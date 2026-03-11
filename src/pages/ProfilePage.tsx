import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "sonner";
import { Loader2, Camera, MapPin, Phone, Mail } from "lucide-react";

export default function ProfilePage() {
  const { profile, refreshProfile, user } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [locationText, setLocationText] = useState(profile?.location_text ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ name, bio: bio || null, phone: phone || null, location_text: locationText || null }).eq("id", user.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); refreshProfile(); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    toast.success("Avatar updated!");
    refreshProfile();
  };

  return (
    <AppLayout>
      <div className="page-container max-w-2xl mx-auto">
        <div className="page-header text-center mb-10">
          <h1 className="text-4xl font-heading font-bold">Profile</h1>
          <p className="text-lg text-muted-foreground mt-2">Manage your personal information</p>
        </div>

        {/* Profile hero card */}
        <Card className="mb-8 overflow-hidden glass-card border-none ring-1 ring-border/50">
          <div className="h-32 bg-gradient-to-r from-primary/30 via-primary-glow/20 to-accent/40 relative">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          </div>
          <CardContent className="relative pt-0 pb-8 px-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 text-center sm:text-left">
              <div className="relative group">
                <Avatar className="h-28 w-28 ring-4 ring-card shadow-elevated transition-transform group-hover:scale-105">
                  <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-accent to-accent-foreground/20 text-accent-foreground text-3xl font-bold">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card hover:bg-primary/90 transition-all hover:scale-110">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div className="pb-2 flex-1">
                <h2 className="font-heading font-bold text-3xl text-foreground tracking-tight mb-1">{profile?.name}</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3 font-medium">
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary/70" />{profile?.email}</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-accent/40 rounded-full px-3 py-1 mt-1">
                  <StarRating rating={Number(profile?.avg_rating ?? 0)} size={14} className="" />
                  <span className="text-xs font-semibold text-foreground/80">{Number(profile?.avg_rating ?? 0).toFixed(1)} Rating</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="glass-card">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-heading font-semibold mb-2">Edit Details</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium text-foreground/80">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-background/50 focus-visible:bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-foreground/80">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl pl-11 bg-background/50 focus-visible:bg-background" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium text-foreground/80">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={locationText} onChange={(e) => setLocationText(e.target.value)} className="h-12 rounded-xl pl-11 bg-background/50 focus-visible:bg-background" placeholder="City, State" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium text-foreground/80">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="rounded-xl bg-background/50 focus-visible:bg-background resize-none" placeholder="Tell others about yourself..." />
            </div>
            
            <div className="pt-4 border-t border-border/40 mt-6">
              <Button onClick={handleSave} disabled={loading} size="lg" className="w-full sm:w-auto h-12 rounded-xl px-8 shadow-elevated transition-transform hover:-translate-y-0.5 ml-auto block">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : null} Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
