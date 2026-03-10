import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-heading font-bold">Notifications</h1>
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}><CheckCheck className="mr-2 h-4 w-4" /> Mark all read</Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-1">
            {notifications.map((n) => (
              <button key={n.id} onClick={() => handleClick(n)} className={cn("w-full text-left flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50", !n.is_read && "bg-primary/5")}>
                <div className={cn("mt-1 h-2 w-2 rounded-full shrink-0", n.is_read ? "bg-transparent" : "bg-primary")} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground truncate">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at!), { addSuffix: true })}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        )}
      </div>
    </AppLayout>
  );
}
