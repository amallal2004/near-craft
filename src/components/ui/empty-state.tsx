import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <div className="mb-5 rounded-2xl bg-accent p-5">
        <Icon className="h-8 w-8 text-accent-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-heading font-semibold">{title}</h3>
      {description && <p className="mb-5 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full px-6">{actionLabel}</Button>
      )}
    </div>
  );
}
