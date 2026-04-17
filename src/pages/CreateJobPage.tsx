import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, MapPin, Sparkles, ArrowRight, ShieldCheck, Lightbulb, WandSparkles } from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, type CreateJobInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { useJobPriceSuggestion } from "@/hooks/useJobPriceSuggestion";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => { const { data } = await supabase.from("categories").select("*").order("sort_order"); return data ?? []; },
  });

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { budget_type: "fixed", urgency: "medium", lat: 0, lng: 0 },
  });

  const watchedValues = useWatch({ control });
  const selectedCategory = categories?.find((category) => category.id === watchedValues.category_id);
  const priceSuggestion = useJobPriceSuggestion({
    title: watchedValues.title ?? "",
    description: watchedValues.description ?? "",
    categoryName: selectedCategory?.name,
    urgency: watchedValues.urgency ?? "medium",
    budgetType: watchedValues.budget_type ?? "fixed",
    locationText: watchedValues.location_text ?? "",
  });

  const applySuggestedAmount = () => {
    if (!priceSuggestion.suggestion) return;
    setValue("budget_amount", priceSuggestion.suggestion.suggested_amount, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    toast.success("Suggested amount added to budget");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setValue("lat", pos.coords.latitude); setValue("lng", pos.coords.longitude); toast.success("Location set!"); },
      () => toast.error("Could not get location")
    );
  };

  const onSubmit = async (data: CreateJobInput) => {
    if (!user) return;
    const { error } = await supabase.from("jobs").insert({
      customer_id: user.id,
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      location_text: data.location_text,
      lat: data.lat,
      lng: data.lng,
      budget_type: data.budget_type,
      budget_amount: data.budget_amount,
      urgency: data.urgency,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Job posted!");
    navigate("/jobs");
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-80px)] bg-l-surface selection:bg-l-primary/10 py-12 px-6 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-l-primary mb-3 block font-l-headline">New Assignment</span>
            <h1 className="text-4xl font-black font-l-headline text-l-on-surface tracking-tight">Post a New Job</h1>
            <p className="text-l-secondary font-medium mt-2 opacity-70">Reach thousands of qualified kinetic professionals in minutes.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[2rem] p-10 shadow-[0_40px_80px_rgba(0,27,60,0.06)] relative group transition-all duration-500 hover:shadow-[0_60px_100px_rgba(0,27,60,0.1)] ring-1 ring-slate-100">
            {/* Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-0 group-hover:h-1.5 bg-l-primary transition-all duration-500 rounded-t-[2rem]"></div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* Job Title */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em]">Job Title</Label>
                <Input 
                  {...register("title")} 
                  placeholder="e.g. Need a personal chef for tonight's gala" 
                  className="w-full bg-l-surface-container-low border-0 rounded-2xl px-6 py-7 focus:ring-4 focus:ring-l-primary/5 outline-none text-l-on-surface placeholder-slate-400 transition-all font-medium text-base shadow-inner h-auto"
                />
                {errors.title && <p className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em]">Description</Label>
                <div className="rounded-2xl overflow-hidden bg-l-surface-container-low ring-1 ring-inset ring-slate-100 shadow-inner group-focus-within:ring-2 group-focus-within:ring-l-primary/20 transition-all">
                  <Textarea 
                    {...register("description")} 
                    placeholder="Outline the key requirements and expectations..." 
                    rows={6} 
                    className="w-full bg-transparent border-0 px-6 py-5 focus:ring-0 outline-none text-l-on-surface placeholder-slate-400 font-medium leading-relaxed resize-none"
                  />
                </div>
                {errors.description && <p className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">{errors.description.message}</p>}
              </div>

              {/* Category & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em]">Category</Label>
                  <Controller name="category_id" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-auto bg-l-surface-container-low border-0 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-l-primary/5 outline-none text-l-on-surface transition-all font-medium text-base shadow-inner">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="z-[100] rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                        {categories && categories.length > 0 ? (
                          categories.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="rounded-xl h-12 mb-1 last:mb-0 text-l-on-surface focus:bg-l-primary/5 focus:text-l-primary font-bold transition-colors cursor-pointer px-4">
                              <span className="flex items-center gap-3">
                                <span className="text-xl opacity-70">{c.icon || "📁"}</span>
                                <span className="tracking-tight">{c.name}</span>
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-400 font-medium italic">Loading categories...</div>
                        )}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.category_id && <p className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">{errors.category_id.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em]">Location</Label>
                  <div className="relative group/loc">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-l-primary group-focus-within/loc:scale-110 transition-transform opacity-70" />
                    <Input 
                      {...register("location_text")} 
                      placeholder="Enter service address" 
                      className="w-full bg-l-surface-container-low border-0 rounded-2xl pl-16 pr-6 py-7 focus:ring-4 focus:ring-l-primary/5 outline-none text-l-on-surface placeholder-slate-400 transition-all font-medium text-base shadow-inner h-auto"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={useCurrentLocation}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-white rounded-xl transition-all active:scale-95"
                    >
                      <Sparkles className="h-4 w-4 text-l-primary opacity-50 group-hover:opacity-100" />
                    </Button>
                  </div>
                  {errors.location_text && <p className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">{errors.location_text.message}</p>}
                </div>
              </div>

              {/* Budget Section */}
              <div className="space-y-6">
                <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em]">Budget Details</Label>
                <div className="flex flex-col md:flex-row gap-6">
                  <Controller name="budget_type" control={control} render={({ field }) => (
                    <div className="flex bg-l-surface-container-low p-2 rounded-[1.25rem] w-fit shadow-inner">
                      <button 
                        type="button"
                        onClick={() => field.onChange("fixed")}
                        className={cn(
                          "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                          field.value === "fixed" ? "bg-white text-l-primary shadow-lg shadow-l-primary/10 scale-[1.02]" : "text-l-secondary opacity-50 hover:opacity-100"
                        )}
                      >
                        Fixed Price
                      </button>
                      <button 
                        type="button"
                        onClick={() => field.onChange("hourly")}
                        className={cn(
                          "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                          field.value === "hourly" ? "bg-white text-l-primary shadow-lg shadow-l-primary/10 scale-[1.02]" : "text-l-secondary opacity-50 hover:opacity-100"
                        )}
                      >
                        Hourly Rate
                      </button>
                    </div>
                  )} />
                  <div className="relative flex-1 group/budget">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-l-on-surface font-black opacity-30 group-focus-within/budget:opacity-100 transition-opacity">₹</span>
                    <Input 
                      type="number" 
                      {...register("budget_amount", { valueAsNumber: true })} 
                      placeholder="0.00" 
                      className="w-full bg-l-surface-container-low border-0 rounded-2xl pl-12 pr-6 py-7 focus:ring-4 focus:ring-l-primary/5 outline-none text-l-on-surface font-black text-lg shadow-inner h-auto transition-all"
                    />
                  </div>
                </div>
                {priceSuggestion.canSuggest && (
                  <div className="rounded-[1.75rem] border border-l-primary/10 bg-gradient-to-br from-amber-50 via-white to-l-primary/5 p-6 shadow-[0_20px_50px_rgba(0,27,60,0.06)]">
                    {priceSuggestion.isLoading ? (
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-l-primary shadow-sm">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-l-primary">AI Price Suggestion</p>
                          <p className="text-sm font-medium text-l-on-surface">Analyzing this job and estimating a fair {watchedValues.budget_type === "hourly" ? "hourly rate" : "fixed price"}...</p>
                        </div>
                      </div>
                    ) : priceSuggestion.suggestion ? (
                      <div className="space-y-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-l-primary shadow-sm">
                              <WandSparkles className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-l-primary">AI Price Suggestion</p>
                              <div className="mt-2 flex items-end gap-3">
                                <p className="text-3xl font-black tracking-tight text-l-on-surface">
                                  {currencyFormatter.format(priceSuggestion.suggestion.suggested_amount)}
                                </p>
                                <p className="pb-1 text-sm font-medium text-l-secondary opacity-80">
                                  Range: {currencyFormatter.format(priceSuggestion.suggestion.min_amount)} - {currencyFormatter.format(priceSuggestion.suggestion.max_amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "w-fit rounded-full border-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]",
                              priceSuggestion.suggestion.confidence === "high" && "bg-emerald-100 text-emerald-700",
                              priceSuggestion.suggestion.confidence === "medium" && "bg-amber-100 text-amber-700",
                              priceSuggestion.suggestion.confidence === "low" && "bg-slate-200 text-slate-700",
                            )}
                          >
                            {priceSuggestion.suggestion.confidence} confidence
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {priceSuggestion.suggestion.explanation.split("\n").map((line) => (
                            <p key={line} className="text-sm font-medium leading-relaxed text-l-secondary">
                              {line}
                            </p>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            type="button"
                            onClick={applySuggestedAmount}
                            className="rounded-2xl bg-l-primary px-6 py-5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-l-primary/20 transition-all hover:scale-[1.01] hover:bg-l-primary"
                          >
                            Use This Amount
                          </Button>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-l-secondary opacity-60">
                            Based on {selectedCategory?.name?.toLowerCase() ?? "job"} market signals in India
                          </p>
                        </div>
                      </div>
                    ) : priceSuggestion.error ? (
                      <div className="rounded-2xl bg-white/80 px-5 py-4 text-sm font-medium text-l-secondary">
                        <p>AI pricing is temporarily unavailable. You can still post the job with your own budget.</p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-l-secondary/70">
                          {priceSuggestion.error}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
                {errors.budget_amount && <p className="text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">{errors.budget_amount.message}</p>}
              </div>

              {/* Urgency Levels */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-l-secondary uppercase tracking-[0.2em] font-l-headline">Urgency Level</Label>
                <Controller name="urgency" control={control} render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: "low", label: "Low", color: "bg-blue-400", border: "border-blue-400/20", active: "border-blue-400" },
                      { id: "medium", label: "Medium", color: "bg-amber-400", border: "border-amber-400/20", active: "border-amber-400" },
                      { id: "urgent", label: "Urgent", color: "bg-l-primary", border: "border-l-primary/20", active: "border-l-primary" },
                    ].map((u) => (
                      <button 
                        key={u.id}
                        type="button" 
                        onClick={() => field.onChange(u.id)}
                        className={cn(
                          "group h-24 flex flex-col items-center justify-center gap-3 rounded-[1.5rem] bg-l-surface-container-low hover:bg-white transition-all duration-500 border shadow-inner",
                          field.value === u.id ? cn(u.active, "bg-white shadow-xl ring-4 ring-slate-50") : cn(u.border, "hover:shadow-lg")
                        )}
                      >
                        <div className={cn("w-2.5 h-2.5 rounded-full transition-transform duration-500 group-hover:scale-150 shadow-[0_0_12px_rgba(0,0,0,0.1)]", u.color, field.value === u.id && "scale-125")}></div>
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", field.value === u.id ? "text-l-on-surface" : "text-l-secondary opacity-50")}>{u.label}</span>
                      </button>
                    ))}
                  </div>
                )} />
              </div>

              {/* Submit Section */}
              <div className="pt-10 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 gap-6">
                <div className="flex items-center gap-3 text-l-secondary opacity-40">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by MW Protection</span>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-12 py-8 rounded-2xl bg-gradient-to-br from-l-primary to-l-primary-container text-white font-black font-l-headline text-lg shadow-2xl shadow-l-primary/20 hover:shadow-l-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-500 border-none group"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Post Job Now
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Guidance Note */}
          <div className="mt-10 p-8 bg-l-surface-container-high/30 rounded-[2rem] flex items-start gap-6 border border-white backdrop-blur-sm group hover:bg-white/50 transition-all duration-500">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm transition-transform group-hover:rotate-12">
              <Lightbulb className="h-6 w-6 transition-transform hover:scale-110" />
            </div>
            <div>
              <h4 className="text-sm font-black text-l-on-surface uppercase tracking-widest font-l-headline">Pro Tip for Quick Hiring</h4>
              <p className="text-sm font-medium text-l-secondary mt-1 leading-relaxed opacity-70">
                Adding detailed job descriptions and clear requirements increases your chances of getting a high-quality professional response by 45%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
