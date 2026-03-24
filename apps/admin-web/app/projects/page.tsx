import { mockProjects } from "@psilo/contracts";

import { AdminShell } from "../../src/components/admin-shell";
import { requireAdminSession } from "../../src/lib/admin-session";

export default function ProjectsPage() {
  requireAdminSession("/projects");

  return (
    <AdminShell
      title="프로젝트 관리"
      description="프로젝트별 멤버십, 일정 채널, 공지 범위, 운영 상태를 묶어서 관리합니다."
    >
      <section className="list-panel">
        <div className="capsule">Projects</div>
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
      </section>
    </AdminShell>
  );
}
