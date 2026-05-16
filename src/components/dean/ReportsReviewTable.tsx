"use client";

import { useEffect, useMemo, useState } from "react";
import type { Report, ReportStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import EmptyTable from "@/components/ui/EmptyTable";
import { reviewReport } from "@/lib/firebase/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import FilterPanel, {
  FilterField,
  filterControlClassName,
} from "./FilterPanel";
import ReportReviewPanel from "./ReportReviewPanel";

type ReportsReviewTableProps = {
  reports: Report[];
};

type AlphabeticalOrder = "az" | "za";
type ReportStatusFilter = "all" | "submitted" | "approved" | "not_submitted";

export default function ReportsReviewTable({ reports }: ReportsReviewTableProps) {
  const { user } = useAuth();
  const [items, setItems] = useState(reports);
  const [selected, setSelected] = useState<Report | null>(null);
  const [studentNumberSearch, setStudentNumberSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [alphabeticalOrder, setAlphabeticalOrder] =
    useState<AlphabeticalOrder>("az");
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  const courses = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.course)));
  }, [items]);

  const filteredReports = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "not_submitted"
          ? item.status !== "submitted"
          : item.status === statusFilter;
      const matchesCourse = courseFilter === "all" || item.course === courseFilter;
      const matchesSearch = `${item.internName}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesStatus && matchesCourse && matchesSearch;
    });
  }, [items, statusFilter, courseFilter, search]);

  const studentNumberFilteredReports = useMemo(() => {
    const studentNumberQuery = studentNumberSearch.trim().toLowerCase();

    return filteredReports.filter((report) => {
      const studentNumber = (report.studentId ?? report.internId).toLowerCase();
      return studentNumberQuery
        ? studentNumber.includes(studentNumberQuery)
        : true;
    });
  }, [filteredReports, studentNumberSearch]);

  const sortedReports = useMemo(() => {
    return [...studentNumberFilteredReports].sort((a, b) =>
      alphabeticalOrder === "az"
        ? a.internName.localeCompare(b.internName)
        : b.internName.localeCompare(a.internName)
    );
  }, [alphabeticalOrder, studentNumberFilteredReports]);

  const updateSelected = (
    status: ReportStatus,
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

  const handleReview = async (status: ReportStatus, deanComment: string) => {
    if (!selected) {
      return;
    }

    if (!user) {
      setError("Sign in to review reports.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await reviewReport({
        internId: selected.internId,
        itemId: selected.id,
        status,
        deanComment,
        reviewedBy: user.uid,
      });

      updateSelected(status, deanComment, user.uid);
      setToast(
        status === "approved" ? "Report approved" : "Changes requested"
      );
    } catch {
      setError("Unable to update the report. Please try again.");
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
      <div className="grid gap-6">
        <div className="space-y-6">
          <FilterPanel
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search student"
          >
            <FilterField label="Student Number">
              <input
                value={studentNumberSearch}
                onChange={(event) => setStudentNumberSearch(event.target.value)}
                placeholder="Search student number"
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
            <FilterField label="Status">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as ReportStatusFilter)
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
                Students submitted weekly reports
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                View all weekly reports submitted by OJT students.
              </p>
            </div>

            <div className="mt-6">
              {sortedReports.length === 0 ? (
                <div className="overflow-x-auto table-scroll">
                  <EmptyTable
                    columns={[
                      "Student Number",
                      "Student",
                      "Course",
                      "Status",
                      "Manage",
                    ]}
                    message="No reports to review."
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {sortedReports.map((report) => (
                      <div
                        key={report.id}
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 p-4 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex min-h-7 shrink-0 items-center justify-center rounded-lg border border-stroke bg-[#15161a] px-2 text-xs font-bold text-slate-500">
                              {report.studentId ?? report.internId}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">
                                {report.internName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {report.course}
                              </p>
                            </div>
                          </div>
                          {report.status === "submitted" ||
                          report.status === "approved" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(report);
                                setError("");
                              }}
                              className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                            >
                              Manage
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Submitted {formatDate(report.submittedAt)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto table-scroll">
                    <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
                      <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="w-40 px-3">Student Number</th>
                          <th className="px-3">Student</th>
                          <th className="px-3">Course</th>
                          <th className="px-3">Status</th>
                          <th className="px-3 text-right">Manage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedReports.map((report) => (
                          <tr
                            key={report.id}
                            className="border-b border-slate-100 bg-white/90 transition hover:bg-slate-50"
                          >
                            <td className="px-3 py-4 font-semibold text-slate-500">
                              {report.studentId ?? report.internId}
                            </td>
                            <td className="px-3 py-4">
                              <p className="font-semibold text-ink">
                                {report.internName}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              <p className="text-sm text-slate-700">
                                {report.course}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              {report.status}
                            </td>
                            <td className="px-3 py-4 text-right">
                              {report.status === "submitted" ||
                              report.status === "approved" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelected(report);
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

      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="h-full w-full max-w-3xl overflow-y-auto lg:max-h-[88vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <ReportReviewPanel
              report={selected}
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
