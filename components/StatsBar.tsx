"use client";

import { useCallback, useState, useTransition } from "react";
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
  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  // Optimistic UI: 로컬 상태로 즉시 반영, 서버 응답 대기 안 함
  const [optimisticStatuses, setOptimisticStatuses] = useState<Set<string> | null>(null);
  const [, startTransition] = useTransition();

  const serverStatuses = (searchParams.get("status") ?? "").split(",").filter(Boolean);
  const activeStatuses = optimisticStatuses ? Array.from(optimisticStatuses) : serverStatuses;

  // 서버 파라미터 변경 시 optimistic 상태 초기화
  const serverKey = searchParams.toString();
  const [lastServerKey, setLastServerKey] = useState(serverKey);
  if (serverKey !== lastServerKey) {
    setLastServerKey(serverKey);
    setOptimisticStatuses(null);
  }

  const handleStatusClick = useCallback((status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "") {
      // Total 클릭 → 모든 필터 초기화
      setOptimisticStatuses(new Set());
      startTransition(() => router.push("/", { scroll: false }));
      return;
    }
    const current = new Set(serverStatuses);
    if (current.has(status)) {
      current.delete(status);
    } else {
      current.add(status);
    }
    setOptimisticStatuses(new Set(current));

    if (current.size === 0) {
      params.delete("status");
    } else {
      params.set("status", Array.from(current).join(","));
    }
    startTransition(() => router.push("?" + params.toString(), { scroll: false }));
  }, [router, searchParams, serverStatuses, startTransition]);

  const cards = [
    { label: "Total", value: stats.total, status: "", color: "var(--white)", bg: "linear-gradient(135deg, rgba(100,116,139,0.15), rgba(51,65,85,0.25))", bgActive: "linear-gradient(135deg, rgba(100,116,139,0.25), rgba(51,65,85,0.35))", border: "var(--border-light)", activeBorder: "var(--muted)" },
    { label: "Passed", value: stats.passed, status: "pass", color: "var(--passed)", bg: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(22,163,74,0.18))", bgActive: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(22,163,74,0.30))", border: "rgba(34,197,94,0.15)", activeBorder: "var(--passed)" },
    { label: "Failed", value: stats.failed, status: "fail", color: "var(--failed)", bg: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.18))", bgActive: "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.30))", border: "rgba(239,68,68,0.15)", activeBorder: "var(--failed)" },
    { label: "Broken", value: stats.broken, status: "broken", color: "var(--broken)", bg: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.18))", bgActive: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.30))", border: "rgba(245,158,11,0.15)", activeBorder: "var(--broken)" },
    { label: "Skipped", value: stats.skipped, status: "skip", color: "var(--skipped)", bg: "linear-gradient(135deg, rgba(107,114,128,0.08), rgba(75,85,99,0.18))", bgActive: "linear-gradient(135deg, rgba(107,114,128,0.18), rgba(75,85,99,0.30))", border: "rgba(107,114,128,0.15)", activeBorder: "var(--skipped)" },
  ];

  return (
    <div className="space-y-4">
      {/* 패스율 바 */}
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest shrink-0" style={{ color: "var(--muted)" }}>
          Pass Rate
        </span>
        <div className="flex-1">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
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
        <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: "var(--white)" }}>
          {passRate}%
        </span>
      </div>

      {/* 5개 카드 균등 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const isActive = card.status === ""
            ? activeStatuses.length === 0
            : activeStatuses.includes(card.status);
          return (
            <div
              key={card.label}
              className={`rounded-xl py-5 px-4 text-center transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                card.status === "" ? "col-span-2 sm:col-span-3 lg:col-span-1" : ""
              }`}
              style={{
                background: isActive ? card.bgActive : card.bg,
                border: isActive ? `2px solid ${card.activeBorder}` : `1px solid ${card.border}`,
                boxShadow: isActive ? `0 0 16px ${card.activeBorder}40` : "none",
              }}
              onClick={() => handleStatusClick(card.status)}
            >
              <div className="text-4xl md:text-5xl font-extrabold tabular-nums mb-1.5" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
