import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Loader2, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import LoadingScreen from "@/components/auth/LoadingScreen";

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

  if (isSubmitting) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 sm:p-6 relative bg-gradient-to-br from-[#f0f3ff] to-[#e4bebc]/20 font-['Inter'] text-[#001b3c] antialiased selection:bg-[#db313f] selection:text-white overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#primary]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#b7102a]/5 blur-[120px] pointer-events-none"></div>

      {/* Main Centered Card container */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,27,60,0.1)] flex flex-col md:flex-row relative z-10 border border-white/50 h-[95vh] max-h-[800px]">
        
        {/* Left Side: Branded Illustration & Testimonial */}
        <section className="hidden md:flex flex-col flex-1 relative overflow-hidden justify-between p-8 lg:p-10 text-white rounded-l-[2rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#b7102a] via-[#bb152c] to-[#92001c] z-0"></div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-black/10 rounded-full blur-2xl z-0 pointer-events-none"></div>
          
          {/* Logo Section */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-white text-[#b7102a] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">G</div>
              <h1 className="text-2xl font-black tracking-tighter text-white font-['Plus_Jakarta_Sans']">GigUp</h1>
            </Link>
          </div>
          
          {/* Illustration Area */}
          <div className="relative z-10 flex-grow flex items-center justify-center py-4">
            <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center p-2 backdrop-blur-xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/0 rounded-2xl blur-lg opacity-50"></div>
              <img 
                alt="Professional Workspace" 
                className="w-full h-full object-cover rounded-xl shadow-inner relative z-10" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5wjiji4kxXpFIpVzSyMiYgLEy4sBukGvPQSglV6WagoZshMZDHZVQL4BHVQDHpdIbwBvL5oqbD7E7sUj7tOl1ZMSJKMIDTS-TQOMH__o1PqZz7xSi05Y2GIyboZW1G3zRVn91SHDv0JEXwN4fyGYkKoUJTknHcap80HomT8zjf3fjs_okAjGiAjC3UznonROWraRjlT-JSbpg6UFR1QMtKIaeLM4DUzPz_U4AdDJrZDLKts4TYAN0C7VyMNlVV23bqmeMaSrOpAg"
              />
            </div>
          </div>
          
          {/* Testimonial Section */}
          <div className="relative z-10 mt-4 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
            <div className="flex gap-1 mb-2 text-[#ffb780]">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              ))}
            </div>
            <p className="text-lg font-['Plus_Jakarta_Sans'] font-bold text-white leading-tight mb-4">
              "This platform transformed how I handle quick tasks. The velocity is honestly unmatched."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                <img 
                  alt="User avatar" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyvdEFAOFUd1WrPQOo6141T2q73ICB7J-wJcjfAQuEP1_Frth6RFDNeH6GUdSL4IIIorOv3lChLmAZcTYEMtzfTKcIKd5Snn70M8004keGgvYFjLa-sDLJebj6V9ggXkQsTJQ221qRIIN46KfEVccHqzubtCZ42UvL5rrLsEdcO2wyxcWQ2EZ11RtZgXri6HQRO0knMdY6K-Iim1DdPsKue37ZsnP9EcmDjV3YU-XD2zh2SGdfHeiFJQaT6CdlYdjq_bxEfcpyNF4"
                />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Alex Rivera</p>
                <p className="text-white/70 text-xs font-medium">Lead Motion Designer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 bg-white relative rounded-r-[2rem] overflow-y-auto w-full md:w-1/2">
          
          <div className="w-full max-w-md mx-auto relative z-10 py-6">
            {/* Mobile Header Only */}
            <div className="md:hidden mb-6 flex justify-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#b7102a] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">G</div>
                <h1 className="text-2xl font-black tracking-tighter text-[#b7102a] font-['Plus_Jakarta_Sans']">GigUp</h1>
              </Link>
            </div>
            
            <header className="mb-8 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-['Plus_Jakarta_Sans'] font-black text-[#001b3c] tracking-tight mb-2">Welcome Back</h2>
              <p className="text-[#485f84] font-medium text-base">Sign in to your account</p>
            </header>
            
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold font-['Inter'] uppercase tracking-widest text-[#5b403f] ml-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#b7102a]/20 to-[#db313f]/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <input 
                    className="relative w-full px-4 py-3 bg-[#f0f3ff] border border-transparent rounded-xl text-[#001b3c] font-medium focus:bg-white focus:border-[#e4bebc] focus:ring-4 focus:ring-[#b7102a]/10 outline-none transition-all placeholder:text-[#8f6f6e]/70" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    {...register("email")}
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f6f6e] w-4 h-4 group-focus-within:text-[#b7102a] transition-colors" />
                </div>
                {errors.email && <p className="text-xs text-[#ba1a1a] ml-1 font-medium">{errors.email.message}</p>}
              </div>
              
              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-xs font-bold font-['Inter'] uppercase tracking-widest text-[#5b403f]" htmlFor="password">Password</label>
                  <Link className="text-xs font-bold text-[#b7102a] hover:text-[#93000a] transition-colors" to="/forgot-password">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#b7102a]/20 to-[#db313f]/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <input 
                    className="relative w-full px-4 py-3 bg-[#f0f3ff] border border-transparent rounded-xl text-[#001b3c] font-medium focus:bg-white focus:border-[#e4bebc] focus:ring-4 focus:ring-[#b7102a]/10 outline-none transition-all placeholder:text-[#8f6f6e]/70" 
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
              
              {/* Remember Me */}
              <div className="flex items-center ml-1 pt-1.5">
                <input className="w-4 h-4 rounded-sm border-[#e4bebc] text-[#b7102a] focus:ring-[#b7102a]/20 transition-all cursor-pointer" id="remember" type="checkbox"/>
                <label className="ml-2 text-xs font-semibold text-[#30476a] cursor-pointer select-none" htmlFor="remember">Keep me logged in</label>
              </div>
              
              {/* Submit Button */}
              <button 
                className="w-full py-3 mt-4 text-white font-bold rounded-xl shadow-[0_8px_16px_-8px_rgba(183,16,42,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(183,16,42,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-2 overflow-hidden group relative bg-gradient-to-r from-[#b7102a] via-[#db313f] to-[#b7102a] bg-[length:200%_auto] hover:bg-right" 
                type="submit"
                disabled={isSubmitting}
              >
                <div className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In to Dashboard"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>
            </form>
            
            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#dee8ff]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="px-3 bg-white text-[#8f6f6e]">Or continue with</span>
              </div>
            </div>
            
            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={signInWithGoogle}
                className="flex items-center justify-center py-3 px-3 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] hover:-translate-y-0.5 active:translate-y-0 transition-all group"
                type="button"
              >
                <img alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLMUYUIA5HcyGKerNAKxFG4lGLuqebN-7Udl9t90elFlQ8_U_Lfw4RH8OFh6R9Pb0d3t6aNP3d9IzP6AJKPGEOUpq1gWbJHYKp20oBu8U-pN2sk9UALi78f6wsoKk9K23HcKYa9xUpcUoDqoR2c6SzpLRYvWN-g3lMqPtJ7H1qIGHfLheAZTXNyHavp-9qreDB6SjdZ8ZVzdc6f3q3BTteloXsIH3AcWNEFgqhP8jCOr1C3rHCwhhMvnr4vkPtN4n74yY7SYlBz5w"/>
              </button>
              <button 
                className="flex items-center justify-center py-3 px-3 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] hover:-translate-y-0.5 active:translate-y-0 transition-all group"
                type="button"
              >
                <svg className="w-5 h-5 text-[#485f84] group-hover:text-[#b7102a] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11V3H8v6H2v12h20V11h-6Zm-6-6h4v14h-4V5Zm-6 6h4v8H4v-8Zm16 8h-4v-6h4v6Z"/>
                </svg>
              </button>
              <button 
                className="flex items-center justify-center py-3 px-3 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] hover:-translate-y-0.5 active:translate-y-0 transition-all group"
                type="button"
              >
                <svg className="w-5 h-5 text-[#485f84] group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.7 1.5.15 2.65.81 3.42 1.94-2.88 1.66-2.36 5.56.55 6.78-1.08 2.65-2.86 4.34-2.78 4.15ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
                </svg>
              </button>
            </div>
            
            {/* Footer Link */}
            <footer className="mt-8 text-center pb-2">
              <p className="text-[#485f84] font-medium text-sm">
                Don't have an account? 
                <Link className="text-[#b7102a] font-black hover:text-[#93000a] hover:underline underline-offset-4 ml-2 transition-all" to="/signup">Join Now</Link>
              </p>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
