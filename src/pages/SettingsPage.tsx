import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeftRight, AlertTriangle } from "lucide-react";

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
      <div className="mx-auto max-w-2xl p-6 lg:p-8 space-y-6">
        <h1 className="text-3xl font-heading font-bold">Settings</h1>

        <Card>
          <CardHeader><CardTitle className="font-heading">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
            <Button onClick={handlePasswordChange} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Update Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading">Role</CardTitle><CardDescription>Currently active as <strong className="capitalize">{activeRole}</strong></CardDescription></CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => switchRole(otherRole)}><ArrowLeftRight className="mr-2 h-4 w-4" /> Switch to {otherRole}</Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="font-heading text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={signOut}>Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
