import { redirect } from "next/navigation";

export default function DeanIndexPage() {
  redirect("/dashboard/dean/students");
}
