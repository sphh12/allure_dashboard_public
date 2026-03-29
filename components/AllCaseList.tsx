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

// severity 아이콘 (FailedCaseList와 동일)
function severityIcon(severity: string | null): string {
  switch (severity) {
    case "blocker":
    case "critical":
      return "🔴";
    case "normal":
      return "🟡";
    case "minor":
    case "trivial":
      return "🟢";
    default:
      return "⚪";
  }
}

// 스텝 상태 아이콘
function stepStatusIcon(status: string) {
  switch (status) {
    case "passed":
      return <span style={{ color: "var(--passed)" }}>✓</span>;
    case "failed":
      return <span style={{ color: "var(--failed)" }}>✗</span>;
    case "broken":
      return <span style={{ color: "var(--broken)" }}>!</span>;
    case "skipped":
      return <span style={{ color: "var(--skipped)" }}>○</span>;
    default:
      return <span style={{ color: "var(--muted)" }}>·</span>;
  }
}

// 스텝 트리 렌더링 (재귀)
function StepTree({ steps, depth = 0 }: { steps: StepItem[]; depth?: number }) {
  return (
    <div className="space-y-0.5">
      {steps.map((step, i) => (
        <div key={i}>
          <div
            className="flex items-start gap-2 py-1 px-2 rounded text-xs"
            style={{
              paddingLeft: `${depth * 16 + 8}px`,
              background:
                step.status === "failed" || step.status === "broken"
                  ? "rgba(239,68,68,0.06)"
                  : "transparent",
            }}
          >
            <span className="shrink-0 w-4 text-center font-mono">
              {stepStatusIcon(step.status)}
            </span>
            <span
              className="flex-1"
              style={{
                color:
                  step.status === "failed" || step.status === "broken"
                    ? "#fca5a5"
                    : "var(--text)",
              }}
            >
              {step.name}
            </span>
          </div>
          {step.statusMessage && (step.status === "failed" || step.status === "broken") && (
            <div
              className="text-[11px] font-mono px-2 py-1 rounded mx-2 mt-0.5"
              style={{
                paddingLeft: `${depth * 16 + 28}px`,
                color: "#fca5a5",
                background: "rgba(239,68,68,0.08)",
              }}
            >
              {step.statusMessage}
            </div>
          )}
          {step.steps && step.steps.length > 0 && (
            <StepTree steps={step.steps} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

// 이미지 모달
function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// 개별 테스트 케이스 행 (펼치기 지원)
function TestCaseRow({ tc }: { tc: TestCaseItem }) {
  const [expanded, setExpanded] = useState(false);
  const [traceExpanded, setTraceExpanded] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const hasSteps = tc.steps && Array.isArray(tc.steps) && tc.steps.length > 0;
  const hasArtifacts = tc.artifacts && tc.artifacts.length > 0;
  const hasError = tc.statusMessage || tc.statusTrace;
  const hasDetails = hasSteps || hasArtifacts || hasError;

  const images = tc.artifacts?.filter((a) => (a.contentType || a.type || "").toLowerCase().startsWith("image/")) ?? [];
  const videos = tc.artifacts?.filter((a) => (a.contentType || a.type || "").toLowerCase().startsWith("video/")) ?? [];

  const borderColor =
    tc.status === "failed"
      ? "rgba(239,68,68,0.15)"
      : tc.status === "broken"
        ? "rgba(245,158,11,0.15)"
        : "var(--border)";

  return (
    <>
      <div style={{ borderBottom: `1px solid ${borderColor}` }}>
        {/* 헤더 행 */}
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02] text-left"
          onClick={() => hasDetails && setExpanded(!expanded)}
          style={{ cursor: hasDetails ? "pointer" : "default" }}
        >
          <div className="shrink-0">
            <StatusBadge status={tc.status} size="sm" />
          </div>

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

          <span
            className="text-[10px] uppercase tracking-wider shrink-0 hidden sm:inline w-24 text-right"
            style={{ color: "var(--muted)" }}
          >
            {tc.severity ? `${severityIcon(tc.severity)} ${tc.severity}` : ""}
          </span>

          <span className="text-xs tabular-nums shrink-0 w-16 text-right" style={{ color: "var(--muted)" }}>
            {formatDuration(tc.durationMs)}
          </span>

          <div className="w-4 shrink-0 flex justify-center">
            {hasDetails ? (
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--muted)" }}
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </div>
        </button>

        {/* 펼침 영역 */}
        {expanded && (
          <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: "var(--border)" }}>
            {/* 에러 메시지 */}
            {tc.statusMessage && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--failed)" }}>
                  Error Message
                </div>
                <div
                  className="rounded-lg px-3 py-2.5 text-xs font-mono leading-relaxed break-all"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    color: "#fca5a5",
                  }}
                >
                  {tc.statusMessage.split("\n")[0]}
                </div>
              </div>
            )}

            {/* 스택 트레이스 */}
            {tc.statusTrace && (
              <div>
                <button
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-1.5 hover:text-white/60 transition-colors"
                  style={{ color: "var(--muted)" }}
                  onClick={() => setTraceExpanded(!traceExpanded)}
                >
                  Stack Trace
                  <svg
                    className={`w-3 h-3 transition-transform ${traceExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {traceExpanded && (
                  <pre
                    className="rounded-lg px-3 py-2.5 text-[11px] font-mono leading-relaxed overflow-auto max-h-[300px]"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                    }}
                  >
                    {tc.statusTrace}
                  </pre>
                )}
              </div>
            )}

            {/* 스텝 상세 */}
            {hasSteps && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>
                  Steps ({tc.steps!.length})
                </div>
                <div
                  className="rounded-lg py-1.5 overflow-auto max-h-[250px]"
                  style={{ background: "rgba(0,0,0,0.15)", border: "1px solid var(--border)" }}
                >
                  <StepTree steps={tc.steps!} />
                </div>
              </div>
            )}

            {/* 스크린샷 */}
            {images.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>
                  Screenshots ({images.length})
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map((a) => (
                    <button
                      key={a.id}
                      className="group relative overflow-hidden rounded-lg border transition-all hover:border-white/20"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--border)" }}
                      onClick={() => setModalImage(a.url)}
                    >
                      <img
                        src={a.url}
                        alt={a.name}
                        className="w-full h-24 object-cover object-top transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 비디오 */}
            {videos.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>
                  Videos ({videos.length})
                </div>
                {videos.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
                  >
                    <video src={a.url} controls preload="metadata" className="w-full max-h-[300px] bg-black" />
                    <div className="px-2 py-1 text-[10px] text-white/50 truncate">{a.name}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 상세 정보 없음 */}
            {!hasError && !hasSteps && !hasArtifacts && (
              <div className="text-xs text-center py-2" style={{ color: "var(--muted)" }}>
                상세 정보 없음
              </div>
            )}
          </div>
        )}
      </div>

      {modalImage && <ImageModal src={modalImage} alt="screenshot" onClose={() => setModalImage(null)} />}
    </>
  );
}

export default function AllCaseList({ testCases }: { testCases: TestCaseItem[] }) {
  const [filter, setFilter] = useState<string>("all");

  // fullName 기준 정렬 (실행 순서 유지: test_01, test_02, ...)
  const sorted = [...testCases].sort((a, b) => a.fullName.localeCompare(b.fullName));
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
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Test Cases ({filtered.length})
        </span>

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

      {/* 테스트 케이스 목록 */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {filtered.map((tc) => (
          <TestCaseRow key={tc.id} tc={tc} />
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
