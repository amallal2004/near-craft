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
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={cn("h-2 rounded-full transition-all", i + 1 <= step ? "w-12 bg-primary" : "w-8 bg-muted")} />
          ))}
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold">How will you use GigLocal?</h1>
              <p className="mt-2 text-muted-foreground">You can always switch roles later</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className={cn("cursor-pointer transition-all hover:border-primary/50", role === "customer" && "border-primary ring-2 ring-primary/20")} onClick={() => setRole("customer")}>
                <CardContent className="flex flex-col items-center p-8">
                  <User className="mb-4 h-12 w-12 text-primary" />
                  <CardTitle className="text-lg font-heading">I need help</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground text-center">Hire workers for tasks</p>
                </CardContent>
              </Card>
              <Card className={cn("cursor-pointer transition-all hover:border-primary/50", role === "worker" && "border-primary ring-2 ring-primary/20")} onClick={() => setRole("worker")}>
                <CardContent className="flex flex-col items-center p-8">
                  <Briefcase className="mb-4 h-12 w-12 text-primary" />
                  <CardTitle className="text-lg font-heading">I want gigs</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground text-center">Find work near you</p>
                </CardContent>
              </Card>
            </div>
            <Button className="w-full h-11" onClick={() => setStep(2)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        )}

        {/* Step 2: Basic info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Tell us about yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="City, State" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="flex-1 h-11" onClick={() => { if (!name || name.length < 2) { toast.error("Name is required"); return; } setStep(role === "worker" ? 3 : totalSteps); }}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Worker details */}
        {step === 3 && role === "worker" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Your skills & rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedSkills((prev) => prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id])}
                      className={cn("rounded-full border px-3 py-1.5 text-sm transition-all", selectedSkills.includes(cat.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <Textarea value={experienceDesc} onChange={(e) => setExperienceDesc(e.target.value)} placeholder="Tell clients about your experience..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate Range: ${hourlyRateMin} - ${hourlyRateMax}</Label>
                <div className="flex gap-4">
                  <Input type="number" value={hourlyRateMin} onChange={(e) => setHourlyRateMin(Number(e.target.value))} placeholder="Min" />
                  <Input type="number" value={hourlyRateMax} onChange={(e) => setHourlyRateMax(Number(e.target.value))} placeholder="Max" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service Radius: {serviceRadius} miles</Label>
                <Slider value={[serviceRadius]} onValueChange={([v]) => setServiceRadius(v)} min={1} max={100} step={1} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="flex-1 h-11" onClick={() => setStep(4)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final step: Summary */}
        {step === totalSteps && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading">All set!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium capitalize">{role}</span></div>
                {locationText && <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{locationText}</span></div>}
                {role === "worker" && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-medium">${hourlyRateMin}-${hourlyRateMax}/hr</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Skills</span><span className="font-medium">{selectedSkills.length} selected</span></div>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button className="flex-1 h-11" onClick={handleSubmit} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
