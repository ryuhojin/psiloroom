import { hashPassword } from "@psilo/auth";

import type {
  UserAccountRecord,
  UserInboxSummaryRecord,
  UserNoticeRecord,
} from "./user-repository";

export const mockInboxSummaryByProject: Record<
  string,
  Omit<UserInboxSummaryRecord, "tenantId" | "accountId" | "projectId">
> = {
  "project-psilo-core": {
    unreadNotices: 3,
    unreadChats: 8,
    todayEvents: 5,
    pendingApprovals: 2,
  },
};

export const mockNotices: UserNoticeRecord[] = [
  {
    id: "notice-go-live",
    tenantId: "tenant-alpha",
    projectId: "project-psilo-core",
    title: "Go-live rehearsal scheduled",
    severity: "critical",
    publishedAt: "2026-03-24T09:00:00.000Z",
  },
  {
    id: "notice-policy",
    tenantId: "tenant-beta",
    projectId: "project-si-rollout",
    title: "Outsourcing access policy updated",
    severity: "warning",
    publishedAt: "2026-03-23T12:30:00.000Z",
  },
];

export const mockUserAccounts: UserAccountRecord[] = [
  {
    id: "account-user-alpha",
    tenantId: "tenant-alpha",
    tenantCode: "ALPHA",
    loginId: "dev.alpha",
    displayName: "Alpha Delivery Engineer",
    passwordHash: hashPassword("complexPass1"),
    status: "ACTIVE",
    tokenVersion: 1,
    projectIds: ["project-psilo-core"],
  },
  {
    id: "account-user-beta",
    tenantId: "tenant-beta",
    tenantCode: "BETA",
    loginId: "vendor.beta",
    displayName: "Beta Outsourcing Engineer",
    passwordHash: hashPassword("complexPass1"),
    status: "ACTIVE",
    tokenVersion: 1,
    projectIds: ["project-si-rollout"],
  },
];
