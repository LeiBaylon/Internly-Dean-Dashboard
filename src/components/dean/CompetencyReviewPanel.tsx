"use client";

import { useEffect, useState } from "react";
import type { Competency } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";

type CompetencyReviewPanelProps = {
  competency: Competency;
  onApprove: (comment: string) => void;
  onRequestChanges: (comment: string) => void;
  onClose: () => void;
  isSaving?: boolean;
  error?: string;
};

export default function CompetencyReviewPanel({
  competency,
  onApprove,
  onRequestChanges,
  onClose,
  isSaving = false,
  error,
}: CompetencyReviewPanelProps) {
  const [comment, setComment] = useState(competency.deanComment ?? "");

  useEffect(() => {
    setComment(competency.deanComment ?? "");
  }, [competency.id, competency.deanComment]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const checklist = [
    {
      label: "Evidence attached",
      checked: Boolean(competency.evidenceUrl),
    },
    {
      label: "Evidence type selected",
      checked: Boolean(competency.evidenceType),
    },
    {
      label: "Notes provided",
      checked: Boolean(competency.notes),
    },
  ];

  return (
    <div className="glass-card slide-in-right h-full rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Competency
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {competency.internName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{competency.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Submitted {formatDate(competency.submittedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs uppercase tracking-wide text-slate-600"
        >
          Close
        </button>
      </div>

      <div className="mt-4">
        <StatusBadge status={competency.status} />
      </div>

      <div className="mt-6 space-y-3 text-sm text-slate-700">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Evidence type
          </p>
          <p className="mt-1">{competency.evidenceType}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Evidence preview
          </p>
          <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-white/80 p-3">
            {competency.evidenceUrl ? (
              <a
                href={competency.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-xs font-semibold text-blue-700"
              >
                {competency.evidenceUrl}
              </a>
            ) : (
              <p className="text-xs text-slate-500">No evidence provided.</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Evidence reference
          </p>
          <p className="mt-1 break-all rounded-lg bg-white/70 p-3">
            {competency.evidenceUrl}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Competency checklist
          </p>
          <div className="mt-2 space-y-2">
            {checklist.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs"
              >
                <span className="text-slate-600">{item.label}</span>
                <span
                  className={
                    item.checked
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-slate-400"
                  }
                >
                  {item.checked ? "OK" : "No"}
                </span>
              </div>
            ))}
          </div>
        </div>
        {competency.notes ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Notes</p>
            <p className="mt-1">{competency.notes}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <label className="text-xs uppercase tracking-wide text-slate-500">
          Dean comment
        </label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share feedback or request changes"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          rows={4}
        />
      </div>

      {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => onApprove(comment)}
          disabled={isSaving}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Approve competency"}
        </button>
        <button
          onClick={() => onRequestChanges(comment)}
          disabled={isSaving}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60"
        >
          Request changes
        </button>
      </div>
    </div>
  );
}
