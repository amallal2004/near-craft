import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

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
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="mb-6 text-3xl font-heading font-bold">Profile</h1>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">{profile?.name?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <p className="font-heading font-semibold text-lg">{profile?.name}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <StarRating rating={Number(profile?.avg_rating ?? 0)} size={14} className="mt-1" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={locationText} onChange={(e) => setLocationText(e.target.value)} /></div>
              <div className="space-y-2"><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
              <Button onClick={handleSave} disabled={loading} className="w-full h-11">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
