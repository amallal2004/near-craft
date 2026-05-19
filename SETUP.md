# 🛠️ GigUp — Developer Setup Guide

This guide will walk you through setting up the **GigUp** project from scratch on your local machine. No prior experience required — just follow each step carefully.

---

## 📋 Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Prerequisites](#2-prerequisites)
3. [Clone the Repository](#3-clone-the-repository)
4. [Install Dependencies](#4-install-dependencies)
5. [Set Up Environment Variables](#5-set-up-environment-variables)
6. [Set Up Supabase](#6-set-up-supabase)
7. [Deploy Edge Functions](#7-deploy-edge-functions)
8. [Run the App Locally](#8-run-the-app-locally)
9. [Project Structure](#9-project-structure)
10. [Available Scripts](#10-available-scripts)
11. [Common Errors & Fixes](#11-common-errors--fixes)

---

## 1. What Is This Project?

**GigUp** is a full-stack web platform that connects customers with local service providers (like plumbers, carpenters, cleaners, etc.). Key features include:

- 📍 Location-based job posting
- 🤖 AI-powered budget estimation for jobs (powered by Gemini)
- 💳 Payments via Stripe
- 🔐 Authentication with Supabase (email + Google OAuth)
- 📊 A dashboard for managing jobs and payouts

**Tech Stack:**

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Serverless Functions | Supabase Edge Functions (Deno) |
| Payments | Stripe |
| AI | Google Gemini API |

---

## 2. Prerequisites

Before starting, make sure the following tools are installed on your machine.

### ✅ Node.js (v18 or higher)

Check if you have it:
```bash
node --version
```

If not installed, use [nvm](https://github.com/nvm-sh/nvm) (recommended):
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal, then install Node.js
nvm install 18
nvm use 18
```

### ✅ npm (comes with Node.js)

```bash
npm --version
```

### ✅ Git

```bash
git --version
```

If not installed: https://git-scm.com/downloads

### ✅ Supabase CLI

```bash
npm install -g supabase
supabase --version
```

> The Supabase CLI is needed to manage the database and deploy Edge Functions.

---

## 3. Clone the Repository

```bash
git clone https://github.com/amallal2004/near-craft.git
cd near-craft
```

---

## 4. Install Dependencies

```bash
npm install
```

This installs all the packages listed in `package.json`. It may take 1–2 minutes on the first run.

---

## 5. Set Up Environment Variables

The app uses environment variables to connect to Supabase and other services. These are **secret** and should **never** be committed to Git.

### Step 1 — Create your `.env` file

```bash
cp .env.example .env
```

> If `.env.example` doesn't exist, create a new file named `.env` manually in the project root.

### Step 2 — Fill in the values

Open `.env` in your editor and add the following:

```env
# ────────────────────────────────────────
# Supabase
# ────────────────────────────────────────
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>

# ────────────────────────────────────────
# Stripe (optional for local dev without payments)
# ────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ────────────────────────────────────────
# Google Gemini (for AI price suggestions)
# ────────────────────────────────────────
GEMINI_API_KEY=AIza...
```

> **Where to find these values?** See section [6. Set Up Supabase](#6-set-up-supabase) below.

### ⚠️ Important Rules

- Never share or commit your `.env` file. It is already listed in `.gitignore`.
- Variables starting with `VITE_` are safe to use in the browser. All others are backend-only.

---

## 6. Set Up Supabase

Supabase provides the database, authentication, and serverless function hosting.

### Step 1 — Create a Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com) and sign up for free.
2. Click **"New Project"**.
3. Fill in a project name (e.g. `near-craft`) and set a database password. Save the password somewhere safe.
4. Choose a region close to you and click **"Create new project"**.
5. Wait ~1 minute for the project to be ready.

### Step 2 — Get Your API Keys

In your Supabase project dashboard:

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the following:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public key** → this is your `VITE_SUPABASE_PUBLISHABLE_KEY`

Paste these into your `.env` file.

### Step 3 — Link the CLI to Your Project

Login and link your local project to the Supabase cloud project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

> Your project ref is the alphanumeric string in your Supabase URL:  
> `https://`**`abcdefghij`**`.supabase.co`

### Step 4 — Push the Database Schema

```bash
supabase db push
```

This applies all the database migrations to your Supabase project, creating the required tables.

### Step 5 — Enable Google OAuth (optional)

If you want the "Sign in with Google" button to work:

1. In the Supabase dashboard, go to **Authentication** → **Providers**.
2. Enable **Google**.
3. Follow the [Supabase Google OAuth guide](https://supabase.com/docs/guides/auth/social-login/auth-google) to get a Client ID and Secret from Google Cloud Console.

---

## 7. Deploy Edge Functions

The app uses Supabase Edge Functions (serverless) for features like Stripe payments and AI price suggestions.

### Set Secrets for Edge Functions

These secrets are used inside the functions and are stored securely in Supabase — **not** in your `.env` file.

```bash
supabase secrets set GEMINI_API_KEY=AIza...
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### Deploy All Functions

```bash
supabase functions deploy suggest-job-price
supabase functions deploy create-checkout-session
supabase functions deploy create-connect-account
supabase functions deploy stripe-webhook
```

Or deploy all at once:

```bash
supabase functions deploy
```

> **Note:** Functions are deployed to the cloud. You don't need to run them locally unless you're developing a new function.

---

## 8. Run the App Locally

Once everything is set up, start the development server:

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:8080
```

The page will **automatically reload** whenever you save a file.

---

## 9. Project Structure

```
near-craft/
├── public/                  # Static assets (robots.txt, etc.)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/            # Login/signup related components
│   │   ├── layout/          # App shell, sidebar, navbar
│   │   └── ui/              # shadcn/ui base components
│   ├── contexts/            # React context providers (e.g. AuthContext)
│   ├── hooks/               # Custom React hooks
│   │   └── useJobPriceSuggestion.ts  # AI price suggestion hook
│   ├── integrations/
│   │   └── supabase/        # Supabase client & auto-generated types
│   ├── lib/                 # Utility functions & validation schemas
│   │   ├── supabase-errors.ts  # Friendly error messages
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── pages/               # Top-level route pages
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CreateJobPage.tsx
│   │   └── ...
│   ├── App.tsx              # App router & route definitions
│   └── main.tsx             # Entry point
├── supabase/
│   ├── functions/           # Supabase Edge Functions (Deno)
│   │   ├── suggest-job-price/      # Gemini AI price estimation
│   │   ├── create-checkout-session/ # Stripe checkout
│   │   ├── create-connect-account/  # Stripe Connect onboarding
│   │   └── stripe-webhook/         # Stripe event handler
│   ├── migrations/          # Database schema migrations
│   └── config.toml          # Supabase project config
├── .env                     # Your local secrets (DO NOT COMMIT)
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 10. Available Scripts

Run these from the project root:

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server at `http://localhost:8080` |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode (re-runs on file change) |

---

## 11. Common Errors & Fixes

### ❌ "Missing Supabase environment variables"

**Cause:** Your `.env` file is missing or the variable names are wrong.

**Fix:** Make sure your `.env` file exists in the project root and contains:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
Then restart the dev server (`npm run dev`).

---

### ❌ "Unable to reach Supabase" / "Failed to fetch"

**Cause:** Wrong Supabase URL, the project is paused (free tier pauses after inactivity), or your internet connection is blocked by a browser extension.

**Fix:**
1. Visit your Supabase dashboard and check if the project is **active** (not paused). Click "Restore" if needed.
2. Double-check the URL in `.env` has no typos.
3. Disable browser extensions like ad blockers temporarily.

---

### ❌ "GEMINI_API_KEY is not configured"

**Cause:** The Edge Function secret is not set in Supabase.

**Fix:**
```bash
supabase secrets set GEMINI_API_KEY=your_actual_key_here
supabase functions deploy suggest-job-price
```

---

### ❌ Port 8080 is already in use

**Cause:** Another process is already running on port 8080.

**Fix:**
```bash
# Find what's using port 8080
lsof -i :8080

# Kill it (replace PID with the actual number)
kill -9 <PID>
```

Then re-run `npm run dev`.

---

### ❌ `npm install` fails

**Fix:** Make sure you're using Node.js 18+:
```bash
node --version   # should be v18.x.x or higher
```

If you're on an older version, use nvm to switch:
```bash
nvm install 18 && nvm use 18
```

---

## 🙋 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/
- **Tailwind Docs:** https://tailwindcss.com/docs
- **shadcn/ui Docs:** https://ui.shadcn.com/docs
- **Stripe Docs:** https://stripe.com/docs
