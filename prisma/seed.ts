import {
  AccountStatus,
  AffiliationType,
  CalendarScope,
  ChatRoomType,
  NoticeSeverity,
  PrismaClient,
  ProjectStatus,
} from "@prisma/client";

import { hashPassword } from "../packages/auth/src/index";

const prisma = new PrismaClient();

async function seedPermissions() {
  const permissions = [
    ["tenant.manage", "Manage tenant and department master data"],
    ["project.manage", "Manage project settings and membership"],
    ["notice.manage", "Publish project notices"],
    ["calendar.manage", "Create and update shared calendar events"],
    ["chat.message.read", "Read project chat messages"],
    ["chat.message.write", "Write project chat messages"],
  ] as const;

  for (const [key, description] of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
  }
}

async function main() {
  await seedPermissions();

  const alphaTenant = await prisma.tenant.upsert({
    where: { code: "ALPHA" },
    update: { name: "Alpha Holdings" },
    create: {
      code: "ALPHA",
      name: "Alpha Holdings",
    },
  });

  const betaTenant = await prisma.tenant.upsert({
    where: { code: "BETA" },
    update: { name: "Beta Manufacturing" },
    create: {
      code: "BETA",
      name: "Beta Manufacturing",
    },
  });

  const alphaDepartment = await prisma.department.upsert({
    where: { id: "seed-department-alpha-strategy" },
    update: {
      tenantId: alphaTenant.id,
      name: "Strategy Office",
    },
    create: {
      id: "seed-department-alpha-strategy",
      tenantId: alphaTenant.id,
      name: "Strategy Office",
    },
  });

  const betaDepartment = await prisma.department.upsert({
    where: { id: "seed-department-beta-outsourcing" },
    update: {
      tenantId: betaTenant.id,
      name: "Outsourcing Office",
    },
    create: {
      id: "seed-department-beta-outsourcing",
      tenantId: betaTenant.id,
      name: "Outsourcing Office",
    },
  });

  const alphaAdmin = await prisma.account.upsert({
    where: {
      tenantId_loginId: {
        tenantId: alphaTenant.id,
        loginId: "pm.alpha",
      },
    },
    update: {
      departmentId: alphaDepartment.id,
      passwordHash: hashPassword("complexPass1"),
      displayName: "Alpha Tenant Admin",
      affiliationType: AffiliationType.DELIVERY,
      status: AccountStatus.ACTIVE,
      tokenVersion: 1,
      globalRoles: ["tenant_admin"],
      isExternal: false,
    },
    create: {
      tenantId: alphaTenant.id,
      departmentId: alphaDepartment.id,
      loginId: "pm.alpha",
      passwordHash: hashPassword("complexPass1"),
      displayName: "Alpha Tenant Admin",
      affiliationType: AffiliationType.DELIVERY,
      status: AccountStatus.ACTIVE,
      tokenVersion: 1,
      globalRoles: ["tenant_admin"],
      isExternal: false,
    },
  });

  const alphaUser = await prisma.account.upsert({
    where: {
      tenantId_loginId: {
        tenantId: alphaTenant.id,
        loginId: "dev.alpha",
      },
    },
    update: {
      departmentId: alphaDepartment.id,
      passwordHash: hashPassword("complexPass1"),
      displayName: "Alpha Delivery Engineer",
      affiliationType: AffiliationType.DELIVERY,
      status: AccountStatus.ACTIVE,
      tokenVersion: 1,
      globalRoles: [],
      isExternal: false,
    },
    create: {
      tenantId: alphaTenant.id,
      departmentId: alphaDepartment.id,
      loginId: "dev.alpha",
      passwordHash: hashPassword("complexPass1"),
      displayName: "Alpha Delivery Engineer",
      affiliationType: AffiliationType.DELIVERY,
      status: AccountStatus.ACTIVE,
      tokenVersion: 1,
      globalRoles: [],
      isExternal: false,
    },
  });

  const betaUser = await prisma.account.upsert({
    where: {
      tenantId_loginId: {
        tenantId: betaTenant.id,
        loginId: "vendor.beta",
      },
    },
    update: {
      departmentId: betaDepartment.id,
      passwordHash: hashPassword("complexPass1"),
      displayName: "Beta Outsourcing Engineer",
      affiliationType: AffiliationType.OUTSOURCING,
      status: AccountStatus.ACTIVE,
      tokenVersion: 1,
      globalRoles: [],
      isExternal: true,
    },
    create: {
      tenantId: betaTenant.id,
      departmentId: betaDepartment.id,
      loginId: "vendor.beta",
      passwordHash: hashPassword("complexPass1"),
      displayName: "Beta Outsourcing Engineer",
      affiliationType: AffiliationType.OUTSOURCING,
      status: AccountStatus.ACTIVE,
      tokenVersion: 1,
      globalRoles: [],
      isExternal: true,
    },
  });

  const alphaProject = await prisma.project.upsert({
    where: { code: "PSILO-CORE" },
    update: {
      tenantId: alphaTenant.id,
      name: "PSILO Core Platform",
      status: ProjectStatus.ACTIVE,
    },
    create: {
      code: "PSILO-CORE",
      name: "PSILO Core Platform",
      tenantId: alphaTenant.id,
      status: ProjectStatus.ACTIVE,
    },
  });

  const betaProject = await prisma.project.upsert({
    where: { code: "SI-ROLLOUT" },
    update: {
      tenantId: betaTenant.id,
      name: "SI Rollout 2026",
      status: ProjectStatus.PLANNING,
    },
    create: {
      code: "SI-ROLLOUT",
      name: "SI Rollout 2026",
      tenantId: betaTenant.id,
      status: ProjectStatus.PLANNING,
    },
  });

  const projectManagerRole = await prisma.projectRole.upsert({
    where: { id: "seed-role-project-manager" },
    update: {
      projectId: alphaProject.id,
      name: "Project Manager",
    },
    create: {
      id: "seed-role-project-manager",
      projectId: alphaProject.id,
      name: "Project Manager",
    },
  });

  const projectMemberRole = await prisma.projectRole.upsert({
    where: { id: "seed-role-project-member" },
    update: {
      projectId: alphaProject.id,
      name: "Project Member",
    },
    create: {
      id: "seed-role-project-member",
      projectId: alphaProject.id,
      name: "Project Member",
    },
  });

  const projectManagePermission = await prisma.permission.findUniqueOrThrow({
    where: { key: "project.manage" },
  });
  const noticeManagePermission = await prisma.permission.findUniqueOrThrow({
    where: { key: "notice.manage" },
  });
  const calendarManagePermission = await prisma.permission.findUniqueOrThrow({
    where: { key: "calendar.manage" },
  });
  const chatReadPermission = await prisma.permission.findUniqueOrThrow({
    where: { key: "chat.message.read" },
  });
  const chatWritePermission = await prisma.permission.findUniqueOrThrow({
    where: { key: "chat.message.write" },
  });

  const rolePermissions = [
    [projectManagerRole.id, projectManagePermission.id],
    [projectManagerRole.id, noticeManagePermission.id],
    [projectManagerRole.id, calendarManagePermission.id],
    [projectManagerRole.id, chatReadPermission.id],
    [projectManagerRole.id, chatWritePermission.id],
    [projectMemberRole.id, chatReadPermission.id],
    [projectMemberRole.id, chatWritePermission.id],
  ] as const;

  for (const [projectRoleId, permissionId] of rolePermissions) {
    await prisma.projectRolePermission.upsert({
      where: {
        projectRoleId_permissionId: {
          projectRoleId,
          permissionId,
        },
      },
      update: {},
      create: {
        projectRoleId,
        permissionId,
      },
    });
  }

  await prisma.projectMember.upsert({
    where: {
      projectId_accountId: {
        projectId: alphaProject.id,
        accountId: alphaAdmin.id,
      },
    },
    update: {
      projectRoleId: projectManagerRole.id,
    },
    create: {
      projectId: alphaProject.id,
      accountId: alphaAdmin.id,
      projectRoleId: projectManagerRole.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_accountId: {
        projectId: alphaProject.id,
        accountId: alphaUser.id,
      },
    },
    update: {
      projectRoleId: projectMemberRole.id,
    },
    create: {
      projectId: alphaProject.id,
      accountId: alphaUser.id,
      projectRoleId: projectMemberRole.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_accountId: {
        projectId: betaProject.id,
        accountId: betaUser.id,
      },
    },
    update: {},
    create: {
      projectId: betaProject.id,
      accountId: betaUser.id,
    },
  });

  const calendar = await prisma.calendar.upsert({
    where: { id: "seed-calendar-project" },
    update: {
      projectId: alphaProject.id,
      scope: CalendarScope.PROJECT,
      title: "PSILO Core Delivery Calendar",
    },
    create: {
      id: "seed-calendar-project",
      projectId: alphaProject.id,
      scope: CalendarScope.PROJECT,
      title: "PSILO Core Delivery Calendar",
    },
  });

  const alphaEvent = await prisma.calendarEvent.upsert({
    where: { id: "seed-event-kickoff" },
    update: {
      calendarId: calendar.id,
      title: "Kick-off rehearsal",
      description: "Initial rehearsal for the delivery team",
      startsAt: new Date("2026-03-24T01:00:00.000Z"),
      endsAt: new Date("2026-03-24T02:00:00.000Z"),
    },
    create: {
      id: "seed-event-kickoff",
      calendarId: calendar.id,
      title: "Kick-off rehearsal",
      description: "Initial rehearsal for the delivery team",
      startsAt: new Date("2026-03-24T01:00:00.000Z"),
      endsAt: new Date("2026-03-24T02:00:00.000Z"),
    },
  });

  await prisma.eventAttendee.upsert({
    where: {
      calendarEventId_accountId: {
        calendarEventId: alphaEvent.id,
        accountId: alphaUser.id,
      },
    },
    update: {},
    create: {
      calendarEventId: alphaEvent.id,
      accountId: alphaUser.id,
    },
  });

  const alphaNotice = await prisma.notice.upsert({
    where: { id: "seed-notice-go-live" },
    update: {
      tenantId: alphaTenant.id,
      projectId: alphaProject.id,
      title: "Go-live rehearsal scheduled",
      body: "Rehearsal is scheduled for Wednesday morning.",
      severity: NoticeSeverity.CRITICAL,
    },
    create: {
      id: "seed-notice-go-live",
      tenantId: alphaTenant.id,
      projectId: alphaProject.id,
      title: "Go-live rehearsal scheduled",
      body: "Rehearsal is scheduled for Wednesday morning.",
      severity: NoticeSeverity.CRITICAL,
    },
  });

  const betaNotice = await prisma.notice.upsert({
    where: { id: "seed-notice-policy" },
    update: {
      tenantId: betaTenant.id,
      projectId: betaProject.id,
      title: "Outsourcing access policy updated",
      body: "Outsourcing access rules were updated for the beta tenant.",
      severity: NoticeSeverity.WARNING,
    },
    create: {
      id: "seed-notice-policy",
      tenantId: betaTenant.id,
      projectId: betaProject.id,
      title: "Outsourcing access policy updated",
      body: "Outsourcing access rules were updated for the beta tenant.",
      severity: NoticeSeverity.WARNING,
    },
  });

  await prisma.noticeTarget.deleteMany({
    where: { noticeId: { in: [alphaNotice.id, betaNotice.id] } },
  });
  await prisma.noticeTarget.createMany({
    data: [
      {
        noticeId: alphaNotice.id,
        targetType: "project",
        targetId: alphaProject.id,
      },
      {
        noticeId: betaNotice.id,
        targetType: "project",
        targetId: betaProject.id,
      },
    ],
  });

  const alphaRoom = await prisma.chatRoom.upsert({
    where: { id: "seed-room-project-alpha" },
    update: {
      name: "PSILO Core Project Room",
      projectId: alphaProject.id,
      type: ChatRoomType.PROJECT,
    },
    create: {
      id: "seed-room-project-alpha",
      name: "PSILO Core Project Room",
      projectId: alphaProject.id,
      type: ChatRoomType.PROJECT,
    },
  });

  const adminChatMember = await prisma.chatMember.upsert({
    where: {
      chatRoomId_accountId: {
        chatRoomId: alphaRoom.id,
        accountId: alphaAdmin.id,
      },
    },
    update: {},
    create: {
      chatRoomId: alphaRoom.id,
      accountId: alphaAdmin.id,
    },
  });

  const userChatMember = await prisma.chatMember.upsert({
    where: {
      chatRoomId_accountId: {
        chatRoomId: alphaRoom.id,
        accountId: alphaUser.id,
      },
    },
    update: {},
    create: {
      chatRoomId: alphaRoom.id,
      accountId: alphaUser.id,
    },
  });

  const alphaMessage = await prisma.chatMessage.upsert({
    where: { id: "seed-message-alpha-1" },
    update: {
      chatRoomId: alphaRoom.id,
      authorId: alphaAdmin.id,
      body: "Kick-off rehearsal starts at 10:00 KST.",
    },
    create: {
      id: "seed-message-alpha-1",
      chatRoomId: alphaRoom.id,
      authorId: alphaAdmin.id,
      body: "Kick-off rehearsal starts at 10:00 KST.",
    },
  });

  await prisma.chatReadReceipt.upsert({
    where: {
      chatMessageId_accountId: {
        chatMessageId: alphaMessage.id,
        accountId: alphaAdmin.id,
      },
    },
    update: {
      chatMemberId: adminChatMember.id,
      readAt: new Date("2026-03-24T00:10:00.000Z"),
    },
    create: {
      chatMessageId: alphaMessage.id,
      chatMemberId: adminChatMember.id,
      accountId: alphaAdmin.id,
      readAt: new Date("2026-03-24T00:10:00.000Z"),
    },
  });

  await prisma.noticeReadReceipt.upsert({
    where: {
      noticeId_accountId: {
        noticeId: alphaNotice.id,
        accountId: alphaAdmin.id,
      },
    },
    update: {
      readAt: new Date("2026-03-24T00:20:00.000Z"),
    },
    create: {
      noticeId: alphaNotice.id,
      accountId: alphaAdmin.id,
      readAt: new Date("2026-03-24T00:20:00.000Z"),
    },
  });

  console.log(
    JSON.stringify(
      {
        tenants: [alphaTenant.code, betaTenant.code],
        projects: [alphaProject.code, betaProject.code],
        adminLoginHint: "ALPHA / pm.alpha / password configured in local seed input",
        userLoginHint: "ALPHA / dev.alpha / password configured in local seed input",
      },
      null,
      2,
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
