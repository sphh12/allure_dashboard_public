"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  label: string;
  value: string;
}

export default function EnvCard({ label, value }: Props) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = textRef.current;
      if (el) {
        // 2px 여유를 두어 서브픽셀 오차로 인한 오탐 방지
        setIsTruncated(el.scrollWidth > el.clientWidth + 2);
      }
    };
    check();
    // 윈도우 리사이즈 시에도 재확인
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [value]);

  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "var(--subtle-bg)", border: "1px solid var(--border)" }}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div
        ref={textRef}
        className={`text-xs font-mono truncate ${isTruncated ? "cursor-help" : ""}`}
        style={{ color: "var(--text)" }}
        title={isTruncated ? value : undefined}
      >
        {value}
      </div>
    </div>
  );
}
