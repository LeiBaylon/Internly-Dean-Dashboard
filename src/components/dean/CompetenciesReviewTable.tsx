"use client";

import { useEffect, useMemo, useState } from "react";
import type { Competency, CompetencyStatus } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import EmptyTable from "@/components/ui/EmptyTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { reviewCompetency } from "@/lib/firebase/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import CompetencyReviewPanel from "./CompetencyReviewPanel";
import FilterPanel, {
  FilterField,
  filterControlClassName,
} from "./FilterPanel";

type CompetenciesReviewTableProps = {
  competencies: Competency[];
};

type AlphabeticalOrder = "az" | "za";
type CompetencyStatusFilter = "all" | "submitted" | "approved" | "not_submitted";

export default function CompetenciesReviewTable({
  competencies,
}: CompetenciesReviewTableProps) {
  const { user } = useAuth();
  const [items, setItems] = useState(competencies);
  const [selected, setSelected] = useState<Competency | null>(null);
  const [statusFilter, setStatusFilter] = useState<CompetencyStatusFilter>(
    "all"
  );
  const [numberFilter, setNumberFilter] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [alphabeticalOrder, setAlphabeticalOrder] =
    useState<AlphabeticalOrder>("az");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  const courses = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.course)));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "not_submitted"
          ? item.status !== "submitted"
          : item.status === statusFilter;
      const matchesCourse = courseFilter === "all" || item.course === courseFilter;
      const matchesSearch = `${item.internName} ${item.course}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesStatus && matchesCourse && matchesSearch
      );
    });
  }, [items, statusFilter, courseFilter, search]);

  const sorted = useMemo(() => {
    const ordered = [...filtered].sort((a, b) =>
      alphabeticalOrder === "az"
        ? a.internName.localeCompare(b.internName)
        : b.internName.localeCompare(a.internName)
    );

    const trimmed = numberFilter.trim();
    if (!trimmed) {
      return ordered;
    }

    return ordered.filter((_, index) =>
      String(index + 1).startsWith(trimmed)
    );
  }, [alphabeticalOrder, filtered, numberFilter]);

  const updateSelected = (
    status: CompetencyStatus,
    deanComment: string,
    reviewedBy: string
  ) => {
    if (!selected) {
      return;
    }

    const updated = {
      ...selected,
      status,
      deanComment,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };

    setItems((prev) =>
      prev.map((item) => (item.id === selected.id ? updated : item))
    );
    setSelected(updated);
  };

  const handleReview = async (status: CompetencyStatus, deanComment: string) => {
    if (!selected) {
      return;
    }

    if (!user) {
      setError("Sign in to review competencies.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await reviewCompetency({
        internId: selected.internId,
        itemId: selected.id,
        status,
        deanComment,
        reviewedBy: user.uid,
      });

      updateSelected(status, deanComment, user.uid);
      setToast(
        status === "approved" ? "Competency approved" : "Changes requested"
      );
    } catch {
      setError("Unable to update the competency. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-6 ${
          selected ? "lg:grid-cols-[3fr_2fr]" : ""
        }`}
      >
        <div className="space-y-6">
        <FilterPanel
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search student or course"
        >
            <FilterField label="Number">
            <input
              value={numberFilter}
              onChange={(event) => setNumberFilter(event.target.value)}
              placeholder="Enter number"
              className={filterControlClassName()}
              inputMode="numeric"
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
            <FilterField label="Status">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as CompetencyStatusFilter)
              }
              className={filterControlClassName()}
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="not_submitted">Not submitted</option>
            </select>
            </FilterField>
        </FilterPanel>

        <div className="glass-card rounded-2xl p-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">
              Manage competency approvals
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Open a competency, review evidence, then approve or request changes.
            </p>
          </div>

        <div className="mt-6">
          {sorted.length === 0 ? (
            <div className="overflow-x-auto table-scroll">
              <EmptyTable
                columns={["Number", "Student", "Course", "Status", "Link", "Manage"]}
                message="No competencies to review."
              />
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {sorted.map((competency, index) => (
                  <div
                    key={competency.id}
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          No. {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {competency.internName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={competency.status} />
                        {competency.status === "submitted" &&
                        competency.evidenceUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(competency);
                              setError("");
                            }}
                            className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                          >
                            Manage
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {competency.course}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Link</p>
                    {competency.evidenceUrl ? (
                      <a
                        href={competency.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-xs font-semibold text-blue-700"
                      >
                        {competency.evidenceUrl}
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">--</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto table-scroll">
                <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3">Number</th>
                      <th className="px-3">Student</th>
                      <th className="px-3">Course</th>
                      <th className="px-3">Status</th>
                      <th className="px-3">Link</th>
                      <th className="px-3 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((competency, index) => (
                      <tr
                        key={competency.id}
                        className="border-b border-slate-100 bg-white/90 transition hover:bg-slate-50"
                      >
                        <td className="px-3 py-4">
                          <p className="text-sm text-slate-700">{index + 1}</p>
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-semibold text-ink">
                            {competency.internName}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm text-slate-700">
                            {competency.course}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge status={competency.status} />
                        </td>
                        <td className="px-3 py-4">
                          {competency.evidenceUrl ? (
                            <a
                              href={competency.evidenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-xs font-semibold text-blue-700"
                            >
                              {competency.evidenceUrl}
                            </a>
                          ) : (
                            "--"
                          )}
                        </td>
                        <td className="px-3 py-4 text-right">
                          {competency.status === "submitted" &&
                          competency.evidenceUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(competency);
                                setError("");
                              }}
                              className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                            >
                              Manage
                            </button>
                          ) : (
                            "--"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      {selected ? (
        <div className="hidden lg:block">
          <CompetencyReviewPanel
            competency={selected}
            onApprove={(comment) => handleReview("approved", comment)}
            onRequestChanges={(comment) =>
              handleReview("changes_requested", comment)
            }
            onClose={() => setSelected(null)}
            isSaving={isSaving}
            error={error}
          />
        </div>
      ) : null}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-40 bg-slate-900/30 p-4 lg:hidden">
          <div className="h-full">
            <CompetencyReviewPanel
              competency={selected}
              onApprove={(comment) => handleReview("approved", comment)}
              onRequestChanges={(comment) =>
                handleReview("changes_requested", comment)
              }
              onClose={() => setSelected(null)}
              isSaving={isSaving}
              error={error}
            />
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-soft">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
