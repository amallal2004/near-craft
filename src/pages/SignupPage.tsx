import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { Loader2, Mail, Eye, EyeOff, ArrowRight, Lock } from "lucide-react";
import LoadingScreen from "@/components/auth/LoadingScreen";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupInput) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Check your email for a confirmation link!");
      navigate("/login");
    } catch (error) {
      console.error("Signup failed", error);
      toast.error(getSupabaseErrorMessage(error));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/callback` } });
      if (error) toast.error(error.message);
    } catch (error) {
      console.error("Google sign-in failed", error);
      toast.error(getSupabaseErrorMessage(error));
    }
  };

  if (isSubmitting) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 sm:p-6 relative bg-gradient-to-br from-[#f0f3ff] to-[#e4bebc]/20 font-['Inter'] text-[#001b3c] antialiased selection:bg-[#db313f] selection:text-white overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#primary]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#b7102a]/5 blur-[120px] pointer-events-none"></div>

      {/* Main Centered Card container */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,27,60,0.1)] flex flex-col md:flex-row-reverse relative z-10 border border-white/50 h-[95vh] max-h-[850px] overflow-hidden">
        
        {/* Image/Branding Side (Right) */}
        <section className="hidden md:flex flex-col flex-1 relative justify-between p-8 lg:p-10 text-white bg-gradient-to-br from-[#b7102a] via-[#bb152c] to-[#92001c]">
          
          {/* Background Decorative Elements */}
          <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-black/10 rounded-full blur-2xl z-0 pointer-events-none"></div>
          
          {/* Logo Section */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-white text-[#b7102a] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">G</div>
              <h1 className="text-2xl font-black tracking-tighter text-white font-['Plus_Jakarta_Sans']">Near-Craft</h1>
            </Link>
          </div>
          
          {/* Illustration Area */}
          <div className="relative z-10 flex-grow flex items-center justify-center py-4">
            <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center p-2 backdrop-blur-xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 group">
              <div className="absolute inset-0 bg-[#001b3c]/20 rounded-xl blur-lg transition-all group-hover:blur-xl"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/0 rounded-2xl blur-lg opacity-50"></div>
              <img 
                alt="Professional Workspace" 
                className="w-full h-full object-cover rounded-xl shadow-inner relative z-10 grayscale-[20%] group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhbZWKKAYxm7oJjll3au_d6RH18v1Xbn9ezL_uJaTnKBQcrDL2e8QzNHoYxD89u_olyK0Eqg3rTw1ogT6b-SqUyqu0v4KXu3lZm858L7KRnLdZeIDsXBmaTJ-NWqvSRdGD6lomyi8jZVNqqjkHY-wizPnx3Xkoe3dXoL0uhxs_AAh1_N79t9Tp_A1EC5UaOdJyfyomT41ppN6uQmjADjz7kz94h0ojrmo204p2LuXrcE50lbSoiuUz3arFxfXg8tmipWMB23GGOc0"
              />
            </div>
          </div>
          
          {/* Testimonial Section */}
          <div className="relative z-10 mt-4 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
            <p className="text-lg font-['Plus_Jakarta_Sans'] font-bold text-white leading-tight mb-4 italic">
              "Near-Craft made it easy to start my local professional career. The platform is intuitive and high-velocity."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                <img 
                  alt="Sofia Gomez profile photo" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrmEKk0CFLpAgKELKkdguHBdpgCzZ0Y0Z-Bpl3uKTxePYliIsQRQxJx3I9Ik5UDZPSHPms1P-ZKJWJ3s_UH_o8Zu_MUnZ2jXQ_gE8EMUkVcqL36ZfkACaIrKkRhiHpPiCQ0vixMJMZsrqb7m66tSSrMg8xp0Ib_Id7hVvyXz8UkWSYLfEQxc3oTMKoFIluo4zr7ZQ_oe5Um-t6SaEIQgeiYD9mWgJ5bW9_uiZL1Qm7pVZqZWedCgKv8mEbTzsCKEAo6Ia9-Tfc90o"
                />
              </div>
              <div>
                <p className="font-bold text-white text-sm uppercase tracking-tight">Sofia Gomez</p>
                <p className="text-white/70 text-xs font-medium">Licensed Plumber</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Side (Left) */}
        <section className="flex-[1.2] flex flex-col justify-center px-6 sm:px-10 lg:px-14 bg-white relative overflow-y-auto w-full md:w-[55%]">
          
          <div className="w-full max-w-md mx-auto relative z-10 py-6">
            {/* Mobile Header Only */}
            <div className="md:hidden mb-6 flex justify-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#b7102a] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">G</div>
                <h1 className="text-2xl font-black tracking-tighter text-[#b7102a] font-['Plus_Jakarta_Sans']">Near-Craft</h1>
              </Link>
            </div>
            
            <header className="mb-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[#f0f3ff] border border-[#e4bebc] md:hidden">
                <span className="w-2 h-2 rounded-full bg-[#b7102a] animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#b7102a]">Velocity Workspaces</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-['Plus_Jakarta_Sans'] font-black text-[#001b3c] tracking-tight mb-2">Create Your Account</h2>
              <p className="text-[#485f84] font-medium text-base">Join the global Near-Craft community</p>
            </header>


            
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-['Inter'] uppercase tracking-widest text-[#5b403f] ml-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f6f6e] w-4 h-4 group-focus-within:text-[#b7102a] transition-colors" />
                  <input 
                    className="relative w-full pl-10 pr-4 py-3 bg-white border border-[#e4bebc] rounded-xl text-[#001b3c] font-medium focus:border-[#b7102a] focus:ring-2 focus:ring-[#b7102a]/20 outline-none transition-all placeholder:text-[#8f6f6e]/70" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-[#ba1a1a] ml-1 font-medium">{errors.email.message}</p>}
              </div>
              
              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-['Inter'] uppercase tracking-widest text-[#5b403f] ml-1" htmlFor="password">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f6f6e] w-4 h-4 group-focus-within:text-[#b7102a] transition-colors" />
                  <input 
                    className="relative w-full pl-10 pr-10 py-3 bg-white border border-[#e4bebc] rounded-xl text-[#001b3c] font-medium focus:border-[#b7102a] focus:ring-2 focus:ring-[#b7102a]/20 outline-none transition-all placeholder:text-[#8f6f6e]/70" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f6f6e] hover:text-[#001b3c] focus:text-[#b7102a] transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#ba1a1a] ml-1 font-medium">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-['Inter'] uppercase tracking-widest text-[#5b403f] ml-1" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f6f6e] w-4 h-4 group-focus-within:text-[#b7102a] transition-colors" />
                  <input 
                    className="relative w-full pl-10 pr-10 py-3 bg-white border border-[#e4bebc] rounded-xl text-[#001b3c] font-medium focus:border-[#b7102a] focus:ring-2 focus:ring-[#b7102a]/20 outline-none transition-all placeholder:text-[#8f6f6e]/70" 
                    id="confirmPassword" 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f6f6e] hover:text-[#001b3c] focus:text-[#b7102a] transition-colors" 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-[#ba1a1a] ml-1 font-medium">{errors.confirmPassword.message}</p>}
              </div>
              
              {/* Terms Checkbox */}
              <div className="flex items-start ml-1 pt-2 gap-2">
                <div className="flex items-center h-5">
                  <input className="w-4 h-4 rounded-sm border-[#e4bebc] text-[#b7102a] focus:ring-[#b7102a]/20 transition-all cursor-pointer" id="terms" type="checkbox" required/>
                </div>
                <label className="text-xs text-[#485f84] leading-tight" htmlFor="terms">
                  I agree to the <a className="text-[#b7102a] hover:underline font-semibold" href="#">Terms of Service</a> and <a className="text-[#b7102a] hover:underline font-semibold" href="#">Privacy Policy</a>.
                </label>
              </div>
              
              {/* Submit Button */}
              <button 
                className="w-full py-3 mt-4 text-white font-bold rounded-xl shadow-[0_8px_16px_-8px_rgba(183,16,42,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(183,16,42,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-2 overflow-hidden group relative bg-gradient-to-r from-[#b7102a] via-[#db313f] to-[#b7102a] bg-[length:200%_auto] hover:bg-right" 
                type="submit"
                disabled={isSubmitting}
              >
                <div className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>
            </form>
            
            {/* Footer Link */}
            <footer className="mt-8 text-center pb-2">
              <p className="text-[#485f84] font-medium text-sm">
                Already have an account? 
                <Link className="text-[#b7102a] font-black hover:text-[#93000a] hover:underline underline-offset-4 ml-2 transition-all" to="/login">Sign In</Link>
              </p>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
