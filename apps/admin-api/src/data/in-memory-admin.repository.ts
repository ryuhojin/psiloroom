import { Injectable } from "@nestjs/common";

import { mockAdminAccounts, mockProjects, mockTenants } from "./mock-admin-data";
import type { AdminAccountRecord, AdminProjectRecord, AdminRepository, AdminTenantRecord } from "./admin-repository";

@Injectable()
export class InMemoryAdminRepository implements AdminRepository {
  async findAdminAccountByTenantCode(
    tenantCode: string,
    loginId: string,
  ): Promise<AdminAccountRecord | null> {
    return (
      mockAdminAccounts.find(
        (candidate) => candidate.tenantCode === tenantCode && candidate.loginId === loginId,
      ) ?? null
    );
  }

  async listTenantsForTenant(tenantId: string, includeAll: boolean): Promise<AdminTenantRecord[]> {
    if (includeAll) {
      return mockTenants;
    }

    return mockTenants.filter((tenant) => tenant.id === tenantId);
  }

  async listProjectsByTenant(tenantId: string): Promise<AdminProjectRecord[]> {
    return mockProjects.filter((project) => project.tenantId === tenantId);
  }
}
