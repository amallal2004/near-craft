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
      <div className="page-container">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track the status of your job applications</p>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-2">
            {applications.map((app) => {
              const job = (app as any).jobs;
              return (
                <Link key={app.id} to={`/jobs/${app.job_id}`} className="group block rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-card-hover hover:border-primary/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold truncate group-hover:text-primary transition-colors">{job?.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{job?.categories?.icon} {job?.categories?.name} · Offer: ${Number(app.offer_price)} · {formatDistanceToNow(new Date(app.created_at!), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={app.status} type="application" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Briefcase} title="No applications yet" description="Browse open jobs and submit your first application" actionLabel="Browse Jobs" onAction={() => {}} />
        )}
      </div>
    </AppLayout>
  );
}
