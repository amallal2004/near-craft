import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { MessageSquare, Search, MessageSquarePlus, Filter } from "lucide-react";
import { formatDistanceToNow, isToday, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredConversations = conversations?.filter(conv => 
    conv.otherProfile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-l-surface selection:bg-l-primary/10">
        {/* Left Panel: Conversations List */}
        <aside className="w-full lg:w-96 flex flex-col bg-white border-r border-slate-100 flex-shrink-0 animate-in slide-in-from-left duration-500">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-l-primary tracking-tighter font-l-headline">Messages</h2>
              <button className="p-2 transition-all hover:bg-l-surface-container-low rounded-xl text-l-primary active:scale-95">
                <MessageSquarePlus className="h-6 w-6" />
              </button>
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
              <button className="bg-l-primary text-white font-black text-[10px] px-4 py-2 rounded-xl shadow-lg shadow-l-primary/20 uppercase tracking-widest whitespace-nowrap whitespace-nowrap">All Chats</button>
              <button className="text-l-secondary/50 hover:bg-l-surface-container-low text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest whitespace-nowrap transition-all hover:translate-x-0.5">Unread</button>
              <button className="text-l-secondary/50 hover:bg-l-surface-container-low text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest whitespace-nowrap transition-all hover:translate-x-0.5">Projects</button>
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6">
            {isLoading ? (
              <div className="space-y-4 px-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
              </div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              <div className="space-y-2">
                {filteredConversations.map((conv: any) => {
                  const date = new Date(conv.created_at);
                  const timeStr = isToday(date) ? format(date, "HH:mm") : format(date, "MMM d");
                  
                  return (
                    <Link 
                      key={conv.convId} 
                      to={conv.job_id ? `/jobs/${conv.job_id}/chat` : `/messages/direct?with=${conv.otherProfile?.id}`} 
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 active:scale-[0.98]",
                        conv.unread > 0 
                          ? "bg-l-surface-container-low border-l-4 border-l-primary shadow-sm" 
                          : "hover:bg-slate-50 border-l-4 border-l-transparent"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 rounded-2xl ring-2 ring-transparent group-hover:ring-l-primary/10 transition-all">
                          <AvatarImage src={conv.otherProfile?.avatar_url} className="object-cover" />
                          <AvatarFallback className="bg-l-surface-container-high text-l-secondary font-black text-xl rounded-2xl">
                            {conv.otherProfile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Status Indicator (Mock online status) */}
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={cn("text-base font-black tracking-tight truncate", conv.unread > 0 ? "text-l-on-surface" : "text-l-secondary")}>
                            {conv.otherProfile?.name ?? "User"}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{timeStr}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={cn("text-xs truncate transition-colors", conv.unread > 0 ? "text-l-on-surface font-bold" : "text-slate-400 font-medium")}>
                            {conv.content}
                          </p>
                          {conv.unread > 0 && (
                            <span className="bg-l-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-l-primary/20 shrink-0">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center opacity-40">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No conversations</p>
              </div>
            )}
          </div>
        </aside>

        {/* Center Panel: Empty State Background */}
        <section className="hidden lg:flex flex-1 flex-col items-center justify-center bg-l-surface relative overflow-hidden px-10 text-center animate-in fade-in duration-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-l-primary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
          
          <div className="relative z-10 space-y-6 max-w-md">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-2xl shadow-l-primary/10 flex items-center justify-center mx-auto mb-8 animate-bounce">
              <MessageSquare className="h-10 w-10 text-l-primary" />
            </div>
            <h2 className="text-4xl font-black text-l-on-surface font-l-headline tracking-tighter leading-tight">
              Select a conversation to start messaging
            </h2>
            <p className="text-lg text-l-secondary font-medium leading-relaxed opacity-60">
              Connect with workers and clients in real-time. Share files, settle budgets, and get work done faster.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
