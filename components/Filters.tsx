"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const platforms = ["", "android", "ios"];
const statuses = [
  { value: "pass", label: "PASS", color: "var(--passed)", bg: "var(--passed-dim)" },
  { value: "fail", label: "FAIL", color: "var(--failed)", bg: "var(--failed-dim)" },
  { value: "broken", label: "BROKEN", color: "var(--broken)", bg: "var(--broken-dim)" },
  { value: "skip", label: "SKIP", color: "var(--skipped)", bg: "var(--skipped-dim)" },
];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") ?? "";

  const hasFilters = searchParams.toString().length > 0;

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push("?" + params.toString());
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/");
  }, [router]);

  const controlStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    color: "var(--text)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div className="glass-bright rounded-xl p-4 space-y-3">
      {/* 상단: 검색 + Platform + Clear */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* 검색 아이콘 + 인풋 */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="timestamp, branch, device, commit..."
            defaultValue={searchParams.get("q") ?? ""}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all placeholder:text-white/20"
            style={controlStyle}
            onKeyDown={(e) => {
              if (e.key === "Enter") update("q", e.currentTarget.value);
            }}
          />
        </div>

        {/* Platform */}
        <select
          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all cursor-pointer"
          style={controlStyle}
          value={searchParams.get("platform") ?? ""}
          onChange={(e) => update("platform", e.target.value)}
        >
          <option value="">Platform</option>
          {platforms.filter(Boolean).map((p) => (
            <option key={p} value={p}>
              {p === "android" ? "Android" : "iOS"}
            </option>
          ))}
        </select>

        {/* Date from */}
        <input
          type={searchParams.get("from") ? "date" : "text"}
          placeholder="From"
          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all cursor-pointer placeholder:text-white/20 w-[130px]"
          style={controlStyle}
          value={searchParams.get("from") ?? ""}
          onFocus={(e) => { e.currentTarget.type = "date"; }}
          onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }}
          onChange={(e) => update("from", e.target.value)}
        />

        {/* Date to */}
        <input
          type={searchParams.get("to") ? "date" : "text"}
          placeholder="To"
          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all cursor-pointer placeholder:text-white/20 w-[130px]"
          style={controlStyle}
          value={searchParams.get("to") ?? ""}
          onFocus={(e) => { e.currentTarget.type = "date"; }}
          onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }}
          onChange={(e) => update("to", e.target.value)}
        />

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 cursor-pointer text-white"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* 하단: Status 버튼 그룹 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] font-medium uppercase tracking-wider mr-1" style={{ color: "var(--muted)" }}>
          Status
        </span>
        {statuses.map((s) => {
          const isActive = activeStatus === s.value;
          return (
            <button
              key={s.value}
              onClick={() => update("status", isActive ? "" : s.value)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer hover:scale-105"
              style={{
                background: isActive ? s.bg.replace("0.10", "0.25") : "rgba(255,255,255,0.04)",
                color: isActive ? s.color : "var(--muted)",
                border: isActive ? `1.5px solid ${s.color}` : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive ? `0 0 8px ${s.color}30` : "none",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isActive ? s.color : "var(--muted)" }}
              />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
