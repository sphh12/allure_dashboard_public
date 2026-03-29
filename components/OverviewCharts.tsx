"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

interface RunData {
  timestamp: string;
  status: string;
  platform: string | null;
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
}

interface Stats {
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
}

// No Data 표시
function NoData() {
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-sm" style={{ color: "var(--muted)" }}>No Data</span>
    </div>
  );
}

// 상태별 색상 (globals.css 변수와 일치)
const STATUS_COLORS: Record<string, string> = {
  Passed: "#22c55e",
  Failed: "#ef4444",
  Broken: "#f59e0b",
  Skipped: "#6b7280",
};

const PLATFORM_COLORS: Record<string, string> = {
  Android: "#6ee7b7",
  iOS: "#c4b5fd",
  Unknown: "#6b7280",
};

// 커스텀 도넛 라벨 (외부) - PieLabelRenderProps 호환
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderOuterLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, name, value, percent } = props;
  if (!percent || percent < 0.03) return null; // 3% 미만은 라벨 생략
  const RADIAN = Math.PI / 180;
  const radius = (outerRadius ?? 80) + 20;
  const x = (cx ?? 0) + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = (cy ?? 0) + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text
      x={x}
      y={y}
      textAnchor={x > (cx ?? 0) ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
      style={{ fill: "var(--text)" }}
    >
      {name} ({value})
    </text>
  );
}

// 커스텀 Tooltip (다크 테마)
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--tooltip-bg)",
        border: "1px solid var(--border-light)",
        borderRadius: 8,
        padding: "8px 12px",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, display: "inline-block" }} />
          <span style={{ color: "var(--muted)" }}>{entry.name}:</span>
          <span style={{ color: "var(--white)", fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Status 이름 → URL 파라미터 값 매핑
const STATUS_TO_PARAM: Record<string, string> = {
  Passed: "pass",
  Failed: "fail",
  Broken: "broken",
  Skipped: "skip",
};

// Platform 이름 → URL 파라미터 값 매핑
const PLATFORM_TO_PARAM: Record<string, string> = {
  Android: "android",
  iOS: "ios",
};

export default function OverviewCharts({ allRuns, allStats, runs }: { allRuns: RunData[]; allStats: Stats; runs: RunData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // 현재 활성 필터 상태
  const activeStatuses = (searchParams.get("status") ?? "").split(",").filter(Boolean);
  const activePlatform = searchParams.get("platform") ?? "";

  // Status 차트 슬라이스 클릭 → status 필터 토글
  const handleStatusClick = useCallback(
    (name: string) => {
      const paramValue = STATUS_TO_PARAM[name];
      if (!paramValue) return;
      const params = new URLSearchParams(searchParams.toString());
      const current = (params.get("status") ?? "").split(",").filter(Boolean);
      const idx = current.indexOf(paramValue);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(paramValue);
      }
      if (current.length === 0) {
        params.delete("status");
      } else {
        params.set("status", current.join(","));
      }
      startTransition(() => router.push("?" + params.toString(), { scroll: false }));
    },
    [router, searchParams, startTransition]
  );

  // Platform 차트 슬라이스 클릭 → platform 필터 토글
  const handlePlatformClick = useCallback(
    (name: string) => {
      const paramValue = PLATFORM_TO_PARAM[name];
      if (!paramValue) return;
      const params = new URLSearchParams(searchParams.toString());
      const currentPlatform = params.get("platform") ?? "";
      if (currentPlatform === paramValue) {
        params.delete("platform"); // 같은 값 클릭 → 해제
      } else {
        params.set("platform", paramValue);
      }
      startTransition(() => router.push("?" + params.toString(), { scroll: false }));
    },
    [router, searchParams, startTransition]
  );
  // 1. Status 도넛 차트 데이터 (항상 전체 기준)
  const statusData = useMemo(() => {
    const data = [
      { name: "Passed", value: allStats.passed },
      { name: "Failed", value: allStats.failed },
      { name: "Broken", value: allStats.broken },
      { name: "Skipped", value: allStats.skipped },
    ].filter((d) => d.value > 0);
    return data;
  }, [allStats]);

  // 2. 트렌드 차트 데이터 (날짜별 테스트 결과 집계)
  const trendData = useMemo(() => {
    // timestamp: "20260305_143000" → "03-05"
    const dateMap = new Map<string, { date: string; passed: number; failed: number; broken: number; total: number }>();

    // 오래된 순서로 정렬
    const sorted = [...runs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    for (const run of sorted) {
      const ts = run.timestamp;
      // "20260305_143000" → "03-05"
      const dateKey = ts.length >= 8 ? `${ts.slice(4, 6)}-${ts.slice(6, 8)}` : ts;
      const existing = dateMap.get(dateKey) ?? { date: dateKey, passed: 0, failed: 0, broken: 0, total: 0 };
      existing.passed += run.passed;
      existing.failed += run.failed;
      existing.broken += run.broken;
      existing.total += run.total;
      dateMap.set(dateKey, existing);
    }

    return Array.from(dateMap.values());
  }, [runs]);

  // 3. Platform 도넛 차트 데이터 (항상 전체 기준)
  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const run of allRuns) {
      const p = run.platform === "ios" ? "iOS" : run.platform === "android" ? "Android" : "Unknown";
      counts[p] = (counts[p] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [allRuns]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
      {/* Status 분포 도넛 차트 */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--white)" }}>Status</h3>
        <div className="h-[220px]">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderOuterLabel}
                  labelLine={false}
                  strokeWidth={0}
                >
                  {statusData.map((entry) => {
                    const paramValue = STATUS_TO_PARAM[entry.name];
                    const isActive = activeStatuses.length === 0 || activeStatuses.includes(paramValue);
                    return (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#6b7280"}
                        fillOpacity={isActive ? 1 : 0.15}
                        cursor="pointer"
                        onClick={() => handleStatusClick(entry.name)}
                      />
                    );
                  })}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" fontSize={28} fontWeight={700} style={{ fill: "var(--white)" }}>
                  {allStats.total}
                </text>
                <text x="50%" y="57%" textAnchor="middle" fontSize={11} style={{ fill: "var(--muted)" }}>
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </div>
        {/* 범례 */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {statusData.map((entry) => {
            const paramValue = STATUS_TO_PARAM[entry.name];
            const isActive = activeStatuses.length === 0 || activeStatuses.includes(paramValue);
            return (
              <div
                key={entry.name}
                className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{ opacity: isActive ? 1 : 0.35 }}
                onClick={() => handleStatusClick(entry.name)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: STATUS_COLORS[entry.name] }}
                />
                <span style={{ color: "var(--muted)" }}>{entry.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 테스트 실행 트렌드 차트 */}
      <div className="glass rounded-2xl p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--white)" }}>Test Results Trend</h3>
        <div className="h-[220px]">
          {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPassed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--passed)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--passed)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--failed)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--failed)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--chart-axis)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="passed"
                name="Passed"
                stroke="var(--passed)"
                fill="url(#gradPassed)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke="var(--failed)"
                fill="url(#gradFailed)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="broken"
                name="Broken"
                stroke="var(--broken)"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </div>
        {/* 범례 */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {[
            { name: "Passed", color: "#22c55e" },
            { name: "Failed", color: "#ef4444" },
            { name: "Broken", color: "#f59e0b" },
          ].map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
              <span style={{ color: "var(--muted)" }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform 분포 차트 */}
        <div className="glass rounded-2xl p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--white)" }}>Platform</h3>
          <div className="h-[220px]">
            {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderOuterLabel}
                  labelLine={false}
                  strokeWidth={0}
                >
                  {platformData.map((entry) => {
                    const paramValue = PLATFORM_TO_PARAM[entry.name];
                    const isActive = !activePlatform || activePlatform === paramValue;
                    return (
                      <Cell
                        key={entry.name}
                        fill={PLATFORM_COLORS[entry.name] ?? "#6b7280"}
                        fillOpacity={isActive ? 1 : 0.15}
                        cursor="pointer"
                        onClick={() => handlePlatformClick(entry.name)}
                      />
                    );
                  })}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" fontSize={28} fontWeight={700} style={{ fill: "var(--white)" }}>
                  {allRuns.length}
                </text>
                <text x="50%" y="57%" textAnchor="middle" fontSize={11} style={{ fill: "var(--muted)" }}>
                  Runs
                </text>
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {platformData.map((entry) => {
              const paramValue = PLATFORM_TO_PARAM[entry.name];
              const isActive = !activePlatform || activePlatform === paramValue;
              return (
                <div
                  key={entry.name}
                  className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ opacity: isActive ? 1 : 0.35 }}
                  onClick={() => handlePlatformClick(entry.name)}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: PLATFORM_COLORS[entry.name] ?? "#6b7280" }}
                  />
                  <span style={{ color: "var(--muted)" }}>{entry.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      {/* Pass Rate 트렌드 바 차트 */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--white)" }}>Pass Rate by Date</h3>
          <div className="h-[220px]">
            {trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={{ stroke: "var(--chart-axis)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="passed" name="Passed" fill="var(--passed)" radius={[3, 3, 0, 0]} stackId="stack" />
                <Bar dataKey="failed" name="Failed" fill="var(--failed)" radius={[0, 0, 0, 0]} stackId="stack" />
                <Bar dataKey="broken" name="Broken" fill="var(--broken)" radius={[3, 3, 0, 0]} stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {[
              { name: "Passed", color: "#22c55e" },
              { name: "Failed", color: "#ef4444" },
              { name: "Broken", color: "#f59e0b" },
            ].map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
                <span style={{ color: "var(--muted)" }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
