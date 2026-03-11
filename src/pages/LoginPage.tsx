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
        <Card className="w-full max-w-md border-0 shadow-elevated bg-card">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="mb-6 inline-flex items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">G</div>
              <span className="text-xl font-heading font-bold">GigLocal</span>
            </Link>
            <CardTitle className="text-2xl font-heading">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="h-11 rounded-xl" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-11 rounded-xl" {...register("password")} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-11 w-11 rounded-xl" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground font-medium">or</span>
              <div className="flex-1 border-t" />
            </div>
            <Button variant="outline" className="w-full h-11 rounded-xl" onClick={signInWithGoogle}>
              Continue with Google
            </Button>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up <ArrowRight className="inline h-3 w-3" /></Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-background" />
        <div className="absolute top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl" />
        <div className="relative max-w-md text-center px-8">
          <h2 className="mb-4 text-3xl font-heading font-bold">Connect with local talent</h2>
          <p className="text-muted-foreground leading-relaxed">Find trusted workers for any job, or discover gig opportunities near you.</p>
        </div>
      </div>
    </div>
  );
}
