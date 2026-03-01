import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import ArtifactViewer from "@/components/ArtifactViewer";
import EnvCard from "@/components/EnvCard";
import RemarkEditor from "@/components/RemarkEditor";
import { formatTimestamp } from "@/lib/utils";

interface SuiteItem {
  name: string;
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ timestamp: string }>;
}) {
  const { timestamp } = await params;
  const run = await prisma.run.findUnique({
    where: { timestamp },
    include: { artifacts: true },
  });

  if (!run) notFound();

  const env: Record<string, string> = {
    ...((run.environment as unknown as Record<string, string>) ?? {}),
    // DB 최상위 필드를 우선 사용 (environment JSON 내 값은 인코딩이 깨질 수 있음)
    gitMessage: run.gitMessage ?? "",
    gitBranch: run.gitBranch ?? "",
    gitCommit: run.gitCommit ?? "",
  };
  const suites = (run.suites as unknown as SuiteItem[]) ?? [];
  const behaviors = (run.behaviors as unknown as SuiteItem[]) ?? [];
  const passRate = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0;

  const priorityEnv = ["platform", "deviceName", "platformVersion", "automationName", "app", "gitBranch", "gitCommit", "gitMessage"];
  const otherEnv = Object.keys(env).filter((k) => !priorityEnv.includes(k));

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 animate-in">
      {/* 네비게이션 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-8 hover:text-white transition-colors"
        style={{ color: "var(--muted)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        대시보드
      </Link>

      {/* 헤더 카드 */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
                {formatTimestamp(run.timestamp)}
              </h1>
              <StatusBadge status={run.status} size="lg" />
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
              {run.durationText && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" d="M12 6v6l4 2" strokeWidth="2" />
                  </svg>
                  <span className="text-white/70">{run.durationText}</span>
                </span>
              )}
              {env.platform && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                    style={{
                      background: env.platform === "ios" ? "rgba(167,139,250,0.12)" : "rgba(52,211,153,0.12)",
                      color: env.platform === "ios" ? "#c4b5fd" : "#6ee7b7",
                    }}
                  >
                    {env.platform === "ios" ? "iOS" : "AOS"}
                  </span>
                  <span className="text-white/70">{env.deviceName}</span>
                </span>
              )}
            </div>
          </div>

          {/* 패스율 원형 */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke={passRate === 100 ? "var(--passed)" : passRate >= 70 ? "var(--broken)" : "var(--failed)"}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${passRate * 2.136} 213.6`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold tabular-nums text-white">{passRate}%</span>
              </div>
            </div>
            <span className="text-[10px] mt-1 text-white/30 uppercase tracking-wider">Pass Rate</span>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Total", value: run.total, color: "#ffffff", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
            { label: "Passed", value: run.passed, color: "var(--passed)", bg: "var(--passed-dim)", border: "rgba(34,197,94,0.15)" },
            { label: "Failed", value: run.failed, color: "var(--failed)", bg: "var(--failed-dim)", border: "rgba(239,68,68,0.15)" },
            { label: "Broken", value: run.broken, color: "var(--broken)", bg: "var(--broken-dim)", border: "rgba(245,158,11,0.15)" },
            { label: "Skipped", value: run.skipped, color: "var(--skipped)", bg: "var(--skipped-dim)", border: "rgba(107,114,128,0.15)" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl py-3 text-center"
              style={{ background: item.bg, border: `1px solid ${item.border}` }}
            >
              <div className="text-xl font-bold tabular-nums" style={{ color: item.color }}>{item.value}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Git 정보 */}
      {env.gitBranch && (
        <div className="glass rounded-2xl p-5 mb-6">
          <SectionTitle>Git Info</SectionTitle>
          <div className="flex flex-wrap gap-3 mt-3">
            <InfoChip label="Branch" value={env.gitBranch} />
            {env.gitCommit && <InfoChip label="Commit" value={env.gitCommit} mono />}
            {env.gitMessage && <InfoChip label="Message" value={env.gitMessage} wide />}
          </div>
        </div>
      )}

      {/* Remark */}
      <RemarkEditor timestamp={run.timestamp} initialRemark={run.remark} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Suites */}
        {suites.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <SectionTitle>Suites</SectionTitle>
            <SuiteList items={suites} />
          </div>
        )}

        {/* Actions */}
        {behaviors.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <SectionTitle>Actions</SectionTitle>
            <SuiteList items={behaviors} />
          </div>
        )}
      </div>

      {/* Environment */}
      <div className="glass rounded-2xl p-5 mb-6">
        <SectionTitle>Environment</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {[...priorityEnv.filter((k) => env[k]), ...otherEnv.filter((k) => env[k])].map((key) => {
            const displayValue = key === "app" ? String(env[key]).split(/[/\\]/).pop() || env[key] : String(env[key]);
            const displayKey = key.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
            return <EnvCard key={key} label={displayKey} value={displayValue} />;
          })}
        </div>
      </div>

      {/* Artifacts */}
      {run.artifacts.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <SectionTitle>Artifacts</SectionTitle>
          <div className="mt-3">
            <ArtifactViewer artifacts={run.artifacts} />
          </div>
        </div>
      )}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
      {children}
    </h2>
  );
}

function InfoChip({ label, value, mono, wide }: { label: string; value: string; mono?: boolean; wide?: boolean }) {
  return (
    <div
      className={`rounded-lg px-3 py-2 ${wide ? "flex-1 min-w-[200px]" : ""}`}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span className="text-[10px] uppercase tracking-wider mr-2 text-white/30">{label}</span>
      <span className={`text-sm text-white ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function SuiteList({ items }: { items: SuiteItem[] }) {
  return (
    <div className="space-y-2 mt-3">
      {items.map((item, i) => {
        const passRate = item.total > 0 ? Math.round((item.passed / item.total) * 100) : 0;
        return (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
          >
            <span className="flex-1 text-sm font-medium truncate text-white/90">{item.name}</span>

            <div className="flex items-center gap-2 text-xs tabular-nums">
              <span style={{ color: "var(--passed)" }}>{item.passed}</span>
              <span style={{ color: item.failed > 0 ? "var(--failed)" : "var(--muted)" }}>{item.failed}</span>
              <span style={{ color: item.broken > 0 ? "var(--broken)" : "var(--muted)" }}>{item.broken}</span>
            </div>

            <div className="w-20 h-1.5 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.06)" }}>
              {item.passed > 0 && <div style={{ width: `${(item.passed / item.total) * 100}%`, background: "var(--passed)" }} />}
              {item.failed > 0 && <div style={{ width: `${(item.failed / item.total) * 100}%`, background: "var(--failed)" }} />}
              {item.broken > 0 && <div style={{ width: `${(item.broken / item.total) * 100}%`, background: "var(--broken)" }} />}
              {item.skipped > 0 && <div style={{ width: `${(item.skipped / item.total) * 100}%`, background: "var(--skipped)" }} />}
            </div>

            <span className="text-xs w-8 text-right tabular-nums font-medium" style={{ color: passRate === 100 ? "var(--passed)" : "var(--muted)" }}>
              {passRate}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
