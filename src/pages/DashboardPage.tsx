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
    <Card className="hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`stat-icon-box ${color}`}>
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-heading font-bold mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function JobListItem({ job, showApplications = false }: { job: any; showApplications?: boolean }) {
  return (
    <Link to={`/jobs/${job.id}`} className="group block rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-card-hover hover:border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-semibold truncate group-hover:text-primary transition-colors">{job.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {(job as any).categories?.icon} {(job as any).categories?.name}
            {showApplications && <> · ${Number(job.budget_amount)} · {job.application_count} applications</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} />
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <h1>Dashboard</h1>
          <p>Manage your jobs and hire workers</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-card">
          <Link to="/jobs/new"><PlusCircle className="mr-2 h-4 w-4" /> Post a Job</Link>
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
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Recent Jobs</h2>
          <Button variant="ghost" size="sm" asChild className="text-primary"><Link to="/jobs">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-2">
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
          <h1>Dashboard</h1>
          <p>Find gigs and manage your work</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-card">
          <Link to="/jobs"><Search className="mr-2 h-4 w-4" /> Browse Jobs</Link>
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
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Recent Applications</h2>
          <Button variant="ghost" size="sm" asChild className="text-primary"><Link to="/applications">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-2">
            {applications.map((app) => (
              <Link key={app.id} to={`/jobs/${app.job_id}`} className="group block rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-card-hover hover:border-primary/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold truncate group-hover:text-primary transition-colors">{(app as any).jobs?.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Offer: ${Number(app.offer_price)} · Applied {formatDistanceToNow(new Date(app.created_at!), { addSuffix: true })}</p>
                  </div>
                  <StatusBadge status={app.status} type="application" />
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
