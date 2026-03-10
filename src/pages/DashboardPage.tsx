import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, DollarSign, Star, PlusCircle, Search, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatCard({ icon: Icon, label, value, loading }: { icon: any; label: string; value: string | number; loading?: boolean }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and hire workers</p>
        </div>
        <Button asChild><Link to="/jobs/new"><PlusCircle className="mr-2 h-4 w-4" /> Post a Job</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Briefcase} label="Active Jobs" value={activeJobs} loading={isLoading} />
        <StatCard icon={Clock} label="Completed" value={completedJobs} loading={isLoading} />
        <StatCard icon={Users} label="Total Jobs" value={jobs?.length ?? 0} loading={isLoading} />
      </div>
      <div>
        <h2 className="mb-4 text-xl font-heading font-semibold">Recent Jobs</h2>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="block rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{(job as any).categories?.name} · ${Number(job.budget_amount)} · {job.application_count} applications</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            ))}
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
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Find gigs and manage your work</p>
        </div>
        <Button asChild><Link to="/jobs"><Search className="mr-2 h-4 w-4" /> Browse Jobs</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Search} label="Open Gigs" value={openJobsCount ?? 0} loading={false} />
        <StatCard icon={Briefcase} label="Pending Applications" value={activeApps} loading={isLoading} />
        <StatCard icon={Clock} label="Active Jobs" value={acceptedApps} loading={isLoading} />
        <StatCard icon={Star} label="Rating" value={profile?.avg_rating ? Number(profile.avg_rating).toFixed(1) : "N/A"} loading={false} />
      </div>
      <div>
        <h2 className="mb-4 text-xl font-heading font-semibold">Recent Applications</h2>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <Link key={app.id} to={`/jobs/${app.job_id}`} className="block rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{(app as any).jobs?.title}</h3>
                    <p className="text-sm text-muted-foreground">Offer: ${Number(app.offer_price)} · Applied {formatDistanceToNow(new Date(app.created_at!), { addSuffix: true })}</p>
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
