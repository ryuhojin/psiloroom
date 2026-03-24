export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserAccountRecord {
  id: string;
  tenantId: string;
  tenantCode: string;
  loginId: string;
  displayName: string;
  passwordHash: string;
  status: "ACTIVE" | "LOCKED" | "DISABLED";
  tokenVersion: number;
  projectIds: string[];
}

export interface UserInboxSummaryRecord {
  unreadNotices: number;
  unreadChats: number;
  todayEvents: number;
  pendingApprovals: number;
  tenantId: string;
  accountId: string;
  projectId: string | null;
}

export interface UserNoticeRecord {
  id: string;
  tenantId: string;
  projectId: string | null;
  title: string;
  body?: string;
  severity: "info" | "warning" | "critical";
  publishedAt: string;
}

export interface UserCalendarEventRecord {
  id: string;
  tenantId: string;
  projectId: string;
  calendarId: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface UserChatMessageRecord {
  id: string;
  tenantId: string;
  projectId: string;
  roomId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface UserRepository {
  findUserAccountByTenantCode(tenantCode: string, loginId: string): Promise<UserAccountRecord | null>;
  findUserAccountById(accountId: string): Promise<UserAccountRecord | null>;
  isProjectMember(accountId: string, tenantId: string, projectId: string): Promise<boolean>;
  hasProjectPermission(
    accountId: string,
    tenantId: string,
    projectId: string,
    permissionKey: string,
  ): Promise<boolean>;
  getInboxSummary(accountId: string, tenantId: string, projectIds: string[]): Promise<UserInboxSummaryRecord>;
  listNotices(
    accountId: string,
    tenantId: string,
    projectIds: string[],
    projectId?: string,
  ): Promise<UserNoticeRecord[]>;
  createProjectNotice(input: {
    tenantId: string;
    projectId: string;
    title: string;
    body: string;
    severity: UserNoticeRecord["severity"];
  }): Promise<UserNoticeRecord>;
  createProjectCalendarEvent(input: {
    tenantId: string;
    projectId: string;
    title: string;
    description?: string;
    startsAt: Date;
    endsAt: Date;
  }): Promise<UserCalendarEventRecord | null>;
  createProjectChatMessage(input: {
    accountId: string;
    tenantId: string;
    projectId: string;
    body: string;
  }): Promise<UserChatMessageRecord | null>;
}
