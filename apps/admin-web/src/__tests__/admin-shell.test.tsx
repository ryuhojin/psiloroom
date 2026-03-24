import { render, screen } from "@testing-library/react";

import { AdminDashboardOverview } from "../components/admin-dashboard-overview";
import { AdminLoginPanel } from "../components/admin-login-panel";
import { AdminShell } from "../components/admin-shell";

describe("Admin web shell", () => {
  it("renders primary navigation", () => {
    render(
      <AdminShell title="Dashboard" description="운영 상태를 한눈에 확인합니다.">
        <div>content</div>
      </AdminShell>,
    );

    expect(screen.getByRole("navigation", { name: "관리자 네비게이션" })).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
  });

  it("renders login inputs", () => {
    render(<AdminLoginPanel action="/login" />);

    expect(screen.getByLabelText("Tenant Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "관리 콘솔 진입" })).toBeInTheDocument();
  });

  it("renders dashboard metrics", () => {
    render(<AdminDashboardOverview />);

    expect(screen.getByText("관리 그룹사")).toBeInTheDocument();
    expect(screen.getByText("PSILO Core Platform")).toBeInTheDocument();
  });
});
