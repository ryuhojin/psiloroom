import { hashPassword } from "@psilo/auth";

import type {
  UserAccountRecord,
  UserCalendarEventRecord,
  UserChatMessageRecord,
  UserInboxSummaryRecord,
  UserNoticeRecord,
} from "./user-repository";

export const mockProjectPermissionsByAccount: Record<string, Record<string, string[]>> = {
  "account-pm-alpha": {
    "project-psilo-core": [
      "notice.manage",
      "calendar.manage",
      "chat.message.read",
      "chat.message.write",
    ],
  },
  "account-user-alpha": {
    "project-psilo-core": ["chat.message.read", "chat.message.write"],
  },
  "account-user-beta": {
    "project-si-rollout": [],
  },
};

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
    body: "Rehearsal is scheduled for Wednesday morning.",
    severity: "critical",
    publishedAt: "2026-03-24T09:00:00.000Z",
  },
  {
    id: "notice-policy",
    tenantId: "tenant-beta",
    projectId: "project-si-rollout",
    title: "Outsourcing access policy updated",
    body: "Outsourcing access rules were updated for the beta tenant.",
    severity: "warning",
    publishedAt: "2026-03-23T12:30:00.000Z",
  },
];

export const mockProjectCalendarsByProject: Record<string, string> = {
  "project-psilo-core": "calendar-psilo-core",
};

export const mockProjectChatRoomsByProject: Record<string, string> = {
  "project-psilo-core": "room-psilo-core",
};

export const mockCalendarEvents: UserCalendarEventRecord[] = [
  {
    id: "event-kickoff",
    tenantId: "tenant-alpha",
    projectId: "project-psilo-core",
    calendarId: "calendar-psilo-core",
    title: "Kick-off rehearsal",
    description: "Initial rehearsal for the delivery team",
    startsAt: "2026-03-24T01:00:00.000Z",
    endsAt: "2026-03-24T02:00:00.000Z",
    createdAt: "2026-03-24T00:30:00.000Z",
  },
];

export const mockChatMessages: UserChatMessageRecord[] = [
  {
    id: "chat-message-alpha-1",
    tenantId: "tenant-alpha",
    projectId: "project-psilo-core",
    roomId: "room-psilo-core",
    authorId: "account-pm-alpha",
    body: "Kick-off rehearsal starts at 10:00 KST.",
    createdAt: "2026-03-24T00:05:00.000Z",
  },
];

export const mockUserAccounts: UserAccountRecord[] = [
  {
    id: "account-pm-alpha",
    tenantId: "tenant-alpha",
    tenantCode: "ALPHA",
    loginId: "pm.alpha",
    displayName: "Alpha Project Manager",
    passwordHash: hashPassword("complexPass1"),
    status: "ACTIVE",
    tokenVersion: 1,
    projectIds: ["project-psilo-core"],
  },
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
