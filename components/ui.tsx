import React from "react";
import clsx from "clsx";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" | "neutral" | "danger" }) {
  const { className, tone = "neutral", ...rest } = props;
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold transition active:translate-y-[0.5px] disabled:active:translate-y-0";
  const tones: Record<string, string> = {
    primary: "bg-alpeta-blue text-white hover:bg-alpeta-blue2 shadow-sm",
    neutral: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return <button className={clsx(base, tones[tone], className)} {...rest} />;
}

export function Chip({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "blue" | "purple" | "orange" | "green" }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <span className={clsx("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 items-center gap-3">
      <div className="col-span-4 text-sm font-bold text-slate-700">{label}</div>
      <div className="col-span-8">{children}</div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-extrabold text-slate-800">{children}</div>;
}

export function Divider() {
  return <div className="h-px w-full bg-slate-200" />;
}

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition",
        checked ? "bg-emerald-500 border-emerald-600" : "bg-slate-200 border-slate-300",
        disabled ? "opacity-60" : "opacity-100"
      )}
      aria-pressed={checked}
    >
      <span className={clsx("inline-block h-5 w-5 transform rounded-full bg-white shadow transition", checked ? "translate-x-5" : "translate-x-1")} />
    </button>
  );
}

function clsx(...args: any[]) {
  return args.filter(Boolean).join(" ");
}
