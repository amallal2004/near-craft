import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Briefcase, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApplicationsPage() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*, jobs(title, status, categories(name, icon))").eq("worker_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="page-container max-w-5xl mx-auto space-y-6">
        <div className="page-header mb-8">
          <h1 className="text-3xl font-heading font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of your job applications</p>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-2">
            {applications.map((app) => {
              const job = (app as any).jobs;
              return (
                <Link key={app.id} to={`/jobs/${app.job_id}`} className="group block rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/40 hover:-translate-y-0.5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500"></div>
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-lg truncate group-hover:text-primary transition-colors">{job?.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 font-medium">
                          {job?.categories?.icon} {job?.categories?.name}
                        </span>
                        <span>&bull;</span>
                        <span className="font-medium text-foreground/80">Offer: <span className="text-primary">₹{Number(app.offer_price)}</span></span>
                        <span>&bull;</span>
                        <span>{formatDistanceToNow(new Date(app.created_at!), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <StatusBadge status={app.status} type="application" />
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 border border-border/40 bg-card/40">
            <EmptyState icon={Briefcase} title="No applications yet" description="Browse open jobs and submit your first application to get started." actionLabel="Browse Jobs" onAction={() => window.location.href = '/jobs'} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
