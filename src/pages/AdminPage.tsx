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
      <div className="page-container max-w-6xl mx-auto space-y-8">
        <div className="page-header text-center sm:text-left mb-8">
          <h1 className="text-4xl font-heading font-bold">Admin Panel</h1>
          <p className="text-lg text-muted-foreground mt-2">Platform overview and management</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border-none ring-1 ring-border/50">
                <CardContent className="flex items-center gap-5 p-6 relative overflow-hidden">
                  {/* Subtle background glow based on card color */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 ${card.color.includes("destructive") ? "bg-destructive" : "bg-primary"}`}></div>
                  
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.color} shadow-sm z-10`}>
                    <card.icon className={`h-7 w-7 ${card.color.includes("destructive") ? "text-destructive" : "text-primary"}`} />
                  </div>
                  <div className="z-10">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{card.label}</p>
                    <p className="text-3xl font-heading font-bold mt-1 text-foreground">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="glass-card rounded-2xl p-8 border border-border/40 bg-card/40">
          <EmptyState icon={Shield} title="Admin features" description="User management, dispute resolution, and category management coming in the next iteration. For now, you can view the high-level metrics above." />
        </div>
      </div>
    </AppLayout>
  );
}
