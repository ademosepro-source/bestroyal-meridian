# Administrator & Staff User Manual

This is the day-to-day guide for using the school management portal once
it's set up (see `docs/SETUP.md` if it isn't yet). It's written for
school staff, not developers — no coding knowledge needed from here on.

Sign in at `/login` with the email and password given to you. If you
don't have one, ask your Super Administrator — accounts aren't
self-service by design (see Staff, below).

## Everyone: the notification bell

Top-right corner of every page, once signed in. It shows announcements,
a published report card, a confirmed payment, a same-day absence, or a
fee reminder — click one to jump straight to it. The red number is how
many you haven't read yet; "Mark all read" clears it.

---

## Super Administrator

You have full access to everything below, plus the sections other roles
don't see.

### Students (`Students` in the sidebar)

- **Register Student**: fills in the child's details and assigns them to
  a class. An admission number is generated for you — you never type one
  in.
- Click any student's name to **edit** their details, **transfer** them
  to a different class, or change their **status** (active / withdrawn /
  graduated).
- Use the search box and the class/status filters to find someone quickly.

### Staff (`Staff`)

- **Add Staff Member** creates their account and generates a temporary
  password, shown to you on screen — share it with the staff member
  yourself (phone, WhatsApp, in person). They'll be required to set their
  own password the first time they sign in. A staff number is generated
  automatically.
- Choose their role carefully (Principal, Teacher, Bursar, Admissions
  Officer) — this controls exactly what they can see and do, and can't be
  changed from this screen afterward (ask a developer if a role needs to
  change).

### Classes & Subjects (`Classes & Subjects`)

- Add classes, add "arms" (e.g. Primary 4A, 4B if a year group is split),
  and add subjects.
- **Class Teacher Assignments**: pick which teacher is the main teacher
  for a class — this is what lets that teacher submit report cards for
  that class.
- **Subject Teacher Assignments**: pick which teacher teaches which
  subject to which class — this is what lets that teacher enter scores
  for that subject.

### Academic Sessions (`Academic Sessions`)

- Add the school year ("2026/2027") and its terms (First/Second/Third
  Term) with start and end dates.
- **"Set current"** on exactly one session and one term at a time — this
  is what attendance, scores and new invoices use by default throughout
  the rest of the system. Change it when a new term starts.

### Admissions (`Admissions`)

- See every application submitted through the public website's
  Admissions page.
- Open one to **mark it under review, accept or reject** it, and add
  notes.
- Once accepted, click **Enrol as Student** — this creates the student
  record for you (and a parent login, emailed automatically, if the
  parent doesn't already have one).

### Attendance (`Attendance`)

- See a school-wide summary for any day. Teachers mark attendance from
  their own dashboard (see Teacher, below) — this page is for oversight.

### Grading Setup (`Grading Setup`)

- **Assessment Components**: the pieces that make up a subject score
  (e.g. 1st CA = 20, 2nd CA = 20, Exam = 60). Make sure they add up to
  100 — the page tells you the running total.
- **Grade Bands**: what score range counts as A, B, C, etc., and the
  remark shown on the report card ("Excellent", "Good"...).
- Change these any time — every score and report card recalculates from
  whatever is set here, automatically.

### Report Cards (`Report Cards`)

- Teachers submit these from their own dashboard. Here you:
  - **Approve** a submitted report card (adds your/the principal's
    comment).
  - **Publish** an approved report card — this is the step that makes it
    visible to the parent. Nothing reaches a parent before this.
- Click **Preview** any time to see exactly what the parent will see.

### Fee Setup (`Fee Setup`)

- Add **Fee Categories** (Tuition, Transport, etc.).
- Set the **amount** each class is charged, per term, per category.
  Changing this later only affects invoices generated *after* the
  change — it never silently changes a bill already sent out.

### Invoices & Payments (`Invoices & Payments`)

- **Generate Invoices for Class**: pick a class and term, and an invoice
  is created for every active student in that class from the fee setup
  above.
- Click an invoice to see its breakdown, record a **manual payment**
  (cash, POS, or bank transfer), or **verify** a bank transfer once it's
  confirmed to have landed in the school's account.
- **Reverse** a payment if one was recorded in error — this is
  deliberately Super-Administrator-only, even for the Bursar's own
  entries, so mistakes can't be quietly undone by whoever made them.
- **Send Fee Reminders for Term**: notifies every parent who still owes
  something for that term.

### Announcements (`Announcements`)

- Write a message and choose who sees it: the public website, every
  parent, every staff member, or one specific class.
- Everyone it's sent to gets a notification automatically.

### School Calendar (`School Calendar`)

- Add resumption dates, exam periods, breaks and events. These show on
  the public website's homepage and News & Events page.

### Reports (`Reports`)

- Student Register, Admission Register, Attendance, Academic
  Performance, and Financial reports — each filterable by class, term,
  status or date. **Export CSV** to open in Excel, or **Print** to get a
  paper copy or save as PDF.

---

## Principal / Head Teacher

You see Students, Classes & Subjects, Attendance, Grading Setup, Report
Cards, Announcements, School Calendar, and Reports — the same as the
Super Administrator for academic matters, but **not** Staff, Fee Setup,
or Invoices & Payments. Financial administration stays with the Bursar
and Super Administrator by design.

Your main extra responsibility is **approving report cards** before
they're published.

---

## Teacher

- **Mark Attendance**: pick your class and today's date, mark each
  student, save. You can only do this for classes you've been assigned to.
- **Enter Scores**: pick one of your assigned subject+class combinations,
  enter each student's score per assessment component, save. You can
  only enter scores for subjects you actually teach.
- **Report Cards** (only if you're the *class teacher*, not just a
  subject teacher): see every student's computed average and position,
  add your comment and the promotion status, then **Submit for
  Approval**. Once a Principal approves and it's published, you can no
  longer edit it from here.

---

## Accountant / Bursar

- **Fee Setup** and **Invoices & Payments**: same as described under
  Super Administrator above.
- **Reports** → **Financial Report**: your main day-to-day screen —
  collections for any date range (with a breakdown by cash/POS/bank/
  online), and outstanding balances by student for a term.

---

## Admissions Officer

- **Applications**: review, mark under review/accept/reject, and enrol
  accepted applicants as students — same as described under Super
  Administrator's Admissions section.
- **Reports** → Student Register and Admission Register.

---

## Parent

- Your dashboard shows each linked child, their recent attendance, and a
  link to their report card once published.
- **School Fees**: see every invoice, what's outstanding, and pay online
  (Paystack — card or bank transfer) or view a receipt for a past
  payment. If your child doesn't appear, or a payment doesn't show up
  after you've paid, contact the school office with your payment
  reference.

---

## Common questions

**"I forgot my password."** There's no self-service reset or admin reset
for an existing account yet — contact your developer, or (for a parent)
the school office, to have it sorted out directly in Supabase.

**"A number on a dashboard looks wrong."** Every figure in this system
is calculated live from the underlying records (scores, payments,
attendance) — it is never a sample or placeholder. If something looks
wrong, it usually means the underlying record (a score, a payment, an
attendance mark) needs correcting, not the dashboard itself.

**"I don't see a feature mentioned in the original plan."** Fee reminders
and announcements currently only appear in the notification bell — no
actual email or text message is sent, because no email/SMS provider has
been set up yet (see `docs/SETUP.md`). Everything else described in this
manual is fully working today.
