import type { ReactNode } from "react";
import DeanGate from "@/components/dean/DeanGate";

export default function DeanLayout({ children }: { children: ReactNode }) {
  return <DeanGate>{children}</DeanGate>;
}
