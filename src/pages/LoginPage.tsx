import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/callback` } });
    if (error) toast.error(error.message);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <Card className="w-full max-w-md border-0 shadow-elevated glass-card overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent"></div>
          <CardHeader className="text-center pb-6 pt-8">
            <Link to="/" className="mb-6 inline-flex items-center justify-center gap-3 transition-transform hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg shadow-sm">N</div>
              <span className="text-2xl font-heading font-bold tracking-tight">NearCraft</span>
            </Link>
            <CardTitle className="text-2xl font-heading font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base mt-2">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-foreground/80">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl bg-background/50 focus-visible:bg-background transition-colors" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-foreground/80">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-12 rounded-xl bg-background/50 focus-visible:bg-background transition-colors" {...register("password")} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="text-right pb-1">
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-glow font-medium transition-colors">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base shadow-elevated transition-transform hover:-translate-y-0.5" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t border-border/60" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">or continue with</span>
              <div className="flex-1 border-t border-border/60" />
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl font-medium hover:bg-accent/50 transition-colors" onClick={signInWithGoogle}>
              Google
            </Button>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up <ArrowRight className="inline h-3 w-3" /></Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-1/4 -left-20 h-96 w-96 rounded-full bg-accent/20 blur-[100px]" />
        <div className="relative max-w-lg text-center px-8 z-10 glass-card p-12 mx-12 border-primary/10">
          <h2 className="mb-6 text-4xl font-heading font-bold leading-tight">Connect with local talent instantly.</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">Find trusted workers for any job, or discover high-paying gig opportunities near you with our premium platform.</p>
        </div>
      </div>
    </div>
  );
}
