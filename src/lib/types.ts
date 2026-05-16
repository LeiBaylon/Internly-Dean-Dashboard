export type UserRole = "dean" | "intern";

export type UserProfile = {
  uid: string;
  displayName: string;
  role: UserRole;
};

export type InternStatus = "active" | "probation" | "sanctioned";

export type InternProfile = {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  course: string;
  yearLevel: string;
  status: InternStatus;
  requiredHours?: number;
  companyName: string;
  companyAddress: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorPhone: string;
  advisorName?: string;
  advisorEmail?: string;
  ojtStartDate?: string;
  ojtEndDate?: string;
};

export type HoursSummary = {
  required: number;
  renderedTotal: number;
  renderedThisWeek: number;
  remaining: number;
};

export type ActivityLogEntry = {
  id: string;
  internId: string;
  date: string;
  activity: string;
  areaCovered: string;
  outcome: string;
  evidenceUrl?: string;
};

export type ReportStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "changes_requested";

export type Report = {
  id: string;
  internId: string;
  studentId?: string;
  internName: string;
  course: string;
  weekLabel: string;
  status: ReportStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  deanComment?: string;
  summary: string;
  highlights: string[];
};

export type CompetencyStatus = "submitted" | "approved" | "changes_requested";

export type Competency = {
  id: string;
  internId: string;
  internName: string;
  course: string;
  title: string;
  status: CompetencyStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  deanComment?: string;
  evidenceType: "link" | "image" | "video";
  evidenceUrl: string;
  notes?: string;
};

export type SanctionSchedule = {
  id: string;
  date: string;
  time?: string;
  capacity: number;
  tasks?: string;
  internsAssigned: string[];
};

export type SanctionStatus = "pending" | "scheduled" | "completed";

export type Sanction = {
  id: string;
  internId: string;
  internName: string;
  daysSanctioned: number;
  scheduledDate?: string;
  status: SanctionStatus;
  reason?: string;
};

export type SummaryCounts = {
  totalInterns: number;
  pendingReports: number;
  pendingCompetencies: number;
  upcomingSanctions: number;
};
