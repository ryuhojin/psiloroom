import { UserInboxOverview } from "../../src/components/user-inbox-overview";
import { UserShell } from "../../src/components/user-shell";
import { requireUserSession } from "../../src/lib/user-session";

export default function InboxPage() {
  requireUserSession("/inbox");

  return (
    <UserShell
      title="통합 Inbox"
      description="미확인 공지, 안 읽은 채팅, 오늘 일정, 승인 대기를 하나의 흐름으로 모읍니다."
    >
      <UserInboxOverview />
    </UserShell>
  );
}
