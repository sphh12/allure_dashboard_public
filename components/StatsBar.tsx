"use client";

interface Stats {
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
}

export default function StatsBar({ stats }: { stats: Stats }) {
  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  const cards = [
    { label: "Total", value: stats.total, color: "#ffffff", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" },
    { label: "Passed", value: stats.passed, color: "var(--passed)", bg: "var(--passed-dim)", border: "rgba(34,197,94,0.15)" },
    { label: "Failed", value: stats.failed, color: "var(--failed)", bg: "var(--failed-dim)", border: "rgba(239,68,68,0.15)" },
    { label: "Broken", value: stats.broken, color: "var(--broken)", bg: "var(--broken-dim)", border: "rgba(245,158,11,0.15)" },
    { label: "Skipped", value: stats.skipped, color: "var(--skipped)", bg: "var(--skipped-dim)", border: "rgba(107,114,128,0.15)" },
  ];

  return (
    <div className="space-y-5">
      {/* 패스율 바 */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Pass Rate
        </span>
        <div className="flex-1">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${passRate}%`,
                background: passRate === 100
                  ? "var(--passed)"
                  : passRate >= 70
                    ? "linear-gradient(90deg, var(--passed), var(--broken))"
                    : "linear-gradient(90deg, var(--failed), var(--broken))",
              }}
            />
          </div>
        </div>
        <span className="text-sm font-bold tabular-nums text-white">
          {passRate}%
        </span>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-5 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02]"
            style={{ background: card.bg, border: `1px solid ${card.border}` }}
          >
            <div className="text-3xl font-bold tabular-nums mb-1" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
