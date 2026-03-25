import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  ArrowLeft,
  MessageSquare,
  Award,
  Globe,
  Briefcase
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Deterministic avatar color from name
function getAvatarColors(name: string) {
  const palettes = [
    { bg: "from-rose-500 to-red-600", text: "text-white" },
    { bg: "from-violet-500 to-purple-600", text: "text-white" },
    { bg: "from-sky-500 to-blue-600", text: "text-white" },
    { bg: "from-emerald-500 to-green-600", text: "text-white" },
    { bg: "from-amber-500 to-orange-600", text: "text-white" },
    { bg: "from-pink-500 to-rose-600", text: "text-white" },
    { bg: "from-teal-500 to-cyan-600", text: "text-white" },
    { bg: "from-indigo-500 to-blue-700", text: "text-white" },
  ];
  const idx = name
    ? name
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0) % palettes.length
    : 0;
  return palettes[idx];
}

function ProfileAvatar({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  const { bg, text } = getAvatarColors(name);
  const sizeClasses = {
    sm: "h-12 w-12 text-base",
    md: "h-20 w-20 text-2xl",
    lg: "h-32 w-32 text-4xl",
  };
  return (
    <div
      className={`rounded-[2rem] bg-gradient-to-br ${bg} ${text} ${sizeClasses[size]} flex items-center justify-center font-black shadow-2xl select-none ring-4 ring-white transition-transform duration-700 group-hover:scale-105`}
    >
      {initials}
    </div>
  );
}

export default function ProfileViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-view", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-pulse">
          <Skeleton className="h-[250px] rounded-[2.5rem]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-6 py-32 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <MapPin className="h-10 w-10 text-red-500 opacity-20" />
          </div>
          <h2 className="text-3xl font-black text-l-on-surface tracking-tighter mb-4">Profile Not Found</h2>
          <p className="text-l-secondary font-medium mb-10 opacity-60 leading-relaxed">The profile you're looking for might have been moved, deactivated, or doesn't exist.</p>
          <Button onClick={() => navigate(-1)} className="bg-l-primary text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-l-primary/20">Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  const displayName = profile.name || "Anonymous Member";
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 space-y-12 animate-fade-in">
        
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="group px-0 hover:bg-transparent text-l-secondary font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:-translate-x-1 transition-transform">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Project
          </Button>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-12 border-slate-100 bg-white rounded-xl font-black text-xs uppercase tracking-widest shadow-sm">Report</Button>
             <Button className="h-12 bg-l-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-l-primary/10">Follow</Button>
          </div>
        </div>

        {/* ── Profile Hero Section ── */}
        <section className="relative group">
          <div className="absolute inset-0 bg-l-primary/10 blur-[120px] rounded-full -z-10 opacity-30 group-hover:opacity-50 transition-opacity"></div>
          
          <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-white shadow-[0_40px_100px_rgba(0,27,60,0.06)] ring-1 ring-slate-50 flex flex-col md:flex-row items-center md:items-end gap-10">
            <div className="relative shrink-0">
               <ProfileAvatar name={displayName} size="lg" />
               <div className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-xl ring-4 ring-white">
                 <ShieldCheck className="h-6 w-6 text-emerald-500" />
               </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="px-5 py-1.5 bg-red-50 text-l-primary rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-red-100/50">
                    Verified {profile.active_role || "Member"}
                  </span>
                  <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm">
                    <Star className="h-5 w-5 fill-current" />
                    <span>{Number(profile.avg_rating || 0).toFixed(1)}</span>
                    <span className="text-l-secondary opacity-40 font-bold ml-1">({profile.total_reviews || 0} Reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-l-on-surface tracking-tighter leading-[0.9] font-l-headline">
                  {displayName}
                </h1>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 text-sm font-bold text-l-secondary">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-l-primary/40" />
                  {profile.location_text || "Global Member"}
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-l-primary/40" />
                  Joined {memberSince}
                </div>
                {profile.is_verified && (
                  <div className="flex items-center gap-2.5 text-emerald-600">
                    <Award className="h-4 w-4" />
                    Elite Tier
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center md:items-end gap-4 w-full md:w-auto mt-6 md:mt-0 pt-10 md:pt-0 border-t md:border-t-0 border-slate-100">
              <Button 
                size="lg"
                onClick={() => navigate(`/messages/direct?with=${id}`)}
                className="w-full md:w-auto h-16 px-10 rounded-2xl bg-[#001b3c] text-white font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-none flex items-center gap-4"
              >
                <MessageSquare className="h-6 w-6" />
                Start Chatting
              </Button>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">Typically Responds in 2 hours</p>
            </div>
          </div>
        </section>

        {/* ── Main Details Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: About & Bio */}
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-8">
              <h2 className="text-3xl font-black text-l-on-surface tracking-tight font-l-headline">Professional Background</h2>
              <div className="bg-l-surface-container-low rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group">
                <div className="relative z-10 leading-relaxed text-l-secondary text-lg font-medium opacity-80 whitespace-pre-wrap font-l-body">
                  {profile.bio || "This member hasn't provided a bio yet. They are part of the NearCraft network, contributing to technical projects and service exchanges within the community."}
                </div>
              </div>
            </section>

            {/* Stats/Badges Row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <Briefcase className="h-8 w-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Projects Completed</h4>
                <p className="text-3xl font-black text-l-on-surface">12</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <Globe className="h-8 w-8 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Radius</h4>
                <p className="text-3xl font-black text-l-on-surface">50mi</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <ShieldCheck className="h-8 w-8 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Safety Score</h4>
                <p className="text-3xl font-black text-l-on-surface">9.8</p>
              </div>
            </section>
          </div>

          {/* Right: Sidebar / Verification Details */}
          <div className="lg:col-span-4 space-y-10">
             <div className="bg-l-surface-container-low rounded-[2.5rem] p-10 space-y-10 border border-white">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Trust & Safety</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-l-on-surface">ID Verified</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Govt ID Confirmed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-l-on-surface">Email Verified</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Business Domain</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-200/40">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Social Context</h4>
                  <div className="flex items-center gap-3">
                    {/* Placeholder for social connections */}
                    <div className="flex -space-x-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-4 border-white"></div>
                      ))}
                    </div>
                    <p className="text-xs font-bold text-l-secondary opacity-60">12 Shared Connections</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-white shadow-sm font-black text-xs uppercase tracking-widest">
                  View Full Resume
                </Button>
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
