"use client";

import { useState, useCallback } from "react";

interface Artifact {
  id: string;
  type: string;
  name: string;
  source: string;
  url: string;
  contentType: string | null;
  sizeBytes: number | null;
}

// 아이콘 컴포넌트
function ImageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
      <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
      <path d="M21 15l-5-5L5 21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="4" width="15" height="16" rx="2" strokeWidth="1.5" />
      <path d="M17 9l5-3v12l-5-3V9z" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeWidth="1.5" />
      <polyline points="14 2 14 8 20 8" strokeWidth="1.5" />
      <line x1="8" y1="13" x2="16" y2="13" strokeWidth="1.5" />
      <line x1="8" y1="17" x2="16" y2="17" strokeWidth="1.5" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="8 6 2 12 8 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 파일 크기 포맷
function formatSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 타입 분류
function classifyArtifact(a: Artifact): "image" | "video" | "json" | "xml" | "text" {
  const ct = (a.contentType || a.type || "").toLowerCase();
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("video/")) return "video";
  if (ct.includes("json")) return "json";
  if (ct.includes("xml")) return "xml";
  return "text";
}

function typeIcon(kind: string) {
  switch (kind) {
    case "image": return <ImageIcon />;
    case "video": return <VideoIcon />;
    case "json": case "xml": return <CodeIcon />;
    default: return <FileTextIcon />;
  }
}

function typeLabel(kind: string) {
  switch (kind) {
    case "image": return "Screenshot";
    case "video": return "Video";
    case "json": return "JSON";
    case "xml": return "Page Source";
    default: return "Log";
  }
}

function typeBadgeStyle(kind: string) {
  switch (kind) {
    case "image": return { bg: "var(--accent-dim)", color: "var(--accent)" };
    case "video": return { bg: "var(--accent2-dim)", color: "var(--accent2)" };
    case "json": return { bg: "var(--passed-dim)", color: "var(--passed)" };
    case "xml": return { bg: "var(--broken-dim)", color: "var(--broken)" };
    default: return { bg: "var(--border-light)", color: "var(--muted)" };
  }
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
        <CloseIcon />
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

// 스크린샷 카드
function ScreenshotCard({ artifact }: { artifact: Artifact }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        className="group relative overflow-hidden rounded-lg cursor-pointer border transition-all"
        style={{ background: "var(--subtle-bg)", borderColor: "var(--border)" }}
        onClick={() => setModalOpen(true)}
      >
        <img
          src={artifact.url}
          alt={artifact.name}
          className="w-full h-40 object-cover object-top transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.8)" }}>{artifact.name}</p>
          {artifact.sizeBytes && (
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>{formatSize(artifact.sizeBytes)}</p>
          )}
        </div>
      </button>
      {modalOpen && (
        <ImageModal src={artifact.url} alt={artifact.name} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// 비디오 카드
function VideoCard({ artifact }: { artifact: Artifact }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--subtle-bg)", border: "1px solid var(--border)" }}
    >
      <video
        src={artifact.url}
        controls
        preload="metadata"
        className="w-full max-h-[400px] bg-black"
      />
      <div className="px-3 py-2 flex items-center justify-between">
        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{artifact.name}</p>
        {artifact.sizeBytes && (
          <span className="text-[10px] ml-2 shrink-0" style={{ color: "var(--muted)" }}>{formatSize(artifact.sizeBytes)}</span>
        )}
      </div>
    </div>
  );
}

// 텍스트/코드 뷰어
function TextViewer({ artifact, language }: { artifact: Artifact; language: string }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContent = useCallback(async () => {
    if (content !== null) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(artifact.url);
      let text = await res.text();
      // JSON은 포맷팅
      if (language === "json") {
        try { text = JSON.stringify(JSON.parse(text), null, 2); } catch { /* 원본 유지 */ }
      }
      setContent(text);
      setExpanded(true);
    } catch {
      setContent("[Load failed]");
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  }, [artifact.url, content, expanded, language]);

  const badgeStyle = typeBadgeStyle(language);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--subtle-bg)", border: "1px solid var(--border)" }}
    >
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
        onClick={loadContent}
      >
        <span
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold uppercase shrink-0"
          style={{ background: badgeStyle.bg, color: badgeStyle.color }}
        >
          {typeIcon(language)}
          {typeLabel(language)}
        </span>
        <span className="text-sm truncate text-left flex-1" style={{ color: "var(--muted)" }}>{artifact.name}</span>
        <div className="flex items-center gap-2 shrink-0">
          {artifact.sizeBytes && (
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>{formatSize(artifact.sizeBytes)}</span>
          )}
          {loading ? (
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>Loading...</span>
          ) : (
            <ExpandIcon expanded={expanded} />
          )}
        </div>
      </button>
      {expanded && content !== null && (
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <pre
            className="p-3 text-xs font-mono overflow-auto max-h-[400px] leading-relaxed"
            style={{ background: "var(--panel-solid)", color: "var(--text)" }}
          >
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}

// 메인 ArtifactViewer
export default function ArtifactViewer({ artifacts }: { artifacts: Artifact[] }) {
  // URL이 있는 첨부파일만 표시
  const withUrl = artifacts.filter((a) => a.url);
  if (withUrl.length === 0) return null;

  // 타입별 그룹화
  const images = withUrl.filter((a) => classifyArtifact(a) === "image");
  const videos = withUrl.filter((a) => classifyArtifact(a) === "video");
  const texts = withUrl.filter((a) => {
    const kind = classifyArtifact(a);
    return kind === "text" || kind === "json" || kind === "xml";
  });

  return (
    <div className="space-y-4">
      {/* 스크린샷 그리드 */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: "var(--muted)" }}><ImageIcon /></span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Screenshots ({images.length})
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((a) => <ScreenshotCard key={a.id} artifact={a} />)}
          </div>
        </div>
      )}

      {/* 비디오 */}
      {videos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: "var(--muted)" }}><VideoIcon /></span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Videos ({videos.length})
            </span>
          </div>
          <div className="space-y-3">
            {videos.map((a) => <VideoCard key={a.id} artifact={a} />)}
          </div>
        </div>
      )}

      {/* 텍스트/코드 파일 */}
      {texts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: "var(--muted)" }}><FileTextIcon /></span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Logs & Data ({texts.length})
            </span>
          </div>
          <div className="space-y-2">
            {texts.map((a) => (
              <TextViewer key={a.id} artifact={a} language={classifyArtifact(a)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
