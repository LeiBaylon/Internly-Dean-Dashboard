import type { SummaryCounts } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

type DeanSummaryCardsProps = {
  counts: SummaryCounts;
};

export default function DeanSummaryCards({ counts }: DeanSummaryCardsProps) {
  const items = [
    {
      label: "Total interns",
      value: formatNumber(counts.totalInterns),
      accent: "text-primary",
      note: "Active across all programs",
      icon: "TI",
      iconBg: "bg-primary-soft text-primary",
      line: "panel-line-top",
    },
    {
      label: "Pending reports",
      value: formatNumber(counts.pendingReports),
      accent: "text-info",
      note: "Awaiting dean review",
      icon: "PR",
      iconBg: "bg-blue-500/10 text-blue-300",
      line: "panel-line-top",
    },
    {
      label: "Pending competencies",
      value: formatNumber(counts.pendingCompetencies),
      accent: "text-warning",
      note: "Ready for approval",
      icon: "PC",
      iconBg: "bg-amber-500/10 text-amber-300",
      line: "panel-line-top warning",
    },
    {
      label: "Upcoming sanctions",
      value: formatNumber(counts.upcomingSanctions),
      accent: "text-rose-300",
      note: "Schedules in the next month",
      icon: "US",
      iconBg: "bg-rose-500/10 text-rose-300",
      line: "panel-line-top danger",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`glass-card card-hover ${item.line} rounded-2xl p-5`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.note}</p>
            </div>
            <span
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${item.iconBg}`}
            >
              {item.icon}
            </span>
          </div>
          <p className={`mt-4 text-right text-3xl font-semibold ${item.accent}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
