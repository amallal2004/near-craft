# Memory: index.md
Updated: now

GigLocal marketplace app - design system, architecture, and build status

## Design System
- Fonts: Figtree (headings) + Source Sans 3 (body)
- Primary: Indigo (239 84% 67%), Primary-glow: (252 90% 72%)
- Accent: soft indigo (234 89% 96% light / 239 50% 18% dark)
- Success: emerald, Warning: amber, Destructive: rose
- Dark mode via class toggle
- Cards: rounded-xl, shadow-card, hover:shadow-card-hover
- Inputs/buttons: h-11, rounded-xl
- Page layout: .page-container, .page-header utility classes
- Status badges: pill-shaped with color-coded backgrounds
- Semantic tokens in index.css, all colors HSL
- Custom shadows: --shadow-card, --shadow-card-hover, --shadow-elevated
- Gradient text: .gradient-text class
- Background: off-white (210 20% 98%) not pure white

## Architecture
- React + Vite + TypeScript + Tailwind + shadcn/ui
- Supabase (Lovable Cloud) for backend
- AuthContext with onAuthStateChange, profile fetching, role switching, isAdmin
- React Query for data fetching, Supabase Realtime for chat/notifications
- Route guards: ProtectedRoute, OnboardingGuard
- Zod validation schemas in src/lib/validations.ts

## Database
- 15 tables with RLS, triggers, notification system
- user_roles table for admin check (per security guidelines)
- Storage buckets: avatars, job-images, portfolio
- Categories seeded with 15 service types

## Pages Built
- Landing, Login, Signup, Forgot/Reset Password, Callback
- Onboarding (multi-step wizard)
- Dashboard (role-aware), Jobs feed, Create Job, Job Detail
- Chat (realtime), Messages inbox, Applications
- Notifications, Reviews, Profile, Settings, Admin (stats only)

## Sonner
- Removed next-themes dependency from sonner.tsx (using plain Sonner)
