import { Injectable } from "@nestjs/common";

import { mockInboxSummaryByProject, mockNotices, mockUserAccounts } from "./mock-user-data";
import type {
  UserAccountRecord,
  UserInboxSummaryRecord,
  UserNoticeRecord,
  UserRepository,
} from "./user-repository";

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  async findUserAccountByTenantCode(
    tenantCode: string,
    loginId: string,
  ): Promise<UserAccountRecord | null> {
    return (
      mockUserAccounts.find(
        (candidate) => candidate.tenantCode === tenantCode && candidate.loginId === loginId,
      ) ?? null
    );
  }

  async getInboxSummary(
    accountId: string,
    tenantId: string,
    projectIds: string[],
  ): Promise<UserInboxSummaryRecord> {
    const projectId = projectIds[0];
    const summary = (projectId ? mockInboxSummaryByProject[projectId] : undefined) ?? {
      unreadNotices: 0,
      unreadChats: 0,
      todayEvents: 0,
      pendingApprovals: 0,
    };

    return {
      ...summary,
      tenantId,
      accountId,
      projectId: projectId ?? null,
    };
  }

  async listNotices(
    _accountId: string,
    tenantId: string,
    projectIds: string[],
    projectId?: string,
  ): Promise<UserNoticeRecord[]> {
    return mockNotices.filter((notice) => {
      if (notice.tenantId !== tenantId) {
        return false;
      }

      if (projectId) {
        return notice.projectId === projectId;
      }

      return notice.projectId === null || projectIds.includes(notice.projectId);
    });
  }
}
