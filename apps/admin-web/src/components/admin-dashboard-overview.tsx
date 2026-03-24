import { mockProjects, mockTenants } from "@psilo/contracts";
import { StatCard } from "@psilo/ui";

export function AdminDashboardOverview() {
  return (
    <>
      <section className="metric-grid">
        <StatCard eyebrow="Tenants" title="관리 그룹사" value={`${mockTenants.length}`}>
          <p style={{ color: "#475569", marginBottom: 0 }}>조직, 부서, 계정 마스터 관리 기준</p>
        </StatCard>
        <StatCard eyebrow="Projects" title="활성 프로젝트" value={`${mockProjects.length}`}>
          <p style={{ color: "#475569", marginBottom: 0 }}>프로젝트별 권한과 채널 정책 운영</p>
        </StatCard>
        <StatCard eyebrow="Realtime" title="감시 항목" value="4">
          <p style={{ color: "#475569", marginBottom: 0 }}>공지, 일정, 채팅, 권한 변경 이벤트</p>
        </StatCard>
      </section>
      <section className="grid-2">
        <div className="list-panel">
          <div className="capsule">Tenant Focus</div>
          <div className="table-list" style={{ marginTop: 20 }}>
            {mockTenants.map((tenant) => (
              <article className="table-item" key={tenant.id}>
                <strong>{tenant.name}</strong>
                <span style={{ color: "#64748b" }}>
                  {tenant.code} / {tenant.departments} departments
                </span>
              </article>
            ))}
          </div>
        </div>
        <div className="list-panel">
          <div className="capsule">Project Pulse</div>
          <div className="table-list" style={{ marginTop: 20 }}>
            {mockProjects.map((project) => (
              <article className="table-item" key={project.id}>
                <strong>{project.name}</strong>
                <span style={{ color: "#64748b" }}>
                  {project.code} / {project.status.toUpperCase()}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
