import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, User, Briefcase, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState<"customer" | "worker">("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationText, setLocationText] = useState("");
  const [experienceDesc, setExperienceDesc] = useState("");
  const [hourlyRateMin, setHourlyRateMin] = useState(15);
  const [hourlyRateMax, setHourlyRateMax] = useState(50);
  const [serviceRadius, setServiceRadius] = useState(10);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const totalSteps = role === "worker" ? 4 : 3;

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    // Update profile
    const { error: profileError } = await supabase.from("profiles").update({
      name,
      phone: phone || null,
      role,
      active_role: role,
      location_text: locationText || null,
    }).eq("id", user.id);

    if (profileError) { toast.error(profileError.message); setLoading(false); return; }

    // If worker, create worker profile and skills
    if (role === "worker") {
      const { data: wp, error: wpError } = await supabase.from("worker_profiles").insert({
        user_id: user.id,
        experience_desc: experienceDesc || null,
        hourly_rate_min: hourlyRateMin,
        hourly_rate_max: hourlyRateMax,
        service_radius: serviceRadius,
      }).select().single();

      if (wpError) { toast.error(wpError.message); setLoading(false); return; }

      if (selectedSkills.length > 0 && wp) {
        await supabase.from("worker_skills").insert(
          selectedSkills.map((catId) => ({ worker_id: wp.id, category_id: catId }))
        );
      }
    }

    await refreshProfile();
    setLoading(false);
    toast.success("Welcome to GigLocal!");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i + 1 <= step ? "w-16 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "w-8 bg-muted")} />
          ))}
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-heading font-bold tracking-tight">How will you use NearCraft?</h1>
              <p className="mt-3 text-lg text-muted-foreground">Select your primary role. You can always switch later.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className={cn("cursor-pointer glass-card border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover group", role === "customer" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50")} onClick={() => setRole("customer")}>
                <CardContent className="flex flex-col items-center text-center p-8">
                  <div className={cn("mb-6 p-4 rounded-2xl transition-colors", role === "customer" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")}>
                    <User className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-xl font-heading font-bold mb-2">I need help</CardTitle>
                  <p className="text-sm text-muted-foreground">Hire trusted professionals for your tasks and projects.</p>
                </CardContent>
              </Card>
              <Card className={cn("cursor-pointer glass-card border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover group", role === "worker" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50")} onClick={() => setRole("worker")}>
                <CardContent className="flex flex-col items-center text-center p-8">
                  <div className={cn("mb-6 p-4 rounded-2xl transition-colors", role === "worker" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")}>
                    <Briefcase className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-xl font-heading font-bold mb-2">I want gigs</CardTitle>
                  <p className="text-sm text-muted-foreground">Offer your skills and find work opportunities near you.</p>
                </CardContent>
              </Card>
            </div>
            <div className="pt-8">
              <Button className="w-full h-14 rounded-xl text-lg shadow-elevated transition-transform hover:-translate-y-0.5" onClick={() => setStep(2)}>Continue <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </div>
          </div>
        )}

        {/* Step 2: Basic info */}
        {step === 2 && (
          <Card className="glass-card border-0 shadow-elevated overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent"></div>
            <CardHeader className="pt-8 px-8 pb-4">
              <CardTitle className="text-3xl font-heading font-bold text-center">Tell us about yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-2">
                <Label className="font-medium text-foreground/80">Full Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="h-12 rounded-xl bg-background/50 focus-visible:bg-background transition-colors" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-foreground/80">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-12 rounded-xl bg-background/50 focus-visible:bg-background transition-colors" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-foreground/80">Location <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="City, State" className="h-12 rounded-xl bg-background/50 focus-visible:bg-background transition-colors" />
              </div>
              <div className="flex gap-4 pt-6 mt-4 border-t border-border/40">
                <Button variant="outline" className="h-12 rounded-xl px-6" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="flex-1 h-12 rounded-xl shadow-elevated transition-transform hover:-translate-y-0.5" onClick={() => { if (!name || name.length < 2) { toast.error("Name is required"); return; } setStep(role === "worker" ? 3 : totalSteps); }}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Worker details */}
        {step === 3 && role === "worker" && (
          <Card className="glass-card border-0 shadow-elevated overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent"></div>
            <CardHeader className="pt-8 px-8 pb-4">
              <CardTitle className="text-3xl font-heading font-bold text-center">Your skills & rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8">
              <div className="space-y-3">
                <Label className="font-medium text-foreground/80">Skills <span className="text-muted-foreground font-normal">(Select all that apply)</span></Label>
                <div className="flex flex-wrap gap-2.5">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedSkills((prev) => prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id])}
                      className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2", selectedSkills.includes(cat.id) ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)] scale-[1.02]" : "border-border bg-card hover:border-primary/50 hover:bg-accent/20")}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-foreground/80">Experience <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea value={experienceDesc} onChange={(e) => setExperienceDesc(e.target.value)} placeholder="Tell clients about your experience, qualifications, and the value you bring..." rows={4} className="rounded-xl bg-background/50 focus-visible:bg-background transition-colors resize-none" />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8 pt-4 border-t border-border/40">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium text-foreground/80 mb-0">Hourly Rate</Label>
                    <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">₹{hourlyRateMin} - ₹{hourlyRateMax}/hr</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input type="number" value={hourlyRateMin} onChange={(e) => setHourlyRateMin(Number(e.target.value))} className="pl-7 rounded-xl bg-background/50" />
                    </div>
                    <span className="text-muted-foreground font-medium">to</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input type="number" value={hourlyRateMax} onChange={(e) => setHourlyRateMax(Number(e.target.value))} className="pl-7 rounded-xl bg-background/50" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium text-foreground/80 mb-0">Service Radius</Label>
                    <span className="text-sm font-semibold text-accent-foreground bg-accent px-2.5 py-1 rounded-full">{serviceRadius} miles</span>
                  </div>
                  <div className="pt-2">
                    <Slider value={[serviceRadius]} onValueChange={([v]) => setServiceRadius(v)} min={1} max={100} step={1} className="py-2" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 mt-4 border-t border-border/40">
                <Button variant="outline" className="h-12 rounded-xl px-6" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="flex-1 h-12 rounded-xl shadow-elevated transition-transform hover:-translate-y-0.5" onClick={() => setStep(4)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final step: Summary */}
        {step === totalSteps && (
          <Card className="glass-card border-0 shadow-elevated overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent"></div>
            <CardHeader className="pt-8 px-8 pb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-heading font-bold">You're all set!</CardTitle>
              <p className="text-muted-foreground mt-2">Here's a quick summary of your profile.</p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4 backdrop-blur-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/40"><span className="text-muted-foreground">Name</span><span className="font-semibold text-foreground">{name}</span></div>
                <div className="flex justify-between items-center py-2 border-b border-border/40"><span className="text-muted-foreground">Role</span><span className="font-semibold capitalize text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">{role}</span></div>
                {locationText && <div className="flex justify-between items-center py-2 border-b border-border/40"><span className="text-muted-foreground">Location</span><span className="font-medium text-foreground">{locationText}</span></div>}
                {role === "worker" && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-border/40"><span className="text-muted-foreground">Rate</span><span className="font-semibold text-foreground">₹{hourlyRateMin}-₹{hourlyRateMax}/hr</span></div>
                    <div className="flex justify-between items-center py-2"><span className="text-muted-foreground">Skills</span><span className="font-semibold text-foreground">{selectedSkills.length} selected</span></div>
                  </>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="h-12 rounded-xl px-6" onClick={() => setStep(step - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="flex-1 h-12 rounded-xl shadow-elevated transition-transform hover:-translate-y-0.5 text-base" onClick={handleSubmit} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Background decorations for Onboarding */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>
    </div>
  );
}
