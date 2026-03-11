import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeftRight, AlertTriangle, Lock, Shield } from "lucide-react";

export default function SettingsPage() {
  const { profile, activeRole, switchRole, signOut, user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error("Min 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setNewPassword(""); }
  };

  const otherRole = activeRole === "customer" ? "worker" : "customer";

  return (
    <AppLayout>
      <div className="page-container max-w-2xl mx-auto space-y-6">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Lock className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-11 rounded-xl" />
            </div>
            <Button onClick={handlePasswordChange} disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Update Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Role</CardTitle>
                <CardDescription>Currently active as <strong className="capitalize text-foreground">{activeRole}</strong></CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => switchRole(otherRole)} className="rounded-xl">
              <ArrowLeftRight className="mr-2 h-4 w-4" /> Switch to {otherRole}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={signOut} className="rounded-xl">Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
