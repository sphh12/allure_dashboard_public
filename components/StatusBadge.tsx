"use client";

const styles: Record<string, { bg: string; text: string; dot: string }> = {
  pass: { bg: "var(--passed-dim)", text: "var(--passed)", dot: "var(--passed)" },
  fail: { bg: "var(--failed-dim)", text: "var(--failed)", dot: "var(--failed)" },
  broken: { bg: "var(--broken-dim)", text: "var(--broken)", dot: "var(--broken)" },
  skip: { bg: "var(--skipped-dim)", text: "var(--skipped)", dot: "var(--skipped)" },
};

export default function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "lg" }) {
  const s = status.toLowerCase();
  const c = styles[s] ?? styles.skip;
  const isLg = size === "lg";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ${
        isLg ? "px-3.5 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]"
      }`}
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.dot}25` }}
    >
      <span
        className={`rounded-full ${isLg ? "w-2 h-2" : "w-1.5 h-1.5"}`}
        style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}60` }}
      />
      {status.toUpperCase()}
    </span>
  );
}
