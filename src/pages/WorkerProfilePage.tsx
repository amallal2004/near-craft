import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, MapPin, Briefcase, Calendar, MessageSquare, ArrowLeft, ShieldCheck, Mail, CheckCircle2, User, Sparkles, ImageIcon, GraduationCap, Construction, Settings as SettingsIcon, LayoutDashboard, History, CalendarDays, HelpCircle, LogOut } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const skillIconMap: Record<string, any> = {
  "Plumbing": Construction,
  "Electrical": Sparkles,
  "Cleaning": CheckCircle2,
  "Carpentry": Briefcase,
  "Gardening": Sparkles,
  "Pet Care": User,
  "Default": Briefcase
};

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, activeRole, profile: currentUserProfile, signOut } = useAuth();

  const { data: worker, isLoading } = useQuery({
    queryKey: ["workerProfile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worker_profiles")
        .select(`
          *,
          profiles:user_id (*),
          worker_skills (categories (name)),
          worker_portfolio (id, image_url, caption)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleMessageUser = () => {
    if (!worker || !worker.profiles) return;
    const p = worker.profiles as any;
    navigate(`/messages/direct?with=${p.id}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-7xl mx-auto px-6 pt-24 pb-12 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Skeleton className="lg:col-span-4 h-[600px] rounded-3xl" />
            <div className="lg:col-span-8 space-y-8">
              <Skeleton className="h-[300px] rounded-3xl" />
              <Skeleton className="h-[200px] rounded-3xl" />
              <Skeleton className="h-[150px] rounded-3xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!worker || !worker.profiles) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-32 text-center">
          <div className="w-24 h-24 bg-l-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-l-secondary" />
          </div>
          <h2 className="text-3xl font-black font-l-headline text-l-on-surface mb-3 tracking-tighter">Professional Not Found</h2>
          <Button onClick={() => navigate("/workers")} className="bg-l-primary text-white rounded-xl px-8 h-12 font-bold shadow-lg">Browse All Professionals</Button>
        </div>
      </AppLayout>
    );
  }

  const p = worker.profiles as any;
  const isSelf = user?.id === p.id;
  const showMessageBtn = !isSelf && activeRole === "customer";
  const initials = p.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "?";

  return (
    <AppLayout>
      <main className="pt-8 pb-12 px-6 md:px-12 max-w-7xl mx-auto selection:bg-l-primary/30 selection:text-l-on-surface animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column - Profile Card */}
          <section className="lg:col-span-4 space-y-8 sticky top-24">
            <div className="bg-l-surface-container-lowest rounded-3xl p-8 text-center relative overflow-hidden group shadow-xl shadow-l-primary/5 ring-1 ring-slate-100 transition-all hover:shadow-2xl">
              {/* Hover Effect Accent */}
              <div className="absolute top-0 left-0 w-full h-0 bg-l-primary group-hover:h-1.5 transition-all duration-500"></div>
              
              <div className="relative inline-block mb-8">
                <div className="w-44 h-44 mx-auto rounded-full bg-l-surface-container-high flex items-center justify-center border-4 border-white shadow-inner group-hover:scale-105 transition-transform duration-700">
                  <Avatar className="h-full w-full rounded-full">
                    <AvatarFallback className="bg-transparent text-l-primary text-5xl font-black font-l-headline">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-[#2A9D8F] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> ONLINE
                </span>
              </div>

              <h1 className="text-3xl font-black font-l-headline text-l-on-surface mb-2 tracking-tighter">{p.name}</h1>
              <div className="flex items-center justify-center gap-2 mb-8">
                <Badge className="bg-l-primary-container text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border-none">Pro</Badge>
                <div className="flex items-center gap-1 text-l-on-surface-variant font-bold text-sm">
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  <span>{p.avg_rating ? Number(p.avg_rating).toFixed(1) : "5.0"}</span>
                  <span className="text-xs text-l-secondary opacity-60 ml-0.5">({p.total_reviews || 0} reviews)</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between text-sm px-2">
                  <span className="text-l-secondary font-bold opacity-60 uppercase text-[10px] tracking-widest">Hourly Rate</span>
                  <span className="text-l-primary font-black text-xl tracking-tighter">${worker.hourly_rate_min || "100"}+</span>
                </div>
                <div className="flex items-center justify-between text-sm px-2">
                  <span className="text-l-secondary font-bold opacity-60 uppercase text-[10px] tracking-widest">Completed Jobs</span>
                  <span className="text-l-on-surface font-black">{worker.completed_jobs || 12}</span>
                </div>
                <div className="flex items-center justify-between text-sm px-2 text-left">
                  <span className="text-l-secondary font-bold opacity-60 uppercase text-[10px] tracking-widest">Location</span>
                  <span className="text-l-on-surface font-black truncate max-w-[150px]">{p.location_text || "San Francisco, CA"}</span>
                </div>
                <div className="flex items-center justify-between text-sm px-2">
                  <span className="text-l-secondary font-bold opacity-60 uppercase text-[10px] tracking-widest">Distance</span>
                  <span className="text-l-on-surface font-black">4.2 miles away</span>
                </div>
              </div>

              {showMessageBtn ? (
                <Button 
                  onClick={handleMessageUser}
                  className="w-full bg-gradient-to-br from-l-primary to-l-primary-container text-white py-7 rounded-2xl font-black shadow-lg shadow-l-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 border-none group"
                >
                  <MessageSquare className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                  Message {p.name?.split(' ')[0]}
                </Button>
              ) : isSelf ? (
                <Button onClick={() => navigate("/profile")} className="w-full bg-l-surface-container-low text-l-on-surface py-7 rounded-2xl font-black hover:bg-l-surface-container-high transition-all border-none">
                  Edit My Profile
                </Button>
              ) : null}
            </div>

            {/* Verifications Card */}
            <div className="bg-l-surface-container-low rounded-3xl p-8 space-y-5 ring-1 ring-slate-100">
              <h3 className="text-[10px] font-black font-l-label uppercase tracking-[0.2em] text-l-secondary mb-2 opacity-60">Verifications</h3>
              <div className="flex items-center gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-5 w-5 text-l-primary" />
                </div>
                <span className="text-sm font-bold text-l-on-surface">Identity Verified</span>
              </div>
              <div className="flex items-center gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5 text-l-primary" />
                </div>
                <span className="text-sm font-bold text-l-on-surface">Background Check Passed</span>
              </div>
              <div className="flex items-center gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Construction className="h-5 w-5 text-l-primary" />
                </div>
                <span className="text-sm font-bold text-l-on-surface">Business License Registered</span>
              </div>
            </div>
          </section>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* About Section */}
            <section>
              <h2 className="text-4xl md:text-5xl font-black font-l-headline text-l-on-surface mb-10 tracking-[ -0.05em] leading-[0.9]">
                About {p.name?.split(' ')[0]}
              </h2>
              <div className="bg-l-surface-container-low p-1.5 rounded-[2.5rem] shadow-sm">
                <div className="bg-white rounded-[2rem] p-10 md:p-14 leading-relaxed text-l-secondary text-lg font-medium shadow-inner">
                  <p className="whitespace-pre-wrap">
                    {p.bio || "With over 12 years of hands-on experience in high-end residential maintenance, I bring a precision-focused approach to every task. My background combines technical engineering knowledge with practical craftsmanship."}
                  </p>
                </div>
              </div>
            </section>

            {/* Professional Experience Section (Bento Grid) */}
            <section>
              <h2 className="text-2xl font-black font-l-headline text-l-on-surface mb-8 tracking-tighter">Professional Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-l-surface-container-low p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-l-primary/10">
                  <div className="flex justify-between items-start mb-6">
                    <Badge className="bg-l-secondary-container text-l-on-secondary-container px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none">Current</Badge>
                    <span className="text-xs text-l-secondary font-black opacity-50">2021 — Present</span>
                  </div>
                  <h4 className="font-black text-l-on-surface text-xl mb-3 font-l-headline">Lead Restoration Specialist</h4>
                  <p className="text-sm text-l-secondary font-medium leading-relaxed opacity-80">
                    {worker.experience_desc || "Managing full-scale structural restorations for historic Victorian homes in the Bay Area."}
                  </p>
                </div>
                
                <div className="bg-l-surface-container-low p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-l-primary/10">
                  <div className="flex justify-between items-start mb-6">
                    <Badge className="bg-l-surface-container-high text-l-on-surface-variant px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none">Past</Badge>
                    <span className="text-xs text-l-secondary font-black opacity-50">2015 — 2021</span>
                  </div>
                  <h4 className="font-black text-l-on-surface text-xl mb-3 font-l-headline">Precision Carpentry Lead</h4>
                  <p className="text-sm text-l-secondary font-medium leading-relaxed opacity-80">Specialized in custom cabinetry and fine woodworking for boutique retail spaces.</p>
                </div>
              </div>
            </section>

            {/* Skills & Expertise Section */}
            <section>
              <h2 className="text-2xl font-black font-l-headline text-l-on-surface mb-8 tracking-tighter">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-4">
                {worker.worker_skills && worker.worker_skills.length > 0 ? (
                  worker.worker_skills.map((skill: any, index: number) => {
                    const skillName = skill.categories?.name;
                    const Icon = skillIconMap[skillName] || skillIconMap["Default"];
                    return (
                      <div key={index} className="bg-white/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white flex items-center gap-4 group hover:bg-l-primary transition-all duration-500 cursor-default shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <Icon className="h-6 w-6 text-l-primary group-hover:text-white transition-colors" />
                        <span className="font-black text-sm text-l-on-surface group-hover:text-white transition-colors tracking-tight Montserrat uppercase">
                          {skillName}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-l-secondary italic opacity-60">No skills listed yet.</p>
                )}
              </div>
            </section>

            {/* Portfolio Grid (Asymmetric) */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-l-headline text-l-on-surface tracking-tighter">Recent Projects</h2>
                <Link to="#" className="text-l-primary text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 auto-rows-[250px]">
                {worker.worker_portfolio && worker.worker_portfolio.length > 0 ? (
                  worker.worker_portfolio.map((item: any, i: number) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "bg-l-surface-container-low rounded-3xl overflow-hidden relative group shadow-sm transition-all duration-500 hover:shadow-2xl",
                        (i % 3 === 0) ? "md:col-span-2" : "col-span-1"
                      )}
                    >
                      <img 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                        src={item.image_url} 
                        alt={item.caption || "Project"} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-l-on-surface/90 via-l-on-surface/20 to-transparent p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <span className="text-white font-black text-xl mb-1 font-l-headline tracking-tighter">{item.caption || "Smart Home Installation"}</span>
                        <span className="text-white/70 text-xs font-bold uppercase tracking-widest">San Francisco, CA</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full h-40 bg-l-surface-container-low rounded-3xl flex items-center justify-center text-l-secondary opacity-40 italic">
                    No portfolio projects added yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
