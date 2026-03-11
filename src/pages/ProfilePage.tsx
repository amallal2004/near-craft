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
        <div className="page-header">
          <h1>Profile</h1>
          <p>Manage your personal information</p>
        </div>

        {/* Profile hero card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary-glow/10 to-accent" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-card shadow-elevated">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div className="pb-1">
                <p className="font-heading font-bold text-xl">{profile?.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profile?.email}</span>
                </div>
                <StarRating rating={Number(profile?.avg_rating ?? 0)} size={14} className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="font-medium">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-xl pl-10" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={locationText} onChange={(e) => setLocationText(e.target.value)} className="h-11 rounded-xl pl-10" placeholder="City, State" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="rounded-xl" placeholder="Tell others about yourself..." />
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full h-11 rounded-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
