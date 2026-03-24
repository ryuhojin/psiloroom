import { AdminDashboardOverview } from "../../src/components/admin-dashboard-overview";
import { AdminShell } from "../../src/components/admin-shell";
import { requireAdminSession } from "../../src/lib/admin-session";

export default function DashboardPage() {
  requireAdminSession("/dashboard");

  return (
    <AdminShell
      title="프로젝트 운영 대시보드"
      description="그룹사별 프로젝트 상태, 권한 흐름, 실시간 전파 지점을 한 번에 확인합니다."
    >
      <AdminDashboardOverview />
    </AdminShell>
  );
}
