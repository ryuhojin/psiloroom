import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "PSILO User Workspace",
  description: "PSILO user workspace for shared SI schedules and realtime collaboration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
