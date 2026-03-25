import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import { Loader2, MapPin, DollarSign, Clock, Users, Send, CheckCircle, MessageSquare, AlertTriangle, Star, ChevronRight, Zap, FileText, ShieldCheck, Trash2 } from "lucide-react";
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

  const createCheckoutSession = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          jobId: id,
          successUrl: `${window.location.origin}/payment-success?jobId=${id}`,
          cancelUrl: `${window.location.origin}/payment-cancel?jobId=${id}`,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (error) {
        console.error("Function error:", error);
        // Try to get a better message if it's from our own rejection
        const errorMsg = error instanceof Error ? error.message : "Payment session creation failed";
        throw new Error(errorMsg);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        throw new Error(data.error);
      }
    },
    onError: (e: any) => {
      console.error("Mutation error:", e);
      toast.error(e.message || "Failed to initiate payment");
    },
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
      <div className="min-h-[calc(100vh-80px)] bg-l-surface selection:bg-l-primary/10 py-10 px-6 sm:px-10 animate-fade-in transition-all duration-700">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="mb-10 flex items-center gap-2 text-l-secondary text-sm font-bold tracking-tight opacity-50 hover:opacity-100 transition-opacity">
            <Link to="/jobs" className="hover:text-l-primary transition-colors">My Jobs</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-l-on-surface">Job Details</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Primary Info */}
            <div className="lg:col-span-8 space-y-12">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase flex items-center gap-2.5 shadow-sm border border-emerald-100/50">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]"></span>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </div>
                    {job.urgency === "urgent" && (
                      <div className="px-4 py-2 rounded-full bg-red-50 text-red-600 text-[10px] font-black tracking-widest uppercase flex items-center gap-2.5 shadow-sm border border-red-100/50">
                        <Zap className="h-3.5 w-3.5 fill-red-600" />
                        Urgent
                      </div>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black font-l-headline text-l-on-surface tracking-tighter leading-[1.1]">
                    {job.title}
                  </h1>
                </div>
              </div>

              {/* Job Description Card (Dark Styled) */}
              <div className="bg-[#001b3c] rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden group shadow-[0_40px_100px_rgba(0,27,60,0.15)] ring-1 ring-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 bg-l-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-l-primary/20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
                
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4 opacity-40">
                    <FileText className="h-5 w-5" />
                    <span className="text-[10px] font-black tracking-[0.25em] uppercase font-l-headline">The Brief</span>
                  </div>
                  
                  <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-200/90 whitespace-pre-wrap font-l-body">
                    {job.description}
                  </p>
                  
                  <div className="pt-10 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Category</p>
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        {category?.icon} {category?.name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Posted</p>
                      <p className="text-base font-bold text-white uppercase tracking-tight">
                        {formatDistanceToNow(new Date(job.created_at!), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Priority</p>
                      <p className="text-base font-bold text-white uppercase tracking-tight">
                        {job.urgency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Budget Card */}
                <div className="bg-white rounded-3xl p-8 border-t-4 border-transparent hover:border-l-primary transition-all duration-500 shadow-[0_15px_40px_rgba(0,27,60,0.04)] group ring-1 ring-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-l-primary mb-6 transition-transform group-hover:scale-110 shadow-sm shadow-red-100/50">
                    <DollarSign className="h-7 w-7" />
                  </div>
                  <p className="text-[10px] font-black text-l-secondary/40 tracking-[0.2em] uppercase mb-2">Budget</p>
                  <h3 className="text-3xl font-black text-l-on-surface tracking-tighter">
                    ₹{Number(job.budget_amount)} 
                    <span className="text-xs text-l-secondary font-bold ml-1.5 opacity-40 uppercase tracking-widest">{job.budget_type === "hourly" ? "hr" : "fixed"}</span>
                  </h3>
                </div>

                {/* Location Card */}
                <div className="bg-white rounded-3xl p-8 border-t-4 border-transparent hover:border-blue-500 transition-all duration-500 shadow-[0_15px_40px_rgba(0,27,60,0.04)] group ring-1 ring-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 transition-transform group-hover:scale-110 shadow-sm shadow-blue-100/50">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <p className="text-[10px] font-black text-l-secondary/40 tracking-[0.2em] uppercase mb-2">Location</p>
                  <h3 className="text-2xl font-black text-l-on-surface tracking-tight truncate">{job.location_text}</h3>
                </div>

                {/* Applicants Card */}
                <div className="bg-white rounded-3xl p-8 border-t-4 border-transparent hover:border-l-on-surface transition-all duration-500 shadow-[0_15px_40px_rgba(0,27,60,0.04)] group ring-1 ring-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 mb-6 transition-transform group-hover:scale-110 shadow-sm">
                    <Users className="h-7 w-7" />
                  </div>
                  <p className="text-[10px] font-black text-l-secondary/40 tracking-[0.2em] uppercase mb-2">Applicants</p>
                  <h3 className="text-2xl font-black text-l-on-surface tracking-tight">
                    {job.application_count} <span className="text-xs text-l-secondary font-bold ml-1 opacity-40 uppercase tracking-widest">Workers</span>
                  </h3>
                </div>
              </div>

              {/* Applications Section (If Owner) */}
              {isOwner && applications && applications.length > 0 && (
                <div className="space-y-8 pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-l-on-surface tracking-tight font-l-headline">Applications</h2>
                    <span className="px-3 py-1 bg-l-surface-container-high rounded-full text-[10px] font-black tracking-widest text-l-secondary uppercase">
                      {applications.length} Received
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    {applications.map((app) => {
                      const worker = (app as any).profiles;
                      return (
                        <div key={app.id} className="group flex flex-col md:flex-row items-center md:items-stretch gap-8 rounded-[2rem] border border-slate-100 bg-white p-8 hover:shadow-[0_40px_80px_rgba(0,27,60,0.06)] hover:-translate-y-1 transition-all duration-500">
                          <Avatar className="h-20 w-20 rounded-2xl ring-4 ring-slate-50">
                            <AvatarImage src={worker?.avatar_url} />
                            <AvatarFallback className="bg-l-surface-container-high text-l-secondary font-black text-xl rounded-2xl">{worker?.name?.charAt(0) ?? "?"}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <Link to={`/profiles/${worker?.id}`} className="hover:text-l-primary transition-colors">
                                  <h4 className="text-xl font-black text-l-on-surface tracking-tight">{worker?.name}</h4>
                                </Link>
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-amber-100/50">
                                    <Star className="h-3 w-3 fill-amber-600" />
                                    {Number(worker?.avg_rating ?? 0).toFixed(1)}
                                  </div>
                                  <span className="text-[10px] font-bold text-l-secondary opacity-40 uppercase tracking-widest">Expert Worker</span>
                                </div>
                              </div>
                              <div className="text-lg font-black text-l-primary">₹{Number(app.offer_price)}</div>
                            </div>
                            
                            <p className="text-sm font-medium text-l-secondary leading-relaxed opacity-70 line-clamp-2">
                              {app.message}
                            </p>
                            
                            {app.status === "pending" && job.status === "open" && (
                              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                                <Button size="lg" className="rounded-xl flex-1 px-8 py-6 font-black bg-l-primary hover:bg-l-primary/90 text-white shadow-xl shadow-l-primary/20 transition-all border-none" onClick={() => acceptApplication.mutate(app.id)}>Accept Offer</Button>
                                <Button size="lg" variant="ghost" className="rounded-xl px-8 py-6 font-black text-l-secondary hover:bg-l-surface-container-high transition-all" onClick={() => navigate(`/jobs/${id}/chat?with=${app.worker_id}`)}>
                                  <MessageSquare className="h-5 w-5 mr-2.5" /> Message
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Review Section */}
              {job.status === "completed" && (isOwner || isSelectedWorker) && (
                <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_80px_rgba(0,27,60,0.06)] border border-slate-100 space-y-8">
                  <h3 className="text-2xl font-black text-l-on-surface tracking-tight font-l-headline">Final Review</h3>
                  <div className="flex justify-center py-10 bg-l-surface-container-low/50 rounded-3xl shadow-inner border border-slate-50">
                    <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={48} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em]">Feedback</Label>
                    <Textarea 
                      value={reviewComment} 
                      onChange={(e) => setReviewComment(e.target.value)} 
                      placeholder="Share your experience working with them..." 
                      rows={4} 
                      className="rounded-2xl bg-l-surface-container-low border-none p-6 focus:ring-4 focus:ring-l-primary/5 outline-none font-medium leading-relaxed resize-none shadow-inner" 
                    />
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => submitReview.mutate()} 
                    disabled={reviewRating === 0 || reviewComment.length < 10 || submitReview.isPending} 
                    className="w-full h-16 rounded-2xl bg-gradient-to-br from-l-primary to-l-primary-container text-white font-black text-lg shadow-2xl shadow-l-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all border-none"
                  >
                    {submitReview.isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Star className="mr-2 h-6 w-6" />}
                    Submit Project Review
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Secondary Info */}
            <div className="lg:col-span-4 space-y-10">
              {/* Posted By Card */}
              <div className="bg-l-surface-container-low rounded-[2.5rem] p-8 md:p-10 space-y-10 border border-white shadow-[0_20px_40px_rgba(0,27,60,0.04)]">
                <div>
                  <p className="text-[10px] font-black text-l-secondary/40 tracking-[0.25em] uppercase mb-8 font-l-headline">Client Profile</p>
                  <div className="flex items-center gap-6 group">
                    <div className="w-20 h-20 rounded-[1.75rem] overflow-hidden bg-white p-1 ring-1 ring-slate-100 shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Avatar className="w-full h-full rounded-2xl">
                        <AvatarImage src={customer?.avatar_url} />
                        <AvatarFallback className="bg-l-surface-container-high text-l-secondary font-black text-2xl uppercase">
                          {customer?.name?.charAt(0) ?? "C"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-l-on-surface tracking-tight leading-tight mb-2">{customer?.name ?? "Customer"}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-black">{Number(customer?.avg_rating ?? 0).toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] font-bold text-l-secondary opacity-40 uppercase tracking-widest">(0 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between py-4 border-b border-slate-200/40">
                    <span className="text-xs font-bold text-l-secondary opacity-50 uppercase tracking-widest">Member Since</span>
                    <span className="text-sm font-black text-l-on-surface">Oct 2023</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-200/40">
                    <span className="text-xs font-bold text-l-secondary opacity-50 uppercase tracking-widest">Jobs Posted</span>
                    <span className="text-sm font-black text-l-on-surface">1</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs font-bold text-l-secondary opacity-50 uppercase tracking-widest">Verification</span>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">ID Verified</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-14 rounded-2xl bg-white border-2 border-slate-100 text-l-on-surface font-black text-sm uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95" asChild>
                  <Link to={`/profiles/${customer.id}`}>
                    View Full Profile
                  </Link>
                </Button>
              </div>

              {/* Map/Location Preview */}
              <div className="bg-l-surface-container-low rounded-[2.5rem] overflow-hidden border border-white shadow-[0_20px_40px_rgba(0,27,60,0.04)] ring-1 ring-slate-100 group transition-all duration-700 hover:shadow-xl">
                <div className="h-56 bg-slate-200 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" 
                    alt="Map Location" 
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-110 group-hover:grayscale-0 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-3xl bg-l-primary flex items-center justify-center text-white shadow-[0_0_30px_rgba(183,16,42,0.5)] z-10 transition-transform duration-500 group-hover:scale-125">
                      <MapPin className="h-7 w-7" />
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-2">
                  <p className="text-[10px] font-black text-l-secondary opacity-40 uppercase tracking-[0.25em]">Service Area</p>
                  <p className="text-lg font-black text-l-on-surface tracking-tight group-hover:text-l-primary transition-colors">{job.location_text}</p>
                </div>
              </div>

              {/* Dynamic Actions for Workers/Owners */}
              <div className="pt-6 space-y-6">
                {/* Worker Apply / Application Status */}
                {activeRole === "worker" && job.status === "open" && !myApplication && !isOwner && (
                  <Button 
                    className="w-full h-16 rounded-2xl bg-l-primary text-white font-black text-lg shadow-2xl shadow-l-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                    onClick={() => setApplyOpen(true)}
                  >
                    <Send className="h-5 w-5 mr-3" />
                    Submit Application
                  </Button>
                )}

                {myApplication && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center shadow-sm">
                    <p className="text-[10px] font-black text-l-secondary/40 tracking-widest uppercase mb-2">Your Application</p>
                    <div className="inline-flex px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-tight border border-blue-100">
                      {myApplication.status}
                    </div>
                  </div>
                )}

                {/* Worker Specific Actions (Assigned/Started) */}
                {isSelectedWorker && job.status === "assigned" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-14 rounded-xl bg-l-primary text-white font-black" onClick={() => updateJobStatus.mutate("in_progress")}>Accept & Start</Button>
                    <Button variant="outline" className="h-14 rounded-xl font-black text-l-secondary" onClick={() => updateJobStatus.mutate("open")}>Decline</Button>
                  </div>
                )}

                {isSelectedWorker && job.status === "in_progress" && (
                  <Button className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-600/20" onClick={() => setConfirmDialog({ open: true, action: "pending_review", title: "Mark job as complete?" })}>
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Mark Complete
                  </Button>
                )}

                {/* Owner Specific Actions (Payment/Dispute) */}
                {isOwner && job.status === "pending_review" && (
                  <div className="space-y-4">
                    <Button 
                      className="w-full h-16 rounded-2xl bg-l-primary text-white font-black text-lg shadow-2xl shadow-l-primary/30" 
                      onClick={() => createCheckoutSession.mutate()} 
                      disabled={createCheckoutSession.isPending}
                    >
                      {createCheckoutSession.isPending ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <DollarSign className="h-5 w-5 mr-3" />}
                      Pay Now & Confirm
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full h-14 rounded-xl text-red-500 hover:bg-red-50 font-black uppercase text-xs tracking-widest" 
                      onClick={() => updateJobStatus.mutate("disputed")}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Raise Dispute
                    </Button>
                  </div>
                )}

                {/* Shared Chat Link */}
                {(isOwner || isSelectedWorker) && ["assigned", "in_progress"].includes(job.status) && (
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-white shadow-sm font-black text-l-secondary uppercase text-xs tracking-[0.15em] hover:bg-slate-50 transition-all" asChild>
                    <Link to={`/jobs/${id}/chat`}>
                      <MessageSquare className="h-4 w-4 mr-3" />
                      Open Project Chat
                    </Link>
                  </Button>
                )}

                {/* Cancel Job (Owner Only) */}
                {isOwner && job.status === "open" && (
                  <Button 
                    variant="outline" 
                    className="w-full h-16 rounded-2xl border-2 border-slate-200 bg-transparent text-slate-400 hover:border-red-100 hover:text-red-500 hover:bg-red-50/50 font-black uppercase tracking-widest text-xs transition-all duration-300 active:scale-95" 
                    onClick={() => setConfirmDialog({ open: true, action: "cancelled", title: "Cancel this job?" })}
                  >
                    <Trash2 className="h-5 w-5 mr-3" />
                    Cancel Job
                  </Button>
                )}
                
                <p className="text-center text-[10px] text-slate-400 uppercase tracking-tighter font-bold opacity-60 px-6 leading-relaxed">
                  Management controls for this project. Status: {job.status}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Redesigned Submit Application Dialog */}
        {activeRole === "worker" && job.status === "open" && !myApplication && !isOwner && (
          <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
            <DialogContent className="sm:max-w-[550px] p-0 rounded-[2.5rem] overflow-hidden border-none shadow-[0_40px_100px_rgba(0,27,60,0.2)]">
              <div className="relative p-8 md:p-12 space-y-8 bg-white">
                {/* Decorative header glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-l-primary/10 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-l-primary shadow-sm shadow-red-100">
                      <Send className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-l-on-surface tracking-tight font-l-headline">Submit Project Offer</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Job Proposal</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed mt-4">
                    Present your best offer to the client. Describe your experience and how you can deliver value for this specific project.
                  </p>
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em] ml-1">Your Price Quote (₹)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input 
                          type="number" 
                          value={applyPrice} 
                          onChange={(e) => setApplyPrice(e.target.value)} 
                          placeholder="0.00" 
                          className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-10 pr-4 text-slate-900 font-bold focus:ring-4 focus:ring-l-primary/5 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em] ml-1">Estimated Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input 
                          placeholder="e.g. 3 Days" 
                          className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-10 pr-4 text-slate-900 font-bold focus:ring-4 focus:ring-l-primary/5 transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em] ml-1">Professional Message</Label>
                    <Textarea 
                      value={applyMessage} 
                      onChange={(e) => setApplyMessage(e.target.value)} 
                      placeholder="Share your expertise and approach to this task..." 
                      rows={5} 
                      className="rounded-2xl bg-slate-50 border-slate-100 p-6 text-slate-900 font-medium leading-relaxed resize-none focus:ring-4 focus:ring-l-primary/5 transition-all shadow-inner" 
                    />
                    <div className="flex justify-between px-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Minimum 10 characters</p>
                      <p className={cn("text-[10px] font-black uppercase tracking-tight", applyMessage.length >= 10 ? "text-emerald-500" : "text-slate-300")}>
                        {applyMessage.length} Characters
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-4 flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-16 rounded-2xl flex-1 px-8 font-black text-slate-400 hover:bg-slate-50 uppercase tracking-widest text-xs"
                    onClick={() => setApplyOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="h-16 rounded-2xl flex-[2] px-8 bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white font-black text-lg shadow-2xl shadow-l-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none" 
                    onClick={() => submitApplication.mutate()} 
                    disabled={submitApplication.isPending || !applyPrice || applyMessage.length < 10}
                  >
                    {submitApplication.isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 mr-3" />}
                    Send Professional Offer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Redesigned Confirm Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <DialogContent className="sm:max-w-[400px] p-0 rounded-[2rem] overflow-hidden border-none shadow-[0_40px_100px_rgba(0,27,60,0.15)]">
            <div className="p-8 space-y-6 bg-white text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto shadow-sm shadow-amber-100">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-l-on-surface tracking-tight font-l-headline text-center">{confirmDialog.title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">
                  Are you sure you want to proceed with this action? This can't be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="h-14 rounded-xl flex-1 font-black text-slate-400 hover:bg-slate-50 uppercase tracking-widest text-[10px]" onClick={() => setConfirmDialog({ open: false, action: "", title: "" })}>Cancel</Button>
                <Button 
                  className="h-14 rounded-xl flex-1 bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white font-black text-sm shadow-lg shadow-l-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all border-none" 
                  onClick={() => updateJobStatus.mutate(confirmDialog.action)} 
                  disabled={updateJobStatus.isPending}
                >
                  {updateJobStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
