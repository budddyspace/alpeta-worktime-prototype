import React from "react";
import { Button } from "./ui";

export type TimeValue = { hh: string; mm: string };

export function toStr(t: TimeValue) {
  return `${t.hh}:${t.mm}`;
}

export function TimePicker({
  value,
  onChange,
  disabled,
}: {
  value: TimeValue;
  onChange: (v: TimeValue) => void;
  disabled?: boolean;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const mins = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="inline-flex items-center gap-2">
      <select
        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm disabled:bg-slate-50"
        value={value.hh}
        onChange={(e) => onChange({ ...value, hh: e.target.value })}
        disabled={disabled}
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-sm text-slate-400">:</span>
      <select
        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm disabled:bg-slate-50"
        value={value.mm}
        onChange={(e) => onChange({ ...value, mm: e.target.value })}
        disabled={disabled}
      >
        {mins.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}

export function InlineHint({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-slate-500 leading-5">{children}</div>;
}

export function Toast({ open, message, onClose }: { open: boolean; message: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span>{message}</span>
          <Button tone="ghost" className="text-white hover:bg-white/10" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
