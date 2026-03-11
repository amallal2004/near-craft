import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data: msgs } = await supabase.from("messages").select("job_id, content, created_at, sender_id, receiver_id, is_read, jobs(title)").or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order("created_at", { ascending: false });
      if (!msgs) return [];
      const jobMap = new Map<string, any>();
      for (const msg of msgs) {
        if (!jobMap.has(msg.job_id)) {
          const otherId = msg.sender_id === user!.id ? msg.receiver_id : msg.sender_id;
          const { data: otherProfile } = await supabase.from("profiles").select("name, avatar_url").eq("id", otherId).single();
          jobMap.set(msg.job_id, { ...msg, otherProfile, unread: msgs.filter(m => m.job_id === msg.job_id && m.receiver_id === user!.id && !m.is_read).length });
        }
      }
      return Array.from(jobMap.values());
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header">
          <h1>Messages</h1>
          <p>Your conversations with workers and customers</p>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-1.5">
            {conversations.map((conv: any) => (
              <Link key={conv.job_id} to={`/jobs/${conv.job_id}/chat`} className={cn(
                "flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-card-hover hover:border-primary/20",
                conv.unread > 0 && "bg-accent/30 border-primary/10"
              )}>
                <Avatar className="h-11 w-11 ring-2 ring-border">
                  <AvatarImage src={conv.otherProfile?.avatar_url} />
                  <AvatarFallback className="bg-accent text-accent-foreground font-semibold">{conv.otherProfile?.name?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("font-heading font-semibold truncate", conv.unread > 0 && "text-foreground")}>{conv.otherProfile?.name ?? "User"}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-xs text-primary font-medium truncate">{(conv.jobs as any)?.title}</p>
                  <p className={cn("text-sm truncate mt-0.5", conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>{conv.content}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground font-bold shadow-card shrink-0">{conv.unread}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquare} title="No messages yet" description="Start a conversation when you connect with a worker or customer" />
        )}
      </div>
    </AppLayout>
  );
}
