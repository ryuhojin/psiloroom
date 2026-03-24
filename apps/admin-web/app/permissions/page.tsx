import { AdminShell } from "../../src/components/admin-shell";
import { requireAdminSession } from "../../src/lib/admin-session";

const permissionRows = [
  { scope: "Global", key: "tenant.manage", description: "그룹사와 부서 마스터 관리" },
  { scope: "Project", key: "project.manage", description: "프로젝트 운영과 멤버십 제어" },
  { scope: "Project", key: "notice.manage", description: "공지 작성 및 발행" },
  { scope: "Project", key: "calendar.manage", description: "일정 생성과 수정" },
];

export default function PermissionsPage() {
  requireAdminSession("/permissions");

  return (
    <AdminShell
      title="권한 정책"
      description="전역 권한과 프로젝트 기능 권한을 분리해 운영 사고를 줄이는 초기 매트릭스입니다."
    >
      <section className="list-panel">
        <div className="capsule">Permission Matrix</div>
        <div className="table-list" style={{ marginTop: 20 }}>
          {permissionRows.map((row) => (
            <article className="table-item" key={row.key}>
              <strong>{row.key}</strong>
              <span style={{ color: "#64748b" }}>
                {row.scope} / {row.description}
              </span>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
