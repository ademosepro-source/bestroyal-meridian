import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-navy-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function ComingSoonPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-6">
      <p className="text-sm font-semibold text-navy-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
