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
      <div className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-border">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-sm">{profile?.name?.charAt(0) ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading font-semibold">{profile?.name}</p>
              <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
            </div>
            <Link to={`/jobs/${review.job_id}`} className="text-xs text-primary hover:underline font-medium">{(review as any).jobs?.title}</Link>
            <StarRating rating={review.rating} size={14} className="mt-2" />
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header">
          <h1>Reviews</h1>
          <p>See what others are saying about you</p>
        </div>
        <Tabs defaultValue="received">
          <TabsList className="rounded-xl">
            <TabsTrigger value="received" className="rounded-lg">Received</TabsTrigger>
            <TabsTrigger value="given" className="rounded-lg">Given</TabsTrigger>
          </TabsList>
          <TabsContent value="received" className="mt-6 space-y-3">
            {loadingReceived ? [1,2].map(i => <CardSkeleton key={i} />) : received && received.length > 0 ? received.map(r => <ReviewCard key={r.id} review={r} />) : <EmptyState icon={Star} title="No reviews received yet" description="Complete jobs to start receiving reviews" />}
          </TabsContent>
          <TabsContent value="given" className="mt-6 space-y-3">
            {loadingGiven ? [1,2].map(i => <CardSkeleton key={i} />) : given && given.length > 0 ? given.map(r => <ReviewCard key={r.id} review={r} />) : <EmptyState icon={Star} title="No reviews given yet" description="Leave reviews after completing jobs" />}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
