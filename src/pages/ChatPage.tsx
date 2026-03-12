import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ChatPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useRealtimeMessages(jobId);

  const withUserId = searchParams.get("with");

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => { 
      if (!jobId) return null;
      const { data } = await supabase.from("jobs").select("*, profiles!jobs_customer_id_fkey(name)").eq("id", jobId).single(); 
      return data; 
    },
    enabled: !!jobId,
  });

  const { data: directProfile } = useQuery({
    queryKey: ["profile", withUserId],
    queryFn: async () => {
      if (!withUserId) return null;
      const { data } = await supabase.from("profiles").select("name").eq("id", withUserId).single();
      return data;
    },
    enabled: !!withUserId && !jobId,
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", jobId, withUserId, user?.id],
    queryFn: async () => {
      let query = supabase.from("messages").select("*, profiles!messages_sender_id_fkey(name, avatar_url)").order("created_at", { ascending: true });
      if (jobId) {
        const { data } = await query.eq("job_id", jobId);
        return data ?? [];
      } else if (withUserId && user?.id) {
        const { data } = await query.is("job_id", null)
                                   .or(`and(sender_id.eq.${user.id},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${user.id})`);
        return data ?? [];
      }
      return [];
    },
    enabled: !!jobId || (!!withUserId && !!user?.id),
  });

  const otherFromJob = job ? (job.customer_id === user?.id ? job.selected_worker_id : job.customer_id) : null;
  const otherFromMessages = messages?.find(m => m.sender_id !== user?.id)?.sender_id
    ?? messages?.find(m => m.receiver_id !== user?.id)?.receiver_id
    ?? null;
  const otherUserId = withUserId || otherFromJob || otherFromMessages;

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!message.trim()) return;
      if (!otherUserId) throw new Error("No recipient found. Start a direct chat or wait for a worker to be assigned.");
      const { error } = await supabase.from("messages").insert({
        job_id: jobId || null, sender_id: user!.id, receiver_id: otherUserId, content: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => { setMessage(""); queryClient.invalidateQueries({ queryKey: ["messages", jobId] }); },
    onError: (err: Error) => { toast({ title: "Failed to send", description: err.message, variant: "destructive" }); },
  });

  const canChat = !!otherUserId;
  const chatTitle = job ? job.title : directProfile ? `Chat with ${directProfile.name}` : "Chat";

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem-5rem)] lg:h-[calc(100vh-4rem)]">
        <div className="border-b border-border/40 bg-card/80 backdrop-blur-md px-6 py-5 shadow-sm">
          <h2 className="font-heading font-semibold">{chatTitle}</h2>
          {!canChat && job && (
            <p className="text-sm text-muted-foreground mt-1">Chat will be available once a worker is assigned to this job.</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-background relative">
          {!canChat ? (
            <EmptyState icon={MessageSquare} title="No chat available" description="A worker needs to be assigned to this job before you can start chatting." />
          ) : messages && messages.length > 0 ? messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const sender = (msg as any).profiles;
            return (
              <div key={msg.id} className={cn("flex gap-2.5", isMine ? "justify-end" : "justify-start")}>
                {!isMine && (
                  <Avatar className="h-8 w-8 ring-2 ring-border mt-1">
                    <AvatarImage src={sender?.avatar_url} />
                    <AvatarFallback className="text-xs bg-accent text-accent-foreground font-semibold">{sender?.name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-5 py-3 shadow-sm",
                  isMine ? "bg-primary text-primary-foreground rounded-br-sm bg-gradient-to-br from-primary to-primary/90" : "glass-card bg-card/60 backdrop-blur-sm border-border/40 rounded-bl-sm"
                )}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>{format(new Date(msg.created_at!), "HH:mm")}</p>
                </div>
              </div>
            );
          }) : (
            <EmptyState icon={MessageSquare} title="No messages yet" description="Send the first message" />
          )}
          <div ref={scrollRef} />
        </div>
        <div className="border-t border-border/40 bg-card/80 backdrop-blur-md p-5">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }} className="flex gap-3">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={canChat ? "Type a message..." : "Chat unavailable..."} className="flex-1 h-12 rounded-xl bg-background border-border/40 focus-visible:ring-primary/30" disabled={!canChat} />
            <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shrink-0 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" disabled={!canChat || !message.trim() || sendMessage.isPending}><Send className="h-5 w-5" /></Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
