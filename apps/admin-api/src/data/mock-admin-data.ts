import { hashPassword } from "@psilo/auth";

import type {
  AdminAccountRecord,
  AdminProjectRecord,
  AdminTenantRecord,
} from "./admin-repository";

export const mockTenants: AdminTenantRecord[] = [
  {
    id: "tenant-alpha",
    code: "ALPHA",
    name: "Alpha Holdings",
    departments: 6,
  },
  {
    id: "tenant-beta",
    code: "BETA",
    name: "Beta Manufacturing",
    departments: 4,
  },
];

export const mockProjects: AdminProjectRecord[] = [
  {
    id: "project-psilo-core",
    tenantId: "tenant-alpha",
    code: "PSILO-CORE",
    name: "PSILO Core Platform",
    status: "active",
  },
  {
    id: "project-si-rollout",
    tenantId: "tenant-beta",
    code: "SI-ROLLOUT",
    name: "SI Rollout 2026",
    status: "planning",
  },
];

export const mockAdminAccounts: AdminAccountRecord[] = [
  {
    id: "account-alpha-admin",
    tenantId: "tenant-alpha",
    tenantCode: "ALPHA",
    loginId: "pm.alpha",
    displayName: "Alpha Tenant Admin",
    passwordHash: hashPassword("complexPass1"),
    roles: ["tenant_admin"],
    status: "ACTIVE",
    tokenVersion: 1,
  },
  {
    id: "account-root-admin",
    tenantId: "tenant-alpha",
    tenantCode: "ALPHA",
    loginId: "root.admin",
    displayName: "Root Admin",
    passwordHash: hashPassword("complexPass1"),
    roles: ["super_admin"],
    status: "ACTIVE",
    tokenVersion: 1,
  },
];
