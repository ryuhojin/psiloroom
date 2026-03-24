import { mockNotices } from "@psilo/contracts";

import { UserShell } from "../../src/components/user-shell";
import { requireUserSession } from "../../src/lib/user-session";

export default function NoticesPage() {
  requireUserSession("/notices");

  return (
    <UserShell
      title="공지"
      description="프로젝트와 조직 범위 공지를 실시간으로 받되 중요 공지는 우선순위를 높여 노출합니다."
    >
      <section className="surface-card">
        <div className="badge">Live Notices</div>
        <div className="surface-list" style={{ marginTop: 20 }}>
          {mockNotices.map((notice) => (
            <article className="surface-item" key={notice.id}>
              <strong>{notice.title}</strong>
              <span style={{ color: "#557089" }}>
                {notice.severity.toUpperCase()} / {notice.publishedAt.slice(0, 10)}
              </span>
            </article>
          ))}
        </div>
      </section>
    </UserShell>
  );
}
