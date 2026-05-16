"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type FilterPanelProps = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  fieldsClassName?: string;
  children: ReactNode;
};

type FilterFieldProps = {
  label: string;
  children: ReactNode;
};

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-bold text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function filterControlClassName(extra = "") {
  return [
    "h-[3.25rem] w-full rounded-xl border border-stroke bg-[#15161a] px-4 text-sm text-ink shadow-none outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function FilterPanel({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  fieldsClassName = "",
  children,
}: FilterPanelProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const hasSearch =
    typeof searchValue === "string" && typeof onSearchChange === "function";

  return (
    <div className="rounded-3xl border border-stroke bg-[#141519]/80 p-5">
      {hasSearch ? (
        <div
          className={`flex flex-wrap items-center gap-4 ${
            filtersOpen ? "border-b border-stroke pb-5" : ""
          }`}
        >
          <div className="relative min-w-64 flex-1">
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className={filterControlClassName("pl-12")}
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`flex h-[3.25rem] items-center gap-2 rounded-xl border px-5 text-sm font-bold text-ink transition ${
              filtersOpen
                ? "border-primary/45 bg-primary-soft hover:border-primary/70"
                : "border-stroke bg-white/70 hover:border-primary/45"
            }`}
            aria-expanded={filtersOpen}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 4h18l-7 8v6l-4 2v-8L3 4Z" />
            </svg>
            Filters
          </button>
        </div>
      ) : null}
      {filtersOpen ? (
        <div
          className={[
            "grid gap-4",
            fieldsClassName || "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
            hasSearch ? "mt-5" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
