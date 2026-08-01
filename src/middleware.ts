import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|tiff|woff|woff2|ttf|eot|otf|mp4|webm|mp3|wav)$).*)",
  ],
};

const COOKIE_TOKEN_KEY = "gearup_token";
const LOGIN_URL = "/auth/login";

// Routes that never need a token
const PUBLIC_PREFIXES = [
  "/",
  "/gear",
  "/auth/",
  "/payment/",
  "/api/",
  "/_next/",
] as const;

// Routes that require any valid token (exact prefix match)
const PROTECTED_PREFIXES = [
  "/dashboard/",
] as const;

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/gear") return true;
  return PUBLIC_PREFIXES.some((p) => p !== "/" && p !== "/gear" && pathname.startsWith(p));
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    const padded = padding ? base64 + "=".repeat(4 - padding) : base64;
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpired(payload: { exp?: number }): boolean {
  if (typeof payload.exp !== "number") return false;
  return payload.exp < Math.floor(Date.now() / 1000);
}

function hasValidToken(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_TOKEN_KEY)?.value;
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;
  if (isTokenExpired(payload)) return false;
  return true;
}

function loginRedirect(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const redirectTo = pathname + (search ?? "");
  const url = new URL(LOGIN_URL, request.url);
  if (redirectTo !== LOGIN_URL && redirectTo !== "/") {
    url.searchParams.set("redirect", redirectTo);
  }
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Protected routes require a valid token
  if (isProtected(pathname)) {
    if (!hasValidToken(request)) {
      return loginRedirect(request);
    }
    return NextResponse.next();
  }

  // Everything else — allow through
  return NextResponse.next();
}
