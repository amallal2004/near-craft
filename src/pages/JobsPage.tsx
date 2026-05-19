import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, DollarSign, Clock, Briefcase, PlusCircle, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/types";

function WorkerJobFeed() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") ?? "all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["open-jobs", search, categoryFilter, urgencyFilter],
    queryFn: async () => {
      let query = supabase.from("jobs")
        .select("*, categories(*)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        const cat = categories?.find(c => c.slug === categoryFilter);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (urgencyFilter !== "all") {
        query = query.eq("urgency", urgencyFilter as "low" | "medium" | "urgent");
      }
      const { data } = await query;
      let result = data ?? [];
      if (search) {
        result = result.filter(j => 
          j.title.toLowerCase().includes(search.toLowerCase()) || 
          j.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      return result;
    },
    enabled: !!categories,
  });

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "urgent": return <span className="material-symbols-outlined text-3xl">bolt</span>;
      case "medium": return <span className="material-symbols-outlined text-3xl">plumbing</span>;
      default: return <span className="material-symbols-outlined text-3xl">construction</span>;
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Header Section */}
      <section className="relative rounded-[2rem] overflow-hidden p-8 md:p-12 flex flex-col justify-end min-h-[320px] bg-slate-900 animate-fade-in group">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            alt="Technical workspace" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 group-hover:scale-100 transition-transform duration-1000" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdA_FPn6THsYTTpYrUx6Fgf7jYJepkFh_nx7jFK0c7ZcA5DZP7wVSFb28r9nqbKdq3SZUH86BPk6-QoBJYnadh5BCh-_i-NowsciCm3RWuItQqAiKOVq-AFxs9UnBeEnfGtGANrC3S4bTtJw0HbwksL1B4Ktr7--Sl-cZTtYAVvDUXLbYzonHTx5_4rUFV6pIHu4iYX0pLBirDt87K_lV6Jn8aQEGdIJCb85s93kr4GksYn5y7aD920jKqyZGLs9JicM-bPSFgAfE" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-l-primary/20 text-l-primary border border-l-primary/30 text-[10px] font-black uppercase tracking-[0.2em]">
            Atelier Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-l-headline font-black text-white tracking-tighter leading-none">
            Browse Available <br/><span className="text-l-primary">Opportunities.</span>
          </h1>
          <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 max-w-lg">
            Connect with premium clients seeking high-velocity precision for technical projects across the network.
          </p>
        </div>
      </section>

      {/* Modern Filter Section */}
      <section className="bg-l-surface-container-low/50 backdrop-blur-md p-2 rounded-3xl flex flex-col md:flex-row gap-2 items-center border border-white sticky top-24 z-30 shadow-sm transition-all duration-300">
        <div className="flex-1 flex flex-wrap gap-2 p-2">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="flex items-center gap-2 h-12 bg-white text-l-on-surface rounded-2xl font-bold border-none shadow-sm hover:bg-l-surface-bright transition-all w-full md:w-auto px-6 whitespace-nowrap">
              <span className="material-symbols-outlined text-lg opacity-50">category</span>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
              <SelectItem value="all" className="rounded-xl h-10 font-bold text-sm">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.slug} className="rounded-xl h-10 font-bold text-sm">
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Urgency Filter */}
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="flex items-center gap-2 h-12 bg-white text-l-on-surface rounded-2xl font-bold border-none shadow-sm hover:bg-l-surface-bright transition-all w-full md:w-auto px-6 whitespace-nowrap">
              <span className="material-symbols-outlined text-lg opacity-50">schedule</span>
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
              <SelectItem value="all" className="rounded-xl h-10 font-bold text-sm text-l-on-surface">All Urgency</SelectItem>
              <SelectItem value="low" className="rounded-xl h-10 font-bold text-sm text-green-600">Low Priority</SelectItem>
              <SelectItem value="medium" className="rounded-xl h-10 font-bold text-sm text-amber-600">Medium Priority</SelectItem>
              <SelectItem value="urgent" className="rounded-xl h-10 font-bold text-sm text-l-primary">Urgent Needs</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Input Integrated */}
          <div className="relative group flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-l-outline opacity-50 group-focus-within:text-l-primary transition-colors">search</span>
            <input 
              className="w-full bg-white border-none rounded-2xl h-12 pl-12 pr-4 text-sm font-bold text-l-on-surface focus:ring-2 focus:ring-l-primary/10 transition-all outline-none placeholder:text-slate-400 shadow-sm"
              placeholder="Filter by title..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200/50 hidden md:block mx-1"></div>

        <div className="p-2 flex gap-2">
          <button 
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              viewMode === "grid" ? "bg-l-primary text-white shadow-lg shadow-l-primary/20" : "text-l-secondary hover:bg-white"
            )}
          >
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300",
              viewMode === "list" ? "bg-l-primary text-white shadow-lg shadow-l-primary/20" : "text-l-secondary hover:bg-white"
            )}
          >
            <span className="material-symbols-outlined text-xl">view_list</span>
          </button>
        </div>
      </section>

      {/* Main Grid Feed */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className={cn(
          "grid gap-8",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1"
        )}>
          {/* Featured Bento Card (Shown for the first job when no search/filter is active or just as a highlight) */}
          {jobs.length > 0 && categoryFilter === "all" && search === "" && viewMode === "grid" && (
            <div className="group bg-slate-900 lg:col-span-2 p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-8 shadow-2xl relative overflow-hidden transition-all duration-700 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-80 h-80 bg-l-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex-1 z-10 relative flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-sm">Featured Opportunity</span>
                  <span className="text-l-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-l-primary animate-pulse"></span>
                    Atelier Verified
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-l-headline font-black text-white mb-4 tracking-tighter leading-tight group-hover:text-l-primary transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${jobs[0].id}`)}>
                  {jobs[0].title}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-xl line-clamp-2">
                  {jobs[0].description}
                </p>
                <div className="flex flex-wrap gap-10 mb-10">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Contract Value</p>
                    <p className="text-2xl font-l-headline font-black text-white">₹{Number(jobs[0].budget_amount)} {jobs[0].budget_type === 'hourly' ? '/hr' : 'Fixed'}</p>
                  </div>
                  <div className="w-px h-12 bg-slate-800"></div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Location</p>
                    <p className="text-2xl font-l-headline font-black text-white">{jobs[0].location_text?.split(',')[0] || "Remote"}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(`/jobs/${jobs[0].id}`)}
                  className="w-fit h-14 px-10 bg-l-primary text-white rounded-2xl font-black text-sm hover:bg-l-primary-container transition-all shadow-xl shadow-l-primary/20 uppercase tracking-widest active:scale-95"
                >
                  Apply Instantly
                </Button>
              </div>
              <div className="w-full md:w-[40%] rounded-[2rem] overflow-hidden relative min-h-[300px] border border-white/10 group-hover:border-l-primary/30 transition-colors">
                <img 
                  alt="Site Engineering" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHHc71RoDMxEF71tQs4kA36G2URYZIb8TMj88rc2n0JOL-hb0aCE9MaiWo9HvjhzQnHuszfSemYWC48mN1YYvX1BT42RwtgAcDAJJ0iZabB8LX5BWiSYhLU2MD93cyqk3UbV3puyvMEiiTMZEj_KvRXEK881_untFgt0DofuVfJo_74T6CgAlSJMkaQwtvlt69XUfny4oazZrRvHXFpo2dZ_LtLGpBPQX6AdZiTLNnaiq2zUDFb9yRzXsdD1HbNnT894iV9eZdsN4" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white text-xl">location_on</span>
                    <span className="text-white font-black text-sm tracking-tight">{jobs[0].location_text || "Remote"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job List Mapping */}
          {jobs.slice(categoryFilter === "all" && search === "" && viewMode === "grid" ? 1 : 0).map((job) => (
            <div 
              key={job.id} 
              className={cn(
                "group relative bg-white p-8 rounded-[2.5rem] border-t-8 border-transparent hover:border-l-primary transition-all duration-500 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-l-primary/5 hover:-translate-y-1 overflow-hidden",
                viewMode === "list" && "flex-row items-center gap-8 py-6"
              )}
            >
              {/* Subtle accent background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-l-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={cn("flex justify-between items-start mb-6", viewMode === "list" && "mb-0 w-full")}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-l-surface-container-low flex items-center justify-center rounded-2xl text-l-primary shadow-inner group-hover:bg-l-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                    {getUrgencyIcon(job.urgency)}
                  </div>
                  <div>
                    <h3 className="font-l-headline font-black text-xl text-l-on-surface group-hover:text-l-primary transition-colors leading-tight line-clamp-1">{job.title}</h3>
                    <p className="text-l-secondary text-xs font-black uppercase tracking-widest opacity-60 mt-1">{(job as any).categories?.name || "Technical"} • {job.budget_type === 'hourly' ? 'Contract' : 'One-time'}</p>
                  </div>
                </div>
                {job.urgency === 'urgent' && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-l-error/10 text-l-error rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="w-2 h-2 rounded-full bg-l-error animate-pulse"></span> Urgent
                  </span>
                )}
              </div>

              {viewMode === "grid" && (
                <p className="text-l-secondary text-sm font-medium leading-relaxed mb-8 line-clamp-2 opacity-70">
                  {job.description}
                </p>
              )}

              <div className={cn(
                "grid gap-4 mb-8",
                viewMode === "grid" ? "grid-cols-2" : "hidden md:grid grid-cols-2 w-1/3"
              )}>
                <div className="bg-l-surface-container-low p-4 rounded-2xl border border-white/50 group-hover:border-l-primary/10 transition-colors">
                  <p className="text-[10px] text-l-secondary uppercase font-black tracking-[0.2em] mb-1.5 opacity-50">Budget/Rate</p>
                  <p className="text-lg font-l-headline font-black text-l-on-surface">₹{Number(job.budget_amount)}</p>
                </div>
                <div className="bg-l-surface-container-low p-4 rounded-2xl border border-white/50 group-hover:border-l-primary/10 transition-colors">
                  <p className="text-[10px] text-l-secondary uppercase font-black tracking-[0.2em] mb-1.5 opacity-50">Location</p>
                  <p className="text-sm font-black text-l-on-surface truncate">{job.location_text?.split(',')[0] || "Remote"}</p>
                </div>
              </div>

              <div className={cn(
                "mt-auto pt-6 flex items-center justify-between border-t border-slate-100 group-hover:border-l-primary/10 transition-colors",
                viewMode === "list" && "border-none pt-0 mt-0"
              )}>
                <div className="flex items-center gap-2 text-l-secondary opacity-50 group-hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{formatDistanceToNow(new Date(job.created_at!), { addSuffix: true })}</span>
                </div>
                <button 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="px-6 py-2.5 bg-l-secondary-container text-l-on-secondary-container rounded-xl font-black text-xs uppercase tracking-widest hover:bg-l-primary hover:text-white transition-all shadow-md active:scale-95"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={() => <span className="material-symbols-outlined text-6xl opacity-20">search_off</span>} 
          title="No jobs found" 
          description="Try adjusting your filters or check back later for new technical opportunities." 
        />
      )}

      {/* Load More Section */}
      <div className="flex justify-center py-10">
        <button className="group relative flex items-center gap-4 px-10 py-4 bg-white text-l-on-surface rounded-full font-black text-sm uppercase tracking-widest hover:text-white transition-all shadow-lg hover:shadow-l-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-l-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <span className="relative z-10">Load More Opportunities</span>
          <span className="material-symbols-outlined relative z-10 group-hover:translate-y-1 transition-transform">keyboard_double_arrow_down</span>
        </button>
      </div>

      {/* FAB - Post service quick access */}
      <button className="fixed bottom-10 right-10 w-20 h-20 bg-l-primary text-white rounded-[2rem] shadow-[0_25px_50px_rgba(183,16,42,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-b-8 border-l-primary-container">
        <span className="material-symbols-outlined text-4xl group-hover:rotate-90 transition-transform duration-500">add</span>
        <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] font-black py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Quick Post Service
        </div>
      </button>
    </div>
  );
}


function CustomerJobFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs", user?.id, statusFilter],
    queryFn: async () => {
      let query = supabase.from("jobs").select("*, categories(*)").eq("customer_id", user!.id).order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter as JobStatus);
      const { data } = await query;
      return data ?? [];
    },
    enabled: !!user,
  });

  const filterOptions = ["all", "open", "in_progress", "completed", "cancelled"];

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 bg-l-surface-container-high/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/50">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-500 uppercase tracking-widest",
                statusFilter === opt 
                  ? "bg-white text-l-primary shadow-lg shadow-l-primary/10 scale-[1.02]" 
                  : "text-l-secondary opacity-60 hover:bg-white/50 hover:opacity-100"
              )}
            >
              {opt.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 bg-white text-l-on-surface font-black rounded-xl text-sm shadow-sm hover:bg-l-surface-bright transition-all border-none px-6 uppercase tracking-widest scale-100 active:scale-95">
            <Search className="mr-2 h-4 w-4 opacity-50" />
            Sort by: Newest
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-[2rem]" />)}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="group relative bg-white rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-l-primary/5 ring-1 ring-slate-100 overflow-hidden flex flex-col justify-between hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-0 bg-l-primary group-hover:h-1 transition-all duration-500"></div>
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-l-surface-container-high/50 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {(job as any).categories?.icon || "💼"}
                  </div>
                  <StatusBadge status={job.status} className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" />
                </div>
                <h3 className="text-xl font-black font-l-headline text-l-on-surface mb-2 group-hover:text-l-primary transition-colors tracking-tight line-clamp-1">{job.title}</h3>
                <p className="text-sm text-l-secondary font-medium opacity-60 mb-6 flex items-center gap-2">
                  <span className="font-black text-l-on-surface/80">₹{Number(job.budget_amount)}</span>
                  <span>•</span>
                  <span>{job.application_count} applications</span>
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] font-black text-l-secondary/50 uppercase tracking-widest">Modified {formatDistanceToNow(new Date(job.created_at!), { addSuffix: true })}</span>
                <div className="h-8 w-8 rounded-full bg-l-primary/5 flex items-center justify-center text-l-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="relative bg-white rounded-[3rem] min-h-[550px] flex flex-col items-center justify-center overflow-hidden shadow-sm ring-1 ring-slate-100/50">
          {/* Kinetic Texture Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
            <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gridLarge" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridLarge)" />
            </svg>
          </div>
          
          <div className="relative z-10 text-center max-w-md px-10">
            <div className="mb-10 relative inline-block">
              <div className="absolute inset-0 bg-l-primary/10 blur-[80px] rounded-full transform scale-150 animate-pulse"></div>
              <div className="relative w-36 h-36 bg-l-surface-container-low rounded-[2.5rem] flex items-center justify-center shadow-inner border border-white/40 group">
                <Briefcase className="h-16 w-16 text-l-primary opacity-30 stroke-[1.5] group-hover:scale-110 transition-transform duration-700" />
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-l-on-surface mb-4 tracking-tighter font-l-headline leading-tight">No active jobs yet</h3>
            <p className="text-l-secondary font-medium mb-10 leading-relaxed opacity-60 text-base">
              It looks like you haven't posted any jobs. Create your first listing to start receiving high-quality proposals from our expert freelancers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/jobs/new")}
                className="px-10 py-7 bg-gradient-to-br from-l-primary to-l-primary-container text-white font-black rounded-2xl shadow-xl shadow-l-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 border-none group"
              >
                <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Post your first job
              </Button>
            </div>
          </div>
          
          <div className="absolute bottom-12 left-12 flex items-center gap-4 opacity-30 select-none">
            <div className="w-2 h-2 rounded-full bg-l-primary"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-l-secondary">GigUp Studio Workspace</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  const { activeRole } = useAuth();
  const isCustomer = activeRole === "customer";

  return (
    <AppLayout>
      <main className={cn(
        "min-h-[calc(100vh-80px)] selection:bg-l-primary/30 selection:text-l-on-surface animate-fade-in",
        isCustomer ? "bg-l-surface-container-low p-12" : "bg-l-surface py-10 px-6 md:px-10 lg:px-14"
      )}>
        {/* Header Section (Only for Customers, Worker feed has its own Hero) */}
        {isCustomer && (
          <header className="mb-12">
            <h1 className="text-4xl font-black tracking-tight text-l-on-surface mb-2 font-l-headline">
              Manage your posted jobs
            </h1>
            <p className="text-l-secondary font-medium text-lg opacity-70">
              Track progress, review applications, and manage your active workforce.
            </p>
          </header>
        )}

        {isCustomer ? <CustomerJobFeed /> : <WorkerJobFeed />}

        {/* Secondary Informational Grid (Only for Customers) */}
        {isCustomer && (
          <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
            <div className="bg-white/40 border border-white p-10 rounded-[2rem] backdrop-blur-sm group hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 bg-l-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="text-l-primary h-6 w-6" />
              </div>
              <h4 className="font-black text-l-on-surface text-xl mb-3 font-l-headline tracking-tight">Verified Professionals</h4>
              <p className="text-sm text-l-secondary leading-relaxed font-medium opacity-70">Every freelancer on GigUp undergoes a rigorous 5-step vetting process.</p>
            </div>
            
            <div className="bg-white/40 border border-white p-10 rounded-[2rem] backdrop-blur-sm group hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 bg-l-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="text-l-primary h-6 w-6" />
              </div>
              <h4 className="font-black text-l-on-surface text-xl mb-3 font-l-headline tracking-tight">High Velocity Matching</h4>
              <p className="text-sm text-l-secondary leading-relaxed font-medium opacity-70">Our AI-driven matching engine connects you with the right talent in under 24 hours.</p>
            </div>
            
            <div className="bg-white/40 border border-white p-10 rounded-[2rem] backdrop-blur-sm group hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 bg-l-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-l-primary h-6 w-6" />
              </div>
              <h4 className="font-black text-l-on-surface text-xl mb-3 font-l-headline tracking-tight">Secure Payments</h4>
              <p className="text-sm text-l-secondary leading-relaxed font-medium opacity-70">Funds are held in escrow and only released when you're 100% satisfied with the work.</p>
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  );
}
