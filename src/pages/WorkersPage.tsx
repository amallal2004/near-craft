import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, MapPin, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
    const p = worker.profiles;
    if (!p) return false;
    
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          worker.experience_desc?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      worker.worker_skills?.some((s: any) => s.category_id === categoryFilter);

    return matchesSearch && matchesCategory;
  }) ?? [];

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Browse Workers</h1>
          <p className="text-muted-foreground">Find the best local professionals for your needs.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name or skills..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-background/50 border-primary/20 focus-visible:ring-primary/40 focus-visible:border-primary/40"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl bg-background/50 border-primary/20">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="overflow-hidden border-border/40">
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => {
              const p = worker.profiles as any;
              return (
                <Link key={worker.id} to={`/workers/${worker.id}`} className="block group">
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/40 bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-16 w-16 ring-2 ring-background border shadow-sm">
                          <AvatarImage src={p.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                            {p.name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-foreground">{p.avg_rating ? Number(p.avg_rating).toFixed(1) : "New"}</span>
                            <span>({p.total_reviews || 0})</span>
                          </div>
                          {(worker.hourly_rate_min || worker.hourly_rate_max) && (
                            <p className="text-sm font-medium mt-1">
                              ${worker.hourly_rate_min}{worker.hourly_rate_max && ` - $${worker.hourly_rate_max}`}/hr
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {p.location_text && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{p.location_text}</span>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {worker.experience_desc || "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {worker.worker_skills?.slice(0, 3).map((s: any, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-secondary/50 font-normal">
                            {s.categories?.name}
                          </Badge>
                        ))}
                        {worker.worker_skills && worker.worker_skills.length > 3 && (
                          <Badge variant="secondary" className="bg-secondary/50 font-normal">
                            +{worker.worker_skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
      </div>
    </AppLayout>
  );
}
