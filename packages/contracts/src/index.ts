export type AffiliationType = "customer" | "delivery" | "outsourcing";

export interface TenantSummary {
  id: string;
  code: string;
  name: string;
  departments: number;
}

export interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  tenantId: string;
  status: "active" | "planning";
}

export interface NoticeSummary {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  scope: "tenant" | "project";
  publishedAt: string;
}

export interface InboxSummary {
  unreadNotices: number;
  unreadChats: number;
  todayEvents: number;
  pendingApprovals: number;
}

export const mockTenants: TenantSummary[] = [
  { id: "tenant-alpha", code: "ALPHA", name: "Alpha Holdings", departments: 6 },
  { id: "tenant-beta", code: "BETA", name: "Beta Manufacturing", departments: 4 },
];

export const mockProjects: ProjectSummary[] = [
  {
    id: "project-psilo-core",
    code: "PSILO-CORE",
    name: "PSILO Core Platform",
    tenantId: "tenant-alpha",
    status: "active",
  },
  {
    id: "project-si-rollout",
    code: "SI-ROLLOUT",
    name: "SI Rollout 2026",
    tenantId: "tenant-beta",
    status: "planning",
  },
];

export const mockNotices: NoticeSummary[] = [
  {
    id: "notice-go-live",
    title: "Go-live rehearsal scheduled",
    severity: "critical",
    scope: "project",
    publishedAt: "2026-03-24T09:00:00.000Z",
  },
  {
    id: "notice-tenant-policy",
    title: "Tenant access policy updated",
    severity: "warning",
    scope: "tenant",
    publishedAt: "2026-03-23T16:30:00.000Z",
  },
];

export const mockInboxSummary: InboxSummary = {
  unreadNotices: 3,
  unreadChats: 8,
  todayEvents: 5,
  pendingApprovals: 2,
};
