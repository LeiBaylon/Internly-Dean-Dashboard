"use client";

import { useMemo, useState } from "react";
import type { InternProfile, Sanction, SanctionSchedule } from "@/lib/types";
import ErrorState from "@/components/ui/ErrorState";
import { createSanction, createSanctionSchedule } from "@/lib/firebase/firestore";
import { formatDate } from "@/lib/utils";
import FilterPanel, {
  FilterField,
  filterControlClassName,
} from "./FilterPanel";
import SanctionScheduleForm from "./SanctionScheduleForm";
import SanctionScheduleList from "./SanctionScheduleList";

type SanctionsManagerProps = {
  interns: InternProfile[];
  sanctions: Sanction[];
  schedules: SanctionSchedule[];
};

type SanctionTab = "records" | "scheduled";

export default function SanctionsManager({
  interns,
  sanctions,
  schedules,
}: SanctionsManagerProps) {
  const [items, setItems] = useState<SanctionSchedule[]>(() => schedules);
  const [sanctionItems, setSanctionItems] = useState<Sanction[]>(() => sanctions);
  const [selectedId, setSelectedId] = useState<string | null>(
    schedules[0]?.id ?? null
  );
  const [activeTab, setActiveTab] = useState<SanctionTab>("records");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInternsOpen, setIsInternsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignNumber, setAssignNumber] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assignDays, setAssignDays] = useState("");
  const [assignError, setAssignError] = useState("");
  const [isAssignSaving, setIsAssignSaving] = useState(false);
  const [recordSearch, setRecordSearch] = useState("");
  const [studentNumberSearch, setStudentNumberSearch] = useState("");
  const [recordSortOrder, setRecordSortOrder] = useState<"asc" | "desc">("asc");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleFromDate, setScheduleFromDate] = useState("");
  const [scheduleToDate, setScheduleToDate] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedSchedule = useMemo(() => {
    return items.find((schedule) => schedule.id === selectedId) ?? null;
  }, [items, selectedId]);

  const internNameById = useMemo(() => {
    return interns.reduce<Record<string, string>>((acc, intern) => {
      acc[intern.id] = intern.name;
      return acc;
    }, {});
  }, [interns]);

  const studentNumberByInternId = useMemo(() => {
    return interns.reduce<Record<string, string>>((acc, intern) => {
      acc[intern.id] = intern.studentId ?? intern.id;
      return acc;
    }, {});
  }, [interns]);

  const filteredSanctions = useMemo(() => {
    const studentNumberQuery = studentNumberSearch.trim().toLowerCase();

    return sanctionItems
      .filter((sanction) => {
        const studentNumber =
          studentNumberByInternId[sanction.internId] ?? sanction.internId;
        const searchText = [sanction.internName].join(" ").toLowerCase();
        const matchesSearch = searchText.includes(recordSearch.toLowerCase());
        const matchesStudentNumber = studentNumberQuery
          ? studentNumber.toLowerCase().includes(studentNumberQuery)
          : true;

        return matchesSearch && matchesStudentNumber;
      })
      .sort((first, second) => {
        const result = first.internName.localeCompare(second.internName);
        return recordSortOrder === "asc" ? result : -result;
      });
  }, [
    sanctionItems,
    recordSearch,
    recordSortOrder,
    studentNumberByInternId,
    studentNumberSearch,
  ]);

  const selectedIntern = useMemo(() => {
    const trimmed = assignNumber.trim().toLowerCase();
    if (!trimmed) {
      return null;
    }

    return (
      interns.find(
        (intern) => (intern.studentId ?? intern.id).toLowerCase() === trimmed
      ) ?? null
    );
  }, [assignNumber, interns]);

  const filteredSchedules = useMemo(() => {
    return items.filter((schedule) => {
      const assignedInterns = schedule.internsAssigned.map(
        (intern) => internNameById[intern] ?? intern
      );
      const searchText = assignedInterns.join(" ").toLowerCase();
      const matchesSearch = searchText.includes(scheduleSearch.toLowerCase());

      const scheduleTime = new Date(schedule.date).getTime();
      const fromTime = scheduleFromDate
        ? new Date(scheduleFromDate).getTime()
        : null;
      const toTime = scheduleToDate
        ? new Date(`${scheduleToDate}T23:59:59`).getTime()
        : null;
      const matchesFrom = fromTime ? scheduleTime >= fromTime : true;
      const matchesTo = toTime ? scheduleTime <= toTime : true;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [
    items,
    internNameById,
    scheduleSearch,
    scheduleFromDate,
    scheduleToDate,
  ]);

  const handleCreate = async (
    schedule: Omit<SanctionSchedule, "id">
  ) => {
    setIsSaving(true);
    setError("");

    try {
      const created = await createSanctionSchedule(schedule);
      setItems((prev) => [created, ...prev]);
      setSelectedId(created.id);
    } catch {
      setError("Unable to create sanction schedule.");
      throw new Error("Unable to create sanction schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetAssignForm = () => {
    setAssignNumber("");
    setAssignReason("");
    setAssignDays("");
    setAssignError("");
  };

  const handleAssignSanction = async () => {
    if (!selectedIntern) {
      setAssignError("Enter a valid student number.");
      return;
    }

    if (!assignReason.trim()) {
      setAssignError("Enter a reason for the sanction.");
      return;
    }

    const daysValue = Number(assignDays);
    if (!Number.isFinite(daysValue) || daysValue <= 0) {
      setAssignError("Enter a valid number of sanction days.");
      return;
    }

    setAssignError("");
    setIsAssignSaving(true);

    try {
      const created = await createSanction({
        internId: selectedIntern.id,
        internName: selectedIntern.name,
        daysSanctioned: daysValue,
        reason: assignReason.trim(),
      });

      setSanctionItems((prev) => [created, ...prev]);
      resetAssignForm();
      setIsAssignOpen(false);
    } catch {
      setAssignError("Unable to assign the sanction.");
    } finally {
      setIsAssignSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <ErrorState title="Sanction schedule error" description={error} />
      ) : null}

      <div className="rounded-2xl border border-stroke bg-[#15161a] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.015)]">
        <div className="grid gap-2 md:grid-cols-2">
          {[
            { id: "records", label: "Student sanction days", icon: "SD" },
            { id: "scheduled", label: "Scheduled days", icon: "SC" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SanctionTab)}
              className={`flex min-h-12 items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-primary/55 bg-primary-soft text-ink shadow-[0_0_28px_rgba(18,201,147,0.16)]"
                  : "border-transparent text-slate-500 hover:bg-white/70 hover:text-ink"
              }`}
              aria-pressed={activeTab === tab.id}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[10px] font-bold ${
                  activeTab === tab.id
                    ? "border-primary/45 bg-primary/10 text-primary"
                    : "border-stroke bg-transparent text-slate-500"
                }`}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "records" ? (
        <div className="space-y-6">
          <FilterPanel
            searchValue={recordSearch}
            onSearchChange={setRecordSearch}
            searchPlaceholder="Search student"
          >
            <FilterField label="Student Number">
              <input
                value={studentNumberSearch}
                onChange={(event) => setStudentNumberSearch(event.target.value)}
                placeholder="Enter student number"
                className={filterControlClassName()}
              />
            </FilterField>
            <FilterField label="Alphabetical Order">
              <select
                value={recordSortOrder}
                onChange={(event) =>
                  setRecordSortOrder(event.target.value as "asc" | "desc")
                }
                className={filterControlClassName()}
              >
                <option value="asc">A to Z</option>
                <option value="desc">Z to A</option>
              </select>
            </FilterField>
          </FilterPanel>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  Student days of sanctions
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  View each student with recorded sanction days and schedule status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetAssignForm();
                  setIsAssignOpen(true);
                }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
              >
                Give sanction
              </button>
            </div>

            <div className="mt-6 overflow-x-auto table-scroll">
              <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-20 border-b border-stroke px-3 py-3">
                      Number
                    </th>
                    <th className="border-b border-stroke px-3 py-3">Student</th>
                    <th className="border-b border-stroke px-3 py-3">
                      Sanction days
                    </th>
                    <th className="border-b border-stroke px-3 py-3">
                      Scheduled date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSanctions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border-b border-stroke px-3 py-14 text-center text-slate-500"
                    >
                      No sanctions recorded yet.
                    </td>
                  </tr>
                  ) : (
                    filteredSanctions.map((sanction, index) => (
                      <tr key={sanction.id} className="transition hover:bg-white/5">
                        <td className="border-b border-stroke px-3 py-4 font-semibold text-slate-500">
                          {index + 1}
                        </td>
                        <td className="border-b border-stroke px-3 py-4 font-semibold text-ink">
                          {sanction.internName}
                        </td>
                        <td className="border-b border-stroke px-3 py-4 text-slate-500">
                          {sanction.daysSanctioned}
                        </td>
                        <td className="border-b border-stroke px-3 py-4 text-slate-500">
                          {sanction.scheduledDate
                            ? formatDate(sanction.scheduledDate)
                            : "Not scheduled"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "scheduled" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">
                Scheduled sanction days
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                View scheduled sanction days and the interns assigned to render
                sanctions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
            >
              Create schedule
            </button>
          </div>

          <FilterPanel
            searchValue={scheduleSearch}
            onSearchChange={setScheduleSearch}
            searchPlaceholder="Search student"
          >
            <FilterField label="From Date">
              <input
                type="date"
                value={scheduleFromDate}
                onChange={(event) => setScheduleFromDate(event.target.value)}
                className={filterControlClassName()}
              />
            </FilterField>
            <FilterField label="To Date">
              <input
                type="date"
                value={scheduleToDate}
                onChange={(event) => setScheduleToDate(event.target.value)}
                className={filterControlClassName()}
              />
            </FilterField>
          </FilterPanel>

          <div>
            <SanctionScheduleList
              schedules={filteredSchedules}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setIsInternsOpen(true);
              }}
            />
          </div>
        </div>
      ) : null}

      {isInternsOpen && selectedSchedule ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsInternsOpen(false)}
        >
          <div
            className="glass-card w-full max-w-2xl rounded-2xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-ink">
                  Interns scheduled
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDate(selectedSchedule.date)}
                  {selectedSchedule.time ? ` at ${selectedSchedule.time}` : ""}{" "}
                  - Capacity {selectedSchedule.capacity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInternsOpen(false)}
                className="rounded-full border border-stroke bg-[#15161a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Close
              </button>
            </div>

            {selectedSchedule.tasks ? (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Tasks
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {selectedSchedule.tasks}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Students assigned for this sanction day
              </p>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {selectedSchedule.internsAssigned.length === 0
                  ? "No interns assigned yet."
                  : selectedSchedule.internsAssigned.map((intern) => (
                      <span
                        key={intern}
                        className="rounded-xl border border-stroke bg-[#15161a] px-3 py-2"
                      >
                        {internNameById[intern] ?? intern}
                      </span>
                    ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!isSaving) {
              setIsCreateOpen(false);
            }
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <SanctionScheduleForm
              onCreate={handleCreate}
              onClose={() => setIsCreateOpen(false)}
              isSaving={isSaving}
            />
          </div>
        </div>
      ) : null}

      {isAssignOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!isAssignSaving) {
              setIsAssignOpen(false);
            }
          }}
        >
          <div
            className="glass-card w-full max-w-2xl rounded-2xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-ink">
                  Give sanction
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Enter a student number to load their information and assign
                  sanctions.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student number
                </span>
                <input
                  value={assignNumber}
                  onChange={(event) => setAssignNumber(event.target.value)}
                  placeholder="Enter student number"
                  className={filterControlClassName()}
                />
              </label>

              <div className="rounded-xl border border-stroke bg-[#15161a] p-4 text-sm text-slate-500">
                {selectedIntern ? (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-ink">
                      {selectedIntern.name}
                    </div>
                    <div>{selectedIntern.course}</div>
                    <div>{selectedIntern.email}</div>
                    <div>{selectedIntern.companyName}</div>
                  </div>
                ) : (
                  "Enter a matching student number to preview details."
                )}
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason for sanction
                </span>
                <input
                  value={assignReason}
                  onChange={(event) => setAssignReason(event.target.value)}
                  placeholder="Type the reason"
                  className={filterControlClassName()}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Days of sanction
                </span>
                <input
                  value={assignDays}
                  onChange={(event) => setAssignDays(event.target.value)}
                  placeholder="Enter number of days"
                  className={filterControlClassName()}
                  inputMode="numeric"
                />
              </label>

              {assignError ? (
                <p className="text-sm text-rose-700">{assignError}</p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="rounded-xl border border-stroke bg-[#15161a] px-4 py-2 text-sm font-semibold text-slate-500"
                  disabled={isAssignSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignSanction}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                  disabled={isAssignSaving}
                >
                  {isAssignSaving ? "Saving..." : "Assign sanction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
