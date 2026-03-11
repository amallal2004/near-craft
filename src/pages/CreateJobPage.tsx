import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, type CreateJobInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

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
      <div className="page-container max-w-2xl mx-auto">
        <div className="page-header text-center mb-10">
          <h1 className="text-4xl font-heading font-bold">Post a Job</h1>
          <p className="text-lg text-muted-foreground mt-2">Describe what you need and find the right worker</p>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-medium">Title *</Label>
                <Input {...register("title")} placeholder="e.g. Fix leaking kitchen faucet" className="h-11 rounded-xl" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Description *</Label>
                <Textarea {...register("description")} placeholder="Describe the job in detail..." rows={4} className="rounded-xl" />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Category *</Label>
                <Controller name="category_id" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>{categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Location *</Label>
                <div className="flex gap-2">
                  <Input {...register("location_text")} placeholder="City, State" className="flex-1 h-11 rounded-xl" />
                  <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0" onClick={useCurrentLocation}><MapPin className="h-4 w-4" /></Button>
                </div>
                {errors.location_text && <p className="text-xs text-destructive">{errors.location_text.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Budget Type</Label>
                  <Controller name="budget_type" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Budget Amount ($) *</Label>
                  <Input type="number" {...register("budget_amount", { valueAsNumber: true })} placeholder="100" className="h-11 rounded-xl" />
                  {errors.budget_amount && <p className="text-xs text-destructive">{errors.budget_amount.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Urgency</Label>
                <Controller name="urgency" control={control} render={({ field }) => (
                  <div className="grid grid-cols-3 gap-3">
                    {(["low", "medium", "urgent"] as const).map((u) => (
                      <button key={u} type="button" onClick={() => field.onChange(u)} className={cn(
                        "rounded-xl border p-3.5 text-center text-sm font-medium transition-all duration-150",
                        field.value === u ? "border-primary bg-accent text-accent-foreground shadow-sm" : "hover:border-primary/30 hover:bg-muted"
                      )}>
                        {u === "low" ? "🟢 Low" : u === "medium" ? "🟡 Medium" : "🔴 Urgent"}
                      </button>
                    ))}
                  </div>
                )} />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Post Job
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
