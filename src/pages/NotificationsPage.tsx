import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Bell, CheckCheck, MessageSquare, Briefcase, AlertTriangle, Star, CreditCard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  message: MessageSquare,
  job: Briefcase,
  application: Briefcase,
  review: Star,
  payment: CreditCard,
  dispute: AlertTriangle,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
    enabled: !!user,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id).eq("is_read", false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleClick = async (notif: any) => {
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    if (notif.reference_type === "job" && notif.reference_id) navigate(`/jobs/${notif.reference_id}`);
    if (notif.reference_type === "message" && notif.reference_id) navigate(`/jobs/${notif.reference_id}/chat`);
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="page-header mb-0">
            <h1>Notifications</h1>
            <p>Stay updated on your jobs and messages</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-1">
            {notifications.map((n) => {
              const IconComp = typeIcons[n.type] || Bell;
              return (
                <button key={n.id} onClick={() => handleClick(n)} className={cn(
                  "w-full text-left flex items-start gap-4 rounded-xl p-4 transition-all duration-150 hover:bg-muted/50",
                  !n.is_read && "bg-accent/40"
                )}>
                  <div className={cn(
                    "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl shrink-0",
                    n.is_read ? "bg-muted" : "bg-accent"
                  )}>
                    <IconComp className={cn("h-4 w-4", n.is_read ? "text-muted-foreground" : "text-accent-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.is_read && "font-semibold")}>{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground truncate mt-0.5">{n.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at!), { addSuffix: true })}</p>
                  </div>
                  {!n.is_read && <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        )}
      </div>
    </AppLayout>
  );
}
