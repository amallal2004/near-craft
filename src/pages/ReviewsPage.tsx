import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Pencil, Trash2, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
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
      <div className="bg-white rounded-3xl p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-l-primary/5 hover:-translate-y-1 group relative overflow-hidden border border-slate-100/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-l-primary/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
          <Avatar className="h-16 w-16 ring-4 ring-l-surface group-hover:ring-l-primary/10 transition-all duration-500 shadow-sm shrink-0">
            <AvatarImage src={profile?.avatar_url} className="object-cover" />
            <AvatarFallback className="bg-l-surface-container-highest text-l-on-surface font-black text-xl font-l-headline">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-black text-l-on-surface tracking-tighter font-l-headline group-hover:text-l-primary transition-colors duration-300">
                  {profile?.name ?? "User"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Link to={`/jobs/${review.job_id}`} className="text-[10px] font-black text-l-primary uppercase tracking-widest hover:underline transition-all decoration-2 underline-offset-4">
                    {(review as any).jobs?.title}
                  </Link>
                  <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] font-bold text-l-secondary/50 uppercase tracking-widest shrink-0">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditable && (
                  <div className="flex items-center gap-1.5 p-1 bg-l-surface-container-low rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => {
                        setEditingReview(review);
                        setEditRating(review.rating);
                        setEditComment(review.comment);
                      }}
                      className="h-8 w-8 flex items-center justify-center text-l-secondary hover:text-l-primary hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"
                      title="Edit Review"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeletingReview(review)}
                      className="h-8 w-8 flex items-center justify-center text-l-secondary hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"
                      title="Delete Review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-l-primary text-l-primary' : 'text-slate-200'}`} />
                ))}
              </div>
              <p className="text-l-on-surface/80 font-medium leading-relaxed font-l-body italic">
                "{review.comment}"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-l-surface selection:bg-l-primary/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16 space-y-12 animate-in fade-in duration-700">
          {/* Header Section */}
          <header className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-black text-l-on-surface tracking-tighter font-l-headline animate-in slide-in-from-left duration-500">
              Reviews
            </h1>
            <p className="text-lg lg:text-xl text-l-secondary font-medium font-l-body opacity-60">
              See what others are saying about you
            </p>
          </header>

          {/* Stats Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-700">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-4 border-l-primary/20 flex flex-col gap-3 transition-all hover:shadow-xl hover:shadow-l-primary/5 hover:-translate-y-1 group">
              <span className="text-[10px] font-black text-l-secondary/50 uppercase tracking-[0.2em]">Average Rating</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-l-on-surface tracking-tighter">
                  {received?.length ? (received.reduce((acc, curr) => acc + curr.rating, 0) / received.length).toFixed(1) : "0.0"}
                </span>
                <span className="text-l-secondary/40 font-bold">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-l-primary text-l-primary" />
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-4 border-emerald-500/20 flex flex-col gap-3 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 group">
              <span className="text-[10px] font-black text-l-secondary/50 uppercase tracking-[0.2em]">Total Reviews</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-l-on-surface tracking-tighter">{received?.length ?? 0}</span>
                <span className="text-l-secondary/40 font-bold uppercase text-[10px] tracking-widest">Received</span>
              </div>
              <p className="text-xs text-emerald-600 font-bold items-center flex gap-1.5 mt-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                100% Legit feedback
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border-t-4 border-blue-500/20 flex flex-col gap-3 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 group">
              <span className="text-[10px] font-black text-l-secondary/50 uppercase tracking-[0.2em]">Response Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-l-on-surface tracking-tighter">100%</span>
                <span className="text-l-secondary/40 font-bold uppercase text-[10px] tracking-widest">Positive</span>
              </div>
              <p className="text-xs text-blue-600 font-bold items-center flex gap-1.5 mt-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified platform
              </p>
            </div>
          </div>

          <Tabs defaultValue="received" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="bg-l-surface-container-low p-1.5 rounded-2xl h-auto border-none">
                <TabsTrigger 
                  value="received" 
                  className="px-8 py-3 rounded-xl data-[state=active]:bg-l-primary data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-l-primary/20 text-sm font-black uppercase tracking-widest transition-all"
                >
                  Received
                </TabsTrigger>
                <TabsTrigger 
                  value="given" 
                  className="px-8 py-3 rounded-xl data-[state=active]:bg-l-primary data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-l-primary/20 text-sm font-black uppercase tracking-widest transition-all"
                >
                  Given
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="received" className="mt-0 outline-none">
              {loadingReceived ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : received && received.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {received.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              ) : (
                <div className="bg-l-surface-container-low rounded-3xl p-12 lg:p-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-l-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50"></div>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-l-primary/10 blur-[100px] opacity-20"></div>
                  
                  <div className="relative mb-8 group">
                    {/* Decorative Glow */}
                    <div className="absolute inset-0 bg-l-primary/20 blur-3xl rounded-full animate-pulse-glow"></div>
                    {/* Main Icon */}
                    <div className="relative h-32 w-32 bg-white rounded-full shadow-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Star className="h-16 w-16 text-l-primary fill-l-primary" />
                    </div>
                    {/* Status Aura */}
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-50">
                      <div className="h-3 w-3 rounded-full bg-l-primary shadow-[0_0_12px_rgba(183,16,42,0.5)]"></div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-black text-l-on-surface font-l-headline tracking-tighter mb-4">No reviews received yet</h2>
                  <p className="max-w-md text-l-secondary font-medium leading-relaxed mb-10 opacity-60">
                    Once you complete a project and your client leaves feedback, it will appear here for the community to see your amazing work.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
                    <Button className="px-10 h-14 bg-l-primary text-white font-black rounded-xl shadow-xl shadow-l-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto uppercase tracking-widest text-xs" asChild>
                      <Link to="/workers">Complete your first gig</Link>
                    </Button>
                    <Button variant="ghost" className="px-10 h-14 bg-white text-l-secondary font-black rounded-xl shadow-sm hover:bg-l-surface transition-all w-full sm:w-auto uppercase tracking-widest text-xs border border-slate-100">
                      Learn about reputation
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="given" className="mt-0 outline-none">
              {loadingGiven ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : given && given.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {given.map(r => <ReviewCard key={r.id} review={r} isEditable />)}
                </div>
              ) : (
                <div className="bg-l-surface-container-low rounded-[3rem] p-12 lg:p-24 flex flex-col items-center justify-center text-center border-4 border-dashed border-white">
                  <div className="relative h-32 w-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-10">
                    <Star className="h-16 w-16 text-l-secondary/20" />
                  </div>
                  <h2 className="text-3xl font-black text-l-on-surface font-l-headline tracking-tighter mb-4">No reviews given yet</h2>
                  <p className="max-w-md text-l-secondary font-medium leading-relaxed mb-12 opacity-60">
                    Share your experience with workers you've hired. Your feedback helps the entire community grow.
                  </p>
                  <Button className="px-10 h-14 bg-l-primary text-white font-black rounded-2xl shadow-2xl shadow-l-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs" asChild>
                    <Link to="/workers">Hire a pro</Link>
                  </Button>
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
    </div>
  </AppLayout>
  );
}
