import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Briefcase,
  Star,
  PlusCircle,
  Search,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
  Check,
  Zap,
  Rocket,
  Wallet,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Customer helpers ────────────────────────────────────────────────────────

function JobListItem({ job, showApplications = false }: { job: any; showApplications?: boolean }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block bg-white border border-slate-100 p-6 transition-all duration-300 rounded-xl hover:shadow-lg hover:border-l-primary/10 relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-l-primary group-hover:text-white transition-all">
            <span className="material-symbols-outlined">{job.categories?.icon || "work"}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-l-primary transition-colors">{job.title}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-bold text-l-primary">₹{Number(job.budget_amount).toLocaleString()}</span>
              {showApplications && <span className="text-slate-300">•</span>}
              {showApplications && <span>{job.application_count || 0} applications</span>}
            </p>
          </div>
        </div>
        <StatusBadge status={job.status as any} />
      </div>
    </Link>
  );
}

// ─── Customer Dashboard ───────────────────────────────────────────────────────

function CustomerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs-dashboard", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*, categories(*)")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return (data as any[]) ?? [];
    },
    enabled: !!user,
  });

  const activeJobs = jobs?.filter((j) => ["open", "assigned", "in_progress", "pending_review"].includes(j.status)).length ?? 0;
  const completedJobs = jobs?.filter((j) => j.status === "completed").length ?? 0;
  const totalReviews = profile?.total_reviews || 0;

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.header variants={itemVariants} className="mb-12">
          <h2 className="text-4xl font-extrabold text-l-on-surface tracking-tight mb-2 font-heading">Dashboard</h2>
          <p className="text-slate-500 font-medium font-body">Manage your jobs and hire workers</p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div variants={itemVariants} className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-transparent hover:border-l-primary transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-slate-300 font-bold text-xs tracking-widest uppercase">Live Now</span>
            </div>
            <p className="text-4xl font-extrabold text-l-on-surface mb-1 font-heading">{isLoading ? "..." : activeJobs}</p>
            <p className="text-slate-500 text-sm font-medium">Active Jobs</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-transparent hover:border-l-primary transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <Check className="h-6 w-6" />
              </div>
              <span className="text-slate-300 font-bold text-xs tracking-widest uppercase">Archive</span>
            </div>
            <p className="text-4xl font-extrabold text-l-on-surface mb-1 font-heading">{isLoading ? "..." : completedJobs}</p>
            <p className="text-slate-500 text-sm font-medium">Completed</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-transparent hover:border-l-primary transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6" />
              </div>
              <span className="text-slate-300 font-bold text-xs tracking-widest uppercase">Investment</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-extrabold text-l-on-surface mb-1 font-heading">{totalReviews}</p>
              <span className="text-slate-400 font-bold text-sm uppercase">Reviews</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Reviews</p>
          </motion.div>
        </div>

        <motion.section variants={itemVariants} className="bg-l-surface-container-low rounded-2xl p-8 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-l-on-surface font-heading">Recent Jobs</h3>
            <Link to="/jobs" className="text-l-primary font-bold text-sm hover:underline flex items-center gap-1 group">
              View all
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {!jobs || jobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                <Search className="h-14 w-14 text-slate-200" />
                <div className="absolute -bottom-2 -right-2 p-3 bg-white rounded-full shadow-lg">
                  <Star className="h-6 w-6 text-l-primary" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-l-on-surface mb-2 font-heading">No jobs yet</h4>
              <p className="text-slate-500 mb-8 font-medium">You haven't posted any jobs for workers to apply to. Start building your team today.</p>
              <Button
                onClick={() => navigate("/jobs/new")}
                className="bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white px-8 py-4 h-auto rounded-xl font-bold flex items-center gap-3 shadow-xl shadow-l-primary/30 hover:scale-105 transition-transform border-none"
              >
                <PlusCircle className="h-5 w-5" />
                Post your first job
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <JobListItem key={job.id} job={job} showApplications={true} />
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}

// ─── Payout Banner (light-theme dark card, matching template) ─────────────────

const PayoutBanner = () => {
  const { profile, session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      if (!session?.access_token) throw new Error("You must be logged in to connect your account.");
      const { data, error } = await supabase.functions.invoke("create-connect-account", {
        body: {
          returnUrl: window.location.origin + "/dashboard",
          refreshUrl: window.location.origin + "/dashboard",
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to start Stripe onboarding";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.payouts_enabled) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center gap-4">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <Check className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900 text-sm">Stripe Connected</p>
          <p className="text-slate-500 text-xs mt-0.5">Your account is verified and ready to receive payouts.</p>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full">Active</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-l-on-surface rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-l-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="relative z-10 space-y-1.5 text-center md:text-left">
        <h3 className="font-heading text-xl font-bold text-white">
          Enable Payouts via <span className="text-[#635BFF]">Stripe</span>
        </h3>
        <p className="text-slate-300 text-sm max-w-md leading-relaxed">
          To begin receiving earnings from your completed gigs, connect a verified payout method. It only takes a minute.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-3">
        <button
          onClick={handleConnectStripe}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-br from-l-primary to-l-primary-container text-white rounded-lg font-bold shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
          <span>Set Up Payouts</span>
        </button>
        <button className="px-6 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
};

// ─── Light Stat Card (matches template's white card style) ────────────────────

interface LightStatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  badge?: React.ReactNode;
}

function LightStatCard({ icon, iconBg, iconColor, label, value, badge }: LightStatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-xl shadow-sm group hover:shadow-md border-t-4 border-transparent hover:border-l-primary transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-lg group-hover:scale-110 transition-transform duration-300", iconBg, iconColor)}>
          {icon}
        </div>
        {badge}
      </div>
      <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-heading font-extrabold text-l-on-surface">{value}</p>
    </motion.div>
  );
}

// ─── Light Application / Offer Card ──────────────────────────────────────────

function OfferCard({ app }: { app: any }) {
  const job = app.jobs;

  const statusStyle: Record<string, string> = {
    pending: "text-amber-600 bg-amber-50",
    accepted: "text-emerald-600 bg-emerald-50",
    rejected: "text-red-600 bg-red-50",
  };

  return (
    <Link
      to={`/jobs/${app.job_id}`}
      className="group bg-white border border-slate-100 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md hover:border-l-primary/20 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-l-primary group-hover:text-white transition-all flex-shrink-0">
          <span className="material-symbols-outlined text-xl">{job?.categories?.icon || "work"}</span>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 group-hover:text-l-primary transition-colors">{job?.title ?? "—"}</h4>
          <p className="text-xs font-bold text-l-primary uppercase tracking-widest mt-0.5">
            Offer: ₹{Number(app.offer_price).toLocaleString()}
          </p>
        </div>
      </div>
      <span className={cn("text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex-shrink-0", statusStyle[app.status] ?? "text-slate-500 bg-slate-100")}>
        {app.status}
      </span>
    </Link>
  );
}

// ─── Worker Dashboard ─────────────────────────────────────────────────────────

function WorkerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications-dashboard", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("*, jobs(*, categories(*))")
        .eq("worker_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(6);
      return (data as any[]) ?? [];
    },
    enabled: !!user,
  });

  const { data: openJobsCount } = useQuery({
    queryKey: ["open-jobs-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      return count ?? 0;
    },
  });

  const pendingApps = applications?.filter((a) => a.status === "pending").length ?? 0;
  const acceptedApps = applications?.filter((a) => a.status === "accepted").length ?? 0;
  const avgRating = profile?.avg_rating ? Number(profile.avg_rating).toFixed(1) : "—";
  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">

        {/* ── Welcome Header ─────────────────────────────────────────────── */}
        <motion.header variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Available for Work</span>
          </div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-l-on-surface">
            Welcome back, <span className="text-l-primary">{firstName}</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed opacity-80">
            {pendingApps > 0
              ? `You have ${pendingApps} pending offer${pendingApps > 1 ? "s" : ""} that need${pendingApps === 1 ? "s" : ""} your immediate attention.`
              : "Browse new gigs and grow your freelance portfolio today."}
          </p>
        </motion.header>

        {/* ── Payout Banner ─────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <PayoutBanner />
        </motion.div>

        {/* ── Stats Grid — 4 cards matching the template ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LightStatCard
            icon={<Zap className="h-5 w-5" style={{ fill: "currentColor" }} />}
            iconBg="bg-red-50"
            iconColor="text-l-primary"
            label="Available Gigs"
            value={openJobsCount ?? 0}
            badge={
              <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Live
              </span>
            }
          />
          <LightStatCard
            icon={<Clock className="h-5 w-5" style={{ fill: "currentColor", fillOpacity: 0 }} />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            label="Pending Offers"
            value={isLoading ? "..." : String(pendingApps).padStart(2, "0")}
            badge={
              <span className="text-slate-400 font-bold text-xs">Awaiting action</span>
            }
          />
          <LightStatCard
            icon={<Check className="h-5 w-5" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Successful Gigs"
            value={isLoading ? "..." : acceptedApps}
            badge={
              <span className="text-blue-500 font-bold text-xs flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Verified
              </span>
            }
          />
          <LightStatCard
            icon={<Star className="h-5 w-5" style={{ fill: "currentColor" }} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            label="Impact Score"
            value={avgRating}
            badge={
              <span className="text-purple-500 font-bold text-xs">
                {profile?.total_reviews ?? 0} reviews
              </span>
            }
          />
        </div>

        {/* ── Recent Offers Section ──────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-l-on-surface">
              Recent Offers{" "}
              {!isLoading && applications && applications.length > 0 && (
                <span className="text-slate-400 font-normal text-lg ml-1">({applications.length})</span>
              )}
            </h2>
            <Link
              to="/applications"
              className="text-l-primary font-bold text-sm flex items-center gap-1 hover:underline group"
            >
              Explore all opportunities
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {!applications || applications.length === 0 ? (
            <div className="bg-l-surface-container-low rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner mb-2">
                <Briefcase className="h-9 w-9 text-slate-300" />
              </div>
              <h4 className="font-heading text-xl font-bold text-l-on-surface">No offers sent yet</h4>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                Start browsing available gigs and send your first offer to get hired.
              </p>
              <Button
                onClick={() => navigate("/jobs")}
                className="bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white px-8 py-4 h-auto rounded-xl font-bold flex items-center gap-3 shadow-xl shadow-l-primary/30 hover:scale-105 transition-transform border-none"
              >
                <Search className="h-4 w-4" />
                Discover Opportunities
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {applications.map((app) => (
                <OfferCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Performance Roadmap ────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="bg-l-surface-container-low/50 border-2 border-dashed border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
            <Rocket className="h-9 w-9 text-slate-300" />
          </div>
          <h4 className="font-heading text-xl font-bold text-l-on-surface">Your Performance Roadmap</h4>
          <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
            Complete 5 more gigs this month to unlock the{" "}
            <span className="text-l-primary font-bold">'Elite Pro'</span> status and gain access to high-budget private offers.
          </p>
          <Button
            variant="ghost"
            className="text-l-primary font-bold hover:text-l-primary hover:bg-l-primary/5 rounded-xl"
            onClick={() => navigate("/applications")}
          >
            View Progress Details
          </Button>
        </motion.div>

      </motion.div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { activeRole } = useAuth();
  return <AppLayout>{activeRole === "worker" ? <WorkerDashboard /> : <CustomerDashboard />}</AppLayout>;
}
