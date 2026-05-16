import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import type {
  ActivityLogEntry,
  Competency,
  CompetencyStatus,
  HoursSummary,
  InternProfile,
  InternStatus,
  Report,
  ReportStatus,
  Sanction,
  SanctionSchedule,
} from "@/lib/types";
import { db, firebaseConfigured } from "./client";

type FirestoreDoc = Record<string, unknown>;

type InternDetail = {
  intern: InternProfile;
  hours: HoursSummary;
  reports: Report[];
  competencies: Competency[];
  sanctions: Sanction[];
};

const allowedInternStatus: InternStatus[] = [
  "active",
  "probation",
  "sanctioned",
];

const allowedReportStatus: ReportStatus[] = [
  "draft",
  "submitted",
  "approved",
  "changes_requested",
];

const allowedCompetencyStatus: CompetencyStatus[] = [
  "submitted",
  "approved",
  "changes_requested",
];

function requireDb() {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  return db;
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string") as string[];
  }

  return [];
}

function toDate(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

function toIsoString(value: unknown) {
  const date = toDate(value);
  return date ? date.toISOString() : "";
}

function normalizeStatus<T extends string>(
  value: unknown,
  allowed: T[],
  fallback: T
) {
  const candidate = typeof value === "string" ? value : "";
  return (allowed.includes(candidate as T) ? candidate : fallback) as T;
}

function mapIntern(id: string, data: FirestoreDoc): InternProfile {
  return {
    id,
    studentId: toStringValue(data.studentId),
    name: toStringValue(data.name, "Unnamed intern"),
    email: toStringValue(data.email),
    course: toStringValue(data.course),
    yearLevel: toStringValue(data.yearLevel),
    status: normalizeStatus(data.status, allowedInternStatus, "active"),
    requiredHours: toNumberValue(data.requiredHours ?? data.required, 0),
    companyName: toStringValue(data.companyName),
    companyAddress: toStringValue(data.companyAddress),
    supervisorName: toStringValue(data.supervisorName),
    supervisorEmail: toStringValue(data.supervisorEmail),
    supervisorPhone: toStringValue(data.supervisorPhone),
    advisorName: toStringValue(data.advisorName),
    advisorEmail: toStringValue(data.advisorEmail),
    ojtStartDate: toStringValue(data.ojtStartDate),
    ojtEndDate: toStringValue(data.ojtEndDate),
  };
}

function mapReport(
  id: string,
  data: FirestoreDoc,
  internId: string,
  studentId = ""
): Report {
  return {
    id,
    internId,
    studentId: toStringValue(data.studentId, studentId) || undefined,
    internName: toStringValue(data.internName, internId || "Intern"),
    course: toStringValue(data.course),
    weekLabel: toStringValue(data.weekLabel, "Week"),
    status: normalizeStatus(data.status, allowedReportStatus, "submitted"),
    submittedAt: toIsoString(data.submittedAt),
    reviewedAt: toIsoString(data.reviewedAt) || undefined,
    reviewedBy: toStringValue(data.reviewedBy) || undefined,
    deanComment: toStringValue(data.deanComment) || undefined,
    summary: toStringValue(data.summary),
    highlights: toStringArray(data.highlights),
  };
}

function mapCompetency(
  id: string,
  data: FirestoreDoc,
  internId: string
): Competency {
  return {
    id,
    internId,
    internName: toStringValue(data.internName, internId || "Intern"),
    course: toStringValue(data.course),
    title: toStringValue(data.title, "Competency"),
    status: normalizeStatus(data.status, allowedCompetencyStatus, "submitted"),
    submittedAt: toIsoString(data.submittedAt),
    reviewedAt: toIsoString(data.reviewedAt) || undefined,
    reviewedBy: toStringValue(data.reviewedBy) || undefined,
    deanComment: toStringValue(data.deanComment) || undefined,
    evidenceType: normalizeStatus(
      data.evidenceType,
      ["link", "image", "video"],
      "link"
    ),
    evidenceUrl: toStringValue(data.evidenceUrl),
    notes: toStringValue(data.notes) || undefined,
  };
}

function mapSanction(id: string, data: FirestoreDoc): Sanction {
  return {
    id,
    internId: toStringValue(data.internId),
    internName: toStringValue(data.internName, "Intern"),
    daysSanctioned: toNumberValue(data.daysSanctioned),
    scheduledDate: toStringValue(data.scheduledDate) || undefined,
    status: normalizeStatus(
      data.status,
      ["pending", "scheduled", "completed"],
      "pending"
    ),
    reason: toStringValue(data.reason) || undefined,
  };
}

function mapSchedule(id: string, data: FirestoreDoc): SanctionSchedule {
  return {
    id,
    date: toStringValue(data.date),
    time: toStringValue(data.time) || undefined,
    capacity: toNumberValue(data.capacity),
    tasks: toStringValue(data.tasks) || undefined,
    internsAssigned: toStringArray(data.internsAssigned),
  };
}

function mapActivityLogEntry(
  id: string,
  data: FirestoreDoc,
  internId: string
): ActivityLogEntry {
  return {
    id,
    internId,
    date: toIsoString(data.date ?? data.loggedAt ?? data.createdAt),
    activity: toStringValue(data.activity, toStringValue(data.task, "")),
    areaCovered: toStringValue(data.areaCovered ?? data.area),
    outcome: toStringValue(data.outcome),
    evidenceUrl:
      toStringValue(data.evidenceUrl ?? data.evidence ?? data.evidenceLink) ||
      undefined,
  };
}

export async function fetchInterns(): Promise<InternProfile[]> {
  const database = requireDb();
  const snapshot = await getDocs(collection(database, "interns"));
  return snapshot.docs.map((docSnap) => mapIntern(docSnap.id, docSnap.data()));
}

export async function fetchReports(): Promise<Report[]> {
  const database = requireDb();
  const [snapshot, internsSnapshot] = await Promise.all([
    getDocs(
      query(collectionGroup(database, "reports"), orderBy("submittedAt", "desc"))
    ),
    getDocs(collection(database, "interns")),
  ]);

  const studentIdByIntern = new Map(
    internsSnapshot.docs.map((docSnap) => [
      docSnap.id,
      toStringValue(docSnap.data().studentId),
    ])
  );

  return snapshot.docs.map((docSnap) => {
    const internId = docSnap.ref.parent.parent?.id ?? "";
    return mapReport(
      docSnap.id,
      docSnap.data(),
      internId,
      studentIdByIntern.get(internId)
    );
  });
}

export async function fetchCompetencies(): Promise<Competency[]> {
  const database = requireDb();
  const snapshot = await getDocs(
    query(
      collectionGroup(database, "competencies"),
      orderBy("submittedAt", "desc")
    )
  );

  return snapshot.docs.map((docSnap) => {
    const internId = docSnap.ref.parent.parent?.id ?? "";
    return mapCompetency(docSnap.id, docSnap.data(), internId);
  });
}

export async function fetchSanctionSchedules(): Promise<SanctionSchedule[]> {
  const database = requireDb();
  const snapshot = await getDocs(
    query(collection(database, "sanctionSchedules"), orderBy("date", "asc"))
  );

  return snapshot.docs.map((docSnap) => mapSchedule(docSnap.id, docSnap.data()));
}

export async function fetchSanctions(): Promise<Sanction[]> {
  const database = requireDb();
  const snapshot = await getDocs(collection(database, "sanctions"));
  return snapshot.docs.map((docSnap) => mapSanction(docSnap.id, docSnap.data()));
}

export async function fetchInternDetail(
  internId: string
): Promise<InternDetail | null> {
  const database = requireDb();
  const internSnap = await getDoc(doc(database, "interns", internId));

  if (!internSnap.exists()) {
    return null;
  }

  const internData = internSnap.data();
  const intern = mapIntern(internSnap.id, internData);
  const requiredHours = toNumberValue(
    internData.requiredHours ?? internData.required
  );

  const [hours, reports, competencies, sanctions] = await Promise.all([
    fetchHoursSummary(internId, requiredHours),
    fetchReportsByIntern(internId),
    fetchCompetenciesByIntern(internId),
    fetchSanctionsByIntern(internId),
  ]);

  return { intern, hours, reports, competencies, sanctions };
}

export async function fetchReportsByIntern(internId: string) {
  const database = requireDb();
  const [internSnap, snapshot] = await Promise.all([
    getDoc(doc(database, "interns", internId)),
    getDocs(
      query(
        collection(database, "interns", internId, "reports"),
        orderBy("submittedAt", "desc")
      )
    ),
  ]);
  const studentId = internSnap.exists()
    ? toStringValue(internSnap.data().studentId)
    : "";

  return snapshot.docs.map((docSnap) =>
    mapReport(docSnap.id, docSnap.data(), internId, studentId)
  );
}

export async function fetchCompetenciesByIntern(internId: string) {
  const database = requireDb();
  const snapshot = await getDocs(
    query(
      collection(database, "interns", internId, "competencies"),
      orderBy("submittedAt", "desc")
    )
  );

  return snapshot.docs.map((docSnap) =>
    mapCompetency(docSnap.id, docSnap.data(), internId)
  );
}

export async function fetchSanctionsByIntern(internId: string) {
  const database = requireDb();
  const snapshot = await getDocs(
    query(collection(database, "sanctions"), where("internId", "==", internId))
  );

  return snapshot.docs.map((docSnap) => mapSanction(docSnap.id, docSnap.data()));
}

export async function fetchHoursSummary(
  internId: string,
  required: number
): Promise<HoursSummary> {
  const database = requireDb();
  const snapshot = await getDocs(collection(database, "interns", internId, "hours"));

  let renderedTotal = 0;
  let renderedThisWeek = 0;
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const hours = toNumberValue(data.hours);
    const entryDate = toDate(data.date ?? data.loggedAt ?? data.createdAt);

    renderedTotal += hours;

    if (entryDate && now - entryDate.getTime() <= weekMs) {
      renderedThisWeek += hours;
    }
  });

  return {
    required,
    renderedTotal,
    renderedThisWeek,
    remaining: Math.max(required - renderedTotal, 0),
  };
}

export async function fetchActivityLogEntries(
  internId: string
): Promise<ActivityLogEntry[]> {
  const database = requireDb();
  const snapshot = await getDocs(collection(database, "interns", internId, "hours"));

  const entries = snapshot.docs.map((docSnap) =>
    mapActivityLogEntry(docSnap.id, docSnap.data(), internId)
  );

  const getTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  return entries.sort((a, b) => getTime(b.date) - getTime(a.date));
}
