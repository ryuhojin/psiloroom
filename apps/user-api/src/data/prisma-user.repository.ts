import { Injectable } from "@nestjs/common";
import { prisma } from "@psilo/database";

import type {
  UserAccountRecord,
  UserInboxSummaryRecord,
  UserNoticeRecord,
  UserRepository,
} from "./user-repository";

function getUtcDayBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function buildProjectMembershipScope(projectIds: string[]) {
  return projectIds.length > 0 ? { in: projectIds } : { in: ["__no-project-membership__"] };
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  async findUserAccountByTenantCode(
    tenantCode: string,
    loginId: string,
  ): Promise<UserAccountRecord | null> {
    const account = await prisma.account.findFirst({
      where: {
        loginId,
        tenant: {
          code: tenantCode,
        },
      },
      select: {
        id: true,
        tenantId: true,
        loginId: true,
        displayName: true,
        passwordHash: true,
        status: true,
        tokenVersion: true,
        tenant: {
          select: {
            code: true,
          },
        },
        projectMembers: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      tenantId: account.tenantId,
      tenantCode: account.tenant.code,
      loginId: account.loginId,
      displayName: account.displayName,
      passwordHash: account.passwordHash,
      status: account.status,
      tokenVersion: account.tokenVersion,
      projectIds: account.projectMembers.map((membership) => membership.projectId),
    };
  }

  async getInboxSummary(
    accountId: string,
    tenantId: string,
    projectIds: string[],
  ): Promise<UserInboxSummaryRecord> {
    const projectFilter = buildProjectMembershipScope(projectIds);
    const { start, end } = getUtcDayBounds();

    const [unreadNotices, unreadChats, todayEvents] = await Promise.all([
      prisma.notice.count({
        where: {
          tenantId,
          OR: [
            { projectId: null },
            { projectId: projectFilter },
          ],
          reads: {
            none: {
              accountId,
            },
          },
        },
      }),
      prisma.chatMessage.count({
        where: {
          chatRoom: {
            project: {
              tenantId,
            },
            projectId: projectFilter,
          },
          authorId: {
            not: accountId,
          },
          reads: {
            none: {
              accountId,
            },
          },
        },
      }),
      prisma.calendarEvent.count({
        where: {
          startsAt: {
            gte: start,
            lt: end,
          },
          calendar: {
            project: {
              tenantId,
            },
            projectId: projectFilter,
          },
        },
      }),
    ]);

    return {
      unreadNotices,
      unreadChats,
      todayEvents,
      pendingApprovals: 0,
      tenantId,
      accountId,
      projectId: projectIds[0] ?? null,
    };
  }

  async listNotices(
    _accountId: string,
    tenantId: string,
    projectIds: string[],
    projectId?: string,
  ): Promise<UserNoticeRecord[]> {
    const projectScope = buildProjectMembershipScope(projectIds);
    const notices = await prisma.notice.findMany({
      where: {
        tenantId,
        ...(projectId
          ? { projectId }
          : {
              OR: [
                { projectId: null },
                { projectId: projectScope },
              ],
            }),
      },
      select: {
        id: true,
        tenantId: true,
        projectId: true,
        title: true,
        severity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notices.map((notice) => ({
      id: notice.id,
      tenantId: notice.tenantId,
      projectId: notice.projectId,
      title: notice.title,
      severity: notice.severity.toLowerCase() as UserNoticeRecord["severity"],
      publishedAt: notice.createdAt.toISOString(),
    }));
  }
}
