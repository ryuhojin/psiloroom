import type { PropsWithChildren } from "react";

import { SectionHeading } from "@psilo/ui";

import { userNavigation } from "../lib/user-navigation";

export function UserShell({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <div className="user-shell">
      <aside className="rail" aria-label="사용자 네비게이션">
        <div className="badge" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          PSILO
        </div>
        <nav aria-label="사용자 네비게이션" style={{ display: "grid", gap: 16 }}>
          {userNavigation.map((item) => (
            <a key={item.href} href={item.href} aria-label={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="user-content">
        <SectionHeading title={title} description={description} />
        {children}
      </main>
    </div>
  );
}
