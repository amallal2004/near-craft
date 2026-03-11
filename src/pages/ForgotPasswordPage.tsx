import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Check your email for a reset link!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-background">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-border/50 shadow-2xl relative z-10 backdrop-blur-xl bg-card/40">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6 shadow-inner mx-auto group">
            <div className="w-8 h-8 rounded-xl bg-primary group-hover:scale-110 transition-transform duration-300 transform rotate-12 group-hover:rotate-0"></div>
          </Link>
          <h1 className="text-3xl font-heading font-bold mb-2 tracking-tight">Reset password</h1>
          <p className="text-muted-foreground">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <p className="text-sm text-foreground/80">We've sent a password reset link to <strong className="text-foreground">{email}</strong>.</p>
            <Button variant="outline" className="h-11 rounded-xl w-full border-border/40 hover:bg-accent/50" asChild><Link to="/login">Back to login</Link></Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-medium">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/30" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Send reset link
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
