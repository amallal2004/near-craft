import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Search, Shield, Zap, Users, Briefcase, Star } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Search, title: "Post Your Job", desc: "Describe what you need done, set your budget, and post it to local workers." },
  { icon: Users, title: "Get Applications", desc: "Receive offers from verified local workers. Compare profiles, ratings, and prices." },
  { icon: CheckCircle, title: "Get It Done", desc: "Choose the best worker, track progress, and pay securely when satisfied." },
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
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-2xl font-heading font-bold text-primary">GigLocal</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
                <Button asChild><Link to="/signup">Sign up</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="container relative mx-auto px-4 py-24 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-heading font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find Trusted Local Help,{" "}
              <span className="text-primary">Fast</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground lg:text-xl">
              Connect with verified nearby workers for plumbing, cleaning, tutoring, moving, and more. Get things done quickly and reliably.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to={user ? "/jobs/new" : "/signup"}>Hire a Worker <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to={user ? "/jobs" : "/signup"}>Find Gigs</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-heading font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex flex-col items-center text-center rounded-xl bg-card border p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-heading font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-heading font-bold">Popular Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {categories?.map((cat) => (
              <Link key={cat.id} to={user ? `/jobs?category=${cat.slug}` : "/signup"} className="flex flex-col items-center rounded-xl border bg-card p-6 text-center transition-all duration-200 hover:border-primary/50 hover:shadow-md">
                <span className="mb-2 text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-heading font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2 text-lg font-heading font-bold text-foreground">GigLocal</p>
          <p>&copy; {new Date().getFullYear()} GigLocal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
