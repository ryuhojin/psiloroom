import { mockTenants } from "@psilo/contracts";

import { AdminShell } from "../../src/components/admin-shell";
import { requireAdminSession } from "../../src/lib/admin-session";

export default async function OrganizationsPage() {
  await requireAdminSession("/organizations");

  return (
    <AdminShell
      title="조직 관리"
      description="그룹사, 부서, 외주 여부, 역할 소속 정보를 기준으로 조직 마스터를 정리합니다."
    >
      <section className="list-panel">
        <div className="capsule">Organization Master</div>
        <div className="table-list" style={{ marginTop: 20 }}>
          {mockTenants.map((tenant) => (
            <article className="table-item" key={tenant.id}>
              <strong>{tenant.name}</strong>
              <span style={{ color: "#64748b" }}>{tenant.code}</span>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
