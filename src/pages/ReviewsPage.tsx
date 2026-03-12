import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ReviewsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<any>(null);
  const [deletingReview, setDeletingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

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

  const updateReview = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("reviews")
        .update({
          rating: editRating,
          comment: editComment,
        })
        .eq("id", editingReview.id)
        .select();
        
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Update failed. You may not have permission to edit this review.");
      }
    },
    onSuccess: async () => {
      toast.success("Review updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["reviews-given", user?.id] });
      setEditingReview(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update review");
    }
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("reviews")
        .delete()
        .eq("id", id)
        .select();
        
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Deletion failed. Please ensure you have permission to delete this review.");
      }
    },
    onSuccess: async () => {
      toast.success("Review deleted successfully");
      // Use a more aggressive invalidation
      await queryClient.invalidateQueries({ queryKey: ["reviews-given"] });
      await queryClient.refetchQueries({ queryKey: ["reviews-given"] });
      setDeletingReview(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete review");
    }
  });

  const ReviewCard = ({ review, isEditable }: { review: any; isEditable?: boolean }) => {
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
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 bg-secondary/50 px-2 py-0.5 rounded-md">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                {isEditable && (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingReview(review);
                        setEditRating(review.rating);
                        setEditComment(review.comment);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit Review"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setDeletingReview(review)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
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
            {loadingGiven ? [1,2].map(i => <CardSkeleton key={i} />) : given && given.length > 0 ? given.map(r => <ReviewCard key={r.id} review={r} isEditable />) : (
                <div className="glass-card rounded-2xl p-12 border border-border/40 bg-card/40">
                  <EmptyState icon={Star} title="No reviews given yet" description="Leave reviews after completing jobs" />
                </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Review Dialog */}
        <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Edit Review</DialogTitle>
              <DialogDescription>Update your rating and feedback.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="flex justify-center p-4 bg-accent/30 rounded-2xl">
                <StarRating rating={editRating} interactive onChange={setEditRating} size={32} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground px-1">Your Feedback</label>
                <Textarea 
                  value={editComment} 
                  onChange={(e) => setEditComment(e.target.value)} 
                  placeholder="Share your experience..." 
                  rows={4} 
                  className="rounded-xl resize-none border-border/60 focus:border-primary/50" 
                />
              </div>
            </div>
            <DialogFooter className="mt-6 flex gap-3 sm:gap-0">
              <Button variant="outline" onClick={() => setEditingReview(null)} className="rounded-xl flex-1 sm:flex-none">Cancel</Button>
              <Button 
                onClick={() => updateReview.mutate()} 
                disabled={editRating === 0 || editComment.length < 10 || updateReview.isPending}
                className="rounded-xl flex-1 sm:flex-none shadow-elevated"
              >
                {updateReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingReview} onOpenChange={(open) => !open && setDeletingReview(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading text-xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This review and its contribution to the user's rating will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteReview.mutate(deletingReview?.id)}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-elevated-destructive"
              >
                {deleteReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Review
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
