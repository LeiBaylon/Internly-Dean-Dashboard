"use client";

import { useEffect, useState } from "react";
import HoursMonitoringTable from "@/components/dean/HoursMonitoringTable";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { fetchHoursSummary, fetchInterns } from "@/lib/firebase/data";
import type { HoursSummary, InternProfile } from "@/lib/types";

export default function DeanHoursPage() {
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [hoursByIntern, setHoursByIntern] = useState<
    Record<string, HoursSummary | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const internResult = await Promise.allSettled([fetchInterns()] as const);
        const internData =
          internResult[0].status === "fulfilled" ? internResult[0].value : [];
        const hoursEntries = await Promise.allSettled(
          internData.map((intern) => {
            const requiredHours = intern.requiredHours ?? 0;

            if (!requiredHours) {
              return Promise.resolve(null);
            }

            return fetchHoursSummary(intern.id, requiredHours);
          })
        );

        if (!active) {
          return;
        }

        const hoursMap: Record<string, HoursSummary | null> = {};
        internData.forEach((intern, index) => {
          const hoursEntry = hoursEntries[index];
          hoursMap[intern.id] =
            hoursEntry?.status === "fulfilled" ? hoursEntry.value : null;
        });

        setInterns(internData);
        setHoursByIntern(hoursMap);

        if (internResult[0].status === "rejected") {
          setError(
            "Hours data could not be loaded. Check Firebase configuration and try again."
          );
        }
      } catch {
        if (active) {
          setInterns([]);
          setHoursByIntern({});
          setError(
            "Hours data could not be loaded. Check Firebase configuration and try again."
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
          title="Hours data limited"
          description={error}
        />
      ) : null}
      <HoursMonitoringTable interns={interns} hoursByIntern={hoursByIntern} />
    </div>
  );
}
