import { Injectable } from "@nestjs/common";
import { prisma } from "@psilo/database";

import type {
  UserAccountRecord,
  UserCalendarEventRecord,
  UserChatMessageRecord,
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
  async findUserAccountById(accountId: string): Promise<UserAccountRecord | null> {
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
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

  async isProjectMember(accountId: string, tenantId: string, projectId: string): Promise<boolean> {
    const membershipCount = await prisma.projectMember.count({
      where: {
        accountId,
        projectId,
        project: {
          tenantId,
        },
      },
    });

    return membershipCount > 0;
  }

  async hasProjectPermission(
    accountId: string,
    tenantId: string,
    projectId: string,
    permissionKey: string,
  ): Promise<boolean> {
    const membership = await prisma.projectMember.findFirst({
      where: {
        accountId,
        projectId,
        project: {
          tenantId,
        },
      },
      select: {
        overrides: {
          where: {
            permission: {
              key: permissionKey,
            },
          },
          select: {
            allowed: true,
          },
          take: 1,
        },
        projectRole: {
          select: {
            permissions: {
              where: {
                permission: {
                  key: permissionKey,
                },
              },
              select: {
                id: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!membership) {
      return false;
    }

    const override = membership.overrides[0];

    if (override) {
      return override.allowed;
    }

    return (membership.projectRole?.permissions.length ?? 0) > 0;
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
        body: true,
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
      body: notice.body,
      severity: notice.severity.toLowerCase() as UserNoticeRecord["severity"],
      publishedAt: notice.createdAt.toISOString(),
    }));
  }

  async createProjectNotice(input: {
    tenantId: string;
    projectId: string;
    title: string;
    body: string;
    severity: UserNoticeRecord["severity"];
  }): Promise<UserNoticeRecord> {
    const notice = await prisma.notice.create({
      data: {
        tenantId: input.tenantId,
        projectId: input.projectId,
        title: input.title,
        body: input.body,
        severity: input.severity.toUpperCase() as "INFO" | "WARNING" | "CRITICAL",
        targets: {
          create: {
            targetType: "project",
            targetId: input.projectId,
          },
        },
      },
      select: {
        id: true,
        tenantId: true,
        projectId: true,
        title: true,
        body: true,
        severity: true,
        createdAt: true,
      },
    });

    return {
      id: notice.id,
      tenantId: notice.tenantId,
      projectId: notice.projectId,
      title: notice.title,
      body: notice.body,
      severity: notice.severity.toLowerCase() as UserNoticeRecord["severity"],
      publishedAt: notice.createdAt.toISOString(),
    };
  }

  async createProjectCalendarEvent(input: {
    tenantId: string;
    projectId: string;
    title: string;
    description?: string;
    startsAt: Date;
    endsAt: Date;
  }): Promise<UserCalendarEventRecord | null> {
    const calendar = await prisma.calendar.findFirst({
      where: {
        projectId: input.projectId,
        scope: "PROJECT",
        project: {
          tenantId: input.tenantId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!calendar) {
      return null;
    }

    const event = await prisma.calendarEvent.create({
      data: {
        calendarId: calendar.id,
        title: input.title,
        description: input.description ?? null,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        targets: {
          create: {
            targetType: "project",
            targetId: input.projectId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
      },
    });

    return {
      id: event.id,
      tenantId: input.tenantId,
      projectId: input.projectId,
      calendarId: calendar.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
    };
  }

  async createProjectChatMessage(input: {
    accountId: string;
    tenantId: string;
    projectId: string;
    body: string;
  }): Promise<UserChatMessageRecord | null> {
    const room = await prisma.chatRoom.findFirst({
      where: {
        projectId: input.projectId,
        type: "PROJECT",
        project: {
          tenantId: input.tenantId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!room) {
      return null;
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId: room.id,
        authorId: input.accountId,
        body: input.body,
      },
      select: {
        id: true,
        authorId: true,
        body: true,
        createdAt: true,
      },
    });

    return {
      id: message.id,
      tenantId: input.tenantId,
      projectId: input.projectId,
      roomId: room.id,
      authorId: message.authorId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
