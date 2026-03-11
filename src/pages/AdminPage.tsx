import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Shield, Users, Briefcase, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

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

  const cards = [
    { icon: Users, label: "Total Users", value: stats?.users ?? 0, color: "bg-accent" },
    { icon: Briefcase, label: "Total Jobs", value: stats?.jobs ?? 0, color: "bg-accent" },
    { icon: AlertTriangle, label: "Open Disputes", value: stats?.disputes ?? 0, color: "bg-destructive/10" },
  ];

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Platform overview and management</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-card-hover transition-shadow duration-200">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                    <card.icon className={`h-6 w-6 ${card.color.includes("destructive") ? "text-destructive" : "text-accent-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-heading font-bold mt-0.5">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <EmptyState icon={Shield} title="Admin features" description="User management, dispute resolution, and category management coming in the next iteration." />
      </div>
    </AppLayout>
  );
}
