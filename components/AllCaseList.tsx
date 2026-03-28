"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

interface StepItem {
  name: string;
  status: string;
  statusMessage?: string;
  steps?: StepItem[];
  attachments?: { name: string; source: string; type: string }[];
}

interface TestCaseArtifact {
  id: string;
  type: string;
  name: string;
  source: string;
  url: string;
  contentType: string | null;
  sizeBytes: number | null;
}

interface TestCaseItem {
  id: string;
  uid: string;
  name: string;
  fullName: string;
  status: string;
  statusMessage: string | null;
  statusTrace: string | null;
  description: string | null;
  suite: string | null;
  severity: string | null;
  durationMs: number;
  steps: StepItem[] | null;
  artifacts: TestCaseArtifact[];
}

// 소요 시간 포맷
function formatDuration(ms: number): string {
  if (ms === 0) return "-";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

// 상태 순서 (failed > broken > skipped > passed)
function statusOrder(status: string): number {
  switch (status) {
    case "failed": return 0;
    case "broken": return 1;
    case "skipped": return 2;
    case "passed": return 3;
    default: return 4;
  }
}

// 상태별 행 배경색
function statusRowBg(status: string): string {
  switch (status) {
    case "failed": return "rgba(239,68,68,0.04)";
    case "broken": return "rgba(245,158,11,0.04)";
    case "skipped": return "rgba(107,114,128,0.04)";
    default: return "transparent";
  }
}

export default function AllCaseList({ testCases }: { testCases: TestCaseItem[] }) {
  const [filter, setFilter] = useState<string>("all");

  // 상태별 정렬
  const sorted = [...testCases].sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
  const filtered = filter === "all" ? sorted : sorted.filter((tc) => tc.status === filter);

  // 상태별 카운트
  const counts = { all: testCases.length, passed: 0, failed: 0, broken: 0, skipped: 0 };
  for (const tc of testCases) {
    if (tc.status in counts) counts[tc.status as keyof typeof counts]++;
  }

  return (
    <div>
      {/* 헤더 + 필터 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text)" }}>
            Test Cases ({filtered.length})
          </span>
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-1">
          {(["all", "passed", "failed", "broken", "skipped"] as const).map((s) => {
            const count = counts[s];
            if (s !== "all" && count === 0) return null;
            const isActive = filter === s;
            const colorMap: Record<string, string> = {
              all: "var(--text)",
              passed: "var(--passed)",
              failed: "var(--failed)",
              broken: "var(--broken)",
              skipped: "var(--skipped)",
            };
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-all"
                style={{
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  color: isActive ? colorMap[s] : "var(--muted)",
                  border: isActive ? `1px solid ${colorMap[s]}33` : "1px solid transparent",
                }}
              >
                {s === "all" ? "All" : s} {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* 테스트 케이스 테이블 */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {filtered.map((tc, i) => (
          <div
            key={tc.id}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
            style={{
              background: statusRowBg(tc.status),
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            {/* 상태 배지 */}
            <div className="shrink-0">
              <StatusBadge status={tc.status} size="sm" />
            </div>

            {/* 테스트명 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                {tc.name}
              </div>
              {tc.fullName && (
                <div className="text-[10px] truncate font-mono" style={{ color: "var(--muted)" }}>
                  {tc.fullName}
                </div>
              )}
            </div>

            {/* severity */}
            {tc.severity && (
              <span
                className="text-[10px] uppercase tracking-wider shrink-0 hidden sm:inline"
                style={{ color: "var(--muted)" }}
              >
                {tc.severity}
              </span>
            )}

            {/* 소요 시간 */}
            <span className="text-xs tabular-nums shrink-0 w-16 text-right" style={{ color: "var(--muted)" }}>
              {formatDuration(tc.durationMs)}
            </span>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-6 text-xs" style={{ color: "var(--muted)" }}>
            해당 상태의 테스트 케이스가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
