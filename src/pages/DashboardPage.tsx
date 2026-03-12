import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Star, PlusCircle, Search, Clock, Users, TrendingUp, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

function StatCard({ icon: Icon, label, value, loading, color = "bg-accent" }: { icon: any; label: string; value: string | number; loading?: boolean; color?: string }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <Card className="glass-card hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="flex items-center gap-5 p-6">
        <div className={`stat-icon-box ${color}`}>
          <Icon className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-heading font-bold mt-1 text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function JobListItem({ job, showApplications = false }: { job: any; showApplications?: boolean }) {
  return (
    <Link to={`/jobs/${job.id}`} className="group block glass-card p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/80">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-heading font-semibold truncate group-hover:text-primary transition-colors">{job.title}</h3>
          <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 rounded-md bg-secondary text-secondary-foreground">{job.categories?.icon}</span>
            {job.categories?.name}
            {showApplications && <span className="text-muted-foreground/50 text-xs px-2">•</span>}
            {showApplications && <span className="font-semibold text-foreground">₹{Number(job.budget_amount)}</span>}
            {showApplications && <span className="text-muted-foreground/50 text-xs px-2">•</span>}
            {showApplications && <span className="text-primary-glow">{job.application_count} applications</span>}
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
  );
}

function CustomerDashboard() {
  const { user } = useAuth();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs-dashboard", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*, categories(*)").eq("customer_id", user!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  const activeJobs = jobs?.filter((j) => ["open", "assigned", "in_progress", "pending_review"].includes(j.status)).length ?? 0;
  const completedJobs = jobs?.filter((j) => j.status === "completed").length ?? 0;

  return (
    <div className="page-container space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="text-4xl font-heading font-bold">Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">Manage your jobs and hire workers</p>
        </div>
        <Button size="lg" asChild className="rounded-full px-8 shadow-elevated hover:scale-105 transition-transform">
          <Link to="/jobs/new"><PlusCircle className="mr-2 h-5 w-5" /> Post a Job</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard icon={Briefcase} label="Active Jobs" value={activeJobs} loading={isLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard icon={Clock} label="Completed" value={completedJobs} loading={isLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard icon={TrendingUp} label="Total Jobs" value={jobs?.length ?? 0} loading={isLoading} />
        </motion.div>
      </div>
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-semibold tracking-tight">Recent Jobs</h2>
          <Button variant="ghost" className="text-primary hover:text-primary-glow font-medium group" asChild>
            <Link to="/jobs">View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => <JobListItem key={job.id} job={job} showApplications />)}
          </div>
        ) : (
          <EmptyState icon={Briefcase} title="No jobs yet" description="Post your first job to get started" actionLabel="Post a Job" onAction={() => {}} />
        )}
      </div>
    </div>
  );
}

function WorkerDashboard() {
  const { user, profile } = useAuth();
  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications-dashboard", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*, jobs(*, categories(*))").eq("worker_id", user!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: openJobsCount } = useQuery({
    queryKey: ["open-jobs-count"],
    queryFn: async () => {
      const { count } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "open");
      return count ?? 0;
    },
  });

  const activeApps = applications?.filter((a) => a.status === "pending").length ?? 0;
  const acceptedApps = applications?.filter((a) => a.status === "accepted").length ?? 0;

  return (
    <div className="page-container space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="text-4xl font-heading font-bold">Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">Find gigs and manage your work</p>
        </div>
        <Button size="lg" asChild className="rounded-full px-8 shadow-elevated hover:scale-105 transition-transform">
          <Link to="/jobs"><Search className="mr-2 h-5 w-5" /> Browse Jobs</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard icon={Search} label="Open Gigs" value={openJobsCount ?? 0} loading={false} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard icon={Briefcase} label="Pending" value={activeApps} loading={isLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard icon={Clock} label="Active Jobs" value={acceptedApps} loading={isLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard icon={Star} label="Rating" value={profile?.avg_rating ? Number(profile.avg_rating).toFixed(1) : "N/A"} loading={false} />
        </motion.div>
      </div>
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-semibold tracking-tight">Recent Applications</h2>
          <Button variant="ghost" className="text-primary hover:text-primary-glow font-medium group" asChild>
            <Link to="/applications">View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Link key={app.id} to={`/jobs/${app.job_id}`} className="group block glass-card p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-heading font-semibold truncate group-hover:text-primary transition-colors">{(app as any).jobs?.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-2">
                      <span className="font-semibold text-foreground">Offer: ₹{Number(app.offer_price)}</span>
                      <span className="text-muted-foreground/50 text-xs px-2">•</span>
                      <span>Applied {formatDistanceToNow(new Date(app.created_at!), { addSuffix: true })}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} type="application" />
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={Briefcase} title="No applications yet" description="Browse open jobs and submit your first application" actionLabel="Browse Jobs" onAction={() => {}} />
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { activeRole } = useAuth();
  return (
    <AppLayout>
      {activeRole === "worker" ? <WorkerDashboard /> : <CustomerDashboard />}
    </AppLayout>
  );
}
