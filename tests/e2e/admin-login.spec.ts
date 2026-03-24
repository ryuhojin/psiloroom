import { createSessionPayload, signSessionToken } from "../../packages/auth/src/index";
import { expect, test } from "@playwright/test";

function createExpiredAdminAccessToken() {
  const now = Math.floor(Date.now() / 1000);

  return signSessionToken({
    sub: "account-alpha-admin",
    tenantId: "tenant-alpha",
    tenantCode: "ALPHA",
    loginId: "pm.alpha",
    sessionId: "account-alpha-admin-admin-session",
    tokenVersion: 1,
    surface: "admin",
    tokenType: "access",
    roles: ["tenant_admin"],
    projectIds: [],
    iat: now - 7200,
    exp: now - 3600,
  });
}

function createAdminRefreshToken() {
  return signSessionToken(
    createSessionPayload({
      sub: "account-alpha-admin",
      tenantId: "tenant-alpha",
      tenantCode: "ALPHA",
      loginId: "pm.alpha",
      sessionId: "account-alpha-admin-admin-session",
      tokenVersion: 1,
      surface: "admin",
      tokenType: "refresh",
      roles: ["tenant_admin"],
      projectIds: [],
    }, 60 * 60 * 24),
  );
}

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

test("admin dashboard exposes realtime control metrics after API login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Tenant Code").fill("ALPHA");
  await page.getByLabel("Login ID").fill("pm.alpha");
  await page.getByLabel("Password").fill("complexPass1");
  await page.getByRole("button", { name: "관리 콘솔 진입" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "프로젝트 운영 대시보드" })).toBeVisible();
  await expect(page.getByText("관리 그룹사")).toBeVisible();
  await expect(page).toHaveScreenshot("admin-dashboard.png", { fullPage: true });
});

test("admin protected route refreshes an expired access token", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "psilo_admin_session",
      value: createExpiredAdminAccessToken(),
      url: "http://localhost:3100",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "psilo_admin_refresh",
      value: createAdminRefreshToken(),
      url: "http://localhost:3100",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("http://localhost:3100/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "프로젝트 운영 대시보드" })).toBeVisible();
});
