import { NextRequest, NextResponse } from "next/server";

const COOKIE_TOKEN_KEY = "gearup_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * POST /api/auth/set-token
 * Sets the auth token as an HttpOnly-compatible cookie server-side
 * so the Next.js middleware can read it immediately on the next navigation.
 *
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: string };
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_TOKEN_KEY, token, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: true,   // always secure — this API only runs on HTTPS in production
      httpOnly: false, // must be false so client-side JS can also read it
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}

/**
 * DELETE /api/auth/set-token
 * Clears the auth cookie server-side on logout.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_TOKEN_KEY, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });
  return response;
}
