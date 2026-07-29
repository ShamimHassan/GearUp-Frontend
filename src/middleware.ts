import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@/types";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|tiff|woff|woff2|ttf|eot|otf|mp4|webm|mp3|wav)$).*)",
  ],
};

const COOKIE_TOKEN_KEY = "gearup_token";
const LOGIN_URL = "/auth/login";
const ROOT_URL = "/";

const PUBLIC_ROUTES = [
  "/",
  "/gear",
  "/auth/login",
  "/auth/register",
  "/payment/success",
  "/payment/cancel",
  "/api/payments/confirm",
] as const;

const PUBLIC_PREFIXES = ["/gear/"] as const;

const AUTH_ROUTE_PREFIX = "/auth/";

const DASHBOARD_ROUTES = {
  [UserRole.CUSTOMER]: "/dashboard/customer",
  [UserRole.PROVIDER]: "/dashboard/provider",
  [UserRole.ADMIN]: "/dashboard/admin",
} as const;

const ROUTE_ROLE_REQUIREMENTS: Array<{ prefix: string; role: UserRole }> = [
  { prefix: "/dashboard/customer", role: UserRole.CUSTOMER },
  { prefix: "/dashboard/provider", role: UserRole.PROVIDER },
  { prefix: "/dashboard/admin", role: UserRole.ADMIN },
];

type JwtRoleClaim = UserRole | string | undefined;

interface DecodedJwtPayload {
  sub?: string;
  role?: JwtRoleClaim;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function parseJwtPayload(token: string): DecodedJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadBase64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s/g, "");
    const padding = payloadBase64.length % 4;
    const padded = padding
      ? payloadBase64 + "=".repeat(4 - padding)
      : payloadBase64;
    const jsonString = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(jsonString) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

function normalizeRole(raw: JwtRoleClaim): UserRole | null {
  if (!raw) return null;
  if (raw === UserRole.CUSTOMER || raw === "CUSTOMER") return UserRole.CUSTOMER;
  if (raw === UserRole.PROVIDER || raw === "PROVIDER") return UserRole.PROVIDER;
  if (raw === UserRole.ADMIN || raw === "ADMIN") return UserRole.ADMIN;
  return null;
}

function isTokenExpired(payload: DecodedJwtPayload): boolean {
  if (typeof payload.exp !== "number") return false;
  return payload.exp < Math.floor(Date.now() / 1000);
}

function startsWithAny(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname.startsWith(p));
}

function isPublicRoute(pathname: string): boolean {
  if ((PUBLIC_ROUTES as readonly string[]).includes(pathname)) return true;
  if (startsWithAny(pathname, PUBLIC_PREFIXES)) return true;
  if (pathname.startsWith("/api/payments/confirm")) return true;
  return false;
}

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith(AUTH_ROUTE_PREFIX);
}

function requiredRoleFor(pathname: string): UserRole | null {
  const match = ROUTE_ROLE_REQUIREMENTS.find((r) => pathname.startsWith(r.prefix));
  return match ? match.role : null;
}

function buildLoginRedirect(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const redirectTo = pathname + (search.length > 0 ? search : "");
  const loginUrl = new URL(LOGIN_URL, request.url);
  if (redirectTo !== LOGIN_URL && redirectTo !== ROOT_URL) {
    loginUrl.searchParams.set("redirect", redirectTo);
  }
  return NextResponse.redirect(loginUrl);
}

function buildRoleDashboardRedirect(
  role: UserRole,
  request: NextRequest,
): NextResponse {
  const dashboardUrl = DASHBOARD_ROUTES[role];
  return NextResponse.redirect(new URL(dashboardUrl, request.url));
}

function buildRootRedirect(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(ROOT_URL, request.url));
}

function clearAuthCookieRedirect(request: NextRequest): NextResponse {
  const res = buildLoginRedirect(request);
  res.cookies.set(COOKIE_TOKEN_KEY, "", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    expires: new Date(0),
  });
  return res;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get(COOKIE_TOKEN_KEY)?.value ?? null;

  const payload = rawToken ? parseJwtPayload(rawToken) : null;
  const tokenValid = Boolean(payload && !isTokenExpired(payload));
  const role = tokenValid && payload ? normalizeRole(payload.role) : null;

  if (!tokenValid && rawToken) {
    return clearAuthCookieRedirect(request);
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (isAuthRoute(pathname)) {
    if (tokenValid && role) {
      return buildRoleDashboardRedirect(role, request);
    }
    return NextResponse.next();
  }

  if (!tokenValid) {
    return buildLoginRedirect(request);
  }

  if (!role) {
    return clearAuthCookieRedirect(request);
  }

  const requiredRole = requiredRoleFor(pathname);
  if (requiredRole && requiredRole !== role) {
    const hasOwnDashboard = Boolean(DASHBOARD_ROUTES[role]);
    if (hasOwnDashboard) {
      return buildRoleDashboardRedirect(role, request);
    }
    return buildRootRedirect(request);
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return buildRoleDashboardRedirect(role, request);
  }

  return NextResponse.next();
}
