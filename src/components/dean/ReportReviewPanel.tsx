"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";

type ReportReviewPanelProps = {
  report: Report;
  onApprove: (comment: string) => void;
  onRequestChanges: (comment: string) => void;
  onClose: () => void;
  isSaving?: boolean;
  error?: string;
};

export default function ReportReviewPanel({
  report,
  onApprove,
  onRequestChanges,
  onClose,
  isSaving = false,
  error,
}: ReportReviewPanelProps) {
  const [comment, setComment] = useState(report.deanComment ?? "");
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "changes" | null
  >(null);

  useEffect(() => {
    setComment(report.deanComment ?? "");
    setConfirmAction(null);
  }, [report.id, report.deanComment]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (confirmAction) {
        setConfirmAction(null);
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmAction, onClose]);

  const handleConfirm = () => {
    if (!confirmAction) {
      return;
    }

    if (confirmAction === "approve") {
      onApprove(comment);
    } else {
      onRequestChanges(comment);
    }

    setConfirmAction(null);
  };

  return (
    <div className="glass-card slide-in-right h-full rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Report</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {report.internName} - {report.weekLabel}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{report.course}</p>
          <p className="mt-1 text-xs text-slate-500">
            Submitted {formatDate(report.submittedAt)}
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
        <StatusBadge status={report.status} />
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Summary</p>
          <p className="mt-2 text-sm text-slate-700">{report.summary}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Highlights
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {report.highlights.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Attachments
          </p>
          <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-white/80 p-3 text-xs text-slate-500">
            No attachments provided.
          </div>
        </div>
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
          onClick={() => setConfirmAction("approve")}
          disabled={isSaving}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Approve report"}
        </button>
        <button
          onClick={() => setConfirmAction("changes")}
          disabled={isSaving}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60"
        >
          Request changes
        </button>
      </div>

      {confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
            <h4 className="text-lg font-semibold text-ink">
              {confirmAction === "approve"
                ? "Confirm approval"
                : "Confirm request changes"}
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              {report.internName} - {report.weekLabel}
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              {comment.trim() ? comment : "No comment provided."}
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-soft disabled:opacity-60"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
