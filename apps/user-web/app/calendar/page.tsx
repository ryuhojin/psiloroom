import { UserShell } from "../../src/components/user-shell";
import { requireUserSession } from "../../src/lib/user-session";

const events = [
  { title: "Kick-off rehearsal", scope: "PROJECT", time: "10:00 - 11:00" },
  { title: "External vendor sync", scope: "GROUP", time: "13:00 - 13:30" },
  { title: "Client review", scope: "PERSONAL", time: "16:00 - 17:00" },
];

export default function CalendarPage() {
  requireUserSession("/calendar");

  return (
    <UserShell
      title="공유 캘린더"
      description="개인, 그룹, 프로젝트 레이어를 분리해서 보되 실시간 변경은 한 흐름으로 반영합니다."
    >
      <section className="surface-card">
        <div className="badge">Today Timeline</div>
        <div className="surface-list" style={{ marginTop: 20 }}>
          {events.map((event) => (
            <article className="surface-item" key={event.title}>
              <strong>{event.title}</strong>
              <span style={{ color: "#557089" }}>
                {event.scope} / {event.time}
              </span>
            </article>
          ))}
        </div>
      </section>
    </UserShell>
  );
}
