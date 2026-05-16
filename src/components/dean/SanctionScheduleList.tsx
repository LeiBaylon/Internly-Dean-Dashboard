import type { SanctionSchedule } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

type SanctionScheduleListProps = {
  schedules: SanctionSchedule[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export default function SanctionScheduleList({
  schedules,
  selectedId,
  onSelect,
}: SanctionScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <EmptyState
        title="No sanction schedules"
        description="Create a schedule to assign interns for sanction days."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {schedules.map((schedule) => {
        const isSelected = selectedId === schedule.id;
        return (
          <button
            key={schedule.id}
            type="button"
            onClick={() => onSelect?.(schedule.id)}
            className={
              isSelected
                ? "glass-card card-hover rounded-2xl border border-primary/30 p-5 text-left"
                : "glass-card card-hover rounded-2xl p-5 text-left"
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Sanction day
                </p>
                <h3 className="mt-2 text-xl font-semibold text-ink">
                  {formatDate(schedule.date)}
                </h3>
                {schedule.time ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Time {schedule.time}
                  </p>
                ) : null}
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                Capacity {schedule.capacity}
              </span>
            </div>

            {schedule.tasks ? (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Tasks
                </p>
                <p className="mt-2 text-sm text-slate-700">{schedule.tasks}</p>
              </div>
            ) : null}

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Interns assigned
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-700">
                {schedule.internsAssigned.length === 0
                  ? "None yet"
                  : schedule.internsAssigned.map((intern) => (
                      <span
                        key={intern}
                        className="rounded-full bg-white/80 px-3 py-1"
                      >
                        {intern}
                      </span>
                    ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
