import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Search, Users, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Search, title: "Post Your Job", desc: "Describe what you need done, set your budget, and post it to local workers.", step: "01" },
  { icon: Users, title: "Get Applications", desc: "Receive offers from verified local workers. Compare profiles, ratings, and prices.", step: "02" },
  { icon: CheckCircle, title: "Get It Done", desc: "Choose the best worker, track progress, and pay securely when satisfied.", step: "03" },
];

const features = [
  { icon: ShieldCheck, title: "Verified Workers", desc: "Every worker is verified for your safety and peace of mind." },
  { icon: Zap, title: "Lightning Fast", desc: "Post a job and start receiving offers within minutes." },
  { icon: Sparkles, title: "Quality Guaranteed", desc: "Built-in reviews and ratings ensure top-quality service." },
];

const stats = [
  { value: "10K+", label: "Jobs Completed" },
  { value: "5K+", label: "Verified Workers" },
  { value: "4.8", label: "Average Rating" },
  { value: "50+", label: "Service Categories" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">G</div>
            <span className="text-xl font-heading font-bold">GigLocal</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild className="rounded-full px-6"><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="rounded-full"><Link to="/login">Log in</Link></Button>
                <Button asChild className="rounded-full px-6"><Link to="/signup">Sign up</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute top-20 -left-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 -right-32 h-80 w-80 rounded-full bg-primary-glow/5 blur-3xl" />
        <div className="container relative mx-auto px-4 py-24 lg:py-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium shadow-card">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Trusted by 10,000+ users</span>
            </div>
            <h1 className="mb-6 text-4xl font-heading font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find Trusted Local Help,{" "}
              <span className="gradient-text">Fast</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Connect with verified nearby workers for plumbing, cleaning, tutoring, moving, and more. Get things done quickly and reliably.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-13 rounded-full px-8 text-base shadow-elevated" asChild>
                <Link to={user ? "/jobs/new" : "/signup"}>Hire a Worker <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-13 rounded-full px-8 text-base" asChild>
                <Link to={user ? "/jobs" : "/signup"}>Find Gigs</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center py-10 border-r last:border-r-0 border-b md:border-b-0">
                <p className="text-3xl font-heading font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">How it works</p>
            <h2 className="text-3xl font-heading font-bold sm:text-4xl">Three simple steps</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative rounded-2xl bg-card border p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300">
                <span className="text-5xl font-heading font-extrabold text-primary/10 absolute top-4 right-6">{step.step}</span>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <step.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-heading font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-24 bg-card border-y">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Categories</p>
              <h2 className="text-3xl font-heading font-bold sm:text-4xl">Popular Services</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 max-w-4xl mx-auto">
              {categories.map((cat) => (
                <Link key={cat.id} to={user ? `/jobs?category=${cat.slug}` : "/signup"} className="flex flex-col items-center rounded-xl border bg-background p-5 text-center transition-all duration-200 hover:shadow-card-hover hover:border-primary/30 group">
                  <span className="mb-2 text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">Why GigLocal</p>
            <h2 className="text-3xl font-heading font-bold sm:text-4xl">Built for trust & speed</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {features.map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-8">
                <div className="mb-5 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                  <feat.icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-heading font-semibold">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl bg-primary p-12 lg:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-glow opacity-90" />
            <div className="relative">
              <h2 className="text-3xl font-heading font-bold text-primary-foreground sm:text-4xl mb-4">Ready to get started?</h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">Join thousands of users finding and providing local services every day.</p>
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-13 text-base font-semibold" asChild>
                <Link to={user ? "/dashboard" : "/signup"}>Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-heading font-bold text-xs">G</div>
            <span className="text-lg font-heading font-bold">GigLocal</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} GigLocal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
