# 🛠️ GigUp — Local Service Marketplace

**GigUp** is a sophisticated, full-stack platform designed to bridge the gap between skilled local craftsmen and customers in need of their services. Built with a focus on ease of use, transparency, and efficiency, it empowers users to post jobs, get AI-powered budget estimates, and manage secure payments seamlessy.

---

## ✨ Key Features

- **🚀 Smart Job Posting**: Post jobs with specific categories, urgency levels, and location data.
- **🤖 AI Pricing Engine**: Get instant, market-accurate budget suggestions powered by Google Gemini, helping you price your jobs fairly based on Indian local market signals.
- **💳 Secure Payments**: Integrated with Stripe for smooth payouts and secure checkout sessions.
- **📊 Real-time Dashboard**: Track your job statuses, manage inquiries, and oversee your earnings in one place.
- **🔐 Enterprise-Grade Auth**: Robust authentication system using Supabase, supporting both email/password and Google OAuth.
- **🎨 Premium UI/UX**: A modern, responsive interface built with Tailwind CSS, shadcn/ui, and Framer Motion for a professional look and feel.

---

## 🚀 Tech Stack

- **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend / Database**: [Supabase](https://supabase.com/)
- **Serverless**: Supabase Edge Functions (Deno)
- **AI Integration**: Google Gemini API
- **Payments**: [Stripe](https://stripe.com/)

---

## 🛠️ Getting Started

For a detailed walkthrough on setting up the environment, database, and edge functions, please refer to our **[Setup Guide (SETUP.md)](./SETUP.md)**.

### Quick Start:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amallal2004/near-craft.git
   cd near-craft
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment:**
   Create a `.env` file with your Supabase credentials.

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

---

## 📦 Project Structure

- `src/components`: UI components organized by feature.
- `src/pages`: Application routes and views.
- `src/hooks`: Custom React hooks (including AI pricing logic).
- `supabase/functions`: Serverless Edge Functions for backend logic.
- `supabase/migrations`: Version-controlled database schema.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
