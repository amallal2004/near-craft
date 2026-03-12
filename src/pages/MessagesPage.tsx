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
      const { data: msgs } = await supabase.from("messages").select("id, job_id, content, created_at, sender_id, receiver_id, is_read, jobs(title)").or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order("created_at", { ascending: false });
      if (!msgs) return [];
      const conversationMap = new Map<string, any>();
      for (const msg of msgs) {
        const otherId = msg.sender_id === user!.id ? msg.receiver_id : msg.sender_id;
        const convId = msg.job_id || `direct_${[msg.sender_id, msg.receiver_id].sort().join('_')}`;
        
        if (!conversationMap.has(convId)) {
          const { data: otherProfile } = await supabase.from("profiles").select("id, name, avatar_url").eq("id", otherId).single();
          
          const unreadCount = msgs.filter(m => {
            const mConvId = m.job_id || `direct_${[m.sender_id, m.receiver_id].sort().join('_')}`;
            return mConvId === convId && m.receiver_id === user!.id && !m.is_read;
          }).length;
          
          conversationMap.set(convId, { ...msg, convId, otherProfile, unread: unreadCount });
        }
      }
      return Array.from(conversationMap.values());
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto space-y-6">
        <div className="page-header mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-heading font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">Your conversations with workers and customers</p>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-1.5">
            {conversations.map((conv: any) => (
              <Link key={conv.convId} to={conv.job_id ? `/jobs/${conv.job_id}/chat` : `/messages/direct?with=${conv.otherProfile?.id}`} className={cn(
                "group flex items-center gap-5 rounded-2xl border p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5",
                conv.unread > 0 
                  ? "bg-primary/5 border-primary/30 shadow-[0_4px_20px_-4px_rgba(var(--primary),0.1)] relative overflow-hidden" 
                  : "bg-card/40 border-border/40 backdrop-blur-sm hover:border-primary/40"
              )}>
                {conv.unread > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                <Avatar className="h-14 w-14 ring-2 ring-border/50 group-hover:ring-primary/20 transition-all shadow-sm">
                  <AvatarImage src={conv.otherProfile?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-accent to-accent-foreground/20 text-accent-foreground font-bold text-lg">{conv.otherProfile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn("font-heading font-bold truncate text-lg transition-colors group-hover:text-primary", conv.unread > 0 ? "text-foreground" : "text-foreground/90")}>{conv.otherProfile?.name ?? "User"}</p>
                    <span className="text-xs font-medium text-muted-foreground shrink-0 bg-secondary/50 px-2 py-0.5 rounded-md">{formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider truncate mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                    {conv.job_id ? (conv.jobs as any)?.title : "Direct Message"}
                  </p>
                  <p className={cn("text-sm truncate leading-relaxed", conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>{conv.content}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold shadow-[0_0_10px_rgba(var(--primary),0.5)] shrink-0 animate-in zoom-in duration-300">{conv.unread}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 border border-border/40 bg-card/40">
            <EmptyState icon={MessageSquare} title="No messages yet" description="Start a conversation when you connect with a worker or customer on a job." />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
