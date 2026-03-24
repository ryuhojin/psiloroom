import type { PropsWithChildren } from "react";

import { SectionHeading } from "@psilo/ui";

import { adminNavigation } from "../lib/admin-navigation";

export function AdminShell({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <div>
          <small>PSILO Admin Console</small>
          <h1 style={{ margin: "12px 0 0", fontSize: 30 }}>Control Tower</h1>
        </div>
        <nav aria-label="관리자 네비게이션">
          {adminNavigation.map((item) => (
            <a key={item.href} href={item.href}>
              <strong>{item.label}</strong>
              <br />
              <small>{item.note}</small>
            </a>
          ))}
        </nav>
        <div className="hero-panel" style={{ background: "rgba(255,255,255,0.08)", color: "white" }}>
          <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase", opacity: 0.7 }}>
            QA Gate
          </p>
          <p style={{ margin: "8px 0 0" }}>
            API, 권한, 실시간, 시각화 스모크를 통과해야 다음 단계로 진행합니다.
          </p>
        </div>
      </aside>
      <main className="content">
        <SectionHeading title={title} description={description} />
        {children}
      </main>
    </div>
  );
}
