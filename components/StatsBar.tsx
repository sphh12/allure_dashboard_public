"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Stats {
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
}

export default function StatsBar({ stats }: { stats: Stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") ?? "";
  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  // 카드 클릭 시 status 필터 토글
  const handleStatusClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeStatus === status) {
      // 같은 status 클릭 시 해제
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push("?" + params.toString());
  };

  const cards = [
    { label: "Total", value: stats.total, status: "", color: "#ffffff", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", activeBorder: "rgba(255,255,255,0.5)" },
    { label: "Passed", value: stats.passed, status: "pass", color: "var(--passed)", bg: "var(--passed-dim)", border: "rgba(34,197,94,0.15)", activeBorder: "var(--passed)" },
    { label: "Failed", value: stats.failed, status: "fail", color: "var(--failed)", bg: "var(--failed-dim)", border: "rgba(239,68,68,0.15)", activeBorder: "var(--failed)" },
    { label: "Broken", value: stats.broken, status: "broken", color: "var(--broken)", bg: "var(--broken-dim)", border: "rgba(245,158,11,0.15)", activeBorder: "var(--broken)" },
    { label: "Skipped", value: stats.skipped, status: "skip", color: "var(--skipped)", bg: "var(--skipped-dim)", border: "rgba(107,114,128,0.15)", activeBorder: "var(--skipped)" },
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

      {/* 카드 그리드 - 반응형: 모바일 2열+1, 태블릿 3열, 데스크톱 5열 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const isActive = activeStatus === card.status && card.status !== "";
          const isClickable = card.status !== "";
          return (
            <div
              key={card.label}
              className={`rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02] ${
                isClickable ? "cursor-pointer" : ""
              } ${card.status === "" ? "col-span-2 sm:col-span-3 lg:col-span-1" : ""}`}
              style={{
                background: isActive ? card.bg.replace("0.10", "0.20") : card.bg,
                border: isActive ? `2px solid ${card.activeBorder}` : `1px solid ${card.border}`,
                boxShadow: isActive ? `0 0 12px ${card.activeBorder}40` : "none",
              }}
              onClick={() => isClickable && handleStatusClick(card.status)}
            >
              <div className="text-3xl font-bold tabular-nums mb-1" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {card.label}
                {isActive && (
                  <span className="ml-1 text-[9px] opacity-60">(click to clear)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
