import { cn } from "@/lib/utils";
import { JOB_STATUS_CONFIG, APPLICATION_STATUS_CONFIG, URGENCY_CONFIG } from "@/lib/types";
import type { JobStatus, ApplicationStatus, UrgencyLevel } from "@/lib/types";

interface StatusBadgeProps {
  status: JobStatus | ApplicationStatus | UrgencyLevel;
  type?: "job" | "application" | "urgency";
  className?: string;
}

export function StatusBadge({ status, type = "job", className }: StatusBadgeProps) {
  const config = type === "application"
    ? APPLICATION_STATUS_CONFIG[status as ApplicationStatus]
    : type === "urgency"
    ? URGENCY_CONFIG[status as UrgencyLevel]
    : JOB_STATUS_CONFIG[status as JobStatus];

  if (!config) return null;

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", config.color, className)}>
      {config.label}
    </span>
  );
}
