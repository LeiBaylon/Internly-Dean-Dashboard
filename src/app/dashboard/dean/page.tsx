"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DeanSummaryCards from "@/components/dean/DeanSummaryCards";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  fetchCompetencies,
  fetchInterns,
  fetchReports,
  fetchSanctionSchedules,
} from "@/lib/firebase/data";
import type { Competency, Report, SanctionSchedule, SummaryCounts } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DeanOverviewPage() {
  const [internCount, setInternCount] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [schedules, setSchedules] = useState<SanctionSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      const [interns, reportsData, competencyData, scheduleData] =
        await Promise.allSettled([
          fetchInterns(),
          fetchReports(),
          fetchCompetencies(),
          fetchSanctionSchedules(),
        ]);

      if (!active) {
        return;
      }

      setInternCount(interns.status === "fulfilled" ? interns.value.length : 0);
      setReports(reportsData.status === "fulfilled" ? reportsData.value : []);
      setCompetencies(
        competencyData.status === "fulfilled" ? competencyData.value : []
      );
      setSchedules(
        scheduleData.status === "fulfilled" ? scheduleData.value : []
      );
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const summaryCounts = useMemo<SummaryCounts>(() => {
    const pendingReports = reports.filter(
      (report) => report.status === "submitted"
    ).length;
    const pendingCompetencies = competencies.filter(
      (competency) => competency.status === "submitted"
    ).length;

    return {
      totalInterns: internCount,
      pendingReports,
      pendingCompetencies,
      upcomingSanctions: schedules.length,
    };
  }, [internCount, reports, competencies, schedules]);

  const pendingReports = reports.filter((report) => report.status === "submitted");
  const pendingCompetencies = competencies.filter(
    (competency) => competency.status === "submitted"
  );

  const activityItems = useMemo(() => {
    const reportItems = reports.map((report) => {
      const actionLabel =
        report.status === "approved"
          ? "Report approved"
          : report.status === "changes_requested"
          ? "Changes requested"
          : "Report submitted";

      return {
        id: `report-${report.id}`,
        title: actionLabel,
        description: `${report.internName} - ${report.weekLabel}`,
        date: report.reviewedAt ?? report.submittedAt,
        status: report.status,
      };
    });

    const competencyItems = competencies.map((competency) => {
      const actionLabel =
        competency.status === "approved"
          ? "Competency approved"
          : competency.status === "changes_requested"
          ? "Changes requested"
          : "Competency submitted";

      return {
        id: `competency-${competency.id}`,
        title: actionLabel,
        description: `${competency.internName} - ${competency.title}`,
        date: competency.reviewedAt ?? competency.submittedAt,
        status: competency.status,
      };
    });

    const sanctionItems = schedules.map((schedule) => ({
      id: `sanction-${schedule.id}`,
      title: "Sanction schedule",
      description: `${formatDate(schedule.date)} - ${schedule.internsAssigned.length} intern(s)`,
      date: schedule.date,
      status: "scheduled",
    }));

    return [...reportItems, ...competencyItems, ...sanctionItems]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [reports, competencies, schedules]);

  const alerts = useMemo(() => {
    const now = Date.now();
    const overdueReports = reports.filter((report) => {
      if (report.status !== "submitted") {
        return false;
      }

      const submittedTime = new Date(report.submittedAt).getTime();
      if (Number.isNaN(submittedTime)) {
        return false;
      }

      const daysSince = (now - submittedTime) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    });

    const internsWithCompetencies = new Set(
      competencies.map((competency) => competency.internId)
    );

    const missingCompetencies = Math.max(
      internCount - internsWithCompetencies.size,
      0
    );

    return [
      {
        title: "Overdue reports",
        detail: `${overdueReports.length} report(s) need follow-up`,
        tone: "text-amber-200 bg-amber-500/10 border-amber-400/20",
      },
      {
        title: "Missing competencies",
        detail: `${missingCompetencies} intern(s) have no submissions`,
        tone: "text-slate-300 bg-white/70 border-stroke",
      },
      {
        title: "Pending approvals",
        detail: `${pendingReports.length + pendingCompetencies.length} items ready for review`,
        tone: "text-blue-200 bg-blue-500/10 border-blue-400/20",
      },
    ];
  }, [competencies, internCount, pendingCompetencies.length, pendingReports.length, reports]);

  if (loading) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DeanSummaryCards counts={summaryCounts} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <SectionHeader
              title="Recent activity"
              subtitle="Latest reviews, approvals, and submissions."
            />
            <div className="mt-5">
              {activityItems.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="New report and competency activity will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {activityItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="mt-1 h-3 w-3 rounded-full bg-primary" />
                      <div className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">
                            {item.title}
                          </p>
                          <span className="text-xs text-slate-500">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-slate-600">
                            {item.description}
                          </p>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <SectionHeader
              title="Alerts"
              subtitle="Items that need dean attention."
            />
            <div className="mt-5 grid gap-3">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className={`rounded-xl border px-4 py-3 text-sm ${alert.tone}`}
                >
                  <p className="font-semibold">{alert.title}</p>
                  <p className="mt-1 text-xs opacity-80">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <SectionHeader title="Pending actions" />
            <div className="mt-4 space-y-3">
              {pendingReports.length === 0 && pendingCompetencies.length === 0 ? (
                <EmptyState
                  title="All caught up"
                  description="No pending submissions right now."
                />
              ) : (
                [...pendingReports.slice(0, 2), ...pendingCompetencies.slice(0, 2)].map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {"internName" in item ? item.internName : "Intern"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {"weekLabel" in item ? item.weekLabel : item.title}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  )
                )
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <SectionHeader title="Upcoming sanctions" />
            <div className="mt-4 space-y-3">
              {schedules.length === 0 ? (
                <EmptyState
                  title="No sanction schedules"
                  description="Create a schedule to assign interns."
                />
              ) : (
                schedules.slice(0, 3).map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {formatDate(schedule.date)}
                    </p>
                    <p className="mt-2 font-semibold text-ink">
                      Capacity {schedule.capacity}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {schedule.internsAssigned.length} assigned
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
