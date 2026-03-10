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

export default function MessagesPage() {
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      // Get distinct job_ids from messages
      const { data: msgs } = await supabase.from("messages").select("job_id, content, created_at, sender_id, receiver_id, is_read, jobs(title)").or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order("created_at", { ascending: false });
      if (!msgs) return [];
      // Group by job_id, take latest
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
      <div className="p-6 lg:p-8">
        <h1 className="mb-6 text-3xl font-heading font-bold">Messages</h1>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv: any) => (
              <Link key={conv.job_id} to={`/jobs/${conv.job_id}/chat`} className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm">
                <Avatar>
                  <AvatarImage src={conv.otherProfile?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">{conv.otherProfile?.name?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{conv.otherProfile?.name ?? "User"}</p>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{(conv.jobs as any)?.title}</p>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{conv.content}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">{conv.unread}</span>
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
