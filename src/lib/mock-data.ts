import type {
  Competency,
  HoursSummary,
  InternProfile,
  Report,
  Sanction,
  SanctionSchedule,
  SummaryCounts,
} from "./types";

export const interns: InternProfile[] = [
  {
    id: "intern-1",
    studentId: "2022-001",
    name: "Alyssa Reyes",
    email: "alyssa.reyes@interly.edu",
    course: "BSIT",
    yearLevel: "4th Year",
    status: "active",
    requiredHours: 480,
    companyName: "Northwind Digital",
    companyAddress: "Cebu IT Park, Cebu City",
    supervisorName: "Jordan Lim",
    supervisorEmail: "jlim@northwind.com",
    supervisorPhone: "+63 917 555 1182",
    advisorName: "Dr. Aileen Mercado",
    advisorEmail: "aileen.mercado@interly.edu",
    ojtStartDate: "2026-02-10",
    ojtEndDate: "2026-06-30",
  },
  {
    id: "intern-2",
    studentId: "2023-014",
    name: "Marco Santos",
    email: "marco.santos@interly.edu",
    course: "BSBA",
    yearLevel: "3rd Year",
    status: "probation",
    requiredHours: 360,
    companyName: "Cobalt Trading",
    companyAddress: "Makati Ave, Makati City",
    supervisorName: "Lea Pineda",
    supervisorEmail: "lpineda@cobalt.ph",
    supervisorPhone: "+63 917 555 2231",
    advisorName: "Prof. Lionel Ong",
    advisorEmail: "lionel.ong@interly.edu",
    ojtStartDate: "2026-02-03",
    ojtEndDate: "2026-06-14",
  },
  {
    id: "intern-3",
    studentId: "2022-022",
    name: "Janine Cruz",
    email: "janine.cruz@interly.edu",
    course: "BSCpE",
    yearLevel: "4th Year",
    status: "active",
    requiredHours: 480,
    companyName: "Skyward Labs",
    companyAddress: "Ortigas Center, Pasig City",
    supervisorName: "Ethan Yu",
    supervisorEmail: "eyu@skywardlabs.io",
    supervisorPhone: "+63 917 555 3318",
    advisorName: "Engr. Patricia Dizon",
    advisorEmail: "patricia.dizon@interly.edu",
    ojtStartDate: "2026-02-12",
    ojtEndDate: "2026-06-25",
  },
];

export const hoursByIntern: Record<string, HoursSummary> = {
  "intern-1": {
    required: 480,
    renderedTotal: 410,
    renderedThisWeek: 24,
    remaining: 70,
  },
  "intern-2": {
    required: 360,
    renderedTotal: 290,
    renderedThisWeek: 16,
    remaining: 70,
  },
  "intern-3": {
    required: 480,
    renderedTotal: 455,
    renderedThisWeek: 18,
    remaining: 25,
  },
};

export const reports: Report[] = [
  {
    id: "report-1",
    internId: "intern-1",
    studentId: "2022-001",
    internName: "Alyssa Reyes",
    course: "BSIT",
    weekLabel: "Week 10",
    status: "submitted",
    submittedAt: "2026-05-12T09:20:00.000Z",
    summary: "Refactored the onboarding flow and documented QA fixes.",
    highlights: ["QA fixes closed", "Updated user guide", "Pair review"],
  },
  {
    id: "report-2",
    internId: "intern-2",
    studentId: "2023-014",
    internName: "Marco Santos",
    course: "BSBA",
    weekLabel: "Week 9",
    status: "changes_requested",
    submittedAt: "2026-05-06T10:10:00.000Z",
    reviewedAt: "2026-05-08T12:00:00.000Z",
    reviewedBy: "dean-demo",
    deanComment: "Add more detail on client meetings and outcomes.",
    summary: "Assisted with procurement summary and client outreach.",
    highlights: ["Weekly call prep", "Expense report"],
  },
  {
    id: "report-3",
    internId: "intern-3",
    studentId: "2022-022",
    internName: "Janine Cruz",
    course: "BSCpE",
    weekLabel: "Week 10",
    status: "approved",
    submittedAt: "2026-05-11T08:40:00.000Z",
    reviewedAt: "2026-05-12T10:00:00.000Z",
    reviewedBy: "dean-demo",
    deanComment: "Strong technical progress and documentation.",
    summary: "Built diagnostics for IoT sensor monitoring.",
    highlights: ["Edge deployment", "Sensor calibration"],
  },
];

export const competencies: Competency[] = [
  {
    id: "comp-1",
    internId: "intern-1",
    internName: "Alyssa Reyes",
    course: "BSIT",
    title: "Client-ready UI build",
    status: "submitted",
    submittedAt: "2026-05-13T13:00:00.000Z",
    evidenceType: "link",
    evidenceUrl: "evidence/alyssa-ui-build",
    notes: "Final demo with responsive layout and accessibility checks.",
  },
  {
    id: "comp-2",
    internId: "intern-2",
    internName: "Marco Santos",
    course: "BSBA",
    title: "Procurement workflow analysis",
    status: "changes_requested",
    submittedAt: "2026-05-07T11:30:00.000Z",
    reviewedAt: "2026-05-09T09:30:00.000Z",
    reviewedBy: "dean-demo",
    deanComment: "Attach the final cost comparison sheet.",
    evidenceType: "link",
    evidenceUrl: "evidence/marco-procurement",
  },
  {
    id: "comp-3",
    internId: "intern-3",
    internName: "Janine Cruz",
    course: "BSCpE",
    title: "Sensor calibration report",
    status: "approved",
    submittedAt: "2026-05-10T07:20:00.000Z",
    reviewedAt: "2026-05-11T10:10:00.000Z",
    reviewedBy: "dean-demo",
    deanComment: "Great documentation on calibration steps.",
    evidenceType: "link",
    evidenceUrl: "evidence/janine-calibration",
  },
];

export const sanctions: Sanction[] = [
  {
    id: "sanction-1",
    internId: "intern-2",
    internName: "Marco Santos",
    daysSanctioned: 2,
    scheduledDate: "2026-05-20",
    status: "scheduled",
  },
];

export const sanctionSchedules: SanctionSchedule[] = [
  {
    id: "schedule-1",
    date: "2026-05-20",
    time: "09:00",
    capacity: 4,
    tasks: "Campus cleanup and inventory assistance.",
    internsAssigned: ["Alyssa Reyes", "Marco Santos"],
  },
  {
    id: "schedule-2",
    date: "2026-05-27",
    time: "13:00",
    capacity: 6,
    tasks: "Office filing and equipment room organization.",
    internsAssigned: ["Janine Cruz"],
  },
];

export const summaryCounts: SummaryCounts = {
  totalInterns: interns.length,
  pendingReports: reports.filter((report) => report.status === "submitted")
    .length,
  pendingCompetencies: competencies.filter(
    (competency) => competency.status === "submitted"
  ).length,
  upcomingSanctions: sanctionSchedules.length,
};

export function getInternById(id: string) {
  return interns.find((intern) => intern.id === id);
}

export function getReportsByIntern(internId: string) {
  return reports.filter((report) => report.internId === internId);
}

export function getCompetenciesByIntern(internId: string) {
  return competencies.filter((competency) => competency.internId === internId);
}

export function getHoursByIntern(internId: string) {
  return hoursByIntern[internId];
}
