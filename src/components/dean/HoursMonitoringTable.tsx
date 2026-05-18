"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmptyTable from "@/components/ui/EmptyTable";
import type { HoursSummary, InternProfile } from "@/lib/types";
import FilterPanel, {
  FilterField,
  filterControlClassName,
} from "./FilterPanel";

type HoursMonitoringTableProps = {
  interns: InternProfile[];
  hoursByIntern: Record<string, HoursSummary | null>;
};

type HoursSort = "remaining" | "rendered_total" | "rendered_week" | "required";
type AlphabeticalOrder = "az" | "za";
type ProgressFilter = "all" | "0-25" | "26-50" | "51-75" | "76-100";

export default function HoursMonitoringTable({
  interns,
  hoursByIntern,
}: HoursMonitoringTableProps) {
  const [search, setSearch] = useState("");
  const [studentNumberFilter, setStudentNumberFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState<HoursSort>("remaining");
  const [alphabeticalOrder, setAlphabeticalOrder] =
    useState<AlphabeticalOrder>("az");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");

  const courses = useMemo(() => {
    return Array.from(new Set(interns.map((intern) => intern.course)));
  }, [interns]);

  const sorted = useMemo(() => {
    const filtered = interns.filter((intern) => {
      const matchesSearch = `${intern.name}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStudentNumber =
        !studentNumberFilter.trim() ||
        (intern.studentId ?? intern.id)
          .toLowerCase()
          .includes(studentNumberFilter.trim().toLowerCase());
      const matchesCourse =
        courseFilter === "all" || intern.course === courseFilter;

      const hours = hoursByIntern[intern.id];
      const progress = hours?.required
        ? Math.min(Math.round((hours.renderedTotal / hours.required) * 100), 100)
        : 0;
      const matchesProgress = (() => {
        if (progressFilter === "all") {
          return true;
        }
        if (progressFilter === "0-25") {
          return progress <= 25;
        }
        if (progressFilter === "26-50") {
          return progress >= 26 && progress <= 50;
        }
        if (progressFilter === "51-75") {
          return progress >= 51 && progress <= 75;
        }
        return progress >= 76;
      })();

      return (
        matchesSearch &&
        matchesStudentNumber &&
        matchesCourse &&
        matchesProgress
      );
    });

    return [...filtered].sort((a, b) => {
      const hoursA = hoursByIntern[a.id];
      const hoursB = hoursByIntern[b.id];

      const nameCompare =
        alphabeticalOrder === "az"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);

      const metricCompare = (() => {
        if (sortBy === "rendered_total") {
          return (hoursB?.renderedTotal ?? 0) - (hoursA?.renderedTotal ?? 0);
        }

        if (sortBy === "rendered_week") {
          return (hoursB?.renderedThisWeek ?? 0) - (hoursA?.renderedThisWeek ?? 0);
        }

        if (sortBy === "required") {
          return (hoursB?.required ?? 0) - (hoursA?.required ?? 0);
        }

        return (hoursB?.remaining ?? 0) - (hoursA?.remaining ?? 0);
      })();

      return metricCompare || nameCompare;
    });
  }, [
    alphabeticalOrder,
    courseFilter,
    hoursByIntern,
    interns,
    progressFilter,
    search,
    sortBy,
    studentNumberFilter,
  ]);

  const getProgress = (hours: HoursSummary | null) => {
    if (!hours || hours.required <= 0) {
      return 0;
    }

    return Math.min(Math.round((hours.renderedTotal / hours.required) * 100), 100);
  };

  return (
    <div className="space-y-6">
      <FilterPanel
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student"
      >
        <FilterField label="Student Number">
          <input
            value={studentNumberFilter}
            onChange={(event) => setStudentNumberFilter(event.target.value)}
            placeholder="Enter student number"
            className={filterControlClassName()}
          />
        </FilterField>
        <FilterField label="Alphabetical Order">
          <select
            value={alphabeticalOrder}
            onChange={(event) =>
              setAlphabeticalOrder(event.target.value as AlphabeticalOrder)
            }
            className={filterControlClassName()}
          >
            <option value="az">A to Z</option>
            <option value="za">Z to A</option>
          </select>
        </FilterField>
        <FilterField label="Course">
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className={filterControlClassName()}
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Sort By">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as HoursSort)}
            className={filterControlClassName()}
          >
            <option value="remaining">Sort: hours remaining</option>
            <option value="rendered_total">Sort: total rendered</option>
            <option value="rendered_week">Sort: rendered this week</option>
            <option value="required">Sort: hours to render</option>
          </select>
        </FilterField>
        <FilterField label="Progress">
          <select
            value={progressFilter}
            onChange={(event) =>
              setProgressFilter(event.target.value as ProgressFilter)
            }
            className={filterControlClassName()}
          >
            <option value="all">All progress</option>
            <option value="0-25">0-25%</option>
            <option value="26-50">26-50%</option>
            <option value="51-75">51-75%</option>
            <option value="76-100">76-100%</option>
          </select>
        </FilterField>
      </FilterPanel>

      <div className="glass-card rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-semibold text-ink">OJT hours summary</h2>
          <p className="mt-1 text-sm text-slate-600">
            View hours to render, hours rendered this week, total rendered, and remaining hours.
          </p>
        </div>

      <div className="mt-6">
        {sorted.length === 0 ? (
          <div className="overflow-x-auto table-scroll">
            <EmptyTable
              columns={[
                "Number",
                "Student",
                "Course",
                "Hours to render",
                "Rendered this week",
                "Total rendered",
                "Remaining",
                "Progress",
              ]}
              message="No hour records match your filters."
              minWidth="min-w-[1080px]"
            />
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {sorted.map((intern) => {
                const hours = hoursByIntern[intern.id];
                const progress = getProgress(hours);

                return (
                  <div
                    key={intern.id}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {intern.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {intern.studentId ?? intern.id}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/dean/students/${intern.id}`}
                        className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        Profile
                      </Link>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <Metric label="Hours to render" value={hours?.required} />
                      <Metric label="This week" value={hours?.renderedThisWeek} />
                      <Metric label="Total rendered" value={hours?.renderedTotal} />
                      <Metric label="Remaining" value={hours?.remaining} />
                    </div>
                    <ProgressBar progress={progress} />
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto table-scroll">
              <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Number</th>
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Course</th>
                    <th className="px-3 py-3">Hours to render</th>
                    <th className="px-3 py-3">Rendered this week</th>
                    <th className="px-3 py-3">Total rendered</th>
                    <th className="px-3 py-3">Remaining</th>
                    <th className="px-3 py-3">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((intern) => {
                    const hours = hoursByIntern[intern.id];
                    const progress = getProgress(hours);

                    return (
                      <tr
                        key={intern.id}
                        className="border-b border-slate-100 bg-white/90 shadow-sm transition hover:bg-slate-50"
                      >
                        <td className="px-3 py-4">
                          <p className="text-sm text-slate-700">
                            {intern.studentId ?? intern.id}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <Link
                            href={`/dashboard/dean/students/${intern.id}`}
                            className="font-semibold text-ink hover:underline"
                          >
                            {intern.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {intern.studentId ?? intern.id} - {intern.course}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm text-slate-700">
                            {intern.course}
                          </p>
                        </td>
                        <td className="px-3 py-4">{formatHours(hours?.required)}</td>
                        <td className="px-3 py-4">
                          {formatHours(hours?.renderedThisWeek)}
                        </td>
                        <td className="px-3 py-4">
                          {formatHours(hours?.renderedTotal)}
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-semibold text-ink">
                            {formatHours(hours?.remaining)}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <ProgressBar progress={progress} compact />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-ink">
        {formatHours(value)}
      </p>
    </div>
  );
}

function ProgressBar({
  progress,
  compact = false,
}: {
  progress: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "min-w-36" : "mt-4"}>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Completed</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function formatHours(value?: number) {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value} hr${value === 1 ? "" : "s"}`;
}
