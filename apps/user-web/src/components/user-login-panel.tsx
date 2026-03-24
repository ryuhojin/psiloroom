export function UserLoginPanel({
  action,
  errorMessage,
  nextPath,
}: {
  action: string | ((formData: FormData) => void | Promise<void>);
  errorMessage?: string;
  nextPath?: string;
}) {
  return (
    <div className="login-shell">
      <section className="login-panel">
        <div className="badge">Workspace Entry</div>
        <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.08 }}>
          오늘 놓치면 안 되는 일정과 공지를 한 곳에서 받습니다.
        </h1>
        <p style={{ margin: 0, color: "#557089" }}>
          프로젝트 참여자는 로그인 직후 Inbox, 캘린더, 채팅, 공지 흐름을 한 번에 확인합니다.
        </p>
        <form action={action}>
          <input type="hidden" name="nextPath" value={nextPath ?? "/inbox"} />
          <label htmlFor="tenant-code">
            Tenant Code
            <input id="tenant-code" name="tenantCode" placeholder="ALPHA" defaultValue="ALPHA" />
          </label>
          <label htmlFor="login-id">
            Login ID
            <input id="login-id" name="loginId" placeholder="dev.alpha" defaultValue="dev.alpha" />
          </label>
          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              defaultValue="complexPass1"
            />
          </label>
          {errorMessage ? (
            <p style={{ margin: 0, color: "#b91c1c", fontWeight: 700 }}>{errorMessage}</p>
          ) : (
            <p style={{ margin: 0, color: "#557089" }}>
              Demo: `ALPHA / dev.alpha / complexPass1`
            </p>
          )}
          <button type="submit">업무 공간 열기</button>
        </form>
      </section>
    </div>
  );
}
