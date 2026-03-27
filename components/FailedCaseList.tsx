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

// severity 아이콘
function severityIcon(severity: string | null) {
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

// 개별 테스트 케이스 카드
function TestCaseCard({ tc }: { tc: TestCaseItem }) {
  const [expanded, setExpanded] = useState(false);
  const [traceExpanded, setTraceExpanded] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const hasSteps = tc.steps && Array.isArray(tc.steps) && tc.steps.length > 0;
  const hasArtifacts = tc.artifacts && tc.artifacts.length > 0;
  const hasError = tc.statusMessage || tc.statusTrace;

  // 아티팩트 분류
  const images = tc.artifacts?.filter((a) => (a.contentType || a.type || "").toLowerCase().startsWith("image/")) ?? [];
  const videos = tc.artifacts?.filter((a) => (a.contentType || a.type || "").toLowerCase().startsWith("video/")) ?? [];

  const borderColor =
    tc.status === "failed"
      ? "rgba(239,68,68,0.3)"
      : tc.status === "broken"
        ? "rgba(245,158,11,0.3)"
        : "var(--border)";

  return (
    <>
      <div
        className="rounded-xl overflow-hidden transition-all"
        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${borderColor}` }}
      >
        {/* 헤더 — 클릭으로 펼치기/접기 */}
        <button
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
          onClick={() => setExpanded(!expanded)}
        >
          {/* 상태 아이콘 */}
          <div className="shrink-0">
            <StatusBadge status={tc.status} size="sm" />
          </div>

          {/* 테스트명 + 스위트 */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{tc.name}</div>
            {tc.suite && (
              <div className="text-[10px] truncate" style={{ color: "var(--muted)" }}>
                {tc.suite}
              </div>
            )}
          </div>

          {/* severity + duration */}
          <div className="flex items-center gap-3 shrink-0">
            {tc.severity && (
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {severityIcon(tc.severity)} {tc.severity}
              </span>
            )}
            <span className="text-xs tabular-nums" style={{ color: "var(--muted)" }}>
              {formatDuration(tc.durationMs)}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--muted)" }}
            >
              <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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

            {/* 관련 아티팩트 — 스크린샷 */}
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

            {/* 관련 아티팩트 — 비디오 */}
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

            {/* 에러도 스텝도 아티팩트도 없는 경우 */}
            {!hasError && !hasSteps && !hasArtifacts && (
              <div className="text-xs text-center py-2" style={{ color: "var(--muted)" }}>
                상세 정보 없음
              </div>
            )}
          </div>
        )}
      </div>

      {/* 이미지 모달 */}
      {modalImage && <ImageModal src={modalImage} alt="screenshot" onClose={() => setModalImage(null)} />}
    </>
  );
}

export default function FailedCaseList({ testCases }: { testCases: TestCaseItem[] }) {
  // failed/broken 케이스만 필터
  const failedCases = testCases.filter((tc) => tc.status === "failed" || tc.status === "broken");

  if (failedCases.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--failed)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--failed)" }}>
          Failed / Broken Cases ({failedCases.length})
        </span>
      </div>

      <div className="space-y-2">
        {failedCases.map((tc) => (
          <TestCaseCard key={tc.id} tc={tc} />
        ))}
      </div>
    </div>
  );
}
