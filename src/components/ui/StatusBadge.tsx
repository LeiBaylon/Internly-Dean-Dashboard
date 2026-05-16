import { classNames } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  submitted: "border border-blue-400/20 bg-blue-500/10 text-blue-200",
  approved: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  changes_requested: "border border-amber-400/20 bg-amber-500/10 text-amber-200",
  draft: "border border-slate-500/20 bg-slate-500/10 text-slate-300",
  sanctioned: "border border-rose-400/20 bg-rose-500/10 text-rose-200",
  active: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  probation: "border border-amber-400/20 bg-amber-500/10 text-amber-200",
  pending: "border border-amber-400/20 bg-amber-500/10 text-amber-200",
  scheduled: "border border-blue-400/20 bg-blue-500/10 text-blue-200",
  completed: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        statusStyles[status] ?? "border border-slate-500/20 bg-slate-500/10 text-slate-300"
      )}
    >
      {label}
    </span>
  );
}
