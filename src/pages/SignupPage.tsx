import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupInput) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/callback` },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for a confirmation link!");
      navigate("/login");
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/callback` } });
    if (error) toast.error(error.message);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link to="/" className="mb-4 inline-block text-2xl font-heading font-bold text-primary">GigLocal</Link>
            <CardTitle className="text-2xl font-heading">Create your account</CardTitle>
            <CardDescription>Start hiring or finding gigs today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create account
              </Button>
            </form>
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t" />
            </div>
            <Button variant="outline" className="w-full h-11" onClick={signInWithGoogle}>
              Continue with Google
            </Button>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="max-w-md text-center px-8">
          <h2 className="mb-4 text-3xl font-heading font-bold">Join the community</h2>
          <p className="text-muted-foreground">Thousands of customers and workers already trust GigLocal for local services.</p>
        </div>
      </div>
    </div>
  );
}
