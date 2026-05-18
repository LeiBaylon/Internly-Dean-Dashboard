"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: NavIconName;
};

export type NavIconName =
  | "dashboard"
  | "profiles"
  | "hours"
  | "reports"
  | "sanctions"
  | "competencies";

type DeanNavProps = {
  items: NavItem[];
  collapsed?: boolean;
};

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function NavIcon({ name, className = "" }: { name: NavIconName; className?: string }) {
  switch (name) {
    case "dashboard":
      return (
        <svg {...baseIconProps} className={className} aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "profiles":
      return (
        <svg {...baseIconProps} className={className} aria-hidden="true">
          <circle cx="12" cy="8" r="3" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      );
    case "hours":
      return (
        <svg {...baseIconProps} className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );
    case "reports":
      return (
        <svg {...baseIconProps} className={className} aria-hidden="true">
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </svg>
      );
    case "sanctions":
      return (
        <svg {...baseIconProps} className={className} aria-hidden="true">
          <path d="M12 4l9 16H3z" />
          <path d="M12 10v4" />
          <circle cx="12" cy="18" r="1" />
        </svg>
      );
    case "competencies":
      return (
        <svg {...baseIconProps} className={className} aria-hidden="true">
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <path d="M4 6l1.5 1.5L8 5" />
          <path d="M4 12l1.5 1.5L8 11" />
          <path d="M4 18l1.5 1.5L8 17" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DeanNav({ items, collapsed = false }: DeanNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2" aria-label="Dean navigation">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={classNames(
              "group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition",
              collapsed ? "justify-center px-3" : "",
              isActive
                ? "border border-primary/30 bg-primary-soft text-ink"
                : "text-slate-500 hover:bg-white/70 hover:text-ink"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
          >
            <span
              className={classNames(
                "flex items-center gap-3",
                collapsed ? "justify-center" : ""
              )}
            >
              <span
                className={classNames(
                  "flex h-7 w-7 items-center justify-center rounded-md border",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent bg-transparent text-slate-500 group-hover:text-primary"
                )}
                aria-hidden="true"
              >
                <NavIcon name={item.icon} className="h-4 w-4" />
              </span>
              {collapsed ? null : item.label}
            </span>
            {collapsed ? null : (
              <span className="text-slate-500" aria-hidden="true">
                {isActive ? ">" : ""}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
