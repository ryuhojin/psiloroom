import { render, screen } from "@testing-library/react";

import { UserInboxOverview } from "../components/user-inbox-overview";
import { UserLoginPanel } from "../components/user-login-panel";
import { UserShell } from "../components/user-shell";

describe("User web shell", () => {
  it("renders primary rail navigation", () => {
    render(
      <UserShell title="Inbox" description="업무 흐름을 우선순위대로 확인합니다.">
        <div>content</div>
      </UserShell>,
    );

    expect(screen.getByRole("navigation", { name: "사용자 네비게이션" })).toBeInTheDocument();
    expect(screen.getByLabelText("/calendar")).toBeInTheDocument();
  });

  it("renders login form", () => {
    render(<UserLoginPanel action="/login" />);

    expect(screen.getByText("Workspace Entry")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "업무 공간 열기" })).toBeInTheDocument();
  });

  it("renders inbox overview data", () => {
    render(<UserInboxOverview />);

    expect(screen.getByText("미확인 공지")).toBeInTheDocument();
    expect(screen.getByText("Go-live rehearsal scheduled")).toBeInTheDocument();
  });
});
