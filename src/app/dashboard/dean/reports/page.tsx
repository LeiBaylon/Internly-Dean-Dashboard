"use client";

import { useEffect, useState } from "react";
import ReportsReviewTable from "@/components/dean/ReportsReviewTable";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { fetchReports } from "@/lib/firebase/data";
import type { Report } from "@/lib/types";

export default function DeanReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchReports();
        if (active) {
          setReports(data);
        }
      } catch {
        if (active) {
          setReports([]);
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
  }, []);

  if (loading) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  return <ReportsReviewTable reports={reports} />;
}
