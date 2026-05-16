"use client";

import { useEffect, useState } from "react";
import CompetenciesReviewTable from "@/components/dean/CompetenciesReviewTable";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { fetchCompetencies } from "@/lib/firebase/data";
import type { Competency } from "@/lib/types";

export default function DeanCompetenciesPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchCompetencies();
        if (active) {
          setCompetencies(data);
        }
      } catch {
        if (active) {
          setCompetencies([]);
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

  return <CompetenciesReviewTable competencies={competencies} />;
}
