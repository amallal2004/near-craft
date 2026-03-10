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

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => { const { data } = await supabase.from("jobs").select("*, profiles!jobs_customer_id_fkey(name)").eq("id", jobId!).single(); return data; },
    enabled: !!jobId,
  });

  const withUserId = searchParams.get("with");
  const otherUserId = withUserId || (job ? (job.customer_id === user?.id ? job.selected_worker_id : job.customer_id) : null);

  const { data: messages } = useQuery({
    queryKey: ["messages", jobId],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*, profiles!messages_sender_id_fkey(name, avatar_url)").eq("job_id", jobId!).order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!jobId,
  });

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!message.trim()) return;
      if (!otherUserId) throw new Error("No recipient found. A worker must be assigned to this job before you can chat.");
      const { error } = await supabase.from("messages").insert({
        job_id: jobId!, sender_id: user!.id, receiver_id: otherUserId, content: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => { setMessage(""); queryClient.invalidateQueries({ queryKey: ["messages", jobId] }); },
    onError: (err: Error) => { toast({ title: "Failed to send", description: err.message, variant: "destructive" }); },
  });

  const canChat = !!otherUserId;

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem-5rem)] lg:h-[calc(100vh-3.5rem)]">
        <div className="border-b p-4">
          <h2 className="font-heading font-semibold">{job?.title ?? "Chat"}</h2>
          {!canChat && job && (
            <p className="text-sm text-muted-foreground mt-1">Chat will be available once a worker is assigned to this job.</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!canChat ? (
            <EmptyState icon={MessageSquare} title="No chat available" description="A worker needs to be assigned to this job before you can start chatting." />
          ) : messages && messages.length > 0 ? messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const sender = (msg as any).profiles;
            return (
              <div key={msg.id} className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
                {!isMine && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sender?.avatar_url} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{sender?.name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5", isMine ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>{format(new Date(msg.created_at!), "HH:mm")}</p>
                </div>
              </div>
            );
          }) : (
            <EmptyState icon={MessageSquare} title="No messages yet" description="Send the first message" />
          )}
          <div ref={scrollRef} />
        </div>
        <div className="border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }} className="flex gap-2">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={canChat ? "Type a message..." : "Chat unavailable..."} className="flex-1" disabled={!canChat} />
            <Button type="submit" size="icon" disabled={!canChat || !message.trim() || sendMessage.isPending}><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
