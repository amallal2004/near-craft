import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  Send, 
  MessageSquare, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  PlusCircle, 
  Image as ImageIcon, 
  Smile, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Loader2,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";

export default function ChatPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useRealtimeMessages(jobId);

  const withUserId = searchParams.get("with");

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => { 
      if (!jobId) return null;
      const { data } = await supabase.from("jobs").select("*, categories(*), profiles!jobs_customer_id_fkey(*)").eq("id", jobId).single(); 
      return data; 
    },
    enabled: !!jobId,
  });

  const { data: conversations, isLoading: isConversationsLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data: msgs } = await supabase.from("messages").select("id, job_id, content, created_at, sender_id, receiver_id, is_read, jobs(title)").or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order("created_at", { ascending: false });
      if (!msgs) return [];
      const conversationMap = new Map<string, any>();
      for (const msg of msgs) {
        const otherId = msg.sender_id === user!.id ? msg.receiver_id : msg.sender_id;
        const convId = msg.job_id || `direct_${[msg.sender_id, msg.receiver_id].sort().join('_')}`;
        
        if (!conversationMap.has(convId)) {
          const { data: otherProfile } = await supabase.from("profiles").select("id, name, avatar_url, bio, avg_rating").eq("id", otherId).single();
          
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

  const { data: otherProfile } = useQuery({
    queryKey: ["profile", otherUserId],
    queryFn: async () => {
      if (!otherUserId) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", otherUserId).single();
      return data;
    },
    enabled: !!otherUserId,
  });

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
  const chatTitle = job ? job.title : otherProfile ? `${otherProfile.name}` : "Chat";

  const filteredConversations = conversations?.filter(conv => 
    conv.otherProfile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-l-surface selection:bg-l-primary/10">
        {/* Left Panel: Conversations List */}
        <aside className={cn(
          "hidden md:flex w-80 lg:w-96 flex-col bg-white border-r border-slate-100 flex-shrink-0 transition-all",
          jobId || withUserId ? "hidden lg:flex" : "flex"
        )}>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-l-primary tracking-tighter font-l-headline">Messages</h2>
              <Link to="/messages" className="p-2 transition-all hover:bg-l-surface-container-low rounded-xl text-l-primary active:scale-95">
                <PlusCircle className="h-6 w-6" />
              </Link>
            </div>

            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-l-primary transition-colors" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-l-surface-container-low border-none rounded-2xl pl-11 pr-4 py-6 text-sm focus:ring-4 focus:ring-l-primary/5 placeholder:text-slate-400 font-medium transition-all" 
                placeholder="Search conversations..." 
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button className="bg-l-primary text-white font-black text-[10px] px-4 py-2 rounded-xl shadow-lg shadow-l-primary/20 uppercase tracking-widest whitespace-nowrap">All Chats</button>
              <button className="text-l-secondary/50 hover:bg-l-surface-container-low text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest whitespace-nowrap transition-all hover:translate-x-0.5">Unread</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6">
            {isConversationsLoading ? (
              <div className="space-y-4 px-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
              </div>
            ) : filteredConversations?.map((conv: any) => {
              const date = new Date(conv.created_at);
              const timeStr = isToday(date) ? format(date, "HH:mm") : format(date, "MMM d");
              const isActive = (conv.job_id === jobId) || (!jobId && conv.otherProfile?.id === withUserId);
              
              return (
                <Link 
                  key={conv.convId} 
                  to={conv.job_id ? `/jobs/${conv.job_id}/chat` : `/messages/direct?with=${conv.otherProfile?.id}`} 
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 active:scale-[0.98] mb-1",
                    isActive 
                      ? "bg-l-surface-container-low border-l-4 border-l-primary shadow-sm" 
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 rounded-2xl group-hover:ring-l-primary/10 transition-all">
                      <AvatarImage src={conv.otherProfile?.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-l-surface-container-high text-l-secondary font-black rounded-2xl">
                        {conv.otherProfile?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={cn("text-sm font-black tracking-tight truncate", isActive || conv.unread > 0 ? "text-l-on-surface" : "text-l-secondary")}>
                        {conv.otherProfile?.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{timeStr}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={cn("text-xs truncate transition-colors", conv.unread > 0 ? "text-l-on-surface font-bold" : "text-slate-400 font-medium")}>
                        {conv.content}
                      </p>
                      {conv.unread > 0 && (
                        <span className="bg-l-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-l-primary/20 shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Center Panel: Chat Area */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden relative shadow-[0_0_60px_rgba(0,27,60,0.03)] z-10">
          {!canChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-2xl shadow-l-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MessageSquare className="h-10 w-10 text-l-primary" />
              </div>
              <h2 className="text-3xl font-black text-l-on-surface font-l-headline tracking-tighter">No Active Chat</h2>
              <p className="max-w-xs text-l-secondary font-medium leading-relaxed opacity-60">
                {jobId ? "A worker needs to be assigned to this job before you can start chatting." : "Select a conversation to start messaging."}
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <header className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-50/60">
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer">
                    <Avatar className="h-11 w-11 rounded-2xl ring-2 ring-transparent group-hover:ring-l-primary/10 transition-all duration-300">
                      <AvatarImage src={otherProfile?.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-l-surface-container-high text-l-secondary font-black rounded-2xl text-lg">
                        {otherProfile?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-l-on-surface tracking-tight font-l-headline leading-tight">{chatTitle}</h2>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.15em] flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      Online Now
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-l-surface-container-low hover:text-l-primary transition-all">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-l-surface-container-low hover:text-l-primary transition-all">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-l-surface-container-low hover:text-l-primary transition-all">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </header>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-slate-50/30">
                <div className="flex flex-col items-center mb-4">
                  <span className="px-4 py-1.5 bg-white border border-slate-100 text-[10px] font-black text-slate-400 rounded-full uppercase tracking-widest shadow-sm">Today</span>
                </div>

                {messages?.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  const sender = (msg as any).profiles;
                  
                  return (
                    <div key={msg.id} className={cn("flex gap-4 group", isMine ? "flex-row-reverse" : "flex-row")}>
                      {!isMine && (
                        <div className="flex-shrink-0 mt-1">
                          <Avatar className="h-10 w-10 rounded-xl ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage src={sender?.avatar_url} />
                            <AvatarFallback className="text-xs bg-l-surface-container-high text-l-secondary font-black rounded-xl uppercase">{sender?.name?.charAt(0) ?? "?"}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <div className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                        <div className={cn(
                          "max-w-[85%] md:max-w-[75%] rounded-[1.75rem] px-6 py-4 shadow-sm relative transition-all duration-300",
                          isMine 
                            ? "bg-gradient-to-br from-l-primary to-l-primary-container text-white rounded-tr-none shadow-l-primary/10 hover:shadow-lg hover:shadow-l-primary/15" 
                            : "bg-white border border-slate-100 text-l-on-surface rounded-tl-none hover:shadow-md hover:border-white transition-all"
                        )}>
                          <p className="text-sm font-medium leading-relaxed font-l-body whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className={cn("flex items-center gap-1.5 mt-2 px-1", isMine ? "flex-row-reverse" : "flex-row")}>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">
                            {format(new Date(msg.created_at!), "HH:mm")}
                          </span>
                          {isMine && <CheckCircle2 className="h-3.5 w-3.5 text-l-primary fill-l-primary/10" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <div className="p-8 bg-white border-t border-slate-50">
                <div className="bg-l-surface-container-low p-2 rounded-3xl border border-transparent focus-within:bg-white focus-within:shadow-[0_20px_50px_rgba(0,27,60,0.06)] focus-within:border-l-primary/10 transition-all duration-500">
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage.mutate();
                      }
                    }}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm py-4 px-6 resize-none font-medium text-l-on-surface placeholder:text-slate-400 font-l-body" 
                    placeholder="Type a message..." 
                    rows={1}
                  />
                  <div className="flex items-center justify-between mt-2 pt-3 px-3 border-t border-slate-200/40">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-l-surface hover:text-l-primary transition-colors">
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-l-surface hover:text-l-primary transition-colors">
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-l-surface hover:text-l-primary transition-colors">
                        <Smile className="h-5 w-5" />
                      </Button>

                    </div>
                    <Button 
                      onClick={() => sendMessage.mutate()}
                      disabled={!message.trim() || sendMessage.isPending}
                      className="bg-gradient-to-br from-l-primary to-l-primary-container text-white px-8 h-12 rounded-2xl flex items-center gap-3 font-black text-sm shadow-xl shadow-l-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                    >
                      {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      SEND
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right Panel: Context Details */}
        {canChat && otherProfile && (
          <aside className="hidden xl:flex w-80 lg:w-96 bg-white flex-col border-l border-slate-100 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-500">
            <div className="p-10 text-center flex flex-col items-center bg-gradient-to-b from-l-surface-container-low/50 to-white">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl p-1 bg-white ring-8 ring-slate-50/50">
                  <Avatar className="w-full h-full rounded-[1.75rem]">
                    <AvatarImage src={otherProfile?.avatar_url} />
                    <AvatarFallback className="bg-l-surface-container-high text-l-secondary font-black text-3xl uppercase">{otherProfile?.name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-2xl shadow-lg ring-4 ring-white">
                  <ShieldCheck className="h-5 w-5 text-l-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-l-on-surface tracking-tighter font-l-headline">{otherProfile?.name}</h3>
              <p className="text-xs text-l-secondary/60 font-black uppercase tracking-widest mt-2">Member Since 2023</p>
              
              <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                <Button variant="outline" className="rounded-xl font-bold text-xs h-11 border-slate-100 hover:bg-slate-50" asChild>
                  <Link to={`/workers/${otherProfile.id}`}>View Profile</Link>
                </Button>
                <Button variant="outline" className="rounded-xl font-bold text-xs h-11 border-slate-100 hover:bg-slate-50">
                  Reviews
                </Button>
              </div>
            </div>

            <div className="px-8 py-6 space-y-10">
              {/* Active Project Card */}
              {job && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Active Engagement
                  </h4>
                  <div className="bg-l-surface-container-low rounded-[2rem] p-6 space-y-5 border border-white shadow-sm shadow-l-primary/5">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-black text-l-on-surface tracking-tight leading-tight line-clamp-2 pr-2">{job.title}</span>
                      <span className="text-sm font-black text-l-primary shrink-0">₹{job.budget_amount}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-l-primary">65%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-l-primary rounded-full w-[65%] shadow-[0_0_8px_rgba(var(--primary),0.3)]"></div>
                      </div>
                    </div>
                    <Link to={`/jobs/${job.id}`} className="flex items-center justify-between group pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-l-primary transition-colors">Details</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-l-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Shared Assets */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared Assets</h4>
                  <Button variant="ghost" className="text-[10px] font-black text-l-primary h-auto p-0 uppercase tracking-widest hover:bg-transparent">See All</Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-l-surface transition-all border border-transparent hover:border-slate-100">
                    <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl text-l-primary shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-l-on-surface truncate">brand_assetsv2.zip</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">12.4 MB • Oct 12</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-l-surface transition-all border border-transparent hover:border-slate-100">
                    <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl text-blue-500 shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-l-on-surface truncate">moodboard_preview.jpg</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">4.5 MB • Oct 10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Actions */}
              <div className="pt-4 space-y-4">
                <Button variant="ghost" className="w-full h-12 rounded-2xl bg-l-surface-container-low text-l-secondary font-black text-[10px] tracking-widest uppercase hover:bg-red-50 hover:text-red-500 transition-all border-none">
                  <Trash2 className="h-4 w-4 mr-3" />
                  Block User
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </AppLayout>
  );
}
