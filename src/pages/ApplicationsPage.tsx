import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/skeletons";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("*, jobs(title, status, categories(name, icon))")
        .eq("worker_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="p-12 max-w-7xl mx-auto min-h-[calc(100vh-80px)] flex flex-col">
        {/* Header Section with Breathing Room */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-l-headline font-black tracking-tighter mb-4 text-l-on-surface">
            Let's build your <span className="text-l-primary italic">Momentum.</span>
          </h1>
          <p className="text-l-secondary max-w-xl text-lg leading-relaxed opacity-70">
            Your active applications and status updates live here. Right now, the stage is yours to claim.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid gap-6">
              {applications.map((app) => {
                const job = (app as any).jobs;
                return (
                  <Link 
                    key={app.id} 
                    to={`/jobs/${app.job_id}`} 
                    className="group relative bg-white p-8 rounded-[2rem] border-l-8 border-transparent hover:border-l-primary transition-all duration-500 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-2xl hover:shadow-l-primary/5 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-l-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex-1 flex items-center gap-6">
                      <div className="w-14 h-14 bg-l-surface-container-low flex items-center justify-center rounded-2xl text-l-primary shadow-inner group-hover:bg-l-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                        <span className="material-symbols-outlined text-2xl">{job?.categories?.icon || "work"}</span>
                      </div>
                      <div>
                        <h3 className="font-l-headline font-black text-xl text-l-on-surface group-hover:text-l-primary transition-colors leading-tight line-clamp-1">{job?.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-l-secondary text-xs font-black uppercase tracking-widest opacity-60">
                            Offer: <span className="text-l-primary">₹{Number(app.offer_price)}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-l-secondary text-[10px] font-black uppercase tracking-widest opacity-40">
                            {formatDistanceToNow(new Date(app.created_at!), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <StatusBadge status={app.status} type="application" className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest" />
                      <div className="h-10 w-10 rounded-full bg-l-primary/5 flex items-center justify-center text-l-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Secondary info panels for when there ARE applications */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
               <SecondaryInfoPanel1 />
               <SecondaryInfoPanel2 />
             </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-6 animate-fade-in-up">
            {/* Main Visual Call to Action */}
            <div className="col-span-12 row-span-4 lg:col-span-8 lg:row-span-6 bg-l-surface-container-low rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center p-12 text-center group">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-l-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-l-secondary-container rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
              </div>
              <div className="relative z-10 space-y-8 max-w-md">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 mx-auto transform group-hover:rotate-6 transition-transform duration-500">
                  <span className="material-symbols-outlined text-5xl text-l-primary" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-l-on-surface mb-3 tracking-tighter">Your pipeline is clear</h4>
                  <p className="text-l-secondary font-medium opacity-70">No active applications found. Thousands of top-tier gigs are waiting for your unique expertise.</p>
                </div>
                <button 
                  onClick={() => navigate("/jobs")}
                  className="inline-flex items-center gap-3 bg-kinetic-gradient text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(183,16,42,0.25)] uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined">explore</span>
                  Browse Jobs
                </button>
              </div>
              {/* Decorative Floating Elements */}
              <div className="absolute top-12 left-12 p-4 bg-white rounded-2xl shadow-sm border border-l-outline-variant/10 rotate-[-12deg] opacity-40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-sm">palette</span>
                  </div>
                  <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                </div>
              </div>
              <div className="absolute bottom-20 right-12 p-4 bg-white rounded-2xl shadow-sm border border-l-outline-variant/10 rotate-[8deg] opacity-40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-sm">code</span>
                  </div>
                  <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-3">
              <SecondaryInfoPanel1 />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-3">
              <SecondaryInfoPanel2 />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function SecondaryInfoPanel1() {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-l-outline-variant/10 flex flex-col justify-between h-full group hover:shadow-xl transition-all duration-500">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-l-tertiary animate-pulse"></div>
          <span className="text-[10px] font-black tracking-widest uppercase text-l-secondary opacity-50 font-l-headline">Strategy</span>
        </div>
        <h5 className="text-xl font-black text-l-on-surface leading-snug font-l-headline tracking-tight">Why start today?</h5>
        <p className="text-sm text-l-secondary mt-2 leading-relaxed opacity-70 font-medium">Workers who apply to 3+ jobs in their first week are 4.5x more likely to secure long-term retainers.</p>
      </div>
      <div className="flex items-center justify-between mt-8">
        <span className="text-xs font-black text-l-primary flex items-center gap-2 group cursor-pointer uppercase tracking-widest">
          Read guide <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </span>
      </div>
    </div>
  );
}

function SecondaryInfoPanel2() {
  return (
    <div className="bg-l-on-surface text-white rounded-[2rem] p-8 relative overflow-hidden group h-full">
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-l-primary shadow-[0_0_8px_rgba(183,16,42,0.8)]"></div>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 font-l-headline">Profile Status</span>
          </div>
          <h5 className="text-xl font-black leading-snug font-l-headline tracking-tight">Expert Tier Achievement</h5>
          <p className="text-sm text-slate-300 mt-2 font-medium opacity-80">Add a video intro to boost your profile to <span className="text-l-primary font-black">Elite Level</span>.</p>
        </div>
        <div className="mt-8">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progress</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-l-primary">85%</span>
           </div>
           <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
             <div className="w-[85%] h-full bg-l-primary rounded-full shadow-[0_0_12px_rgba(183,16,42,0.4)] transition-all duration-1000"></div>
           </div>
        </div>
      </div>
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(183,16,42,0.1),transparent)] pointer-events-none"></div>
    </div>
  );
}
