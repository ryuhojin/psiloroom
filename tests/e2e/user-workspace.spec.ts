import { createSessionPayload, signSessionToken } from "../../packages/auth/src/index";
import { expect, test } from "@playwright/test";

test("user login page renders the workspace entry panel", async ({ page }) => {
  await page.goto("http://127.0.0.1:3001/login");

  await expect(page.getByRole("heading", { name: "오늘 놓치면 안 되는 일정과 공지를 한 곳에서 받습니다." })).toBeVisible();
  await expect(page.getByRole("button", { name: "업무 공간 열기" })).toBeVisible();
  await expect(page).toHaveScreenshot("user-login.png", { fullPage: true });
});

test("user protected route redirects to login without a session", async ({ page }) => {
  await page.goto("http://127.0.0.1:3001/inbox");

  await expect(page).toHaveURL(/\/login\?next=%2Finbox$/);
});

test("user inbox page renders mission inbox summary cards", async ({ page }) => {
  const token = signSessionToken(
    createSessionPayload({
      sub: "account-user-alpha",
      tenantId: "tenant-alpha",
      tenantCode: "ALPHA",
      loginId: "dev.alpha",
      sessionId: "account-user-alpha-user-session",
      tokenVersion: 1,
      surface: "user",
      roles: ["project_member"],
      projectIds: ["project-psilo-core"],
    }),
  );

  await page.context().addCookies([
    {
      name: "psilo_user_session",
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto("http://127.0.0.1:3001/inbox");

  await expect(page.getByRole("heading", { name: "통합 Inbox" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "미확인 공지" })).toBeVisible();
  await expect(page).toHaveScreenshot("user-inbox.png", { fullPage: true });
});
