import type { Database } from "@/integrations/supabase/types";

export type Tables = Database["public"]["Tables"];
export type Enums = Database["public"]["Enums"];

export type Profile = Tables["profiles"]["Row"];
export type Category = Tables["categories"]["Row"];
export type WorkerProfile = Tables["worker_profiles"]["Row"];
export type Job = Tables["jobs"]["Row"];
export type Application = Tables["applications"]["Row"];
export type Message = Tables["messages"]["Row"];
export type Review = Tables["reviews"]["Row"];
export type Payment = Tables["payments"]["Row"];
export type Notification = Tables["notifications"]["Row"];
export type Dispute = Tables["disputes"]["Row"];
export type SavedJob = Tables["saved_jobs"]["Row"];

export type JobStatus = Enums["job_status"];
export type ApplicationStatus = Enums["application_status"];
export type ActiveRole = Enums["active_role"];
export type UserRole = Enums["user_role"];
export type BudgetType = Enums["budget_type"];
export type UrgencyLevel = Enums["urgency_level"];

export type JobWithCategory = Job & { categories: Category | null };
export type ApplicationWithWorker = Application & { profiles: Profile | null };
export type ApplicationWithJob = Application & { jobs: JobWithCategory | null };
export type MessageWithSender = Message & { sender: Profile | null };

export const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  assigned: { label: "Assigned", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  in_progress: { label: "In Progress", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  pending_review: { label: "Pending Review", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  disputed: { label: "Disputed", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
};

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  accepted: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  withdrawn: { label: "Withdrawn", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
};

export const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  urgent: { label: "Urgent", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};
