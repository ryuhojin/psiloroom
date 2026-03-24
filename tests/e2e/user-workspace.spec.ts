import { createSessionPayload, signSessionToken } from "../../packages/auth/src/index";
import { expect, test } from "@playwright/test";

function createExpiredUserAccessToken() {
  const now = Math.floor(Date.now() / 1000);

  return signSessionToken({
    sub: "account-user-alpha",
    tenantId: "tenant-alpha",
    tenantCode: "ALPHA",
    loginId: "dev.alpha",
    sessionId: "account-user-alpha-user-session",
    tokenVersion: 1,
    surface: "user",
    tokenType: "access",
    roles: ["project_member"],
    projectIds: ["project-psilo-core"],
    iat: now - 7200,
    exp: now - 3600,
  });
}

function createUserRefreshToken() {
  return signSessionToken(
    createSessionPayload({
      sub: "account-user-alpha",
      tenantId: "tenant-alpha",
      tenantCode: "ALPHA",
      loginId: "dev.alpha",
      sessionId: "account-user-alpha-user-session",
      tokenVersion: 1,
      surface: "user",
      tokenType: "refresh",
      roles: ["project_member"],
      projectIds: ["project-psilo-core"],
    }, 60 * 60 * 24),
  );
}

test("user login page renders the workspace entry panel", async ({ page }) => {
  await page.goto("http://localhost:3101/login");

  await expect(page.getByRole("heading", { name: "오늘 놓치면 안 되는 일정과 공지를 한 곳에서 받습니다." })).toBeVisible();
  await expect(page.getByRole("button", { name: "업무 공간 열기" })).toBeVisible();
  await expect(page).toHaveScreenshot("user-login.png", { fullPage: true });
});

test("user protected route redirects to login without a session", async ({ page }) => {
  await page.goto("http://localhost:3101/inbox");

  await expect(page).toHaveURL(/\/login\?next=%2Finbox$/);
});

test("user inbox page renders mission inbox summary cards after API login", async ({ page }) => {
  await page.goto("http://localhost:3101/login");
  await page.getByLabel("Tenant Code").fill("ALPHA");
  await page.getByLabel("Login ID").fill("dev.alpha");
  await page.getByLabel("Password").fill("complexPass1");
  await page.getByRole("button", { name: "업무 공간 열기" }).click();

  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("heading", { name: "통합 Inbox" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "미확인 공지" })).toBeVisible();
  await expect(page).toHaveScreenshot("user-inbox.png", { fullPage: true });
});

test("user protected route refreshes an expired access token", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "psilo_user_session",
      value: createExpiredUserAccessToken(),
      url: "http://localhost:3101",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "psilo_user_refresh",
      value: createUserRefreshToken(),
      url: "http://localhost:3101",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("http://localhost:3101/inbox");

  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("heading", { name: "통합 Inbox" })).toBeVisible();
});
