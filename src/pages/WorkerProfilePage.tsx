import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase, Calendar, MessageSquare, ArrowLeft, ShieldCheck, Mail, CheckCircle2, User, Sparkles, ImageIcon, GraduationCap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();

  const { data: worker, isLoading } = useQuery({
    queryKey: ["workerProfile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worker_profiles")
        .select(`
          *,
          profiles:user_id (*),
          worker_skills (categories (name)),
          worker_portfolio (id, image_url, caption)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleMessageUser = () => {
    if (!worker || !worker.profiles) return;
    const p = worker.profiles as any;
    navigate(`/messages/direct?with=${p.id}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-[350px] shrink-0"><Skeleton className="h-[500px] rounded-3xl" /></div>
            <div className="flex-1 space-y-6">
              <Skeleton className="h-[200px] rounded-3xl" />
              <Skeleton className="h-[300px] rounded-3xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!worker || !worker.profiles) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-heading font-bold mb-3">Worker Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">The professional you are looking for does not exist or their profile has been removed.</p>
          <Button onClick={() => navigate("/workers")} size="lg" className="rounded-xl px-8">Browse All Workers</Button>
        </div>
      </AppLayout>
    );
  }

  const p = worker.profiles as any;
  const isSelf = user?.id === p.id;
  const showMessageBtn = !isSelf && activeRole === "customer";
  const firstName = p.name?.split(' ')[0] || 'Worker';

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8 relative pb-24 md:pb-10">
        
        <Button variant="ghost" className="mb-2 -ml-3 hover:bg-background/80 hover:backdrop-blur-sm transition-all" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* Left Column - Sticky Profile Card */}
          <div className="w-full md:w-[360px] shrink-0 md:sticky md:top-24 z-10">
            <Card className="overflow-hidden border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl rounded-3xl">
              <div className="h-36 bg-gradient-to-br from-primary via-primary/80 to-purple-600 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
              </div>
              
              <CardContent className="px-6 md:px-8 pb-8 pt-0 relative flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 ring-4 ring-background shadow-2xl absolute -top-16 bg-background rounded-full transition-transform hover:scale-105 duration-500">
                  <AvatarImage src={p.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-4xl font-heading font-bold">
                    {p.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-20 w-full space-y-5">
                  <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">{p.name}</h1>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {p.is_verified && (
                        <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Pro</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="bg-secondary/30 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 transition-colors hover:bg-secondary/50">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500" />
                        <span className="font-bold text-lg leading-none">{p.avg_rating ? Number(p.avg_rating).toFixed(1) : "New"}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{p.total_reviews || 0} Reviews</span>
                    </div>
                    <div className="bg-secondary/30 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 transition-colors hover:bg-secondary/50">
                      <div className="flex items-center gap-1 text-primary">
                        <span className="font-bold text-lg leading-none">
                          {(worker.hourly_rate_min || worker.hourly_rate_max) ? 
                            `$${worker.hourly_rate_min}${worker.hourly_rate_max ? `+` : ''}` : 
                            "TBD"}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Per Hour</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-sm max-w-xs mx-auto text-left">
                    <div className="flex items-center gap-3 text-muted-foreground group">
                      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-medium flex-1 truncate">{p.location_text || "Remote / Unspecified"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground group">
                      <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="font-medium flex-1">{worker.completed_jobs || 0} Completed Jobs</span>
                    </div>
                    {worker.service_radius && (
                      <div className="flex items-center gap-3 text-muted-foreground group">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-medium flex-1 pl-1">Serves within {worker.service_radius}km</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border/40" />

                  {/* Desktop Action Button */}
                  <div className="hidden md:block pt-2">
                    {showMessageBtn ? (
                      <Button 
                        onClick={handleMessageUser} 
                        className="w-full text-base h-14 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold flex items-center justify-center gap-2 overflow-hidden relative group"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></span>
                        <MessageSquare className="h-5 w-5" />
                        Message {firstName}
                      </Button>
                    ) : isSelf ? (
                      <Button onClick={() => navigate("/profile")} variant="outline" className="w-full h-12 rounded-xl font-semibold border-2">
                        Edit My Profile
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 space-y-6 md:space-y-8 min-w-0">
            
            {/* About & Experience section */}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden ring-1 ring-border/50">
                <CardHeader className="pb-4 border-b border-border/30 bg-secondary/10 px-6 md:px-8 py-5">
                  <CardTitle className="text-xl flex items-center gap-2 font-heading">
                    <User className="h-5 w-5 text-primary" />
                    About {firstName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
                    <p className="whitespace-pre-wrap">{p.bio || "This professional hasn't written a biography yet."}</p>
                  </div>
                  
                  {worker.experience_desc && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                        <GraduationCap className="w-5 h-5 text-purple-500" />
                        Professional Experience
                      </h3>
                      <div className="bg-secondary/20 p-5 rounded-2xl border border-border/50 text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                        {worker.experience_desc}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Skills & Expertise
                    </h3>
                    {worker.worker_skills && worker.worker_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {worker.worker_skills.map((skill: any, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 py-1.5 px-4 text-sm font-medium rounded-full transition-colors"
                          >
                            {skill.categories?.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No specific skills listed yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio section */}
              {worker.worker_portfolio && worker.worker_portfolio.length > 0 && (
                <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4 border-b border-border/30 bg-secondary/10 px-6 md:px-8 py-5">
                    <CardTitle className="text-xl flex items-center gap-2 font-heading">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Portfolio Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {worker.worker_portfolio.map((item: any) => (
                        <div key={item.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-sm border border-border/50">
                          <img 
                            src={item.image_url} 
                            alt={item.caption || "Portfolio visual"} 
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                            <p className="text-white text-sm font-medium leading-snug transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                              {item.caption || "Portfolio Item"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Fixed Action Button */}
        {showMessageBtn && (
          <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+70px)] left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent md:hidden z-40 pb-6 pointer-events-none">
            <Button 
              onClick={handleMessageUser} 
              className="w-full text-base h-14 rounded-2xl shadow-[0_8px_30px_rgb(var(--primary)/0.3)] bg-gradient-to-r from-primary to-primary/90 text-white font-bold flex items-center justify-center gap-2 pointer-events-auto"
            >
              <MessageSquare className="h-5 w-5" />
              Message {firstName}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
