"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ActivityLogEntry,
  Competency,
  HoursSummary,
  InternProfile,
} from "@/lib/types";
import EmptyTable from "@/components/ui/EmptyTable";
import {
  fetchActivityLogEntries,
  fetchCompetenciesByIntern,
} from "@/lib/firebase/data";
import StudentActivityPanel from "./StudentActivityPanel";
import FilterPanel, {
  FilterField,
  filterControlClassName,
} from "./FilterPanel";

type InternsTableProps = {
  interns: InternProfile[];
  hoursByIntern: Record<string, HoursSummary | null>;
};

type HoursFilter = "all" | "0-20" | "21-50" | "51-100" | "100+";
type AlphabeticalOrder = "az" | "za";

export default function InternsTable({
  interns,
  hoursByIntern,
}: InternsTableProps) {
  const [search, setSearch] = useState("");
  const [studentNumberFilter, setStudentNumberFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [hoursFilter, setHoursFilter] = useState<HoursFilter>("all");
  const [alphabeticalOrder, setAlphabeticalOrder] =
    useState<AlphabeticalOrder>("az");
  const [selectedIntern, setSelectedIntern] = useState<InternProfile | null>(null);
  const [activityEntries, setActivityEntries] = useState<ActivityLogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [competenciesLoading, setCompetenciesLoading] = useState(false);
  const [competenciesError, setCompetenciesError] = useState("");

  useEffect(() => {
    if (!selectedIntern) {
      return;
    }

    let active = true;

    const load = async () => {
      setActivityLoading(true);
      setActivityError("");
      setActivityEntries([]);

      try {
        const entries = await fetchActivityLogEntries(selectedIntern.id);
        if (active) {
          setActivityEntries(entries);
        }
      } catch {
        if (active) {
          setActivityError("Unable to load activity log. Please try again.");
        }
      } finally {
        if (active) {
          setActivityLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [selectedIntern]);

  useEffect(() => {
    if (!selectedIntern) {
      return;
    }

    let active = true;

    const load = async () => {
      setCompetenciesLoading(true);
      setCompetenciesError("");
      setCompetencies([]);

      try {
        const entries = await fetchCompetenciesByIntern(selectedIntern.id);
        if (active) {
          setCompetencies(entries);
        }
      } catch {
        if (active) {
          setCompetenciesError("Unable to load competencies. Please try again.");
        }
      } finally {
        if (active) {
          setCompetenciesLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [selectedIntern]);

  const handleSelectIntern = (intern: InternProfile) => {
    setSelectedIntern(intern);
  };

  const courses = useMemo(() => {
    return Array.from(new Set(interns.map((intern) => intern.course)));
  }, [interns]);

  const filtered = useMemo(() => {
    return interns.filter((intern) => {
      const matchesSearch = `${intern.name} ${intern.companyName}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStudentNumber =
        !studentNumberFilter.trim() ||
        (intern.studentId ?? intern.id)
          .toLowerCase()
          .includes(studentNumberFilter.trim().toLowerCase());
      const matchesCourse = courseFilter === "all" || intern.course === courseFilter;

      const hours = hoursByIntern[intern.id];
      const remaining = hours?.remaining ?? null;
      const matchesHours = (() => {
        if (hoursFilter === "all") {
          return true;
        }
        if (remaining === null) {
          return false;
        }
        if (hoursFilter === "0-20") {
          return remaining <= 20;
        }
        if (hoursFilter === "21-50") {
          return remaining >= 21 && remaining <= 50;
        }
        if (hoursFilter === "51-100") {
          return remaining >= 51 && remaining <= 100;
        }
        return remaining > 100;
      })();

      return matchesSearch && matchesStudentNumber && matchesCourse && matchesHours;
    });
  }, [
    interns,
    search,
    studentNumberFilter,
    courseFilter,
    hoursFilter,
    hoursByIntern,
  ]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      alphabeticalOrder === "az"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }, [alphabeticalOrder, filtered]);

  return (
    <div className="space-y-6">
      <FilterPanel
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student or company"
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
        <FilterField label="Hours Remaining">
          <select
            value={hoursFilter}
            onChange={(event) => setHoursFilter(event.target.value as HoursFilter)}
            className={filterControlClassName()}
          >
            <option value="all">All hours remaining</option>
            <option value="0-20">0-20 hours</option>
            <option value="21-50">21-50 hours</option>
            <option value="51-100">51-100 hours</option>
            <option value="100+">100+ hours</option>
          </select>
        </FilterField>
      </FilterPanel>

      <div className="glass-card rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-ink">
            Student profiles and company info
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Open each OJT student profile and review their assigned company details.
          </p>
        </div>

        <div>
          {sorted.length === 0 ? (
            <div className="overflow-x-auto table-scroll">
              <EmptyTable
                columns={["Number", "Student", "Course", "Company", "Hours"]}
                message="No interns match your filters."
              />
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {sorted.map((intern) => {
                  const hours = hoursByIntern[intern.id];
                  return (
                    <button
                      key={intern.id}
                      type="button"
                      onClick={() => handleSelectIntern(intern)}
                      className="w-full rounded-2xl border border-slate-200 bg-white/90 p-4 text-left shadow-sm transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {intern.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {intern.studentId ?? intern.id}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">{intern.course}</p>
                      <p className="mt-1 text-xs text-slate-500">{intern.companyName}</p>
                      <div className="mt-3 text-xs text-slate-500">
                        Hours: {hours ? `${hours.renderedTotal} / ${hours.remaining}` : "--"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto table-scroll">
                <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-3">Number</th>
                      <th className="px-3 py-3">Student</th>
                      <th className="px-3 py-3">Course</th>
                      <th className="px-3 py-3">Company</th>
                      <th className="px-3 py-3">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((intern) => {
                      const hours = hoursByIntern[intern.id];
                      return (
                        <tr
                          key={intern.id}
                          className="cursor-pointer border-b border-slate-100 bg-white/90 shadow-sm transition hover:bg-slate-50"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectIntern(intern)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleSelectIntern(intern);
                            }
                          }}
                        >
                          <td className="px-3 py-4">
                            <p className="text-sm text-slate-700">
                              {intern.studentId ?? intern.id}
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold text-ink">
                                {intern.name}
                              </span>
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <p className="text-sm text-slate-700">
                              {intern.course}
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <p className="text-sm text-slate-700">
                              {intern.companyName}
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <p className="text-sm text-slate-700">
                              {hours ? `${hours.renderedTotal} rendered` : "--"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {hours ? `${hours.remaining} remaining` : "--"}
                            </p>
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

      {selectedIntern ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto flex h-full max-w-4xl items-start justify-center">
            <StudentActivityPanel
              intern={selectedIntern}
              competencies={competencies}
              competenciesLoading={competenciesLoading}
              competenciesError={competenciesError}
              activityEntries={activityEntries}
              isLoading={activityLoading}
              error={activityError}
              onClose={() => setSelectedIntern(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
