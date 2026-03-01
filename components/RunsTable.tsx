"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { formatTimestamp } from "@/lib/utils";

interface RunRow {
  id: string;
  timestamp: string;
  status: string;
  platform: string | null;
  deviceName: string | null;
  platformVersion: string | null;
  gitBranch: string | null;
  gitCommit: string | null;
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
  durationText: string | null;
  remark: string | null;
}

export default function RunsTable({ runs }: { runs: RunRow[] }) {
  if (runs.length === 0) {
    return (
      <div className="glass rounded-2xl text-center py-20 animate-in">
        <div className="text-4xl mb-4 opacity-20">&#x1F50D;</div>
        <div className="text-lg font-medium text-white">
          No data found
        </div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Try changing filters or run a new test
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 데스크톱: 테이블 레이아웃 */}
      <div className="glass rounded-2xl overflow-hidden animate-in hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <Th align="left" style={{ width: 150 }}>Timestamp</Th>
                <Th align="left">Device</Th>
                <Th align="left">Branch</Th>
                <Th align="center" style={{ width: 90 }}>Result</Th>
                <Th align="center" style={{ width: 180 }}>Test Results</Th>
                <Th align="right" style={{ width: 90 }}>Duration</Th>
                <Th align="left" style={{ width: 150 }}>Remark</Th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, i) => {
                const passRate = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0;
                const tsFormatted = formatTimestamp(run.timestamp);
                const [date, time] = tsFormatted.split(" ");

                return (
                  <Link key={run.id} href={`/runs/${run.timestamp}`} className="contents">
                    <tr
                      className="run-row cursor-pointer"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        animationDelay: `${i * 30}ms`,
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium font-mono text-white">{date}</div>
                        <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{time}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background: run.platform === "ios" ? "rgba(167,139,250,0.12)" : "rgba(52,211,153,0.12)",
                              color: run.platform === "ios" ? "#c4b5fd" : "#6ee7b7",
                            }}
                          >
                            {run.platform === "ios" ? "iOS" : "AOS"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate max-w-[200px] text-white">
                              {run.deviceName ?? "-"}
                            </div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>
                              {run.platformVersion ?? run.platform ?? ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <div className="min-w-0">
                            <span className="text-sm font-mono font-medium text-white">{run.gitBranch ?? "-"}</span>
                            {run.gitCommit && (
                              <span className="text-xs font-mono ml-2" style={{ color: "var(--muted)" }}>
                                @{run.gitCommit.slice(0, 7)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.06)" }}>
                            {run.passed > 0 && (
                              <div style={{ width: `${(run.passed / run.total) * 100}%`, background: "var(--passed)" }} />
                            )}
                            {run.failed > 0 && (
                              <div style={{ width: `${(run.failed / run.total) * 100}%`, background: "var(--failed)" }} />
                            )}
                            {run.broken > 0 && (
                              <div style={{ width: `${(run.broken / run.total) * 100}%`, background: "var(--broken)" }} />
                            )}
                            {run.skipped > 0 && (
                              <div style={{ width: `${(run.skipped / run.total) * 100}%`, background: "var(--skipped)" }} />
                            )}
                          </div>
                          <span className="text-xs tabular-nums whitespace-nowrap font-medium text-white">
                            {run.passed}/{run.total}
                          </span>
                        </div>
                        <div className="text-[10px] mt-1 tabular-nums" style={{ color: "var(--muted)" }}>
                          {passRate}% passed
                          {run.failed > 0 && <span style={{ color: "var(--failed)" }}> · {run.failed} fail</span>}
                          {run.broken > 0 && <span style={{ color: "var(--broken)" }}> · {run.broken} broken</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-mono tabular-nums" style={{ color: "var(--muted)" }}>
                          {run.durationText ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {run.remark ? (
                          <div className="text-xs text-white/60 truncate max-w-[140px]" title={run.remark}>
                            {run.remark}
                          </div>
                        ) : (
                          <span className="text-xs text-white/15">-</span>
                        )}
                      </td>
                    </tr>
                  </Link>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모바일: 카드 레이아웃 */}
      <div className="space-y-3 md:hidden animate-in">
        {runs.map((run, i) => {
          const passRate = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0;
          const tsFormatted = formatTimestamp(run.timestamp);
          const [date, time] = tsFormatted.split(" ");

          return (
            <Link key={run.id} href={`/runs/${run.timestamp}`}>
              <div
                className="glass rounded-xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* 상단: 상태 + 타임스탬프 + Duration */}
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={run.status} />
                  <div className="text-right">
                    <div className="text-xs font-mono text-white">{date}</div>
                    <div className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>{time}</div>
                  </div>
                </div>

                {/* 중단: 디바이스 + 브랜치 */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{
                      background: run.platform === "ios" ? "rgba(167,139,250,0.12)" : "rgba(52,211,153,0.12)",
                      color: run.platform === "ios" ? "#c4b5fd" : "#6ee7b7",
                    }}
                  >
                    {run.platform === "ios" ? "iOS" : "AOS"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate text-white">
                      {run.deviceName ?? "-"}
                    </div>
                    <div className="text-xs font-mono truncate" style={{ color: "var(--muted)" }}>
                      {run.gitBranch ?? "-"}
                      {run.gitCommit && ` @${run.gitCommit.slice(0, 7)}`}
                    </div>
                  </div>
                  <div className="text-xs font-mono tabular-nums shrink-0" style={{ color: "var(--muted)" }}>
                    {run.durationText ?? "-"}
                  </div>
                </div>

                {/* Remark */}
                {run.remark && (
                  <div
                    className="text-xs text-white/50 truncate mb-2 px-2 py-1 rounded"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                    title={run.remark}
                  >
                    {run.remark}
                  </div>
                )}

                {/* 하단: 테스트 결과 바 */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.06)" }}>
                    {run.passed > 0 && (
                      <div style={{ width: `${(run.passed / run.total) * 100}%`, background: "var(--passed)" }} />
                    )}
                    {run.failed > 0 && (
                      <div style={{ width: `${(run.failed / run.total) * 100}%`, background: "var(--failed)" }} />
                    )}
                    {run.broken > 0 && (
                      <div style={{ width: `${(run.broken / run.total) * 100}%`, background: "var(--broken)" }} />
                    )}
                    {run.skipped > 0 && (
                      <div style={{ width: `${(run.skipped / run.total) * 100}%`, background: "var(--skipped)" }} />
                    )}
                  </div>
                  <span className="text-[11px] tabular-nums font-medium text-white whitespace-nowrap">
                    {run.passed}/{run.total}
                    <span className="ml-1" style={{ color: "var(--muted)" }}>({passRate}%)</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function Th({ children, align, style }: { children: React.ReactNode; align: string; style?: React.CSSProperties }) {
  return (
    <th
      className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-white/50"
      style={{ textAlign: align as never, ...style }}
    >
      {children}
    </th>
  );
}
