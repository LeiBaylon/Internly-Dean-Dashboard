"use client";

import { useEffect, useState } from "react";
import InternsTable from "@/components/dean/InternsTable";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import {
  fetchCompetencies,
  fetchHoursSummary,
  fetchInterns,
  fetchReports,
} from "@/lib/firebase/data";
import type { Competency, HoursSummary, InternProfile, Report } from "@/lib/types";

export default function DeanStudentsPage() {
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [hoursByIntern, setHoursByIntern] = useState<
    Record<string, HoursSummary | null>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      const [internResult, reportResult, competencyResult] =
        await Promise.allSettled([
          fetchInterns(),
          fetchReports(),
          fetchCompetencies(),
        ] as const);

      const internData =
        internResult.status === "fulfilled" ? internResult.value : [];
      const reportData =
        reportResult.status === "fulfilled" ? reportResult.value : [];
      const competencyData =
        competencyResult.status === "fulfilled" ? competencyResult.value : [];

      const hoursEntries = await Promise.allSettled(
        internData.map((intern) => {
          const requiredHours = intern.requiredHours ?? 0;
          if (!requiredHours) {
            return Promise.resolve(null);
          }

          return fetchHoursSummary(intern.id, requiredHours);
        })
      );

      if (active) {
        const hoursMap: Record<string, HoursSummary | null> = {};
        internData.forEach((intern, index) => {
          const hoursEntry = hoursEntries[index];
          hoursMap[intern.id] =
            hoursEntry?.status === "fulfilled" ? hoursEntry.value : null;
        });

        setInterns(internData);
        setReports(reportData);
        setCompetencies(competencyData);
        setHoursByIntern(hoursMap);
        setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  return (
    <InternsTable
      interns={interns}
      reports={reports}
      competencies={competencies}
      hoursByIntern={hoursByIntern}
    />
  );
}
