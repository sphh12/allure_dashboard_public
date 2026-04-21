"use client";

import { DEMO_MODE } from "@/lib/masking";

export default function DemoBadge() {
  if (!DEMO_MODE) return null;

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm"
      style={{
        background: "rgba(245, 158, 11, 0.15)",
        border: "1px solid rgba(245, 158, 11, 0.4)",
        color: "#fcd34d",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: "#f59e0b" }}
      />
      Demo Mode — 샘플 데이터
    </div>
  );
}
