import { mockInboxSummary, mockNotices } from "@psilo/contracts";
import { StatCard } from "@psilo/ui";

export function UserInboxOverview() {
  return (
    <>
      <section className="hero-card">
        <div className="badge" style={{ background: "rgba(255,255,255,0.16)", color: "white" }}>
          Mission Inbox
        </div>
        <h1 style={{ margin: 0, fontSize: 40 }}>실시간으로 밀려오는 일정, 채팅, 공지를 우선순위대로 정리합니다.</h1>
        <p style={{ margin: 0, maxWidth: 680, color: "rgba(255,255,255,0.8)" }}>
          프로젝트별 권한을 유지한 채 개인, 그룹, 프로젝트 단위 협업 정보를 한 화면에서 확인할 수 있습니다.
        </p>
      </section>
      <section className="summary-grid">
        <StatCard eyebrow="Notices" title="미확인 공지" value={`${mockInboxSummary.unreadNotices}`} />
        <StatCard eyebrow="Chats" title="안 읽은 채팅" value={`${mockInboxSummary.unreadChats}`} />
        <StatCard eyebrow="Calendar" title="오늘 일정" value={`${mockInboxSummary.todayEvents}`} />
        <StatCard eyebrow="Approvals" title="승인 대기" value={`${mockInboxSummary.pendingApprovals}`} />
      </section>
      <section className="surface-card">
        <div className="badge">Important Notices</div>
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
    </>
  );
}
