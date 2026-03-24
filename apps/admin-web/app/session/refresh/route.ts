import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_REFRESH_COOKIE,
  ADMIN_SESSION_COOKIE,
  getAdminRefreshCookieMaxAge,
  getAdminSessionCookieMaxAge,
  requestAdminRefresh,
} from "../../../src/lib/admin-session";

function normalizeNextPath(value: string | null, fallback: string) {
  return value?.startsWith("/") ? value : fallback;
}

export async function GET(request: NextRequest) {
  const nextPath = normalizeNextPath(request.nextUrl.searchParams.get("next"), "/dashboard");
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextPath)}`, request.url));
  }

  const refreshResult = await requestAdminRefresh(refreshToken);

  if (!refreshResult.ok) {
    const response = NextResponse.redirect(
      new URL(`/login?error=expired&next=${encodeURIComponent(nextPath)}`, request.url),
    );
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    response.cookies.delete(ADMIN_REFRESH_COOKIE);
    return response;
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, refreshResult.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: getAdminSessionCookieMaxAge(),
  });
  response.cookies.set(ADMIN_REFRESH_COOKIE, refreshResult.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: getAdminRefreshCookieMaxAge(),
  });

  return response;
}
