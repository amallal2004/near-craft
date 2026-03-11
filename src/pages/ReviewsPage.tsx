import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function ReviewsPage() {
  const { user } = useAuth();

  const { data: received, isLoading: loadingReceived } = useQuery({
    queryKey: ["reviews-received", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*, profiles!reviews_reviewer_id_fkey(name, avatar_url), jobs(title)").eq("reviewee_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: given, isLoading: loadingGiven } = useQuery({
    queryKey: ["reviews-given", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*, profiles!reviews_reviewee_id_fkey(name, avatar_url), jobs(title)").eq("reviewer_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const ReviewCard = ({ review }: { review: any }) => {
    const profile = (review as any).profiles;
    return (
      <div className="glass-card rounded-2xl border border-border/40 p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 group mb-4">
        <div className="flex items-start gap-5">
          <Avatar className="h-12 w-12 ring-2 ring-border/50 group-hover:ring-primary/20 transition-all shadow-sm">
            <AvatarImage src={profile?.avatar_url} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-accent to-accent-foreground/20 text-accent-foreground font-bold">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 p-0.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">{profile?.name ?? "User"}</p>
              <span className="text-xs font-medium text-muted-foreground shrink-0 bg-secondary/50 px-2 py-0.5 rounded-md">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
            </div>
            <Link to={`/jobs/${review.job_id}`} className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors uppercase tracking-wider block mb-2">{(review as any).jobs?.title}</Link>
            <StarRating rating={review.rating} size={16} className="mt-1" />
            <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto space-y-6">
        <div className="page-header mb-8">
          <h1 className="text-3xl font-heading font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">See what others are saying about you</p>
        </div>
        <Tabs defaultValue="received">
          <TabsList className="rounded-xl">
            <TabsTrigger value="received" className="rounded-lg">Received</TabsTrigger>
            <TabsTrigger value="given" className="rounded-lg">Given</TabsTrigger>
          </TabsList>
          <TabsContent value="received" className="mt-8 space-y-4">
            {loadingReceived ? [1,2].map(i => <CardSkeleton key={i} />) : received && received.length > 0 ? received.map(r => <ReviewCard key={r.id} review={r} />) : (
                <div className="glass-card rounded-2xl p-12 border border-border/40 bg-card/40">
                  <EmptyState icon={Star} title="No reviews received yet" description="Complete jobs to start receiving reviews" />
                </div>
            )}
          </TabsContent>
          <TabsContent value="given" className="mt-8 space-y-4">
            {loadingGiven ? [1,2].map(i => <CardSkeleton key={i} />) : given && given.length > 0 ? given.map(r => <ReviewCard key={r.id} review={r} />) : (
                <div className="glass-card rounded-2xl p-12 border border-border/40 bg-card/40">
                  <EmptyState icon={Star} title="No reviews given yet" description="Leave reviews after completing jobs" />
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
