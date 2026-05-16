"use client";

import { useState } from "react";
import type { SanctionSchedule } from "@/lib/types";
import { filterControlClassName } from "./FilterPanel";

type SanctionScheduleFormProps = {
  onCreate: (schedule: Omit<SanctionSchedule, "id">) => Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
};

export default function SanctionScheduleForm({
  onCreate,
  onClose,
  isSaving = false,
}: SanctionScheduleFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [tasks, setTasks] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!date) {
      setError("Pick a date for the schedule.");
      return;
    }

    if (!time) {
      setError("Pick a time for the schedule.");
      return;
    }

    if (capacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    setError("");

    try {
      await onCreate({
        date,
        time,
        capacity,
        tasks: tasks.trim() || undefined,
        internsAssigned: [],
      });

      setDate("");
      setTime("");
      setCapacity(4);
      setTasks("");
      onClose();
    } catch {
      setError("Unable to create schedule. Try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Schedule sanctions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create sanction days and define the work to be completed.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="rounded-full border border-stroke bg-[#15161a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Close
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-slate-500">
          <span className="mb-2 block">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={isSaving}
            className={filterControlClassName()}
          />
        </label>

        <label className="block text-sm font-bold text-slate-500">
          <span className="mb-2 block">Time</span>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            disabled={isSaving}
            className={filterControlClassName()}
          />
        </label>

        <label className="block text-sm font-bold text-slate-500">
          <span className="mb-2 block">Capacity</span>
          <input
            type="number"
            value={capacity}
            min={1}
            onChange={(event) => setCapacity(Number(event.target.value))}
            disabled={isSaving}
            className={filterControlClassName()}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-bold text-slate-500">
        <span className="mb-2 block">Tasks</span>
        <textarea
          value={tasks}
          onChange={(event) => setTasks(event.target.value)}
          disabled={isSaving}
          placeholder="List the sanction tasks"
          rows={5}
          className={filterControlClassName("h-auto min-h-32 py-3")}
        />
      </label>

      {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="rounded-xl border border-stroke bg-[#15161a] px-4 py-2 text-sm font-semibold text-slate-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Create schedule"}
        </button>
      </div>
    </form>
  );
}
