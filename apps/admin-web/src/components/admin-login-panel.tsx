export function AdminLoginPanel({
  action,
  errorMessage,
  nextPath,
}: {
  action: string | ((formData: FormData) => void | Promise<void>);
  errorMessage?: string;
  nextPath?: string;
}) {
  return (
    <div className="login-grid">
      <section className="login-copy">
        <div className="capsule">Tenant-aware control plane</div>
        <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.02 }}>
          그룹사별 정책과 프로젝트 권한을 한 화면에서 통제합니다.
        </h1>
        <p style={{ margin: 0, maxWidth: 520, color: "rgba(255,255,255,0.8)" }}>
          관리자는 조직, 프로젝트, 권한, 공지, 일정 정책을 관리하고 변경 사항을 실시간으로 전파합니다.
        </p>
      </section>
      <section className="login-panel">
        <p className="capsule">Admin Login</p>
        <h2 style={{ marginTop: 16 }}>PSILO 관리자 로그인</h2>
        <p style={{ color: "#64748b" }}>
          그룹사 코드와 계정 정보를 기준으로 접근 경계를 분리합니다.
        </p>
        <form action={action}>
          <input type="hidden" name="nextPath" value={nextPath ?? "/dashboard"} />
          <label htmlFor="tenant-code">
            Tenant Code
            <input id="tenant-code" name="tenantCode" placeholder="ALPHA" defaultValue="ALPHA" />
          </label>
          <label htmlFor="login-id">
            Login ID
            <input id="login-id" name="loginId" placeholder="pm.alpha" defaultValue="pm.alpha" />
          </label>
          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              defaultValue="complexPass1"
            />
          </label>
          {errorMessage ? (
            <p style={{ margin: 0, color: "#b91c1c", fontWeight: 700 }}>{errorMessage}</p>
          ) : (
            <p style={{ margin: 0, color: "#64748b" }}>
              Demo: `ALPHA / pm.alpha / complexPass1`
            </p>
          )}
          <button type="submit">관리 콘솔 진입</button>
        </form>
      </section>
    </div>
  );
}
