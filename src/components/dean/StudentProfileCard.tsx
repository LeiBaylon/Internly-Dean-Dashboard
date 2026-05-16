import type { InternProfile } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

type StudentProfileCardProps = {
  intern: InternProfile;
};

export default function StudentProfileCard({ intern }: StudentProfileCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Student profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">
            {intern.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {intern.studentId ?? intern.id} - {intern.course} - {intern.yearLevel}
          </p>
          <p className="mt-1 text-sm text-slate-600">{intern.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={intern.status} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Company
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {intern.companyName}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {intern.companyAddress}
          </p>
        </div>
        <div className="rounded-xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Supervisor
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {intern.supervisorName}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {intern.supervisorEmail}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {intern.supervisorPhone}
          </p>
        </div>
        <div className="rounded-xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            OJT dates
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {intern.ojtStartDate ? formatDate(intern.ojtStartDate) : "--"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            to {intern.ojtEndDate ? formatDate(intern.ojtEndDate) : "--"}
          </p>
        </div>
        <div className="rounded-xl bg-white/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Advisor info
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {intern.advisorName ?? "--"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {intern.advisorEmail ?? "--"}
          </p>
        </div>
      </div>
    </div>
  );
}
