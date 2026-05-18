"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import type { UserProfile } from "@/lib/types";
import { classNames, formatDate } from "@/lib/utils";
import { auth } from "@/lib/firebase/auth";
import DeanNav, { type NavItem } from "./DeanNav";

const navItems: NavItem[] = [
  { label: "OJT Profiles", href: "/dashboard/dean/students", icon: "profiles" },
  { label: "OJT Hours", href: "/dashboard/dean/hours", icon: "hours" },
  { label: "Weekly Reports", href: "/dashboard/dean/reports", icon: "reports" },
  { label: "OJT Sanctions", href: "/dashboard/dean/sanctions", icon: "sanctions" },
  { label: "OJT Competencies", href: "/dashboard/dean/competencies", icon: "competencies" },
];

type Breadcrumb = { label: string; href?: string };

const baseBreadcrumbs: Breadcrumb[] = [
  { label: "Dean", href: "/dashboard/dean/students" },
];

type DeanShellProps = {
  user: UserProfile;
  children: ReactNode;
};

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/dashboard/dean/students/")) {
    const studentId = pathname.split("/").pop() ?? "Student";
    return {
      title: "Student OJT Profile",
      subtitle: "View the student's profile, company information, and OJT records.",
      breadcrumbs: [
        ...baseBreadcrumbs,
        { label: "OJT Profiles", href: "/dashboard/dean/students" },
        { label: studentId },
      ],
    };
  }

  if (pathname === "/dashboard/dean/students") {
    return {
      title: "Student OJT Profile Management",
      subtitle: "View student profiles and company information in one place.",
      breadcrumbs: [...baseBreadcrumbs, { label: "OJT Profiles" }],
    };
  }

  if (pathname === "/dashboard/dean/hours") {
    return {
      title: "Student OJT Hours Monitoring",
      subtitle: "Track required hours, weekly rendered hours, totals, and remaining balances.",
      breadcrumbs: [...baseBreadcrumbs, { label: "OJT Hours" }],
    };
  }

  if (pathname === "/dashboard/dean/reports") {
    return {
      title: "Student Weekly Report Monitoring",
      subtitle: "View submitted weekly reports and manage dean approvals.",
      breadcrumbs: [...baseBreadcrumbs, { label: "Weekly Reports" }],
    };
  }

  if (pathname === "/dashboard/dean/competencies") {
    return {
      title: "Student OJT Competencies Management",
      subtitle: "View submitted competencies and manage dean approvals.",
      breadcrumbs: [...baseBreadcrumbs, { label: "OJT Competencies" }],
    };
  }

  if (pathname === "/dashboard/dean/sanctions") {
    return {
      title: "Student OJT Sanction Management",
      subtitle: "View sanction days, schedule sanction events, and check assigned interns.",
      breadcrumbs: [...baseBreadcrumbs, { label: "OJT Sanctions" }],
    };
  }

  return {
    title: "Dean",
    subtitle: "OJT program oversight.",
    breadcrumbs: baseBreadcrumbs,
  };
}

export default function DeanShell({ user, children }: DeanShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname]);
  const title = pageMeta.title;

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex min-h-screen">
        <aside
          className={classNames(
            "hidden shrink-0 border-r border-stroke bg-[#17181c] px-5 py-7 lg:flex lg:flex-col",
            navCollapsed ? "w-20" : "w-72 xl:w-80"
          )}
        >
          <div
            className={classNames(
              "flex items-center justify-between",
              navCollapsed ? "flex-col gap-3" : ""
            )}
          >
            <button
              type="button"
              onClick={() => setNavCollapsed((prev) => !prev)}
              className={classNames(
                "flex items-center gap-3",
                navCollapsed ? "justify-center" : ""
              )}
              aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
              title={navCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#35e0ad] to-[#08a978] text-2xl font-bold text-white shadow-soft">
                I
              </span>
              {navCollapsed ? null : (
                <span className="text-2xl font-bold text-ink">Internly</span>
              )}
            </button>
            {navCollapsed ? null : (
              <button
                type="button"
                onClick={() => setNavCollapsed(true)}
                className="h-8 w-8 rounded-full border border-stroke bg-white/70 text-xs font-semibold text-slate-500"
                aria-label="Collapse navigation"
                title="Collapse navigation"
              >
                &lt;&lt;
              </button>
            )}
          </div>

          <div className="mt-12">
            <DeanNav items={navItems} collapsed={navCollapsed} />
          </div>

          <div className="mt-auto space-y-6">
            <button
              type="button"
              onClick={handleSignOut}
              className={classNames(
                "text-rose-300 transition hover:text-rose-200",
                navCollapsed
                  ? "flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white/70 text-xs font-semibold"
                  : "px-4 py-2 text-left text-sm font-semibold"
              )}
              aria-label="Sign Out"
              title={navCollapsed ? "Sign Out" : undefined}
            >
              {navCollapsed ? "SO" : "Sign Out"}
            </button>

            {navCollapsed ? null : (
              <div className="rounded-xl border border-stroke bg-white/70 px-4 py-4">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.displayName}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {user.uid}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stroke bg-[#17181c] px-4 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/dashboard/dean/students"
                className="flex items-center gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#35e0ad] to-[#08a978] text-xl font-bold text-white">
                  I
                </span>
                <span className="text-xl font-bold text-ink">Internly</span>
              </Link>
              <button
                type="button"
                onClick={() => setNavOpen((prev) => !prev)}
                className="rounded-lg border border-stroke bg-white/70 px-3 py-2 text-sm font-semibold text-slate-500"
                aria-label="Toggle navigation"
              >
                Menu
              </button>
            </div>
            {navOpen ? (
              <div className="mt-4">
                <DeanNav items={navItems} />
              </div>
            ) : null}
          </header>

          <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
            <div className="mx-auto w-full max-w-[1600px] space-y-8">
              <header>
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex min-w-0 items-start gap-3">
                  <div className="min-w-0">
                    <nav className="text-xs uppercase tracking-wide text-slate-500">
                      {pageMeta.breadcrumbs.map((crumb, index) => (
                        <span key={`${crumb.label}-${index}`}>
                          {crumb.href ? (
                            <Link
                              href={crumb.href}
                              className="hover:text-ink"
                            >
                              {crumb.label}
                            </Link>
                          ) : (
                            <span>{crumb.label}</span>
                          )}
                          {index < pageMeta.breadcrumbs.length - 1 ? (
                            <span className="mx-2 text-slate-500">/</span>
                          ) : null}
                        </span>
                      ))}
                    </nav>
                    <h2 className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
                      {title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-base text-slate-500">
                      {pageMeta.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="rounded-full border border-stroke bg-white/70 px-3 py-1.5">
                    {formatDate(new Date().toISOString())}
                  </span>
                </div>
              </div>
              </header>

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
