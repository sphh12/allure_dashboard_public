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
}

export default function RunsTable({ runs }: { runs: RunRow[] }) {
  if (runs.length === 0) {
    return (
      <div className="glass rounded-2xl text-center py-20 animate-in">
        <div className="text-4xl mb-4 opacity-20">&#x1F50D;</div>
        <div className="text-lg font-medium text-white">
          데이터가 없습니다
        </div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          필터를 변경하거나 새로운 테스트를 실행해보세요
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden animate-in">
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
                    {/* Timestamp */}
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium font-mono text-white">{date}</div>
                      <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{time}</div>
                    </td>

                    {/* Device */}
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

                    {/* Branch */}
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

                    {/* Result Badge */}
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={run.status} />
                    </td>

                    {/* Test Results */}
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

                    {/* Duration */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-mono tabular-nums" style={{ color: "var(--muted)" }}>
                        {run.durationText ?? "-"}
                      </span>
                    </td>
                  </tr>
                </Link>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
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
