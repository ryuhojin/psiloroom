import { createSessionPayload, signSessionToken } from "../../packages/auth/src/index";
import { expect, test } from "@playwright/test";

test("admin login page renders the control plane hero", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "PSILO 관리자 로그인" })).toBeVisible();
  await expect(page.getByLabel("Tenant Code")).toBeVisible();
  await expect(page.getByRole("button", { name: "관리 콘솔 진입" })).toBeVisible();
  await expect(page).toHaveScreenshot("admin-login.png", { fullPage: true });
});

test("admin protected route redirects to login without a session", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
});

test("admin dashboard exposes realtime control metrics", async ({ page }) => {
  const token = signSessionToken(
    createSessionPayload({
      sub: "account-alpha-admin",
      tenantId: "tenant-alpha",
      tenantCode: "ALPHA",
      loginId: "pm.alpha",
      sessionId: "account-alpha-admin-admin-session",
      tokenVersion: 1,
      surface: "admin",
      roles: ["tenant_admin"],
      projectIds: [],
    }),
  );

  await page.context().addCookies([
    {
      name: "psilo_admin_session",
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "프로젝트 운영 대시보드" })).toBeVisible();
  await expect(page.getByText("관리 그룹사")).toBeVisible();
  await expect(page).toHaveScreenshot("admin-dashboard.png", { fullPage: true });
});
