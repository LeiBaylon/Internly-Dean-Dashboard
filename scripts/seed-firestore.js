#!/usr/bin/env node
"use strict";

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const deanUid = process.env.DEAN_UID;
const deanDisplayName = process.env.DEAN_DISPLAY_NAME || "Dean Rivera";

function loadCredential() {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inlineJson) {
    try {
      return admin.credential.cert(JSON.parse(inlineJson));
    } catch (error) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT must be valid JSON.");
    }
  }

  const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (filePath) {
    const absolutePath = path.resolve(filePath);
    const contents = fs.readFileSync(absolutePath, "utf8");
    return admin.credential.cert(JSON.parse(contents));
  }

  return admin.credential.applicationDefault();
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const interns = [
  {
    id: "intern-1",
    studentId: "2022-001",
    name: "Alyssa Reyes",
    email: "alyssa.reyes@interly.edu",
    course: "BSIT",
    yearLevel: "4th Year",
    status: "active",
    companyName: "Northwind Digital",
    companyAddress: "Cebu IT Park, Cebu City",
    supervisorName: "Jordan Lim",
    supervisorEmail: "jlim@northwind.com",
    supervisorPhone: "+63 917 555 1182",
  },
  {
    id: "intern-2",
    studentId: "2023-014",
    name: "Marco Santos",
    email: "marco.santos@interly.edu",
    course: "BSBA",
    yearLevel: "3rd Year",
    status: "probation",
    companyName: "Cobalt Trading",
    companyAddress: "Makati Ave, Makati City",
    supervisorName: "Lea Pineda",
    supervisorEmail: "lpineda@cobalt.ph",
    supervisorPhone: "+63 917 555 2231",
  },
  {
    id: "intern-3",
    studentId: "2022-022",
    name: "Janine Cruz",
    email: "janine.cruz@interly.edu",
    course: "BSCpE",
    yearLevel: "4th Year",
    status: "active",
    companyName: "Skyward Labs",
    companyAddress: "Ortigas Center, Pasig City",
    supervisorName: "Ethan Yu",
    supervisorEmail: "eyu@skywardlabs.io",
    supervisorPhone: "+63 917 555 3318",
  },
];

const hoursByIntern = {
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

const reports = [
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

const competencies = [
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

const sanctions = [
  {
    id: "sanction-1",
    internId: "intern-2",
    internName: "Marco Santos",
    daysSanctioned: 2,
    scheduledDate: "2026-05-20",
    status: "scheduled",
  },
];

const sanctionSchedules = [
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

const hoursEntries = [
  {
    id: "hours-intern-1-1",
    internId: "intern-1",
    hours: 12,
    date: daysAgo(2),
  },
  {
    id: "hours-intern-1-2",
    internId: "intern-1",
    hours: 12,
    date: daysAgo(5),
  },
  {
    id: "hours-intern-1-3",
    internId: "intern-1",
    hours: 386,
    date: daysAgo(20),
  },
  {
    id: "hours-intern-2-1",
    internId: "intern-2",
    hours: 8,
    date: daysAgo(1),
  },
  {
    id: "hours-intern-2-2",
    internId: "intern-2",
    hours: 8,
    date: daysAgo(4),
  },
  {
    id: "hours-intern-2-3",
    internId: "intern-2",
    hours: 274,
    date: daysAgo(18),
  },
  {
    id: "hours-intern-3-1",
    internId: "intern-3",
    hours: 10,
    date: daysAgo(3),
  },
  {
    id: "hours-intern-3-2",
    internId: "intern-3",
    hours: 8,
    date: daysAgo(6),
  },
  {
    id: "hours-intern-3-3",
    internId: "intern-3",
    hours: 437,
    date: daysAgo(22),
  },
];

async function seed() {
  const credential = loadCredential();
  admin.initializeApp({ credential });

  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });

  const batch = db.batch();

  if (deanUid) {
    const deanRef = db.collection("users").doc(deanUid);
    batch.set(
      deanRef,
      {
        role: "dean",
        displayName: deanDisplayName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    console.warn("DEAN_UID not set; skipping users/{uid}.");
  }

  interns.forEach((intern) => {
    const requiredHours = hoursByIntern[intern.id]?.required ?? 0;
    const internRef = db.collection("interns").doc(intern.id);
    batch.set(
      internRef,
      {
        ...intern,
        requiredHours,
      },
      { merge: true }
    );
  });

  reports.forEach((report) => {
    const reportRef = db
      .collection("interns")
      .doc(report.internId)
      .collection("reports")
      .doc(report.id);

    batch.set(
      reportRef,
      {
        ...report,
        submittedAt: new Date(report.submittedAt),
        reviewedAt: report.reviewedAt ? new Date(report.reviewedAt) : undefined,
      },
      { merge: true }
    );
  });

  competencies.forEach((competency) => {
    const competencyRef = db
      .collection("interns")
      .doc(competency.internId)
      .collection("competencies")
      .doc(competency.id);

    batch.set(
      competencyRef,
      {
        ...competency,
        submittedAt: new Date(competency.submittedAt),
        reviewedAt: competency.reviewedAt
          ? new Date(competency.reviewedAt)
          : undefined,
      },
      { merge: true }
    );
  });

  hoursEntries.forEach((entry) => {
    const hoursRef = db
      .collection("interns")
      .doc(entry.internId)
      .collection("hours")
      .doc(entry.id);

    batch.set(
      hoursRef,
      {
        hours: entry.hours,
        date: entry.date,
      },
      { merge: true }
    );
  });

  sanctions.forEach((sanction) => {
    const sanctionRef = db.collection("sanctions").doc(sanction.id);
    batch.set(sanctionRef, sanction, { merge: true });
  });

  sanctionSchedules.forEach((schedule) => {
    const scheduleRef = db
      .collection("sanctionSchedules")
      .doc(schedule.id);
    batch.set(scheduleRef, schedule, { merge: true });
  });

  await batch.commit();

  console.log("Firestore seed complete.");
  if (deanUid) {
    console.log(`Updated users/${deanUid}.`);
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message || error);
  process.exit(1);
});
