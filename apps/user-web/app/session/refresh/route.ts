import { NextResponse, type NextRequest } from "next/server";

import {
  getUserRefreshCookieMaxAge,
  getUserSessionCookieMaxAge,
  requestUserRefresh,
  USER_REFRESH_COOKIE,
  USER_SESSION_COOKIE,
} from "../../../src/lib/user-session";

function normalizeNextPath(value: string | null, fallback: string) {
  return value?.startsWith("/") ? value : fallback;
}

export async function GET(request: NextRequest) {
  const nextPath = normalizeNextPath(request.nextUrl.searchParams.get("next"), "/inbox");
  const refreshToken = request.cookies.get(USER_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, request.url));
  }

  const refreshResult = await requestUserRefresh(refreshToken);

  if (!refreshResult.ok) {
    const response = NextResponse.redirect(
      new URL(`/login?error=expired&next=${encodeURIComponent(nextPath)}`, request.url),
    );
    response.cookies.delete(USER_SESSION_COOKIE);
    response.cookies.delete(USER_REFRESH_COOKIE);
    return response;
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(USER_SESSION_COOKIE, refreshResult.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: getUserSessionCookieMaxAge(),
  });
  response.cookies.set(USER_REFRESH_COOKIE, refreshResult.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: getUserRefreshCookieMaxAge(),
  });

  return response;
}
