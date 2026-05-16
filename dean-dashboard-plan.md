# Dean Dashboard Plan

Goal
Build a dean-facing dashboard that lets administrators view intern data, monitor hours, review weekly reports, manage sanctions, and approve competencies.

Scope
- Student OJT Profile Management
  - View student profile and company info
- Student OJT Hours Monitoring
  - View hours to render, hours rendered this week, total rendered, total remaining
- Student Weekly Report Monitoring
  - View submitted reports
  - Comment on reports
  - Approve or request changes
- Student OJT Sanction Management
  - View sanction days per student
  - Schedule a day or event to render sanctions
  - View interns scheduled for a given sanction day
- Student OJT Competencies Management
  - View submitted competencies
  - Approve or request changes

Users and Permissions
- Dean role can view all interns, approve reports and competencies, and manage sanctions.
- Intern role can only access intern dashboard pages.
- Store roles in the user profile, for example: `users/{uid}.role = "dean" | "intern"`.
- Enforce access in Firebase rules and server actions or API routes.

Data Model (Firestore)
Use existing intern data and add review fields to support dean actions.

Collections
- `interns/{internId}`
  - Profile data and summary fields
- `interns/{internId}/hours/{entryId}`
  - Hours log entries
- `interns/{internId}/reports/{reportId}`
  - Add review fields:
    - `status`: "draft" | "submitted" | "approved" | "changes_requested"
    - `submittedAt`
    - `reviewedBy`
    - `reviewedAt`
    - `deanComment`
- `interns/{internId}/competencies/{competencyId}`
  - Add review fields:
    - `status`: "submitted" | "approved" | "changes_requested"
    - `submittedAt`
    - `reviewedBy`
    - `reviewedAt`
    - `deanComment`
- `sanctionSchedules/{scheduleId}`
  - `date`
  - `capacity`
  - `internsAssigned[]`
- `sanctions/{sanctionId}`
  - `internId`
  - `daysSanctioned`
  - `scheduledDate`
  - `status`

Indexes
- Reports by `status`, `submittedAt`, and `internId`.
- Competencies by `status`, `submittedAt`, and `internId`.
- Sanction schedules by `date`.

Routes and Pages (App Router)
- `/dashboard/dean` (overview)
  - Summary tiles: total interns, pending reports, pending competencies, upcoming sanctions
- `/dashboard/dean/students`
  - Search and filter list of interns
- `/dashboard/dean/students/[id]`
  - Tabs: Profile, Hours, Reports, Competencies, Sanctions
- `/dashboard/dean/reports`
  - Table of submitted reports, filters by status, date, course
  - Review drawer or modal with approve or request changes
- `/dashboard/dean/competencies`
  - Table of submitted competencies, filters by status, date, course
  - Review drawer or modal with approve or request changes
- `/dashboard/dean/sanctions`
  - Schedule creation, calendar or list
  - View interns assigned per date

Core Components
- `DeanSummaryCards`
- `InternsTable` with search and filters
- `StudentProfileCard`
- `HoursSummaryCards`
- `ReportsReviewTable`
- `ReportReviewPanel` (approve or request changes, add comment)
- `CompetenciesReviewTable`
- `CompetencyReviewPanel`
- `SanctionScheduleForm`
- `SanctionScheduleList`
- `StatusBadge` (submitted, approved, changes requested)
- `EmptyState`, `ErrorState`, `LoadingSkeleton`

Key Workflows
1) Review weekly report
- Dean opens report, reads details, adds comment.
- Click approve or request changes.
- Update report status and review fields.

2) Review competency
- Dean checks evidence (image, video, link).
- Click approve or request changes.
- Update competency status and review fields.

3) Schedule sanctions
- Dean creates a schedule date and capacity.
- Assign interns to the schedule.
- Interns can view their scheduled sanction day.

4) Student detail view
- Show profile, company info, hours summary, reports list, competencies list, sanctions.

Business Rules
- Intern can submit weekly report only if hours are fully rendered.
- Intern can submit competencies only when required items are complete.
- Dean can approve only submitted items.

UI and UX Notes
- Use tabs for student details to reduce page clutter.
- Use filters and search to handle large data sets.
- Provide clear status badges and counts for pending reviews.

UI Design Spec
- Visual Style
  - Theme: professional, calm, data-focused; light background with subtle gradients or soft card shadows.
  - Primary color: deep blue or teal for actions and status (avoid purple default).
  - Accent colors:
    - Success: green (approved)
    - Warning: amber (changes requested / pending)
    - Info: blue (submitted)
    - Neutral: gray (draft, empty, disabled)
  - Typography: readable serif for page titles and a clean sans for body text.
  - Layout: 12-column grid, cards with clear spacing; dense data stays readable.
- Global Layout
  - Left sidebar (sticky): logo, navigation, role badge, user menu.
  - Top bar: page title + breadcrumbs + quick actions + search.
  - Main content: cards, tables, and tabs with consistent spacing.
  - Right rail (optional on wide screens): quick stats, alerts, pending actions.
- Dashboard Overview (`/dashboard/dean`)
  - Hero summary strip with four cards: Total interns, Pending reports, Pending competencies, Upcoming sanctions.
  - Second row: "Recent Activity" timeline (report reviews, approvals), "Alerts" card (overdue reports, missing competencies), Quick links card: "Review Reports", "Review Competencies", "Schedule Sanction".
- Student List (`/dashboard/dean/students`)
  - Table layout with sticky header and zebra rows.
  - Top controls: search input (name, id, company); filters (course, year level, status, hours remaining); sort by (name, hours rendered, latest report, risk flag).
  - Row content: avatar + name + ID; company name; hours rendered / remaining; report status badge; competency status badge; actions ("View Profile", "View Reports").
  - Bulk actions: message, export, assign sanction.
- Student Detail (`/dashboard/dean/students/[id]`)
  - Header card: student name, course, company, status badges.
  - Tabs: Profile | Hours | Reports | Competencies | Sanctions.
  - Profile tab: profile card, company info, OJT dates, advisor info.
  - Hours tab: summary tiles (this week, total, remaining); hours log table with filters and export.
  - Reports tab: report table with status filter; review drawer panel with full report content + actions.
  - Competencies tab: list of competencies with evidence preview; review panel with approve/request changes.
  - Sanctions tab: past sanctions, scheduled sanctions, assign action.
- Reports Review (`/dashboard/dean/reports`)
  - Table view with filters (status, date range, course).
  - Row shows: intern, week range, status, submitted date.
  - Clicking row opens side drawer: report content in readable sections; file attachments; comment box; Approve / Request Changes buttons.
  - Action confirmation modal with summary.
- Competencies Review (`/dashboard/dean/competencies`)
  - Table view with filters (status, course, date).
  - Row shows: intern, competency title, evidence type.
  - Review panel: evidence preview (image/video/link); competency checklist; comment area; Approve / Request Changes buttons.
- Sanctions (`/dashboard/dean/sanctions`)
  - Split layout: schedule list on left, detail panel on right.
  - Create schedule form: date picker, capacity input, assigned interns selector.
  - Schedule list: date, capacity, assigned count; click to view assigned interns.
  - Drag-and-drop (optional): assign interns to dates.
- Components and Patterns
  - StatusBadge: submitted (blue), approved (green), changes requested (amber), draft (gray).
  - Cards: consistent header, small icon, right-aligned count.
  - Tables: column sorting, sticky header, row hover.
  - Drawer / Side Panel: 40% width, full height, close on Esc.
  - Empty state: short message, link to action, minimal illustration.
- Accessibility
  - Minimum 4.5:1 contrast.
  - Keyboard navigation for tables and drawers.
  - Focus ring visible on all inputs.
  - Clear aria labels for status icons.
- Micro-interactions
  - Status change toast: "Report approved".
  - Loading skeletons for tables.
  - Smooth drawer slide-in.
  - Card hover for clickable cards.
- Responsive Behavior
  - Mobile: sidebar collapses to top hamburger; cards stack vertically; tables convert to stacked cards.
  - Tablet: two-column card layout; drawer becomes full screen.

Implementation Steps
1) Add dean role handling in auth and Firestore rules.
2) Create dean routes and page shells.
3) Build summary cards and student list.
4) Build reports review flow.
5) Build competencies review flow.
6) Build sanctions scheduling.
7) Add loading, empty, and error states.
8) Add tests for role checks and approval workflows.

Suggested Build Prompts
- "Create App Router pages for the dean dashboard under /dashboard/dean with a summary page and placeholder sections."
- "Build a student list table with search and filters by course and status."
- "Implement report review UI with approve and request changes actions and Firestore updates."
- "Implement competency review UI with evidence preview and approval flow."
- "Build sanction schedule management with date, capacity, and assigned interns."

Acceptance Criteria
- Dean can see all intern profiles and company info.
- Dean can view and approve or request changes for weekly reports.
- Dean can view and approve or request changes for competencies.
- Dean can manage sanction schedules and view assigned interns.
- All dean routes are protected by role checks.
