import { UserShell } from "../../src/components/user-shell";
import { requireUserSession } from "../../src/lib/user-session";

const rooms = [
  { name: "Project Room", detail: "PSILO Core / 8 unread" },
  { name: "Vendor Group", detail: "Outsourcing sync / 2 unread" },
  { name: "Direct Message", detail: "PM Alpha / 1 unread" },
];

export default async function ChatPage() {
  await requireUserSession("/chat");

  return (
    <UserShell
      title="채팅"
      description="개인, 그룹, 프로젝트 채팅을 같은 구조로 유지하되 권한 범위 밖 채널은 표시하지 않습니다."
    >
      <section className="surface-card">
        <div className="badge">Conversation Feed</div>
        <div className="surface-list" style={{ marginTop: 20 }}>
          {rooms.map((room) => (
            <article className="surface-item" key={room.name}>
              <strong>{room.name}</strong>
              <span style={{ color: "#557089" }}>{room.detail}</span>
            </article>
          ))}
        </div>
      </section>
    </UserShell>
  );
}
