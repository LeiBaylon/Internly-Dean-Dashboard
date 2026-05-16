import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type {
  CompetencyStatus,
  ReportStatus,
  Sanction,
  SanctionSchedule,
} from "../types";
import { db, firebaseConfigured } from "./client";
import { auth } from "./auth";

type ReviewPayload = {
  internId: string;
  itemId: string;
  status: ReportStatus | CompetencyStatus;
  deanComment?: string;
  reviewedBy: string;
};

export async function reviewReport({
  internId,
  itemId,
  status,
  deanComment,
  reviewedBy,
}: ReviewPayload) {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const reviewer = reviewedBy ?? auth?.currentUser?.uid;

  if (!reviewer) {
    throw new Error("Not signed in.");
  }

  const ref = doc(db, "interns", internId, "reports", itemId);
  await updateDoc(ref, {
    status,
    deanComment: deanComment ?? "",
    reviewedBy: reviewer,
    reviewedAt: serverTimestamp(),
  });
}

export async function reviewCompetency({
  internId,
  itemId,
  status,
  deanComment,
  reviewedBy,
}: ReviewPayload) {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const reviewer = reviewedBy ?? auth?.currentUser?.uid;

  if (!reviewer) {
    throw new Error("Not signed in.");
  }

  const ref = doc(db, "interns", internId, "competencies", itemId);
  await updateDoc(ref, {
    status,
    deanComment: deanComment ?? "",
    reviewedBy: reviewer,
    reviewedAt: serverTimestamp(),
  });
}

export async function createSanctionSchedule(
  schedule: Omit<SanctionSchedule, "id">
) {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  if (!auth?.currentUser) {
    throw new Error("Not signed in.");
  }

  const ref = await addDoc(collection(db, "sanctionSchedules"), {
    date: schedule.date,
    time: schedule.time ?? "",
    capacity: schedule.capacity,
    tasks: schedule.tasks ?? "",
    internsAssigned: schedule.internsAssigned,
  });

  return { id: ref.id, ...schedule };
}

export async function createSanction(
  sanction: Omit<Sanction, "id" | "status" | "scheduledDate">
) {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  if (!auth?.currentUser) {
    throw new Error("Not signed in.");
  }

  const ref = await addDoc(collection(db, "sanctions"), {
    internId: sanction.internId,
    internName: sanction.internName,
    daysSanctioned: sanction.daysSanctioned,
    reason: sanction.reason ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return {
    id: ref.id,
    ...sanction,
    status: "pending",
  };
}
