import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserLoginPanel } from "../../src/components/user-login-panel";
import { USER_SESSION_COOKIE, createUserSessionToken, readUserSession } from "../../src/lib/user-session";

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

    const token = createUserSessionToken({
      tenantCode,
      loginId,
      password,
    });

    if (!token) {
      redirect(`/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
    }

    cookies().set(USER_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    redirect(nextPath || "/inbox");
  }

  return (
    <UserLoginPanel
      action={loginAction}
      errorMessage={searchParams?.error === "invalid" ? "로그인 정보가 올바르지 않습니다." : undefined}
      nextPath={searchParams?.next}
    />
  );
}
