"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import type { ActivityLogEntry, Competency, InternProfile } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import EmptyTable from "@/components/ui/EmptyTable";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

type StudentActivityPanelProps = {
  intern: InternProfile;
  competencies: Competency[];
  activityEntries: ActivityLogEntry[];
  isLoading: boolean;
  error?: string;
  onClose: () => void;
};

const activityColumns = [
  "DATE",
  "ACTIVITY",
  "AREA COVERED",
  "OUTCOME",
  "EVIDENCE LINK",
];

function displayValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "--";
}

export default function StudentActivityPanel({
  intern,
  competencies,
  activityEntries,
  isLoading,
  error,
  onClose,
}: StudentActivityPanelProps) {
  const submittedCompetencies = useMemo(() => {
    return competencies.filter(
      (competency) =>
        competency.internId === intern.id && competency.status === "submitted"
    );
  }, [competencies, intern.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="glass-card slide-in-right h-full max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Student overview
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">
            {intern.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {intern.studentId ?? intern.id} · {intern.course}
          </p>
          <p className="mt-1 text-xs text-slate-500">{intern.companyName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/dean/students/${intern.id}`}
            className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
          >
            View profile
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
          >
            Close
          </button>
        </div>
      </div>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-lg font-semibold text-ink">
              Submitted competencies view
            </h4>
            <p className="text-xs text-slate-500">
              Submitted items for this student.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {submittedCompetencies.length} submission(s)
          </span>
        </div>
        <div className="mt-4 overflow-x-auto table-scroll">
          {submittedCompetencies.length === 0 ? (
            <EmptyState
              title="No submitted competencies"
              description="This student has no submitted competencies yet."
            />
          ) : (
            <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Competency</th>
                  <th className="px-3 py-3">Submitted</th>
                  <th className="px-3 py-3">Evidence</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {submittedCompetencies.map((competency) => (
                  <tr
                    key={competency.id}
                    className="border-b border-slate-100 bg-white/90"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold text-ink">
                        {competency.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {competency.internName}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      {formatDate(competency.submittedAt)}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                        {competency.evidenceType}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={competency.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="mt-6">
        <div>
          <h4 className="text-lg font-semibold text-ink">Activity log</h4>
          <p className="text-xs text-slate-500">
            Daily activity details and evidence links.
          </p>
        </div>
        <div className="mt-4 overflow-x-auto table-scroll">
          {isLoading ? (
            <LoadingSkeleton lines={4} />
          ) : error ? (
            <ErrorState
              title="Unable to load activity log"
              description={error}
            />
          ) : activityEntries.length === 0 ? (
            <EmptyTable
              columns={activityColumns}
              message="No activity entries recorded for this student."
              minWidth="min-w-[840px]"
            />
          ) : (
            <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {activityColumns.map((column) => (
                    <th key={column} className="px-3 py-3">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activityEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 bg-white/90"
                  >
                    <td className="px-3 py-4">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-3 py-4">
                      {displayValue(entry.activity)}
                    </td>
                    <td className="px-3 py-4">
                      {displayValue(entry.areaCovered)}
                    </td>
                    <td className="px-3 py-4">
                      {displayValue(entry.outcome)}
                    </td>
                    <td className="px-3 py-4">
                      {entry.evidenceUrl ? (
                        <a
                          href={entry.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-xs font-semibold text-blue-700"
                        >
                          {entry.evidenceUrl}
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
