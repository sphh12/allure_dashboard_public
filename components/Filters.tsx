"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const platforms = ["", "android", "ios"];
const statuses = ["", "pass", "fail", "broken", "skip"];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="glass-bright rounded-xl p-4 flex flex-wrap gap-3 items-center">
      {/* 검색 아이콘 + 인풋 */}
      <div className="relative flex-1 min-w-[240px]">
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

      {/* Status */}
      <select
        className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all cursor-pointer"
        style={controlStyle}
        value={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">Result</option>
        {statuses.filter(Boolean).map((s) => (
          <option key={s} value={s}>
            {s.toUpperCase()}
          </option>
        ))}
      </select>

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
  );
}
