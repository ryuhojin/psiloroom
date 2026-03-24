import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionTokenPayload } from "@psilo/auth";
import { verifySessionToken } from "@psilo/auth";

export const ADMIN_SESSION_COOKIE = "psilo_admin_session";
export const ADMIN_REFRESH_COOKIE = "psilo_admin_refresh";
export const ADMIN_REFRESH_ROUTE = "/session/refresh";

const DEFAULT_ADMIN_REDIRECT = "/dashboard";
const DEFAULT_ADMIN_API_BASE_URL = "http://127.0.0.1:4000/api/admin";

function getAdminApiBaseUrl() {
  return process.env.ADMIN_API_BASE_URL ?? DEFAULT_ADMIN_API_BASE_URL;
}

export function getAdminSessionCookieMaxAge() {
  return 60 * 60;
}

export function getAdminRefreshCookieMaxAge() {
  return 60 * 60 * 24;
}

export async function requestAdminLogin(input: {
  tenantCode: string;
  loginId: string;
  password: string;
}) {
  try {
    const response = await fetch(`${getAdminApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        ok: false as const,
        reason: response.status === 400 || response.status === 401 ? "invalid" : "unavailable",
      };
    }

    const payload = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };

    return {
      ok: true as const,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  } catch {
    return {
      ok: false as const,
      reason: "unavailable" as const,
    };
  }
}

export async function requestAdminRefresh(refreshToken: string) {
  try {
    const response = await fetch(`${getAdminApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return {
        ok: false as const,
        reason: response.status === 400 || response.status === 401 ? "unauthorized" : "unavailable",
      };
    }

    const payload = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };

    return {
      ok: true as const,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  } catch {
    return {
      ok: false as const,
      reason: "unavailable" as const,
    };
  }
}

export async function requestAdminSession(accessToken: string) {
  try {
    const response = await fetch(`${getAdminApiBaseUrl()}/auth/session`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false as const,
        reason: response.status === 401 ? "unauthorized" : "unavailable",
      };
    }

    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      reason: "unavailable" as const,
    };
  }
}

function buildLoginRedirect(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

function buildRefreshRedirect(nextPath: string) {
  return `${ADMIN_REFRESH_ROUTE}?next=${encodeURIComponent(nextPath)}`;
}

function verifyAdminAccessToken(token: string): SessionTokenPayload | null {
  try {
    const payload = verifySessionToken(token);
    return payload.surface === "admin" && payload.tokenType === "access" ? payload : null;
  } catch {
    return null;
  }
}

export function readAdminSession() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminAccessToken(token);
}

export async function requireAdminSession(nextPath = DEFAULT_ADMIN_REDIRECT) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value;

  if (!accessToken) {
    if (refreshToken) {
      redirect(buildRefreshRedirect(nextPath));
    }

    redirect(buildLoginRedirect(nextPath));
  }

  const session = verifyAdminAccessToken(accessToken);

  if (!session) {
    if (refreshToken) {
      redirect(buildRefreshRedirect(nextPath));
    }

    redirect(buildLoginRedirect(nextPath));
  }

  const validation = await requestAdminSession(accessToken);

  if (validation.ok) {
    return session;
  }

  if (validation.reason === "unauthorized" && refreshToken) {
    redirect(buildRefreshRedirect(nextPath));
  }

  if (validation.reason === "unauthorized") {
    redirect(buildLoginRedirect(nextPath));
  }

  return session;
}
