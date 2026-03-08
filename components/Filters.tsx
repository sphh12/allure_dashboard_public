"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";

const platforms = ["", "android", "ios"];

const controlStyle: React.CSSProperties = {
  background: "var(--border)",
  color: "var(--text)",
  border: "1px solid var(--border-light)",
};

// 커스텀 날짜 입력: 숫자 연속 입력 → 자동 포맷 (20260202 → 2026-02-02)
function DateInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // 외부 value 변경 시 동기화 (Clear 버튼 등)
  useEffect(() => {
    setText(value);
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 추출 (최대 8자리)
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);

    // 자동 포맷: 20260202 → 2026-02-02
    let formatted = "";
    if (digits.length > 0) formatted = digits.slice(0, 4);
    if (digits.length > 4) formatted += "-" + digits.slice(4, 6);
    if (digits.length > 6) formatted += "-" + digits.slice(6, 8);

    setText(formatted);

    // 커서를 끝으로 이동
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = formatted.length;
        inputRef.current.setSelectionRange(pos, pos);
      }
    });

    // 완성된 날짜 (yyyy-mm-dd = 10자) → 필터 적용
    if (formatted.length === 10) {
      onChange(formatted);
    } else if (digits.length === 0) {
      onChange("");
    }
  };

  // 포커스 해제 시 미완성 입력은 실제 값으로 복원
  const handleBlur = () => {
    if (text.length > 0 && text.length < 10) {
      setText(value);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={text}
        onChange={handleInput}
        onBlur={handleBlur}
        maxLength={10}
        className="px-3 py-2.5 pr-8 rounded-lg text-sm outline-none transition-all cursor-text w-[130px] placeholder:text-white/20"
        style={controlStyle}
      />
      {/* 캘린더 아이콘 */}
      <button
        type="button"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => {
          try { dateRef.current?.showPicker(); } catch { dateRef.current?.click(); }
        }}
      >
        <svg className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {/* 숨겨진 native date picker (캘린더 아이콘용) */}
      <input
        ref={dateRef}
        type="date"
        className="sr-only"
        tabIndex={-1}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          onChange(v);
        }}
      />
    </div>
  );
}

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
      router.push("?" + params.toString(), { scroll: false });
    },
    [router, searchParams]
  );

  // 디바운스 검색 — 300ms 후 자동 검색
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearch = useMemo(
    () => (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => update("q", value), 300);
    },
    [update]
  );

  const clearAll = useCallback(() => {
    router.push("/", { scroll: false });
  }, [router]);

  return (
    <div className="glass-bright rounded-xl p-4 space-y-3">
      {/* 상단: 검색 + Platform + Clear */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* 검색 아이콘 + 인풋 */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--muted)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            key={searchParams.get("q") ?? ""}
            type="text"
            placeholder="timestamp, branch, device, commit, remark..."
            defaultValue={searchParams.get("q") ?? ""}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all placeholder:text-white/20"
            style={controlStyle}
            onChange={(e) => debouncedSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                update("q", e.currentTarget.value);
              }
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
        <DateInput
          value={searchParams.get("from") ?? ""}
          onChange={(v) => update("from", v)}
          placeholder="yyyy-mm-dd"
        />

        {/* Date to */}
        <DateInput
          value={searchParams.get("to") ?? ""}
          onChange={(v) => update("to", v)}
          placeholder="yyyy-mm-dd"
        />

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 cursor-pointer"
            style={{ background: "var(--border-light)", border: "1px solid var(--border-light)", color: "var(--white)" }}
          >
            Clear
          </button>
        )}
      </div>

    </div>
  );
}
