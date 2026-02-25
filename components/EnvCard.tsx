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
    const el = textRef.current;
    if (el) {
      // scrollWidth > clientWidth이면 텍스트가 잘린 것
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [value]);

  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider mb-1 text-white/30">
        {label}
      </div>
      <div
        ref={textRef}
        className={`text-xs font-mono truncate text-white/80 ${isTruncated ? "cursor-help" : ""}`}
        title={isTruncated ? value : undefined}
      >
        {value}
      </div>
    </div>
  );
}
