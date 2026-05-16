import type { HoursSummary } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

type HoursSummaryCardsProps = {
  hours: HoursSummary;
};

export default function HoursSummaryCards({ hours }: HoursSummaryCardsProps) {
  const items = [
    {
      label: "Hours required",
      value: formatNumber(hours.required),
    },
    {
      label: "Rendered this week",
      value: formatNumber(hours.renderedThisWeek),
    },
    {
      label: "Total rendered",
      value: formatNumber(hours.renderedTotal),
    },
    {
      label: "Remaining",
      value: formatNumber(hours.remaining),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="glass-card card-hover panel-line-top rounded-2xl p-5"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {item.label}
          </p>
          <p className="mt-3 text-3xl font-bold text-primary">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
