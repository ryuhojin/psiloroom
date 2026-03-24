import { Injectable } from "@nestjs/common";

import {
  mockCalendarEvents,
  mockChatMessages,
  mockInboxSummaryByProject,
  mockNotices,
  mockProjectCalendarsByProject,
  mockProjectChatRoomsByProject,
  mockProjectPermissionsByAccount,
  mockUserAccounts,
} from "./mock-user-data";
import type {
  UserAccountRecord,
  UserCalendarEventRecord,
  UserChatMessageRecord,
  UserInboxSummaryRecord,
  UserNoticeRecord,
  UserRepository,
} from "./user-repository";

let noticeSequence = 1;
let calendarEventSequence = 1;
let chatMessageSequence = 1;

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

  async findUserAccountById(accountId: string): Promise<UserAccountRecord | null> {
    return mockUserAccounts.find((candidate) => candidate.id === accountId) ?? null;
  }

  async isProjectMember(accountId: string, tenantId: string, projectId: string): Promise<boolean> {
    const account = mockUserAccounts.find((candidate) => candidate.id === accountId);

    return account?.tenantId === tenantId && account.projectIds.includes(projectId);
  }

  async hasProjectPermission(
    accountId: string,
    tenantId: string,
    projectId: string,
    permissionKey: string,
  ): Promise<boolean> {
    const isMember = await this.isProjectMember(accountId, tenantId, projectId);

    if (!isMember) {
      return false;
    }

    return (
      mockProjectPermissionsByAccount[accountId]?.[projectId]?.includes(permissionKey) ?? false
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

  async createProjectNotice(input: {
    tenantId: string;
    projectId: string;
    title: string;
    body: string;
    severity: UserNoticeRecord["severity"];
  }): Promise<UserNoticeRecord> {
    const notice: UserNoticeRecord = {
      id: `notice-created-${noticeSequence++}`,
      tenantId: input.tenantId,
      projectId: input.projectId,
      title: input.title,
      body: input.body,
      severity: input.severity,
      publishedAt: new Date().toISOString(),
    };

    mockNotices.unshift(notice);

    return notice;
  }

  async createProjectCalendarEvent(input: {
    tenantId: string;
    projectId: string;
    title: string;
    description?: string;
    startsAt: Date;
    endsAt: Date;
  }): Promise<UserCalendarEventRecord | null> {
    const calendarId = mockProjectCalendarsByProject[input.projectId];

    if (!calendarId) {
      return null;
    }

    const event: UserCalendarEventRecord = {
      id: `calendar-event-created-${calendarEventSequence++}`,
      tenantId: input.tenantId,
      projectId: input.projectId,
      calendarId,
      title: input.title,
      description: input.description ?? null,
      startsAt: input.startsAt.toISOString(),
      endsAt: input.endsAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    mockCalendarEvents.unshift(event);

    return event;
  }

  async createProjectChatMessage(input: {
    accountId: string;
    tenantId: string;
    projectId: string;
    body: string;
  }): Promise<UserChatMessageRecord | null> {
    const roomId = mockProjectChatRoomsByProject[input.projectId];

    if (!roomId) {
      return null;
    }

    const message: UserChatMessageRecord = {
      id: `chat-message-created-${chatMessageSequence++}`,
      tenantId: input.tenantId,
      projectId: input.projectId,
      roomId,
      authorId: input.accountId,
      body: input.body,
      createdAt: new Date().toISOString(),
    };

    mockChatMessages.push(message);

    return message;
  }
}
