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
      <div className="page-container max-w-2xl mx-auto space-y-8">
        <div className="page-header text-center mb-10">
          <h1 className="text-4xl font-heading font-bold">Settings</h1>
          <p className="text-lg text-muted-foreground mt-2">Manage your account preferences</p>
        </div>

        <Card className="glass-card overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent"></div>
          <CardHeader className="pb-4 pt-6 px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Change Password</CardTitle>
                <CardDescription className="text-base mt-1">Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-3">
              <Label className="font-medium text-foreground/80 text-sm">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-xl bg-background/50 focus-visible:bg-background transition-colors" />
            </div>
            <Button onClick={handlePasswordChange} disabled={loading} className="rounded-xl h-11 px-8 shadow-elevated">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Update Password
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-8 border-b border-border/40">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Account Role</CardTitle>
                <CardDescription className="text-base mt-1">Currently active as <strong className="capitalize text-foreground font-semibold px-2 py-0.5 rounded-md bg-secondary/50">{activeRole}</strong></CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 bg-card/30">
            <Button variant="outline" onClick={() => switchRole(otherRole)} className="rounded-xl h-12 w-full sm:w-auto px-8 hover:bg-accent/50 transition-colors border-2">
              <ArrowLeftRight className="mr-2 h-4 w-4 text-muted-foreground" /> Switch to {otherRole}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/30 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-destructive/30"></div>
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-destructive text-xl">Danger Zone</CardTitle>
                <CardDescription className="text-base mt-1 text-destructive/80">Irreversible account actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <Button variant="destructive" onClick={signOut} className="rounded-xl h-12 px-8 shadow-sm hover:shadow-md transition-all">Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
