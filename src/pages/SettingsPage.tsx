import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeftRight, AlertTriangle, Lock, Shield, Settings as SettingsIcon, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function SettingsPage() {
  const { profile, activeRole, switchRole, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
    }
  };

  const otherRole = activeRole === "customer" ? "worker" : "customer";

  return (
    <AppLayout>
      <div className="bg-[#f9f9ff] min-h-screen">
        <div className="p-8 max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-l-primary/10 text-l-primary rounded-lg">
                  <SettingsIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-l-secondary opacity-70">Control Center</span>
              </div>
              <h1 className="text-4xl font-heading font-extrabold tracking-tight text-l-on-surface">
                Account <span className="text-l-primary">Settings</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-2xl">
                Manage your profile preferences, secure your account, and refine your experience on GigUp.
              </p>
            </motion.div>

            {/* Change Password Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-1.5 w-full bg-gradient-to-r from-l-primary/40 to-l-primary-container/40 group-hover:from-l-primary transition-all duration-500"></div>
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-heading font-bold text-l-on-surface">Security & Password</CardTitle>
                      <CardDescription className="text-slate-500 font-medium font-body mt-1">
                        Protect your account with a secure, unique password.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-bold text-sm">New Password</Label>
                    <div className="relative">
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="h-12 rounded-xl bg-slate-50 border-slate-100 pl-4 pr-12 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-l-primary/10 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="bg-gradient-to-br from-[#b7102a] to-[#db313f] text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-l-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-none"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Role Management Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-heading font-bold text-l-on-surface">Experience Mode</CardTitle>
                      <CardDescription className="text-slate-500 font-medium font-body mt-1">
                        Currently acting as <span className="font-bold text-l-primary capitalize px-2 py-0.5 rounded-lg bg-l-primary/5">{activeRole}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="bg-slate-50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">Switch to {otherRole} Dashboard</p>
                      <p className="text-xs text-slate-500 font-medium">Access your {otherRole} workspace and manage relevant tasks.</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => switchRole(otherRole)}
                      className="rounded-xl h-11 px-6 border-slate-200 hover:border-l-primary hover:text-l-primary hover:bg-white bg-white font-bold text-slate-600 transition-all"
                    >
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Switch Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-red-100 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500/20"></div>
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-heading font-bold text-red-600">Danger Zone</CardTitle>
                      <CardDescription className="text-slate-500 font-medium font-body mt-1">
                        Actions that involve your account session and data.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="flex items-center justify-between gap-4 p-4 border border-red-50 rounded-2xl bg-red-50/30">
                    <div className="space-y-0.5">
                      <p className="font-bold text-red-900 text-sm">Terminate Session</p>
                      <p className="text-xs text-red-700/60 font-medium">Sign out from your current device.</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={signOut}
                      className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer Text */}
            <motion.div variants={itemVariants} className="text-center pt-8 border-t border-slate-100 mt-12 pb-12">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                © {new Date().getFullYear()} GigUp Atelier. All rights reserved.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
