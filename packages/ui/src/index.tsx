import type { PropsWithChildren } from "react";

export function StatCard({
  eyebrow,
  title,
  value,
  children,
}: PropsWithChildren<{ eyebrow: string; title: string; value: string }>) {
  return (
    <section
      style={{
        border: "1px solid rgba(15, 23, 42, 0.12)",
        borderRadius: 20,
        padding: 20,
        background:
          "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.92))",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
      }}
    >
      <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase", color: "#64748b" }}>
        {eyebrow}
      </p>
      <h3 style={{ margin: "8px 0 4px", fontSize: 20 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{value}</p>
      {children}
    </section>
  );
}

export function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <header style={{ display: "grid", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 28 }}>{title}</h2>
      <p style={{ margin: 0, color: "#475569", maxWidth: 720 }}>{description}</p>
    </header>
  );
}
