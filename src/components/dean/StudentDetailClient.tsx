"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HoursSummaryCards from "@/components/dean/HoursSummaryCards";
import StudentProfileCard from "@/components/dean/StudentProfileCard";
import EmptyState from "@/components/ui/EmptyState";
import EmptyTable from "@/components/ui/EmptyTable";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchInternDetail } from "@/lib/firebase/data";
import { reviewCompetency, reviewReport } from "@/lib/firebase/firestore";
import type {
  Competency,
  CompetencyStatus,
  HoursSummary,
  InternProfile,
  Report,
  ReportStatus,
  Sanction,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import ReportReviewPanel from "@/components/dean/ReportReviewPanel";
import CompetencyReviewPanel from "@/components/dean/CompetencyReviewPanel";
import FilterPanel, {
  FilterField,
  filterControlClassName,
} from "@/components/dean/FilterPanel";

type DetailState = {
  intern: InternProfile | null;
  hours: HoursSummary | null;
  reports: Report[];
  competencies: Competency[];
  sanctions: Sanction[];
};

type StudentDetailClientProps = {
  internId: string;
};

const studentTabs = [
  { id: "profile", label: "Profile" },
  { id: "hours", label: "Hours" },
  { id: "reports", label: "Reports" },
  { id: "competencies", label: "Competencies" },
  { id: "sanctions", label: "Sanctions" },
];

export default function StudentDetailClient({ internId }: StudentDetailClientProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [state, setState] = useState<DetailState>({
    intern: null,
    hours: null,
    reports: [],
    competencies: [],
    sanctions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(
    null
  );
  const [reportFilter, setReportFilter] = useState<"all" | ReportStatus>("all");
  const [competencyFilter, setCompetencyFilter] = useState<
    "all" | CompetencyStatus
  >("all");
  const [reportError, setReportError] = useState("");
  const [competencyError, setCompetencyError] = useState("");
  const [isReportSaving, setIsReportSaving] = useState(false);
  const [isCompetencySaving, setIsCompetencySaving] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && studentTabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "reports") {
      setSelectedReport(null);
    }
    if (activeTab !== "competencies") {
      setSelectedCompetency(null);
    }
  }, [activeTab]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const detail = await fetchInternDetail(internId);

        if (!active) {
          return;
        }

        if (!detail) {
          setError("Student record not found.");
          return;
        }

        setState({
          intern: detail.intern,
          hours: detail.hours,
          reports: detail.reports,
          competencies: detail.competencies,
          sanctions: detail.sanctions,
        });
      } catch {
        if (active) {
          setError("Unable to load student data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [internId]);

  if (loading) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Student detail unavailable" description={error} />;
  }

  if (!state.intern) {
    return (
      <EmptyState
        title="Student not found"
        description="Try another student record."
      />
    );
  }

  const filteredReports = useMemo(() => {
    return state.reports.filter((report) =>
      reportFilter === "all" ? true : report.status === reportFilter
    );
  }, [state.reports, reportFilter]);

  const filteredCompetencies = useMemo(() => {
    return state.competencies.filter((competency) =>
      competencyFilter === "all" ? true : competency.status === competencyFilter
    );
  }, [state.competencies, competencyFilter]);

  const updateReportSelection = (
    status: ReportStatus,
    deanComment: string,
    reviewedBy: string
  ) => {
    if (!selectedReport) {
      return;
    }

    const updated = {
      ...selectedReport,
      status,
      deanComment,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };

    setState((prev) => ({
      ...prev,
      reports: prev.reports.map((report) =>
        report.id === selectedReport.id ? updated : report
      ),
    }));
    setSelectedReport(updated);
  };

  const handleReportReview = async (status: ReportStatus, deanComment: string) => {
    if (!selectedReport) {
      return;
    }

    if (!user) {
      setReportError("Sign in to review reports.");
      return;
    }

    setIsReportSaving(true);
    setReportError("");

    try {
      await reviewReport({
        internId: selectedReport.internId,
        itemId: selectedReport.id,
        status,
        deanComment,
        reviewedBy: user.uid,
      });

      updateReportSelection(status, deanComment, user.uid);
    } catch {
      setReportError("Unable to update the report. Please try again.");
    } finally {
      setIsReportSaving(false);
    }
  };

  const updateCompetencySelection = (
    status: CompetencyStatus,
    deanComment: string,
    reviewedBy: string
  ) => {
    if (!selectedCompetency) {
      return;
    }

    const updated = {
      ...selectedCompetency,
      status,
      deanComment,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };

    setState((prev) => ({
      ...prev,
      competencies: prev.competencies.map((competency) =>
        competency.id === selectedCompetency.id ? updated : competency
      ),
    }));
    setSelectedCompetency(updated);
  };

  const handleCompetencyReview = async (
    status: CompetencyStatus,
    deanComment: string
  ) => {
    if (!selectedCompetency) {
      return;
    }

    if (!user) {
      setCompetencyError("Sign in to review competencies.");
      return;
    }

    setIsCompetencySaving(true);
    setCompetencyError("");

    try {
      await reviewCompetency({
        internId: selectedCompetency.internId,
        itemId: selectedCompetency.id,
        status,
        deanComment,
        reviewedBy: user.uid,
      });

      updateCompetencySelection(status, deanComment, user.uid);
    } catch {
      setCompetencyError("Unable to update the competency. Please try again.");
    } finally {
      setIsCompetencySaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Student tabs">
        {studentTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                isActive
                  ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                  : "rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
              }
              aria-pressed={isActive}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "profile" ? (
        <section>
          <StudentProfileCard intern={state.intern} />
        </section>
      ) : null}

      {activeTab === "hours" ? (
        <section className="space-y-6">
          {state.hours ? <HoursSummaryCards hours={state.hours} /> : null}
          <div className="glass-card rounded-2xl p-6">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Hours log</h2>
              <p className="mt-1 text-sm text-slate-600">
                Detailed entries for rendered hours.
              </p>
            </div>
            <FilterPanel>
                <FilterField label="Entry Range">
                <select className={filterControlClassName()}>
                  <option>All entries</option>
                  <option>This week</option>
                  <option>This month</option>
                </select>
                </FilterField>
                <button className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Export
                </button>
            </FilterPanel>
            <div className="mt-4">
              <EmptyState
                title="No hours logged yet"
                description="Hours entries will appear here once logged."
              />
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "reports" ? (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <div className="glass-card rounded-2xl p-6">
              <div>
                <h2 className="text-2xl font-semibold text-ink">Reports</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Filter weekly reports and review submissions.
                </p>
              </div>
              <FilterPanel>
                  <FilterField label="Status">
                <select
                  value={reportFilter}
                  onChange={(event) =>
                    setReportFilter(event.target.value as "all" | ReportStatus)
                  }
                  className={filterControlClassName()}
                >
                  <option value="all">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes requested</option>
                </select>
                  </FilterField>
              </FilterPanel>

              <div className="mt-4 overflow-x-auto table-scroll">
                {filteredReports.length === 0 ? (
                  <EmptyTable
                    columns={["Week", "Submitted", "Status"]}
                    message="No reports match the current filter."
                    minWidth="min-w-[560px]"
                  />
                ) : (
                  <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-3">Week</th>
                        <th className="px-3 py-3">Submitted</th>
                        <th className="px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report) => (
                        <tr
                          key={report.id}
                          className="cursor-pointer border-b border-slate-100 bg-white/90 transition hover:bg-slate-50"
                          onClick={() => {
                            setSelectedReport(report);
                            setReportError("");
                          }}
                        >
                          <td className="px-3 py-4">{report.weekLabel}</td>
                          <td className="px-3 py-4">
                            {formatDate(report.submittedAt)}
                          </td>
                          <td className="px-3 py-4">
                            <StatusBadge status={report.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              {selectedReport ? (
                <ReportReviewPanel
                  report={selectedReport}
                  onApprove={(comment) => handleReportReview("approved", comment)}
                  onRequestChanges={(comment) =>
                    handleReportReview("changes_requested", comment)
                  }
                  onClose={() => setSelectedReport(null)}
                  isSaving={isReportSaving}
                  error={reportError}
                />
              ) : (
                <div className="glass-card rounded-2xl p-6">
                  <EmptyState
                    title="Select a report"
                    description="Choose a report to open the review drawer."
                  />
                </div>
              )}
            </div>
          </div>

          {selectedReport ? (
            <div className="fixed inset-0 z-40 bg-slate-900/30 p-4 lg:hidden">
              <div className="h-full">
                <ReportReviewPanel
                  report={selectedReport}
                  onApprove={(comment) => handleReportReview("approved", comment)}
                  onRequestChanges={(comment) =>
                    handleReportReview("changes_requested", comment)
                  }
                  onClose={() => setSelectedReport(null)}
                  isSaving={isReportSaving}
                  error={reportError}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "competencies" ? (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <div className="glass-card rounded-2xl p-6">
              <div>
                <h2 className="text-2xl font-semibold text-ink">Competencies</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Verify evidence submissions and updates.
                </p>
              </div>
              <FilterPanel>
                  <FilterField label="Status">
                <select
                  value={competencyFilter}
                  onChange={(event) =>
                    setCompetencyFilter(
                      event.target.value as "all" | CompetencyStatus
                    )
                  }
                  className={filterControlClassName()}
                >
                  <option value="all">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes requested</option>
                </select>
                  </FilterField>
              </FilterPanel>

              <div className="mt-4 overflow-x-auto table-scroll">
                {filteredCompetencies.length === 0 ? (
                  <EmptyTable
                    columns={["Competency", "Evidence", "Status"]}
                    message="No competencies match the current filter."
                    minWidth="min-w-[560px]"
                  />
                ) : (
                  <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-3">Competency</th>
                        <th className="px-3 py-3">Evidence</th>
                        <th className="px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompetencies.map((competency) => (
                        <tr
                          key={competency.id}
                          className="cursor-pointer border-b border-slate-100 bg-white/90 transition hover:bg-slate-50"
                          onClick={() => {
                            setSelectedCompetency(competency);
                            setCompetencyError("");
                          }}
                        >
                          <td className="px-3 py-4">
                            <p className="font-semibold text-ink">
                              {competency.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(competency.submittedAt)}
                            </p>
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
            </div>

            <div className="hidden lg:block">
              {selectedCompetency ? (
                <CompetencyReviewPanel
                  competency={selectedCompetency}
                  onApprove={(comment) =>
                    handleCompetencyReview("approved", comment)
                  }
                  onRequestChanges={(comment) =>
                    handleCompetencyReview("changes_requested", comment)
                  }
                  onClose={() => setSelectedCompetency(null)}
                  isSaving={isCompetencySaving}
                  error={competencyError}
                />
              ) : (
                <div className="glass-card rounded-2xl p-6">
                  <EmptyState
                    title="Select a competency"
                    description="Choose a competency to open the review drawer."
                  />
                </div>
              )}
            </div>
          </div>

          {selectedCompetency ? (
            <div className="fixed inset-0 z-40 bg-slate-900/30 p-4 lg:hidden">
              <div className="h-full">
                <CompetencyReviewPanel
                  competency={selectedCompetency}
                  onApprove={(comment) =>
                    handleCompetencyReview("approved", comment)
                  }
                  onRequestChanges={(comment) =>
                    handleCompetencyReview("changes_requested", comment)
                  }
                  onClose={() => setSelectedCompetency(null)}
                  isSaving={isCompetencySaving}
                  error={competencyError}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "sanctions" ? (
        <section className="glass-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Sanctions</h2>
              <p className="mt-1 text-sm text-slate-600">
                Past and scheduled sanctions for this intern.
              </p>
            </div>
            <button className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Assign sanction
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {state.sanctions.length === 0 ? (
              <EmptyState
                title="No sanctions recorded"
                description="This intern has no sanction history."
              />
            ) : (
              state.sanctions.map((sanction) => (
                <div
                  key={sanction.id}
                  className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {sanction.daysSanctioned} day(s) sanctioned
                    </p>
                    <p className="text-xs text-slate-500">
                      Scheduled {formatDate(sanction.scheduledDate)}
                    </p>
                  </div>
                  <StatusBadge status={sanction.status} />
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
