import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminLoginPanel } from "../../src/components/admin-login-panel";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, readAdminSession } from "../../src/lib/admin-session";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  if (readAdminSession()) {
    redirect("/dashboard");
  }

  async function loginAction(formData: FormData) {
    "use server";

    const tenantCode = String(formData.get("tenantCode") ?? "");
    const loginId = String(formData.get("loginId") ?? "");
    const password = String(formData.get("password") ?? "");
    const nextPath = String(formData.get("nextPath") ?? "/dashboard");

    const token = createAdminSessionToken({
      tenantCode,
      loginId,
      password,
    });

    if (!token) {
      redirect(`/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
    }

    cookies().set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    redirect(nextPath || "/dashboard");
  }

  return (
    <AdminLoginPanel
      action={loginAction}
      errorMessage={searchParams?.error === "invalid" ? "로그인 정보가 올바르지 않습니다." : undefined}
      nextPath={searchParams?.next}
    />
  );
}
