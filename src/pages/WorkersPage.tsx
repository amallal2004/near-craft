import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, MapPin, Briefcase, Filter, ArrowRight, User, Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WorkersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("Top Rated");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const { data: workers, isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worker_profiles")
        .select(`
          *,
          profiles:user_id (name, avatar_url, location_text, avg_rating, total_reviews),
          worker_skills (category_id, categories (name))
        `)
        .eq("is_available", true);

      if (error) throw error;
      return data;
    },
  });

  const filteredWorkers = workers?.filter((worker) => {
    const p = worker.profiles as any;
    if (!p) return false;
    
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          worker.experience_desc?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      worker.worker_skills?.some((s: any) => (s as any).category_id === categoryFilter);

    return matchesSearch && matchesCategory;
  }) ?? [];

  return (
    <AppLayout>
      <section className="p-8 md:p-12 max-w-7xl mx-auto w-full animate-fade-in">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-l-on-surface mb-4 font-l-headline">
            Find Your Creative <span className="text-l-primary">Velocity</span>
          </h1>
          <p className="text-l-secondary max-w-2xl text-lg font-l-body leading-relaxed">
            Connect with the top 1% of specialized talent for your next project. Filter by expertise, rating, or rate.
          </p>
        </div>

        {/* Filters & Search (Asymmetric Bento style) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
          <div className="lg:col-span-3 bg-l-surface-container-low p-2 rounded-2xl flex items-center flex-wrap gap-2">
            <Button
              variant={categoryFilter === "all" ? "default" : "ghost"}
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-6 h-11 rounded-xl text-sm font-bold transition-all",
                categoryFilter === "all" 
                  ? "bg-white text-l-on-surface shadow-sm hover:bg-white" 
                  : "text-l-secondary hover:bg-white/50"
              )}
            >
              All Workers
            </Button>
            {categories?.slice(0, 4).map((cat) => (
              <Button
                key={cat.id}
                variant={categoryFilter === cat.id ? "default" : "ghost"}
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "px-6 h-11 rounded-xl text-sm font-bold transition-all",
                  categoryFilter === cat.id 
                    ? "bg-white text-l-on-surface shadow-sm hover:bg-white" 
                    : "text-l-secondary hover:bg-white/50"
                )}
              >
                {cat.name}
              </Button>
            ))}
            
            <div className="ml-auto hidden xl:flex items-center space-x-2 pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-transparent border-none text-sm font-bold text-l-primary focus:ring-0 p-0 h-auto gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl border-slate-100">
                  <SelectItem value="Top Rated">Top Rated</SelectItem>
                  <SelectItem value="Newest">Newest</SelectItem>
                  <SelectItem value="Price: Low to High">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-l-surface-container-low p-2 rounded-2xl flex items-center justify-between px-5 h-[60px] lg:h-auto">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-l-secondary" />
              <span className="text-sm font-bold text-l-on-surface">Advanced Filters</span>
            </div>
            <Badge className="bg-l-primary/10 text-l-primary hover:bg-l-primary/20 border-none px-2.5 py-1 text-[11px] font-black rounded-md">
              {filteredWorkers.length}
            </Badge>
          </div>
        </div>

        {/* Main Content Area with Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-2xl border-none bg-l-surface-container-lowest p-6 shadow-sm overflow-hidden min-h-[300px]">
                <div className="flex justify-between items-start mb-6">
                  <Skeleton className="h-20 w-20 rounded-2xl" />
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-6" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkers.map((worker) => {
              const p = worker.profiles as any;
              const initials = p.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "?";
              
              return (
                <div key={worker.id} className="group bg-l-surface-container-lowest rounded-2xl p-6 transition-all duration-300 hover:bg-l-surface-bright relative border-t-0 hover:border-t-4 border-l-primary overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      {/* Generic Avatar Placeholder */}
                      <div className="w-20 h-20 rounded-2xl bg-l-surface-container-high flex items-center justify-center text-l-primary font-black text-2xl group-hover:scale-105 transition-transform duration-500 shadow-inner">
                        <Avatar className="h-full w-full rounded-2xl">
                          <AvatarFallback className="bg-transparent text-l-primary text-2xl font-black rounded-2xl">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end text-amber-500 mb-1">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-sm font-black ml-1 text-l-on-surface">
                          {p.avg_rating ? Number(p.avg_rating).toFixed(1) : "5.0"}
                        </span>
                        <span className="text-[11px] text-l-secondary ml-1 font-bold">({p.total_reviews || 0})</span>
                      </div>
                      <p className="text-[10px] font-bold text-l-secondary uppercase tracking-tight opacity-70">Availability</p>
                      <p className="text-xs font-black text-l-primary mt-0.5">Full-time</p>
                    </div>
                  </div>

                  <Link to={`/workers/${worker.id}`} className="block">
                    <h3 className="text-xl font-extrabold text-l-on-surface mb-1 font-l-headline group-hover:text-l-primary transition-colors truncate">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-l-secondary font-medium mb-4 leading-relaxed line-clamp-2 min-h-[40px]">
                    {worker.experience_desc || "Professional worker ready to help with your project."}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {worker.worker_skills?.slice(0, 3).map((s: any, i: number) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="bg-l-surface-container-high text-l-on-secondary-container text-[11px] font-bold rounded-full border-none px-3 py-1 shadow-sm"
                      >
                        {s.categories?.name}
                      </Badge>
                    ))}
                    {worker.worker_skills && worker.worker_skills.length > 3 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-l-surface-container-high text-l-on-secondary-container text-[11px] font-bold rounded-full border-none px-3 py-1 shadow-sm"
                      >
                        +{worker.worker_skills.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100/60 mt-auto">
                    <div>
                      <span className="text-2xl font-black text-l-on-surface tracking-tight">
                        ${worker.hourly_rate_min || "45"}
                      </span>
                      <span className="text-[10px] text-l-secondary font-black ml-1 uppercase">/hr</span>
                    </div>
                    <Button 
                      asChild
                      className="bg-gradient-to-br from-l-primary to-l-primary-container text-white px-6 h-11 rounded-xl font-bold text-sm shadow-lg shadow-l-primary/20 hover:scale-[1.02] transition-transform active:scale-95 border-none"
                    >
                      <Link to={`/workers/${worker.id}`}>Hire Now</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            icon={Search} 
            title="No workers found" 
            description="Try adjusting your search or category filter to find more workers."
          />
        )}

        {/* Pagination Section */}
        <div className="mt-16 flex flex-col items-center animate-fade-in">
          <Button variant="ghost" className="flex items-center space-x-2 text-l-on-surface font-bold hover:text-l-primary transition-colors mb-6 group">
            <span className="tracking-tight">Load more professionals</span>
            <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-l-primary ring-4 ring-l-primary/20"></div>
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
