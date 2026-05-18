"use client";

import { useEffect, useState } from "react";
import SanctionsManager from "@/components/dean/SanctionsManager";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import {
  fetchInterns,
  fetchSanctionSchedules,
  fetchSanctions,
} from "@/lib/firebase/data";
import type { InternProfile, Sanction, SanctionSchedule } from "@/lib/types";

export default function DeanSanctionsPage() {
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [schedules, setSchedules] = useState<SanctionSchedule[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [internResult, scheduleResult, sanctionResult] =
          await Promise.allSettled([
            fetchInterns(),
            fetchSanctionSchedules(),
            fetchSanctions(),
          ] as const);

        if (!active) {
          return;
        }

        setInterns(
          internResult.status === "fulfilled" ? internResult.value : []
        );
        setSchedules(
          scheduleResult.status === "fulfilled" ? scheduleResult.value : []
        );
        setSanctions(
          sanctionResult.status === "fulfilled" ? sanctionResult.value : []
        );

        const hasError =
          internResult.status === "rejected" ||
          scheduleResult.status === "rejected" ||
          sanctionResult.status === "rejected";

        if (hasError) {
          setError(
            "Sanction data could not be loaded. Check Firebase configuration and try again."
          );
        }
      } catch {
        if (active) {
          setInterns([]);
          setSchedules([]);
          setSanctions([]);
          setError(
            "Sanction data could not be loaded. Check Firebase configuration and try again."
          );
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

  return (
    <div className="space-y-6">
      {error ? (
        <ErrorState
          title="Sanction data limited"
          description={error}
        />
      ) : null}
      <SanctionsManager
        interns={interns}
        sanctions={sanctions}
        schedules={schedules}
      />
    </div>
  );
}
