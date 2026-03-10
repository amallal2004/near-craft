import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Shield, Users, Briefcase, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, jobs, disputes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);
      return { users: users.count ?? 0, jobs: jobs.count ?? 0, disputes: disputes.count ?? 0 };
    },
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <h1 className="mb-6 text-3xl font-heading font-bold">Admin Panel</h1>
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card><CardContent className="flex items-center gap-4 p-6"><div className="rounded-lg bg-primary/10 p-3"><Users className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-heading font-bold">{stats?.users ?? 0}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><div className="rounded-lg bg-primary/10 p-3"><Briefcase className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Jobs</p><p className="text-2xl font-heading font-bold">{stats?.jobs ?? 0}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><div className="rounded-lg bg-destructive/10 p-3"><AlertTriangle className="h-6 w-6 text-destructive" /></div><div><p className="text-sm text-muted-foreground">Open Disputes</p><p className="text-2xl font-heading font-bold">{stats?.disputes ?? 0}</p></div></CardContent></Card>
        </div>
        <EmptyState icon={Shield} title="Admin features" description="User management, dispute resolution, and category management coming in the next iteration." />
      </div>
    </AppLayout>
  );
}
