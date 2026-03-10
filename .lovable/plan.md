
# Local Gig Marketplace — Full Build Plan

## Overview
A two-sided marketplace connecting customers who need local services with verified nearby workers. Built with React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Lovable Cloud (Supabase).

> **Note:** This project uses React + Vite (not Next.js). Server actions become client-side mutations via Supabase SDK + React Query. Middleware becomes client-side route guards. The user experience will be identical.

---

## Design System (Atelier Salt)
- **Fonts:** Figtree (headings, bold/semibold) + Source Sans 3 (body/UI)
- **Color palette:** Slate-950 (structure), Slate-900 (canvas), Indigo-500 (primary accent), Emerald-400 (success), Amber-400 (warning), Rose-500 (danger)
- **Dark mode** with toggle in navbar
- **Layout:** Contained grid (max 1440px), sidebar on desktop, bottom nav on mobile
- **Cards:** rounded-xl, subtle border, shadow lift on hover (not scale), border shifts to indigo
- **Top-label inputs** (no floating labels), pill-shaped status badges, generous whitespace
- **Empty states** with lucide icons + heading + subtitle + CTA
- **Skeleton loaders** for all async content, loading spinners on buttons, toast notifications via sonner

---

## Database Setup (Lovable Cloud / Supabase)

### Tables
- **profiles** — user data linked to auth.users, with location, rating, role, active_role
- **categories** — service categories (seeded with 15 categories)
- **worker_profiles** — extended worker info (rates, radius, availability)
- **worker_skills** — worker ↔ category mapping
- **worker_portfolio** — worker photo gallery
- **worker_availability** — weekly schedule
- **jobs** — job postings with location, budget, status, urgency
- **job_images** — photos attached to jobs
- **applications** — worker applications to jobs
- **messages** — chat messages between users per job
- **reviews** — ratings and comments post-completion
- **payments** — payment tracking
- **notifications** — in-app notification system
- **disputes** — job dispute management
- **saved_jobs** — worker bookmarks

### Key Database Features
- PostGIS for location-based queries
- Triggers for: auto-create profile on signup, update ratings, update application counts, update completed jobs count
- Notification triggers for: new applications, status changes, new messages
- Row Level Security on all tables
- Admin helper function `is_admin()`

---

## Pages & Features

### 1. Landing Page (`/`)
- Hero section with large heading, subtitle, two CTAs ("Hire a Worker" / "Find Gigs")
- How-it-works section (3 steps with icons)
- Category showcase grid with emoji icons
- Stats section (animated counters)
- Footer

### 2. Authentication (`/login`, `/signup`, `/forgot-password`, `/reset-password`)
- Split layout: form on left, decorative panel on right
- Email + password auth with Google OAuth
- Show/hide password toggle, zod validation
- Password reset flow with email link

### 3. Auth Callback (`/callback`)
- Handles OAuth redirect, exchanges code for session

### 4. Onboarding (`/onboarding`)
- Multi-step wizard with progress indicator
- Step 1: Choose role (customer/worker) with large cards
- Step 2: Basic info (name, phone, avatar upload, location)
- Step 3 (worker only): Skills selection, experience, hourly rates, service radius
- Step 4: Summary & confirmation

### 5. Dashboard (`/dashboard`)
- **Customer view:** Active jobs count, total spent, pending reviews, recent jobs, "Post a Job" CTA
- **Worker view:** Nearby gigs, active jobs, earnings, rating, recent applications, "Browse Jobs" CTA
- Role-aware stat cards with icons

### 6. Job Feed (`/jobs`)
- **Worker view:** Grid/list of open jobs, filter sidebar (category, budget range, urgency, sort), search bar, grid/list toggle, pagination
- **Customer view:** "My Jobs" with status tabs (All, Open, In Progress, Completed, Cancelled)
- Job cards with title, category badge, budget, urgency, location, time posted, application count

### 7. Create Job (`/jobs/new`)
- Form sections: title, description, category select, location input, budget type toggle, budget amount, urgency radio cards, image upload (drag-drop, max 5)
- Preview before submit

### 8. Job Detail (`/jobs/:id`)
- Two-column layout: Left (sticky) = budget, location, urgency, customer info; Right (scrollable) = description, images, applications/actions
- **Worker viewing open job:** "Apply Now" drawer (slides up 60%, left column stays visible)
- **Customer owns job:** Applications tab, status actions, edit button
- **Selected worker:** Accept/decline assignment, mark complete
- **Pending review:** Confirm completion or raise dispute
- **Completed:** Review form if not yet reviewed

### 9. Applications View (`/jobs/:id/applications`)
- Customer sees all applications: worker avatar, name, rating, completed jobs, offer price, message, actions (accept/reject/message)

### 10. My Applications (`/applications`)
- Worker's applications across all jobs: job title, offer price, status badge, date, filter by status

### 11. Chat/Messages (`/jobs/:id/chat`, `/messages`)
- Real-time chat via Supabase Realtime
- Message bubbles (sent right/indigo, received left/gray), timestamps, avatars, auto-scroll
- Messages inbox grouped by job with unread count badges

### 12. Profile (`/profile`, `/profile/:id`)
- **Own profile:** Editable form (name, bio, phone, avatar, location). Workers: manage skills, rates, availability, portfolio
- **Public profile:** Read-only with avatar, name, bio, rating stars, reviews tab, worker skills/portfolio/availability

### 13. Reviews (`/reviews`)
- Two tabs: "Reviews I Received" and "Reviews I Gave"
- Review cards with avatar, name, job title, star rating, comment, date

### 14. Notifications (`/notifications`)
- Full page list with icon, title, body, time ago, unread dot
- Click navigates to referenced entity
- "Mark all read" button
- Bell icon in navbar with real-time unread count

### 15. Settings (`/settings`)
- Change password, email preferences
- Role switcher: activate worker mode or toggle between roles
- Danger zone: deactivate account

### 16. Admin Panel (`/admin`)
- Protected route (admin only)
- Dashboard: total users, jobs, disputes, revenue stats
- Sub-pages: Users list (search, filter, suspend), Jobs list, Disputes (view detail, resolve), Flagged reviews, Categories CRUD

---

## Real-Time Features
- **Chat messages:** Subscribe to new messages per job
- **Notifications:** Live bell count updates
- **Job applications:** Customer sees new applications appear in real-time

Custom hooks: `useRealtimeMessages(jobId)`, `useRealtimeNotifications(userId)`

---

## Business Rules (enforced client-side + RLS)
- Max 5 open jobs per customer
- Max 10 pending applications per worker
- Cannot apply to own job
- One review per party per job
- Job status lifecycle enforced on transitions
- Cancellation rules based on current status

---

## Architecture
- **Routing:** React Router with auth guard wrapper component
- **Data fetching:** React Query for all reads, mutations for writes
- **Auth state:** Supabase `onAuthStateChange` listener in context provider
- **Role switching:** `active_role` column determines UI view
- **Validation:** Zod schemas for all forms
- **File uploads:** Supabase Storage buckets for avatars, job images, portfolio
- **Responsive:** Mobile-first with bottom nav on mobile, sidebar on desktop
