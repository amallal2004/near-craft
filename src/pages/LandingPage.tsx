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
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-foreground">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/5 blur-[100px] mix-blend-screen" />
        <div className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-500/5 blur-[100px] mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-heading font-bold text-lg shadow-lg shadow-primary/20">G</div>
            <span className="text-2xl font-heading font-bold tracking-tight">GigLocal</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Button size="lg" asChild className="rounded-full px-8 shadow-card hover:shadow-card-hover transition-all"><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" size="lg" asChild className="rounded-full font-medium"><Link to="/login">Log in</Link></Button>
                <Button size="lg" asChild className="rounded-full px-8 font-medium shadow-card hover:shadow-card-hover transition-all"><Link to="/signup">Sign up</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: "easeOut" }} className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-xl px-5 py-2 text-sm font-medium shadow-lg hover:bg-card/80 transition-colors cursor-default">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>The #1 local service marketplace</span>
            </div>
            <h1 className="mb-8 text-5xl font-heading font-bold tracking-tight sm:text-7xl lg:text-8xl leading-tight">
              Trusted help, <br className="hidden sm:block" />
              <span className="gradient-text">on demand.</span>
            </h1>
            <p className="mb-12 text-lg text-muted-foreground lg:text-2xl leading-relaxed max-w-2xl mx-auto font-light">
              Connect with verified local professionals for any task. Seamless, secure, and lightning fast.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-14 rounded-full px-10 text-lg shadow-elevated transition-transform hover:scale-105" asChild>
                <Link to={user ? "/jobs/new" : "/signup"}>Hire a Worker <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 rounded-full px-10 text-lg border-border/50 backdrop-blur-sm bg-background/50 transition-transform hover:scale-105 hover:bg-background/80" asChild>
                <Link to={user ? "/jobs" : "/signup"}>Browse Gigs</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-card/30 backdrop-blur-xl z-10 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center py-12 border-r border-border/40 last:border-r-0 border-b md:border-b-0">
                <p className="text-4xl font-heading font-bold gradient-text mb-2">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 lg:py-32 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6">Designed for simplicity</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">Get started in minutes and experience the future of local services.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-card p-10 group">
                <span className="text-7xl font-heading font-black text-primary/[0.03] absolute top-6 right-6 transition-transform group-hover:scale-110">{step.step}</span>
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-inner">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-4 text-2xl font-heading font-semibold">{step.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-24 lg:py-32 border-y border-border/40 bg-card/20 backdrop-blur-xl relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-heading font-bold">Popular Categories</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 max-w-5xl mx-auto">
              {categories.map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link to={user ? `/jobs?category=${cat.slug}` : "/signup"} className="flex flex-col items-center glass-card p-6 text-center group h-full justify-center gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300 group-hover:-translate-y-1">{cat.icon}</span>
                    <span className="text-sm font-semibold tracking-wide">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-24 lg:py-32 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6">Engineered for trust</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">Every aspect of GigLocal is designed to give you peace of mind.</p>
          </div>
          <div className="grid gap-10 md:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="mb-8 mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary/50 border border-border">
                  <feat.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-4 text-2xl font-heading font-semibold">{feat.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative z-10 px-6">
        <div className="container mx-auto">
          <div className="relative rounded-[2.5rem] bg-card border border-border/50 p-12 lg:p-24 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-purple-500/20 opacity-50" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-8">Ready to transform how you work?</h2>
              <p className="text-xl text-muted-foreground mb-12 font-light">Join the growing community of professionals and customers building the future of local services.</p>
              <Button size="lg" className="rounded-full px-12 h-16 text-lg shadow-elevated transition-transform hover:scale-105" asChild>
                <Link to={user ? "/dashboard" : "/signup"}>Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 relative z-10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">G</div>
            <span className="text-xl font-heading font-bold">GigLocal</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} GigLocal. Built with precision.</p>
        </div>
      </footer>
    </div>
  );
}
