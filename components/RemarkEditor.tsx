"use client";

import { useState } from "react";

interface RemarkEditorProps {
  timestamp: string;
  initialRemark: string | null;
}

export default function RemarkEditor({ timestamp, initialRemark }: RemarkEditorProps) {
  const [remark, setRemark] = useState(initialRemark ?? "");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 편집 모드 진입
  const startEdit = () => {
    setDraft(remark);
    setEditing(true);
  };

  // 저장
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/runs/${timestamp}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: draft }),
      });
      if (res.ok) {
        const data = await res.json();
        setRemark(data.remark ?? "");
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/runs/${timestamp}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: "" }),
      });
      if (res.ok) {
        setRemark("");
        setDraft("");
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  // 취소
  const handleCancel = () => {
    setDraft("");
    setEditing(false);
  };

  return (
    <div className="glass rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Remark
        </h2>

        {/* remark 있고 보기 모드일 때: 수정/삭제 버튼 */}
        {!editing && remark && (
          <div className="flex items-center gap-2">
            <button
              onClick={startEdit}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Edit"
            >
              {/* 연필 아이콘 */}
              <svg className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Delete"
            >
              {/* 휴지통 아이콘 */}
              <svg className="w-3.5 h-3.5 hover:text-red-400" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 편집 모드 */}
      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Enter a remark..."
            rows={3}
            autoFocus
            className="w-full rounded-lg px-3 py-2.5 text-sm placeholder-white/20 resize-y"
            style={{
              background: "var(--subtle-bg)",
              border: "1px solid var(--subtle-border)",
              outline: "none",
              color: "var(--text)",
            }}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={saving || !draft.trim()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              style={{
                background: "rgba(34,197,94,0.15)",
                color: "var(--passed)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              style={{
                background: "var(--subtle-bg)",
                border: "1px solid var(--border-light)",
                color: "var(--muted)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : remark ? (
        /* 보기 모드 - remark 표시 */
        <div
          className="text-sm whitespace-pre-wrap leading-relaxed rounded-lg px-3 py-2.5"
          style={{
            background: "var(--subtle-bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
          {remark}
        </div>
      ) : (
        /* remark 없음 - 추가 버튼 */
        <button
          onClick={startEdit}
          className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors hover:bg-white/3 cursor-pointer"
          style={{
            background: "var(--subtle-bg)",
            border: "1px dashed var(--subtle-border)",
            color: "var(--muted)",
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Remark
        </button>
      )}
    </div>
  );
}
