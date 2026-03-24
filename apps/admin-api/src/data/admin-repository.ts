export const ADMIN_REPOSITORY = Symbol("ADMIN_REPOSITORY");

export interface AdminAccountRecord {
  id: string;
  tenantId: string;
  tenantCode: string;
  loginId: string;
  displayName: string;
  passwordHash: string;
  roles: string[];
  status: "ACTIVE" | "LOCKED" | "DISABLED";
  tokenVersion: number;
}

export interface AdminTenantRecord {
  id: string;
  code: string;
  name: string;
  departments: number;
}

export interface AdminProjectRecord {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  status: "active" | "planning" | "closed";
}

export interface AdminRepository {
  findAdminAccountByTenantCode(tenantCode: string, loginId: string): Promise<AdminAccountRecord | null>;
  findAdminAccountById(accountId: string): Promise<AdminAccountRecord | null>;
  listTenantsForTenant(tenantId: string, includeAll: boolean): Promise<AdminTenantRecord[]>;
  listProjectsByTenant(tenantId: string): Promise<AdminProjectRecord[]>;
}
