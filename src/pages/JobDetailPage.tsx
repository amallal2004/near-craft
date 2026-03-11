import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeletons";
import { toast } from "sonner";
import { Loader2, MapPin, DollarSign, Clock, Users, Send, CheckCircle, MessageSquare, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [applyMessage, setApplyMessage] = useState("");
  const [applyPrice, setApplyPrice] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string; title: string }>({ open: false, action: "", title: "" });

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*, categories(*), profiles!jobs_customer_id_fkey(*)").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: applications } = useQuery({
    queryKey: ["applications", id],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*, profiles(*)").eq("job_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id && job?.customer_id === user?.id,
  });

  const { data: myApplication } = useQuery({
    queryKey: ["my-application", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*").eq("job_id", id!).eq("worker_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!id && !!user && activeRole === "worker",
  });

  const isOwner = job?.customer_id === user?.id;
  const isSelectedWorker = job?.selected_worker_id === user?.id;

  const submitApplication = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("applications").insert({
        job_id: id!, worker_id: user!.id, message: applyMessage, offer_price: Number(applyPrice),
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Application submitted!"); setApplyOpen(false); queryClient.invalidateQueries({ queryKey: ["my-application", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateJobStatus = useMutation({
    mutationFn: async (status: string) => {
      const updates: any = { status };
      if (status === "cancelled") updates.cancelled_at = new Date().toISOString();
      if (status === "completed") updates.completed_at = new Date().toISOString();
      if (status === "in_progress") updates.started_at = new Date().toISOString();
      const { error } = await supabase.from("jobs").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Job updated!"); queryClient.invalidateQueries({ queryKey: ["job", id] }); setConfirmDialog({ open: false, action: "", title: "" }); },
    onError: (e: any) => toast.error(e.message),
  });

  const acceptApplication = useMutation({
    mutationFn: async (appId: string) => {
      const app = applications?.find(a => a.id === appId);
      if (!app) return;
      await supabase.from("applications").update({ status: "accepted" as const }).eq("id", appId);
      await supabase.from("jobs").update({ status: "assigned" as const, selected_worker_id: app.worker_id }).eq("id", id!);
      await supabase.from("applications").update({ status: "rejected" as const }).eq("job_id", id!).neq("id", appId);
    },
    onSuccess: () => { toast.success("Worker selected!"); queryClient.invalidateQueries({ queryKey: ["job", id] }); queryClient.invalidateQueries({ queryKey: ["applications", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const revieweeId = isOwner ? job!.selected_worker_id! : job!.customer_id;
      const { error } = await supabase.from("reviews").insert({
        job_id: id!, reviewer_id: user!.id, reviewee_id: revieweeId, rating: reviewRating, comment: reviewComment,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Review submitted!"); setReviewRating(0); setReviewComment(""); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <AppLayout><div className="page-container"><CardSkeleton /><div className="mt-4"><CardSkeleton /></div></div></AppLayout>;
  if (!job) return <AppLayout><EmptyState icon={AlertTriangle} title="Job not found" /></AppLayout>;

  const customer = (job as any).profiles;
  const category = (job as any).categories;

  return (
    <AppLayout>
      <div className="page-container max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <span>{category?.icon} {category?.name}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(job.created_at!), { addSuffix: true })}</span>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={job.status} />
              <StatusBadge status={job.urgency} type="urgency" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">{job.title}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-3 text-base font-heading font-semibold">Description</h2>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            {/* Applications (owner only) */}
            {isOwner && applications && applications.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Applications ({applications.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {applications.map((app) => {
                    const worker = (app as any).profiles;
                    return (
                      <div key={app.id} className="flex items-start gap-4 rounded-xl border p-4 hover:shadow-card-hover transition-shadow duration-200">
                        <Avatar className="ring-2 ring-border">
                          <AvatarImage src={worker?.avatar_url} />
                          <AvatarFallback className="bg-accent text-accent-foreground font-semibold">{worker?.name?.charAt(0) ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-semibold">{worker?.name}</span>
                            <StarRating rating={Number(worker?.avg_rating ?? 0)} size={12} />
                            <StatusBadge status={app.status} type="application" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{app.message}</p>
                          <p className="text-sm font-semibold text-primary mt-1">${Number(app.offer_price)}</p>
                        </div>
                        {app.status === "pending" && job.status === "open" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" className="rounded-lg" onClick={() => acceptApplication.mutate(app.id)}>Accept</Button>
                            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => navigate(`/jobs/${id}/chat?with=${app.worker_id}`)}>
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Review form */}
            {job.status === "completed" && (isOwner || isSelectedWorker) && (
              <Card>
                <CardHeader><CardTitle>Leave a Review</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={28} />
                  <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience (min 10 chars)..." rows={3} className="rounded-xl" />
                  <Button onClick={() => submitReview.mutate()} disabled={reviewRating === 0 || reviewComment.length < 10 || submitReview.isPending} className="rounded-xl">
                    {submitReview.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shrink-0">
                    <DollarSign className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</p>
                    <p className="text-lg font-bold">${Number(job.budget_amount)} <span className="text-sm font-normal text-muted-foreground">{job.budget_type === "hourly" ? "/hr" : "fixed"}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shrink-0">
                    <MapPin className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</p>
                    <p className="font-medium">{job.location_text}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shrink-0">
                    <Users className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Applications</p>
                    <p className="font-medium">{job.application_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-border">
                    <AvatarImage src={customer?.avatar_url} />
                    <AvatarFallback className="bg-accent text-accent-foreground font-semibold">{customer?.name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading font-semibold">{customer?.name ?? "Customer"}</p>
                    <StarRating rating={Number(customer?.avg_rating ?? 0)} size={12} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {activeRole === "worker" && job.status === "open" && !myApplication && !isOwner && (
              <Sheet open={applyOpen} onOpenChange={setApplyOpen}>
                <SheetTrigger asChild><Button className="w-full h-12 rounded-xl text-base"><Send className="mr-2 h-4 w-4" /> Apply Now</Button></SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
                  <SheetHeader><SheetTitle className="font-heading">Apply to this job</SheetTitle></SheetHeader>
                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label className="font-medium">Your offer ($)</Label>
                      <Input type="number" value={applyPrice} onChange={(e) => setApplyPrice(e.target.value)} placeholder="100" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Cover message (min 10 chars)</Label>
                      <Textarea value={applyMessage} onChange={(e) => setApplyMessage(e.target.value)} placeholder="Tell the customer why you're the best fit..." rows={4} className="rounded-xl" />
                    </div>
                    <Button className="w-full h-12 rounded-xl text-base" onClick={() => submitApplication.mutate()} disabled={submitApplication.isPending || !applyPrice || applyMessage.length < 10}>
                      {submitApplication.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Application
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {myApplication && (
              <Card><CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">You applied</p>
                <StatusBadge status={myApplication.status} type="application" />
              </CardContent></Card>
            )}

            {isOwner && job.status === "open" && (
              <Button variant="outline" className="w-full rounded-xl" onClick={() => setConfirmDialog({ open: true, action: "cancelled", title: "Cancel this job?" })}>Cancel Job</Button>
            )}

            {isSelectedWorker && job.status === "assigned" && (
              <div className="space-y-2">
                <Button className="w-full rounded-xl" onClick={() => updateJobStatus.mutate("in_progress")}>Accept & Start Work</Button>
                <Button variant="outline" className="w-full rounded-xl" onClick={() => updateJobStatus.mutate("open")}>Decline</Button>
              </div>
            )}

            {isSelectedWorker && job.status === "in_progress" && (
              <Button className="w-full rounded-xl" onClick={() => setConfirmDialog({ open: true, action: "pending_review", title: "Mark job as complete?" })}>
                <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
              </Button>
            )}

            {isOwner && job.status === "pending_review" && (
              <div className="space-y-2">
                <Button className="w-full rounded-xl" onClick={() => updateJobStatus.mutate("completed")}><CheckCircle className="mr-2 h-4 w-4" /> Confirm Completion</Button>
                <Button variant="destructive" className="w-full rounded-xl" onClick={() => updateJobStatus.mutate("disputed")}><AlertTriangle className="mr-2 h-4 w-4" /> Raise Dispute</Button>
              </div>
            )}

            {(isOwner || isSelectedWorker) && ["assigned", "in_progress"].includes(job.status) && (
              <Button variant="outline" className="w-full rounded-xl" asChild>
                <Link to={`/jobs/${id}/chat`}><MessageSquare className="mr-2 h-4 w-4" /> Chat</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Confirm dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="font-heading">{confirmDialog.title}</DialogTitle></DialogHeader>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setConfirmDialog({ open: false, action: "", title: "" })}>Cancel</Button>
              <Button className="rounded-xl" onClick={() => updateJobStatus.mutate(confirmDialog.action)} disabled={updateJobStatus.isPending}>
                {updateJobStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
