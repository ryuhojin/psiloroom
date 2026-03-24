import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserLoginPanel } from "../../src/components/user-login-panel";
import {
  USER_REFRESH_COOKIE,
  USER_SESSION_COOKIE,
  getUserRefreshCookieMaxAge,
  getUserSessionCookieMaxAge,
  readUserSession,
  requestUserLogin,
} from "../../src/lib/user-session";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  if (readUserSession()) {
    redirect("/inbox");
  }

  async function loginAction(formData: FormData) {
    "use server";

    const tenantCode = String(formData.get("tenantCode") ?? "");
    const loginId = String(formData.get("loginId") ?? "");
    const password = String(formData.get("password") ?? "");
    const nextPath = String(formData.get("nextPath") ?? "/inbox");

    const result = await requestUserLogin({
      tenantCode,
      loginId,
      password,
    });

    if (!result.ok) {
      redirect(`/login?error=${result.reason}&next=${encodeURIComponent(nextPath)}`);
    }

    cookies().set(USER_SESSION_COOKIE, result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: getUserSessionCookieMaxAge(),
    });
    cookies().set(USER_REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: getUserRefreshCookieMaxAge(),
    });

    redirect(nextPath || "/inbox");
  }

  return (
    <UserLoginPanel
      action={loginAction}
      errorMessage={
        searchParams?.error === "invalid"
          ? "로그인 정보가 올바르지 않습니다."
          : searchParams?.error === "expired"
            ? "세션이 만료되었습니다. 다시 로그인해 주세요."
          : searchParams?.error === "unavailable"
            ? "인증 서버에 연결할 수 없습니다."
            : undefined
      }
      nextPath={searchParams?.next}
    />
  );
}
