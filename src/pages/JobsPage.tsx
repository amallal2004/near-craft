import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, DollarSign, Clock, Briefcase, PlusCircle, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { JobStatus } from "@/lib/types";

function WorkerJobFeed() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") ?? "all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => { const { data } = await supabase.from("categories").select("*").order("sort_order"); return data ?? []; },
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["open-jobs", search, categoryFilter, urgencyFilter],
    queryFn: async () => {
      let query = supabase.from("jobs").select("*, categories(*)").eq("status", "open").order("created_at", { ascending: false });
      if (categoryFilter !== "all") {
        const cat = categories?.find(c => c.slug === categoryFilter);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (urgencyFilter !== "all") query = query.eq("urgency", urgencyFilter as "low" | "medium" | "urgent");
      const { data } = await query;
      let result = data ?? [];
      if (search) result = result.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase()));
      return result;
    },
    enabled: !!categories,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-10 rounded-xl h-11" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 rounded-xl h-11"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((c) => <SelectItem key={c.id} value={c.slug}>{c.icon} {c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-36 rounded-xl h-11"><SelectValue placeholder="Urgency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}</div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="group glass-card p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/80">
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold tracking-wide uppercase">
                  {(job as any).categories?.icon} {(job as any).categories?.name}
                </span>
                <StatusBadge status={job.urgency} type="urgency" />
              </div>
              <h3 className="mb-3 text-xl font-heading font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
              <p className="mb-5 text-sm text-muted-foreground line-clamp-2 leading-relaxed font-light">{job.description}</p>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground"><DollarSign className="h-4 w-4 text-muted-foreground" />₹{Number(job.budget_amount)} {job.budget_type === "hourly" ? "/hr" : "fixed"}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location_text}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatDistanceToNow(new Date(job.created_at!), { addSuffix: true })}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{job.application_count} apps</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} title="No jobs found" description="Try adjusting your filters or check back later" />
      )}
    </div>
  );
}

function CustomerJobFeed() {
  const { user } = useAuth();
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

  return (
    <div className="space-y-6">
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
          <TabsTrigger value="open" className="rounded-lg">Open</TabsTrigger>
          <TabsTrigger value="in_progress" className="rounded-lg">In Progress</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="group block glass-card p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/80">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-heading font-semibold truncate group-hover:text-primary transition-colors">{job.title}</h3>
                  <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center p-1 rounded-md bg-secondary text-secondary-foreground">{(job as any).categories?.icon}</span>
                    {(job as any).categories?.name}
                    <span className="text-muted-foreground/50 text-xs px-2">•</span>
                    <span className="font-semibold text-foreground">₹{Number(job.budget_amount)}</span>
                    <span className="text-muted-foreground/50 text-xs px-2">•</span>
                    <span className="text-primary-glow">{job.application_count} applications</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={job.status} />
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={Briefcase} title="No jobs yet" description="Post your first job to get started" actionLabel="Post a Job" onAction={() => {}} />
      )}
    </div>
  );
}

export default function JobsPage() {
  const { activeRole } = useAuth();
  return (
    <AppLayout>
      <div className="page-container max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="page-header mb-0">
            <h1 className="text-4xl font-heading font-bold">{activeRole === "worker" ? "Browse Jobs" : "My Jobs"}</h1>
            <p className="text-lg text-muted-foreground mt-2">{activeRole === "worker" ? "Find gigs near you" : "Manage your posted jobs"}</p>
          </div>
          {activeRole === "customer" && (
            <Button size="lg" asChild className="rounded-full px-8 shadow-elevated hover:scale-105 transition-transform"><Link to="/jobs/new"><PlusCircle className="mr-2 h-5 w-5" /> Post a Job</Link></Button>
          )}
        </div>
        {activeRole === "worker" ? <WorkerJobFeed /> : <CustomerJobFeed />}
      </div>
    </AppLayout>
  );
}
