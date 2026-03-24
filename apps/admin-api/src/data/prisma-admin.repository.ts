import { Injectable } from "@nestjs/common";
import { prisma } from "@psilo/database";

import type {
  AdminAccountRecord,
  AdminProjectRecord,
  AdminRepository,
  AdminTenantRecord,
} from "./admin-repository";

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  async findAdminAccountById(accountId: string): Promise<AdminAccountRecord | null> {
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select: {
        id: true,
        loginId: true,
        passwordHash: true,
        tokenVersion: true,
        status: true,
        globalRoles: true,
        displayName: true,
        tenantId: true,
        tenant: {
          select: {
            code: true,
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
      roles: account.globalRoles,
      status: account.status,
      tokenVersion: account.tokenVersion,
    };
  }

  async findAdminAccountByTenantCode(
    tenantCode: string,
    loginId: string,
  ): Promise<AdminAccountRecord | null> {
    const account = await prisma.account.findFirst({
      where: {
        loginId,
        tenant: {
          code: tenantCode,
        },
      },
      select: {
        id: true,
        loginId: true,
        passwordHash: true,
        tokenVersion: true,
        status: true,
        globalRoles: true,
        displayName: true,
        tenantId: true,
        tenant: {
          select: {
            code: true,
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
      roles: account.globalRoles,
      status: account.status,
      tokenVersion: account.tokenVersion,
    };
  }

  async listTenantsForTenant(tenantId: string, includeAll: boolean): Promise<AdminTenantRecord[]> {
    const tenants = await prisma.tenant.findMany({
      where: includeAll ? undefined : { id: tenantId },
      select: {
        id: true,
        code: true,
        name: true,
        _count: {
          select: {
            departments: true,
          },
        },
      },
      orderBy: { code: "asc" },
    });

    return tenants.map((tenant) => ({
      id: tenant.id,
      code: tenant.code,
      name: tenant.name,
      departments: tenant._count.departments,
    }));
  }

  async listProjectsByTenant(tenantId: string): Promise<AdminProjectRecord[]> {
    const projects = await prisma.project.findMany({
      where: { tenantId },
      select: {
        id: true,
        tenantId: true,
        code: true,
        name: true,
        status: true,
      },
      orderBy: { code: "asc" },
    });

    return projects.map((project) => ({
      id: project.id,
      tenantId: project.tenantId,
      code: project.code,
      name: project.name,
      status: project.status.toLowerCase() as AdminProjectRecord["status"],
    }));
  }
}
