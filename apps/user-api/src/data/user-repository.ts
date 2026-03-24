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
  severity: "info" | "warning" | "critical";
  publishedAt: string;
}

export interface UserRepository {
  findUserAccountByTenantCode(tenantCode: string, loginId: string): Promise<UserAccountRecord | null>;
  getInboxSummary(accountId: string, tenantId: string, projectIds: string[]): Promise<UserInboxSummaryRecord>;
  listNotices(
    accountId: string,
    tenantId: string,
    projectIds: string[],
    projectId?: string,
  ): Promise<UserNoticeRecord[]>;
}
