"use client";

import type { ReactNode } from "react";
import AccessDenied from "@/components/ui/AccessDenied";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import SignInCard from "@/components/auth/SignInCard";
import DeanShell from "@/components/layout/DeanShell";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserProfile } from "@/lib/types";

export default function DeanGate({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto mt-16 w-full max-w-2xl">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (!user) {
    return <SignInCard />;
  }

  if (role !== "dean") {
    return <AccessDenied />;
  }

  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName ?? user.email ?? "Dean",
    role: "dean",
  };

  return <DeanShell user={profile}>{children}</DeanShell>;
}
