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
      <div className="page-container max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div className="page-header mb-0">
            <h1 className="text-3xl font-heading font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on your jobs and messages</p>
          </div>
          <Button variant="outline" className="rounded-xl h-10 px-4 bg-card/50 backdrop-blur-sm border-border/40 hover:bg-accent/50 transition-colors" onClick={() => markAllRead.mutate()}>
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
                  "w-full text-left flex items-start gap-5 rounded-2xl p-5 mb-3 transition-all duration-300 border hover:-translate-y-0.5",
                  !n.is_read 
                    ? "bg-primary/5 border-primary/20 shadow-[0_4px_20px_-4px_rgba(var(--primary),0.1)] hover:shadow-card-hover" 
                    : "glass-card border-border/40 hover:border-primary/30"
                )}>
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 transition-colors shadow-sm",
                    n.is_read ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"
                  )}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1 gap-2">
                       <p className={cn("text-base font-heading truncate", !n.is_read ? "font-bold text-foreground" : "font-semibold text-foreground/80")}>{n.title}</p>
                       <span className="text-xs font-medium text-muted-foreground shrink-0 bg-secondary/30 px-2 py-0.5 rounded-md">{formatDistanceToNow(new Date(n.created_at!), { addSuffix: true })}</span>
                    </div>
                    {n.body && <p className="text-sm text-muted-foreground leading-relaxed mt-1 pr-8">{n.body}</p>}
                  </div>
                  {!n.is_read && <div className="mt-3 h-2.5 w-2.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.6)] animate-pulse" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 border border-border/40 bg-card/40">
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Check back later for updates." />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
