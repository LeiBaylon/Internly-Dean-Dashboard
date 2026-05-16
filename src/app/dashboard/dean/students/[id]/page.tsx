import StudentDetailClient from "@/components/dean/StudentDetailClient";

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <StudentDetailClient internId={params.id} />;
}
