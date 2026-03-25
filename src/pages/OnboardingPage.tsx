import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState<"customer" | "worker" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationText, setLocationText] = useState("");
  const [experienceDesc, setExperienceDesc] = useState("");
  const [hourlyRateMin, setHourlyRateMin] = useState(15);
  const [hourlyRateMax, setHourlyRateMax] = useState(50);
  const [serviceRadius, setServiceRadius] = useState(10);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const totalSteps = role === "worker" ? 4 : 3;

  const handleRoleSelect = (selectedRole: "customer" | "worker") => {
    setRole(selectedRole);
    setTimeout(() => setStep(2), 400); // Slight delay for feedback
  };

  const handleSubmit = async () => {
    if (!user || !role) return;
    setLoading(true);

    const { error: profileError } = await supabase.from("profiles").update({
      name,
      phone: phone || null,
      role,
      active_role: role,
      location_text: locationText || null,
    }).eq("id", user.id);

    if (profileError) {
      toast.error(profileError.message);
      setLoading(false);
      return;
    }

    if (role === "worker") {
      const { data: wp, error: wpError } = await supabase.from("worker_profiles").upsert({
        user_id: user.id,
        experience_desc: experienceDesc || null,
        hourly_rate_min: hourlyRateMin,
        hourly_rate_max: hourlyRateMax,
        service_radius: serviceRadius,
      }).select().single();

      if (wpError) {
        toast.error(wpError.message);
        setLoading(false);
        return;
      }

      if (selectedSkills.length > 0 && wp) {
        await supabase.from("worker_skills").delete().eq("worker_id", wp.id);
        await supabase.from("worker_skills").insert(
          selectedSkills.map((catId) => ({ worker_id: wp.id, category_id: catId }))
        );
      }
    }

    await refreshProfile();
    setLoading(false);
    toast.success("Welcome to MinuteWorker!");
    navigate("/dashboard", { replace: true });
  };

  const getProgressWidth = () => {
    if (!role) return "0%";
    if (role === "customer") {
      return (step / 3) * 100 + "%";
    }
    return (step / 4) * 100 + "%";
  };

  return (
    <div className={cn(
      "bg-[#f9f9ff] font-['Inter'] text-[#001b3c] min-h-screen flex flex-col relative overflow-x-hidden",
      step === 1 && "h-screen overflow-hidden"
    )}>
      {/* Decoration Elements */}
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-1/2 bg-gradient-to-bl from-[#E63946]/5 to-transparent blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-gradient-to-tr from-[#485f84]/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* TopNavBar - Hidden for Step 1 & 2 to save space */}
      <AnimatePresence>
        {step > 2 && (
          <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100"
          >
            <div className="text-2xl font-black italic text-[#E63946] font-['Plus_Jakarta_Sans'] tracking-tight">MinuteWorker</div>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-[#E63946] transition-colors p-2">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className={cn(
        "flex-grow flex flex-col items-center w-full relative",
        (step === 1 || step === 2) ? "h-screen overflow-hidden" : "justify-start pt-20"
      )}>
        <AnimatePresence mode="wait">
          {/* Step 1: Twin Hero Redesign */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex flex-col md:flex-row min-h-0 bg-white"
            >
              {/* Customer Side */}
              <motion.div 
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center p-8 md:p-12 cursor-pointer group overflow-hidden transition-all duration-700",
                  role === "customer" ? "bg-[#E63946] md:flex-[1.5]" : "bg-white hover:bg-[#fde8e9] md:hover:flex-[1.2]"
                )}
                onClick={() => handleRoleSelect("customer")}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    className={cn(
                      "w-24 h-24 md:w-40 md:h-40 rounded-3xl mb-8 flex items-center justify-center shadow-2xl transition-colors duration-500",
                      role === "customer" ? "bg-white text-[#E63946]" : "bg-[#fde8e9] text-[#E63946]"
                    )}
                  >
                    <span className="material-symbols-outlined text-6xl md:text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
                  </motion.div>
                  <motion.h2 
                    className={cn(
                      "text-3xl md:text-6xl font-black uppercase tracking-tighter mb-4 transition-colors duration-500",
                      role === "customer" ? "text-white" : "text-[#001b3c]"
                    )}
                  >
                    I Need <br className="hidden md:block"/> Service
                  </motion.h2>
                  <p className={cn(
                    "text-sm md:text-xl font-medium max-w-xs md:max-w-sm transition-colors duration-500",
                    role === "customer" ? "text-white/80" : "text-[#485f84]"
                  )}>
                    Hire top-tier local experts for tasks, chores, and professional gigs.
                  </p>
                  <div className={cn(
                    "mt-8 flex items-center gap-2 font-black text-xs md:text-base uppercase tracking-widest px-6 py-3 rounded-full border-2 transition-all duration-300",
                    role === "customer" ? "bg-white text-[#E63946] border-white" : "border-[#001b3c]/10 text-[#001b3c] group-hover:bg-[#E63946] group-hover:text-white group-hover:border-[#E63946]"
                  )}>
                    Get Started <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -left-10 text-[200px] font-black text-[#001b3c]/5 select-none pointer-events-none">HIRE</div>
              </motion.div>

              {/* Split Line */}
              <div className="hidden md:block w-px bg-slate-100 relative z-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-4 rounded-full shadow-lg border border-slate-100 font-black italic text-[10px] text-[#485f84]">OR</div>
              </div>

              {/* Worker Side */}
              <motion.div 
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center p-8 md:p-12 cursor-pointer group overflow-hidden transition-all duration-700",
                  role === "worker" ? "bg-[#001b3c] md:flex-[1.5]" : "bg-white hover:bg-[#dee8ff] md:hover:flex-[1.2]"
                )}
                onClick={() => handleRoleSelect("worker")}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={cn(
                      "w-24 h-24 md:w-40 md:h-40 rounded-3xl mb-8 flex items-center justify-center shadow-2xl transition-colors duration-500",
                      role === "worker" ? "bg-white text-[#001b3c]" : "bg-[#dee8ff] text-[#001b3c]"
                    )}
                  >
                    <span className="material-symbols-outlined text-6xl md:text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>work_history</span>
                  </motion.div>
                  <motion.h2 
                    className={cn(
                      "text-3xl md:text-6xl font-black uppercase tracking-tighter mb-4 transition-colors duration-500",
                      role === "worker" ? "text-white" : "text-[#001b3c]"
                    )}
                  >
                    I Want <br className="hidden md:block"/> Work
                  </motion.h2>
                  <p className={cn(
                    "text-sm md:text-xl font-medium max-w-xs md:max-w-sm transition-colors duration-500",
                    role === "worker" ? "text-white/80" : "text-[#485f84]"
                  )}>
                    Build your career by completing tasks and getting paid instantly.
                  </p>
                  <div className={cn(
                    "mt-8 flex items-center gap-2 font-black text-xs md:text-base uppercase tracking-widest px-6 py-3 rounded-full border-2 transition-all duration-300",
                    role === "worker" ? "bg-white text-[#001b3c] border-white" : "border-[#001b3c]/10 text-[#001b3c] group-hover:bg-[#001b3c] group-hover:text-white group-hover:border-[#001b3c]"
                  )}>
                    Start Earning <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 text-[200px] font-black text-[#001b3c]/5 select-none pointer-events-none">GIGS</div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Basic Info Redesign (Contextual Split) */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full h-full flex items-center justify-center px-4 md:px-12 relative overflow-hidden"
            >
              <div className="w-full max-w-5xl h-[min(85vh,650px)] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,27,60,0.1)] overflow-hidden border border-slate-50 relative group/card">
                
                {/* Visual Context Side (Left) */}
                <div className={cn(
                  "relative w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-center text-white overflow-hidden transition-all duration-700",
                  role === "customer" ? "bg-[#E63946]" : "bg-[#001b3c]"
                )}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative z-10"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                      <span className="material-symbols-outlined text-3xl text-white">
                        {role === "customer" ? "rocket_launch" : "electric_bolt"}
                      </span>
                    </div>
                    <h1 className="font-['Plus_Jakarta_Sans'] font-black text-3xl md:text-4xl leading-[1.1] tracking-tighter mb-4 italic uppercase">
                      {role === "customer" ? (
                        <>Find Help <br/> in Minutes.</>
                      ) : (
                        <>Your Gig <br/> Journey <br/> Starts Here.</>
                      )}
                    </h1>
                    <div className={cn(
                      "h-1 w-12 mb-6 rounded-full",
                      role === "customer" ? "bg-white/40" : "bg-white/20"
                    )}></div>
                    <p className="text-white/70 text-sm md:text-base font-medium leading-relaxed max-w-[240px]">
                      {role === "customer" 
                        ? "Quick tasks or long-term projects, get matched instantly." 
                        : "Complete your professional profile and start earning today."}
                    </p>
                  </motion.div>

                  {/* Editorial Decorations */}
                  <div className="absolute top-8 right-8 text-white/5 font-black text-6xl italic select-none pointer-events-none">MW</div>
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
                </div>

                {/* Form Side (Right) - Modular Bento Design */}
                <div className="w-full md:w-[60%] flex flex-col relative bg-white">
                  {/* Integrated Progress Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 overflow-hidden z-20">
                    <motion.div 
                      className={cn(
                        "h-full rounded-r-full",
                        role === "customer" ? "bg-[#E63946]" : "bg-[#001b3c]"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: getProgressWidth() }}
                      transition={{ duration: 0.8, ease: "circOut" }}
                    />
                  </div>

                  <div className="flex-grow p-8 md:p-12 flex flex-col justify-center overflow-hidden">
                    <motion.header 
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8"
                    >
                      <h2 className="font-['Plus_Jakarta_Sans'] font-black text-2xl md:text-3xl text-[#001b3c] tracking-tight mb-2">Tell us about you.</h2>
                      <p className="text-[#485f84] text-xs font-medium opacity-50">Provide your basic dossier to proceed.</p>
                    </motion.header>

                    <div className="space-y-4">
                      {[
                        { 
                          id: 'name', 
                          label: 'Legal Full Name', 
                          required: true, 
                          icon: 'fingerprint', 
                          placeholder: 'Alex Rivera',
                          value: name,
                          setter: setName
                        },
                        { 
                          id: 'phone', 
                          label: 'Primary Contact', 
                          required: false, 
                          icon: 'alternate_email', 
                          placeholder: '+1 (555) 000-0000',
                          value: phone,
                          setter: setPhone
                        },
                        { 
                          id: 'location', 
                          label: 'Home Base', 
                          required: false, 
                          icon: 'distance', 
                          placeholder: 'City, State',
                          value: locationText,
                          setter: setLocationText
                        }
                      ].map((field, idx) => (
                        <motion.div 
                          key={field.id}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + (idx * 0.1) }}
                          className="group relative"
                        >
                          <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 focus-within:border-[#E63946]/30 focus-within:bg-white focus-within:shadow-[0_10px_30px_rgba(230,57,70,0.05)] transition-all duration-300">
                            <label className="block font-black text-[9px] uppercase tracking-[0.2em] text-[#485f84]/60 mb-2 group-focus-within:text-[#E63946] transition-colors">
                              {field.label} {field.required && <span className="text-[#E63946]">*</span>}
                            </label>
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-xl text-slate-300 group-focus-within:text-[#E63946] transition-colors">
                                {field.icon}
                              </span>
                              <input 
                                value={field.value} 
                                onChange={(e) => field.setter(e.target.value)} 
                                placeholder={field.placeholder} 
                                className="w-full p-0 bg-transparent border-0 outline-none focus:ring-0 focus:outline-none text-[#001b3c] font-bold text-sm placeholder:text-slate-200 h-auto shadow-none" 
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="pt-6 flex items-center gap-4"
                      >
                        <Button 
                          onClick={() => {
                            if (!name || name.length < 2) {
                              toast.error("Valid identity name is required");
                              return;
                            }
                            setStep(role === "worker" ? 3 : totalSteps);
                          }}
                          className={cn(
                            "flex-1 h-14 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-3",
                            role === "customer" ? "bg-[#E63946] hover:bg-[#b7102a]" : "bg-[#001b3c] hover:bg-[#002b5e]"
                          )}
                        >
                          Establish Profile
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Button>
                        <button 
                          onClick={() => setStep(1)}
                          className="w-14 h-14 flex items-center justify-center text-[#485f84] bg-slate-50 rounded-2xl hover:bg-[#E63946]/10 hover:text-[#E63946] transition-all group"
                          title="Change Role"
                        >
                          <span className="material-symbols-outlined transition-transform group-hover:rotate-180">swap_horiz</span>
                        </button>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Subtle Footer */}
                  <div className="px-10 pb-8 flex justify-between items-center opacity-20">
                    <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400">Atelier v2.2</p>
                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Worker Skills Redesign (Contextual Split) */}
          {step === 3 && role === "worker" && (
            <motion.div 
              key="step3-worker"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full h-full flex items-center justify-center px-4 md:px-12 relative overflow-hidden"
            >
              <div className="w-full max-w-5xl h-[min(85vh,650px)] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,27,60,0.1)] overflow-hidden border border-slate-50 relative group/card">
                
                {/* Visual Context Side (Left) */}
                <div className={cn(
                  "relative w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-center text-white transition-all duration-700 bg-[#001b3c]"
                )}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10"
                  >
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                      <span className="material-symbols-outlined text-3xl text-white">palette</span>
                    </div>
                    <h1 className="font-['Plus_Jakarta_Sans'] font-black text-3xl md:text-4xl leading-[1.1] tracking-tighter mb-4 italic uppercase">
                      Showcase <br/> Your <br/> Craft.
                    </h1>
                    <div className="h-1 w-12 mb-6 rounded-full bg-white/20"></div>
                    <p className="text-white/70 text-sm font-medium leading-relaxed max-w-[240px]">
                      Clients value precision. Define your expertise and set your parameters for the market.
                    </p>
                  </motion.div>

                  {/* Watermark */}
                  <div className="absolute top-8 right-8 text-white/5 font-black text-6xl italic select-none pointer-events-none">SK</div>
                </div>

                {/* Form Side (Right) */}
                <div className="w-full md:w-[60%] flex flex-col relative bg-white">
                  <div className="flex-grow p-8 md:p-12 md:py-8 flex flex-col justify-center overflow-hidden">
                    <motion.header 
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#001b3c]"></span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#485f84]">Service Parameters</span>
                      </div>
                      <h2 className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-[#001b3c] tracking-tight mb-1 font-italic uppercase italic">Define Your Offering</h2>
                    </motion.header>

                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                      {/* Skills Bento Grid */}
                      <div className="space-y-3">
                        <label className="block font-black text-[9px] uppercase tracking-[0.2em] text-[#485f84]/60">Expertise Categories</label>
                        <div className="flex flex-wrap gap-2">
                          {categories?.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedSkills((prev) => 
                                prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                              )}
                              className={cn(
                                "rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                                selectedSkills.includes(cat.id) 
                                  ? "border-[#001b3c] bg-[#001b3c] text-white shadow-lg" 
                                  : "border-slate-100 bg-slate-50/50 text-[#001b3c]/60 hover:border-[#001b3c]/30 hover:bg-white"
                              )}
                            >
                              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rates & Range */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[#485f84]/60">Hourly Rate (₹)</label>
                            <span className="text-xs font-black text-[#001b3c]">₹{hourlyRateMin}-₹{hourlyRateMax}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={hourlyRateMin} 
                              onChange={(e) => setHourlyRateMin(Number(e.target.value))} 
                              className="w-full bg-white border-0 h-10 text-xs font-black rounded-lg text-center focus:ring-1 focus:ring-[#001b3c]/20 outline-none"
                            />
                            <span className="text-slate-300 font-black">/</span>
                            <input 
                              type="number" 
                              value={hourlyRateMax} 
                              onChange={(e) => setHourlyRateMax(Number(e.target.value))} 
                              className="w-full bg-white border-0 h-10 text-xs font-black rounded-lg text-center focus:ring-1 focus:ring-[#001b3c]/20 outline-none"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                          <div className="flex justify-between items-center mb-6">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[#485f84]/60">Service Radius</label>
                            <span className="text-xs font-black text-[#001b3c]">{serviceRadius}KM</span>
                          </div>
                          <Slider 
                            value={[serviceRadius]} 
                            onValueChange={([v]) => setServiceRadius(v)} 
                            min={1} 
                            max={100} 
                            step={1} 
                            className="[&_[role=slider]]:bg-[#001b3c] [&_[role=slider]]:border-white"
                          />
                        </div>
                      </div>
                    </div>

                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="pt-8 flex items-center gap-4"
                    >
                      <Button 
                        onClick={() => {
                          if (selectedSkills.length === 0) {
                            toast.error("Please select at least one skill");
                            return;
                          }
                          setStep(4);
                        }}
                        className="flex-1 h-14 bg-[#001b3c] hover:bg-[#002b5e] text-white rounded-2xl font-black text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        Review Parameters
                        <span className="material-symbols-outlined text-base">analytics</span>
                      </Button>
                      <button 
                        onClick={() => setStep(2)}
                        className="w-14 h-14 flex items-center justify-center text-[#485f84] bg-slate-50 rounded-2xl hover:bg-[#001b3c]/10 hover:text-[#001b3c] transition-all"
                      >
                        <span className="material-symbols-outlined">arrow_back</span>
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4 (Worker) or 3 (Hirer): Summary / Confirmation Redesign */}
          {step === totalSteps && (
            <motion.div 
              key="summary-step"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full h-full flex items-center justify-center px-4 md:px-12 relative overflow-hidden"
            >
              <div className="w-full max-w-5xl h-[min(85vh,650px)] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,27,60,0.1)] overflow-hidden border border-slate-50 relative group/card">
                
                {/* Success Visual Side (Left) */}
                <div className={cn(
                  "relative w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-center text-white overflow-hidden transition-all duration-700",
                  role === "customer" ? "bg-[#E63946]" : "bg-[#001b3c]"
                )}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="relative z-10 text-center md:text-left"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl mx-auto md:mx-0 border border-white/10">
                      <motion.span 
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="material-symbols-outlined text-5xl text-white"
                      >
                        rocket_launch
                      </motion.span>
                    </div>
                    <h1 className="font-['Plus_Jakarta_Sans'] font-black text-3xl md:text-5xl leading-[1] tracking-tighter mb-4 italic uppercase">
                      Ready <br/> to Launch.
                    </h1>
                    <div className={cn(
                      "h-1.5 w-16 mb-8 rounded-full mx-auto md:mx-0",
                      role === "customer" ? "bg-white/40" : "bg-white/20"
                    )}></div>
                    <p className="text-white/70 text-sm md:text-base font-medium leading-relaxed max-w-[260px] mx-auto md:mx-0">
                      Your profile is calibrated and ready for the NearCraft ecosystem.
                    </p>
                  </motion.div>

                  {/* Aesthetic Watermark */}
                  <div className="absolute top-10 right-10 text-white/5 font-black text-8xl italic select-none pointer-events-none">OK</div>
                  <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
                </div>

                {/* Summary Details Side (Right) */}
                <div className="w-full md:w-[60%] flex flex-col relative bg-white">
                  <div className="flex-grow p-8 md:p-14 flex flex-col justify-center overflow-hidden">
                    <motion.header 
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mb-10"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600/60">Final Calibration</span>
                      </div>
                      <h2 className="font-['Plus_Jakarta_Sans'] font-black text-2xl md:text-4xl text-[#001b3c] tracking-tight mb-2 uppercase italic">{name}</h2>
                      <p className="text-[#485f84] text-xs font-medium opacity-40">Review your parameters before final deployment.</p>
                    </motion.header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                      {[
                        { label: 'Platform Role', value: role, icon: 'shield_person', color: role === 'customer' ? 'text-[#E63946]' : 'text-[#001b3c]' },
                        { label: 'Identity', value: 'Verified Email', icon: 'verified_user', color: 'text-emerald-500' },
                        { label: 'Contact', value: phone || 'Not Provided', icon: 'alternate_email', color: 'text-slate-400' },
                        { label: 'Base', value: locationText || 'Remote', icon: 'radar', color: 'text-slate-400' }
                      ].map((item, idx) => (
                        <motion.div 
                          key={item.label}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 + (idx * 0.1) }}
                          className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex flex-col gap-2 hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-500 cursor-default group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[#485f84]/40">{item.label}</span>
                            <span className={cn("material-symbols-outlined text-sm opacity-20 group-hover:opacity-100 transition-opacity", item.color)}>{item.icon}</span>
                          </div>
                          <span className={cn("text-sm font-black uppercase tracking-tight truncate", item.color)}>{item.value}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex flex-col sm:flex-row items-center gap-4"
                    >
                      <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className={cn(
                          "flex-1 w-full h-16 rounded-2xl font-black text-base shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group/btn",
                          role === "customer" ? "bg-[#E63946] hover:bg-[#b7102a]" : "bg-[#001b3c] hover:bg-[#002b5e]"
                        )}
                      >
                        {loading ? <Loader2 className="animate-spin" /> : (
                          <>
                            Deploy Profile
                            <span className="material-symbols-outlined transition-transform duration-500 group-hover/btn:translate-x-2">rocket_launch</span>
                          </>
                        )}
                      </Button>
                      <button 
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto h-16 px-8 flex items-center justify-center text-[#485f84] font-black text-[9px] uppercase tracking-[0.3em] border border-slate-100 rounded-2xl hover:bg-slate-50 hover:text-[#E63946] transition-all"
                      >
                        Recalibrate
                      </button>
                    </motion.div>
                  </div>

                  {/* Subtle Detail */}
                  <div className="absolute bottom-8 right-8 flex items-center gap-2 opacity-20">
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Phase Finalized</span>
                    <div className="w-8 h-[1px] bg-slate-200"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* BottomNavBar - Hidden for Step 1 & 2 */}
      {step > 2 && (
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white shadow-[0_-10px_30px_rgba(0,27,60,0.04)] sm:rounded-t-2xl md:hidden">
          <div className="flex flex-col items-center justify-center bg-[#fde8e9] text-[#E63946] rounded-xl px-4 py-2">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>steppers</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Progress</span>
          </div>
          <button className="flex flex-col items-center justify-center text-slate-400 px-4 py-2 hover:text-[#E63946] transition-colors">
            <span className="material-symbols-outlined mb-1">contact_support</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
          </button>
          <button 
            onClick={() => navigate("/")}
            className="flex flex-col items-center justify-center text-slate-400 px-4 py-2 hover:text-[#E63946] transition-colors"
          >
            <span className="material-symbols-outlined mb-1">close</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
          </button>
        </nav>
      )}
    </div>
  );
}
