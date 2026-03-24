import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "PSILO Admin",
  description: "PSILO administrator console for SI project operations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
