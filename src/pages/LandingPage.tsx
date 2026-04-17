import { Link } from "react-router-dom";
import { useState } from "react";
import { 
    Search, LayoutGrid, Wrench, Zap, Paintbrush, Hammer, 
    Scissors, Truck, ShieldCheck, Home, Star, StarHalf, 
    CheckCircle2, Users, Award, ArrowRight, Globe, AtSign, Quote
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
    const { user } = useAuth();
    const [query, setQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };
    
    return (
        <div className="bg-l-surface font-l-body text-l-on-surface">

    {/*  TopAppBar  */}
    <nav
        className="sticky top-0 w-full z-50 bg-white dark:bg-slate-900 shadow-[0_20px_40px_rgba(0,27,60,0.06)] font-['Plus_Jakarta_Sans'] antialiased">
        <div className="flex items-center justify-between px-6 py-4 max-w-[1440px] mx-auto">
            <div className="flex items-center gap-8">
                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-50">Near-Craft</span>
                <div className="hidden lg:flex items-center gap-6">
                    <button onClick={() => scrollTo('categories')} className="text-slate-600 dark:text-slate-400 hover:text-l-primary font-medium transition-colors py-1 cursor-pointer">Categories</button>
                    <button onClick={() => scrollTo('services')} className="text-slate-600 dark:text-slate-400 hover:text-l-primary font-medium transition-colors py-1 cursor-pointer">Popular Services</button>
                    <button onClick={() => scrollTo('how-it-works')} className="text-slate-600 dark:text-slate-400 hover:text-l-primary font-medium transition-colors py-1 cursor-pointer">How It Works</button>
                    <button onClick={() => scrollTo('specialists')} className="text-slate-600 dark:text-slate-400 hover:text-l-primary font-medium transition-colors py-1 cursor-pointer">Top Professionals</button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {user ? (
                    <Link to="/dashboard" className="px-6 py-2 bg-gradient-to-br from-l-primary to-l-primary-container text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">Go to Dashboard</Link>
                ) : (
                    <>
                        <Link to="/login" className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">Sign In</Link>
                        <Link to="/signup" className="px-6 py-2 bg-gradient-to-br from-l-primary to-l-primary-container text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">Join Now</Link>
                    </>
                )}
            </div>
        </div>
    </nav>
    {/*  Hero Section  */}
    <motion.header className="relative overflow-hidden bg-l-surface py-20 lg:py-32" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
                <span className="inline-block py-1 px-3 bg-l-primary/10 dark:bg-l-primary/20 text-l-primary text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-l-primary/20 animate-pulse">
        Quality service at your doorstep
    </span>
                <h1
                    className="font-l-headline text-5xl lg:text-7xl font-extrabold text-l-on-surface leading-[1.1] tracking-tighter mb-8">
                    Find Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-l-primary via-purple-500 to-pink-500 animate-pulse">Professionals</span> for Any Gig, Anytime
                </h1>
                <p className="text-lg text-l-on-surface-variant max-w-lg mb-10 leading-relaxed">
                    Your trusted neighborhood platform for plumbers, electricians, painters, and more. Get your home projects
                    done right.
                </p>
                {/*  Search Bar  */}
                <div
                    className={`flex flex-col md:flex-row p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl transition-all duration-300 border dark:border-slate-800 mb-6 max-w-2xl relative z-20 ${
                        searchFocused
                            ? 'shadow-2xl shadow-l-primary/30 border-l-primary/60 ring-2 ring-l-primary/30 scale-[1.015]'
                            : 'border-l-outline-variant/20 hover:shadow-xl hover:shadow-l-primary/10'
                    }`}>
                    <div className="flex-1 flex items-center px-4 py-2 gap-3 border-r border-l-outline-variant/10 dark:border-slate-700">
                        <Search className={`w-5 h-5 transition-colors duration-200 ${searchFocused ? 'text-l-primary' : 'text-l-outline'}`} />
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white font-medium placeholder:text-slate-400 text-sm"
                            placeholder="What local service do you need?"
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)} />
                    </div>
                    <div className="px-4 py-2 flex items-center gap-2 min-w-[160px] border-r border-l-outline-variant/10 dark:border-slate-700">
                        <LayoutGrid className="w-4 h-4 text-l-outline flex-shrink-0" />
                        <select className="bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 font-semibold text-sm cursor-pointer w-full">
                            <option>All Categories</option>
                            <option>Plumbing</option>
                            <option>Electrical</option>
                            <option>Painting</option>
                            <option>Carpentry</option>
                        </select>
                    </div>
                    <button
                        className="relative overflow-hidden bg-l-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-l-primary-container active:scale-95 transition-all duration-200 flex items-center gap-2 group/btn">
                        <Search className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span>Search</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-sm font-bold text-l-on-surface-variant">Popular:</span>
                    <button onClick={() => scrollTo('services')} className="text-xs font-semibold px-3 py-1 bg-l-surface-container-high rounded-full hover:bg-l-primary hover:text-white transition-colors cursor-pointer">Home Repair</button>
                    <button onClick={() => scrollTo('services')} className="text-xs font-semibold px-3 py-1 bg-l-surface-container-high rounded-full hover:bg-l-primary hover:text-white transition-colors cursor-pointer">House Cleaning</button>
                    <button onClick={() => scrollTo('services')} className="text-xs font-semibold px-3 py-1 bg-l-surface-container-high rounded-full hover:bg-l-primary hover:text-white transition-colors cursor-pointer">Electrician</button>
                </div>
                {/*  Trust Indicator  */}
                <div className="mt-12 flex gap-12 items-center">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-l-on-surface">600+</span>
                        <span className="text-xs font-bold text-l-outline uppercase tracking-wider">Local Pros</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-l-on-surface">10K+</span>
                        <span className="text-xs font-bold text-l-outline uppercase tracking-wider">Jobs Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-l-tertiary-fixed text-l-on-tertiary-fixed px-3 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold text-lg">4.9</span>
                        </div>
                        <span className="text-xs font-bold text-l-outline uppercase tracking-wider">Rating</span>
                    </div>
                </div>
            </div>
            <div className="relative hidden lg:block">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tr from-l-primary/20 to-purple-500/20 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] bg-gradient-to-bl from-pink-500/20 to-l-primary/20 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1s' }}></div>
                <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-6 pt-8">
                        <div className="bg-white dark:bg-slate-900 dark:text-white p-4 rounded-3xl shadow-2xl transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 border border-transparent dark:border-slate-800">
                            <img className="w-full h-48 object-cover rounded-2xl mb-4"
                                data-alt="Professional female plumber smiling"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvvaEIdS5h4LctMAn0e7dRoctNqaz8pjZ6SoY44henaZiT0q9C01gqv5EBrJnyc2Nt6tbD0Tj5CWsIX86ROOrjExy5eYn7QwARo_v8eWJUA77su2v80gjEEuK5i6-oUquvaNuB9nP7_qesN8FPJgGXoFyUDuSADgpbY0dTKZqrcSiwa2iTIZN17t9Ol4hLfytz_tusxOXLPbQ_DQV7-pUpqeBS74mrMZrJj9wDW18NwPoIMf-etGz9AYWIBLclS0o-Jhuig41bQiE" />
                            <h4 className="font-bold text-l-on-surface">Sarah Jenkins</h4>
                            <p className="text-xs text-l-on-surface-variant">Master Plumber</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-3xl shadow-xl transform translate-x-12 translate-y-4 hover:translate-x-14 hover:scale-105 transition-all duration-500 border border-transparent dark:border-slate-800" style={{ animationDelay: "1.5s" }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 bg-l-primary-container rounded-full flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Same Day Service</p>
                                    <p className="text-xs text-l-on-surface-variant">Avg. 2 hours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 pt-12">
                        <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-3xl shadow-xl -translate-x-8 hover:-translate-x-10 hover:scale-105 transition-all duration-500 border border-transparent dark:border-slate-800" style={{ animationDelay: "0.5s" }}>
                            <div className="flex -space-x-3 mb-4">
                                <img className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    data-alt="User avatar 1"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZoNhZ_Goau3RiG4w6yZRsRrIqyqag_R2V9QPaAthuvVbPKmh-Z0b0UWQX77ZxEYeSMygiyZZ3804QZwPzyoIyCQSJjvDkJYb6fIZb0MX8Z0VmFtWMhzqdcHmolW-dMWfAts-NGcfM2CFGyL-0uVeV8R97L-vero6Q1IGTTnxRan0PLp5mIbRH2F0gD49h8shjhs9QOMpbQZO15y3usXnmOWCOPaiUH62LgAL08KTNJpoQ80v58mTIFpE6jYrMZ9ImrHXfdggM56M" />
                                <img className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    data-alt="User avatar 2"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuALUNXtuGvP4vjGBTXt4xEOrBrp5-ewKAIlibO42Nqg6JdqoW2IlB9mc6LlkXF4rIcc7wrcQXqH9FYP3UOVrRgdHvH7BHwS2sC_cKgcj9hd9KFYU0ivTMBn3PIygxhS4x78-M6RyVxv3RoHH4ozlpDrb77O8LBg-8rwAxuMXjgyujBXsmh2UIFstV3mvEEzY6IjXSXOahcR9e_7gQho3lezUxZjxg22JdPXIlgrfcbYiP2a99SpS94NYXmt3V5-6TL1WBm0Ss63Rbs" />
                                <img className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    data-alt="User avatar 3"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIOUSPV-8RZ65y52RyReY4O-h9wf83NzNwbbF9Mtr45XKWtRYfh4tdWbQWhA-rNrIGDUERRGIAmJp1LXfEmK8s-OxRxN2cgpVwMv_12khD9XWB97lQhhzdJuyOzeIbDazl8M5hI6uXVT1G41tgZvb5b6fnt349NWIxbYFK_RCa6XNqPEkDucLOnt5DxVTsWthq4yU25ALoEJ6FoyxYM_JtgtVDKm78g325BW4pZUsuA0fl-5GTK2QGTz3srD3TA9yhgBtYRsymTb0" />
                                <div
                                    className="w-10 h-10 rounded-full bg-l-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold text-l-primary">
                                    +2k</div>
                            </div>
                            <p className="text-xs font-bold uppercase text-l-outline tracking-widest">Happy Clients</p>
                        </div>
                        <div
                            className="bg-white dark:bg-slate-900 dark:text-white p-4 rounded-3xl shadow-2xl transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 border border-transparent dark:border-slate-800">
                            <img className="w-full h-48 object-cover rounded-2xl mb-4"
                                data-alt="Male professional electrician"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaQXc4LJkn37VnoYZR6gN6kxEUn1OiYTM08INc_LP_fNyA2UV5fv0wgFVrH_W9L-EL4LcNv9eNZobbZsYNINlumPBt7PIICA-aKLZImEGNBf57VR_jTfS-sf93fABz5TMdrOkN18PefkoVtFX-1pjSOb_0ZIAhLlhbTQnr-N5yARa6yzM7_YLFmYXGVlb2sJoko2V30nUpWCKePYsfGrTxirJyvM_EEnuZ9ZFIY7yKLAD4s53UsOH3_Zmr9XUAN1X4NtStoLNZATk" />
                            <h4 className="font-bold text-l-on-surface">Marcello V.</h4>
                            <p className="text-xs text-l-on-surface-variant">Certified Electrician</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.header>
    {/*  Trusted By  */}
    <motion.section id="trusted" className="py-12 bg-l-surface-container-low overflow-hidden border-y border-l-outline-variant/10" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold text-l-outline uppercase tracking-[0.2em] mb-10">Trusted by
                local homeowners and businesses</p>
            <div className="flex justify-between items-center opacity-40 grayscale flex-wrap gap-12">
                <span className="text-3xl font-black italic">TECHFLOW</span>
                <span className="text-3xl font-black tracking-tighter">NEXUS</span>
                <span className="text-3xl font-bold font-l-headline">Studio.</span>
                <span className="text-3xl font-black tracking-tight">VANTAGE</span>
                <span className="text-3xl font-serif font-bold">LUMINA</span>
            </div>
        </div>
    </motion.section>
    {/*  Categories Section  */}
    <motion.section id="categories" className="py-24 bg-l-surface" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
                <div>
                    <h2 className="font-l-headline text-4xl font-extrabold text-l-on-surface tracking-tight mb-4">Browse by
                        Category</h2>
                    <p className="text-l-on-surface-variant max-w-md">Find exactly what you need with our curated list of
                        local services.</p>
                </div>
                <a className="text-l-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
                    href="#">
                    View All Categories <ArrowRight className="w-5 h-5" />
                </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/*  Category Card  */}
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Wrench className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">Plumbing</h3>
                    <p className="text-sm text-l-on-surface-variant">120+ active pros</p>
                </div>
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">Electrical</h3>
                    <p className="text-sm text-l-on-surface-variant">85+ active pros</p>
                </div>
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Paintbrush className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">Painting</h3>
                    <p className="text-sm text-l-on-surface-variant">64+ active pros</p>
                </div>
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Hammer className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">Carpentry</h3>
                    <p className="text-sm text-l-on-surface-variant">92+ active pros</p>
                </div>
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Home className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">House Cleaning</h3>
                    <p className="text-sm text-l-on-surface-variant">45+ active pros</p>
                </div>
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Truck className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">Moving</h3>
                    <p className="text-sm text-l-on-surface-variant">30+ active pros</p>
                </div>
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Scissors className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">Gardening</h3>
                    <p className="text-sm text-l-on-surface-variant">22+ active pros</p>
                </div>
                <div
                    className="group bg-l-surface-container-lowest p-8 rounded-3xl border border-transparent hover:border-l-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-l-primary/10 transition-all duration-300 transition-all duration-300 cursor-pointer">
                    <div
                        className="w-14 h-14 bg-l-surface-container-high rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-inherit">Handyman</h3>
                    <p className="text-sm text-l-on-surface-variant">58+ active pros</p>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  Popular Services  */}
    <motion.section id="services" className="py-24 bg-l-surface-container-low" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-l-headline text-4xl font-extrabold text-l-on-surface tracking-tight mb-12">Popular Services</h2>
            <div className="flex gap-8 overflow-x-auto pb-12 hide-scrollbar">
                {/*  Service Card  */}
                <div className="min-w-[320px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-l-outline-variant/20 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="relative overflow-hidden h-48">
                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            data-alt="Plumbing repair mockup"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWspvDgn_mcTrIa98JcNd-E6JcrNoVYwVgwDhhGWMj-RmRccewqYUKwF4zVS0Qqa8n-Xg8YRs0dFYb59EBJUu1SFCkUadm6UMIxCtzjDGIlTXYdPV9jx8dOq2hMAMxjDVU26R31NyFhsD-BR6PlBGQ2_v8zjtpBC93SIYRHJtH5gdCothuOhxW-5_2HyM-gUw10zyMbj31iEu5bjtjYU1q6sbQCi4zqVJ9bzh6eQemnrhN7yJgiStiRbo0TgFi6R0lM_hcWproOxw" />
                        <div
                            className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-l-primary">
                            Trending</div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <img className="w-10 h-10 rounded-full object-cover" data-alt="Freelancer profile small"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1tQJlwTz6XLUke8juY_x6VIpI43JBxgBVjgZNfnLRvtujhy19AGZ8SEGszzoK-O63IfV29dHvUOBCaPufRo16R0L_r8mRquSW0cWUnL1BP-e0_BZ0hRBEaUciF-uht5ci4R7vzAZKgEm9yU4B-S3OEONzxrkBF-arfZmn9qeVEGdHNRaMWujtU86RDgIyd9XEEIgq3isVd6wF-T2fNYCsu-UL1MjKhRshUcbFffOLs-rRypIbsxSE3ePyA8AuGtZz8XNpPEaEcgo" />
                            <div>
                                <h4 className="text-sm font-bold text-inherit">Alex Rivera</h4>
                                <p className="text-[10px] font-bold text-l-outline uppercase tracking-wider">Verified Pro
                                </p>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-4 line-clamp-2 text-inherit">I will install or repair your home plumbing fixtures</h3>
                        <div className="flex items-center justify-between pt-4 border-t border-l-outline-variant/10">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold">4.9</span>
                                <span className="text-xs text-l-outline">(1.2k)</span>
                            </div>
                            <div>
                                <span className="text-xs text-l-outline font-bold uppercase block text-right">Starting
                                    at</span>
                                <span className="text-xl font-black text-l-primary">$80</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  Repeat Service Card 1  */}
                <div className="min-w-[320px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-l-outline-variant/20 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="relative overflow-hidden h-48">
                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            data-alt="Electrical wiring panel"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfOcSFxFL3-YpuML7QgJpASjuDFE2qlxYfl_SF5YZ_FH8AGbhsIgZO9F1OF1cV5jZZjhhjOJL1NyG11lFGNx-duwZxhG8NuzJkW78Od_fDJMbj2JGzBhcGJedyLEjWyRq-2bI7t7Av1O4LyLCdIwWvkhOIyVZJd-9Wi9G3BkJBjZGr1hQsTiY9xM21jK9rX9jduhJclFLULuE3q73cKjqPtV8Jj-IEhYkimDO7lIYl2Zmh7juf81Zqlu7-Da7Fcby6boqxMK-t2_k" />
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <img className="w-10 h-10 rounded-full object-cover" data-alt="Freelancer profile small"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv9dmJwzYDocgVQs0RTcojwAWzAUNf8arux85T61iR_VOyYFNGG4I7DXzge9fDGRqWLc04rzveIvLpsIXOwbk1_35GDTbOEMUh07IaIKa8eTM9cgC1yMKK8p8s30Fiudo7fYbqiSFG1tSo2I9WZjUvf4h3JIBOFuP0dkG9F_14T_LGO1s8Ldrqxwa3OtnL-XXCG2w7fvjJisUHdTh_BnPvjosdN96Yy4DeFONbWxgDlTIPnNfxaIXuT1PSQhYACBAD8PhK50k6F9I" />
                            <div>
                                <h4 className="text-sm font-bold text-inherit">Elena K.</h4>
                                <p className="text-[10px] font-bold text-l-outline uppercase tracking-wider">Licensed Pro</p>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-4 line-clamp-2 text-inherit">I will provide complete electrical wiring and repair</h3>
                        <div className="flex items-center justify-between pt-4 border-t border-l-outline-variant/10">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold">5.0</span>
                                <span className="text-xs text-l-outline">(850)</span>
                            </div>
                            <div>
                                <span className="text-xs text-l-outline font-bold uppercase block text-right">Starting
                                    at</span>
                                <span className="text-xl font-black text-l-primary">$150</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  Repeat Service Card 2  */}
                <div className="min-w-[320px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-l-outline-variant/20 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="relative overflow-hidden h-48">
                        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            data-alt="Painting interior walls"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2M1qcAIShBdGZ7CgQ8h-xSTWgpCU_v6oNywmp_FHouHn3E1oqrQLEYDgg_xL4_oWFqq1E-SGVikxyHZVacMzCoCHJg7HflI5elLNeotSU0db4EYHTyJQHu6AnhYVv80qb9SpViONgHKZRwbICOyMirfZVEwVSYFIffiZ_vvrL23Uftisk03zS5qNRICwQT0PpanA3BmVUOOYBOpGcls0xyaw82ddd9lhb7vsWMyZMhvm9f2c2POM-ovZvM4EiGucadV_HVNufuJo" />
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <img className="w-10 h-10 rounded-full object-cover" data-alt="Freelancer profile small"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmxwtQuOJUPsL33y-D7xsqpE3pnvxPZzU-ZVLasJ4lF6x4CtDh6mUxVposZBYs3Nb79nFUCeGRWo5J4yZ76iRiEKLQdxRCJZjyYWoi2LcCAR1KR59n0id_6c55Jw7APltSfa9fKF5-OMxOqC9O8UjR0K9e7EprW-9FvM6hDOOa1Fec6p7fNDvylPIjbSRAIUy8N9SNC_hELZ4xPJlnXK7jnpbzQ_3CxrvSVGu7Y8ASt_QbNwakMBnoyOw2JZNee4PAJTKtJHDr7nc" />
                            <div>
                                <h4 className="text-sm font-bold text-inherit">Jordan S.</h4>
                                <p className="text-[10px] font-bold text-l-outline uppercase tracking-wider">Pro Painter</p>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-4 line-clamp-2 text-inherit">I will paint your home interior with premium colors</h3>
                        <div className="flex items-center justify-between pt-4 border-t border-l-outline-variant/10">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold">4.8</span>
                                <span className="text-xs text-l-outline">(430)</span>
                            </div>
                            <div>
                                <span className="text-xs text-l-outline font-bold uppercase block text-right">Starting
                                    at</span>
                                <span className="text-xl font-black text-l-primary">$45</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  How It Works (Dark)  */}
    <motion.section id="how-it-works" className="py-24 bg-[#1A1A2E] text-white overflow-hidden relative" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-l-primary/5 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
                <h2 className="font-l-headline text-4xl font-extrabold tracking-tight mb-4 text-inherit">Efficiency in Every Step</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Booking a local professional shouldn't be a hassle. Our streamlined
                    process connects you with pros in minutes.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-12">
                <div className="text-center relative">
                    <div
                        className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-slate-700">
                        <Search className="w-10 h-10 text-l-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-inherit">Search</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Find local pros by skill, rating, or previous work
                        history.</p>
                </div>
                <div className="text-center relative">
                    <div
                        className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-slate-700">
                        <CheckCircle2 className="w-10 h-10 text-l-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-inherit">Choose</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Compare profiles, reviews, and portfolios to find
                        your match.</p>
                </div>
                <div className="text-center relative">
                    <div
                        className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-slate-700">
                        <Users className="w-10 h-10 text-l-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-inherit">Collaborate</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Communicate directly to discuss your specific needs
                        and setup an appointment.</p>
                </div>
                <div className="text-center relative">
                    <div
                        className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-slate-700">
                        <Award className="w-10 h-10 text-l-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-inherit">Get it Done</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Review the finished work and rate your professional
                        for next time.</p>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  Featured Freelancers  */}
    <motion.section id="specialists" className="py-24 bg-l-surface" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-l-headline text-4xl font-extrabold text-l-on-surface tracking-tight mb-16">Top Rated Local Pros
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
                {/*  Profile Card  */}
                <div
                    className="bg-l-surface-container-lowest p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-l-primary/10 hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-l-primary/20">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-l-primary-container text-l-on-primary-container flex items-center justify-center text-2xl font-black">LT</div>
                        <div>
                            <h3 className="font-bold text-xl text-inherit">Lina Thompson</h3>
                            <div className="flex items-center gap-1 text-l-tertiary">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black">5.0</span>
                                <span className="text-xs text-l-outline font-medium">(480 reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Pipe Repair</span>
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Installation</span>
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Water
                            Heater</span>
                    </div>
                    <button
                        className="w-full py-3 bg-l-secondary-container text-l-on-secondary-container font-bold rounded-xl hover:bg-primary hover:text-white transition-colors">View
                        Profile</button>
                </div>
                {/*  Profile Card 2  */}
                <div
                    className="bg-l-surface-container-lowest p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-l-primary/10 hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-l-primary/20">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-l-primary-container text-l-on-primary-container flex items-center justify-center text-2xl font-black">DC</div>
                        <div>
                            <h3 className="font-bold text-xl text-inherit">David Chen</h3>
                            <div className="flex items-center gap-1 text-l-tertiary">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black">4.9</span>
                                <span className="text-xs text-l-outline font-medium">(215 reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Wiring</span>
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Panel Upgrade</span>
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Safety Check</span>
                    </div>
                    <button
                        className="w-full py-3 bg-l-secondary-container text-l-on-secondary-container font-bold rounded-xl hover:bg-primary hover:text-white transition-colors">View
                        Profile</button>
                </div>
                {/*  Profile Card 3  */}
                <div
                    className="bg-l-surface-container-lowest p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-l-primary/10 hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-l-primary/20">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-l-primary-container text-l-on-primary-container flex items-center justify-center text-2xl font-black">MR</div>
                        <div>
                            <h3 className="font-bold text-xl text-inherit">Maria Rossi</h3>
                            <div className="flex items-center gap-1 text-l-tertiary">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black">4.9</span>
                                <span className="text-xs text-l-outline font-medium">(322 reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Content
                            Painting</span>
                        <span
                            className="text-[10px] font-bold px-3 py-1 bg-l-surface-container-high rounded-full uppercase tracking-tighter">Electrician</span>
                    </div>
                    <button
                        className="w-full py-3 bg-l-secondary-container text-l-on-secondary-container font-bold rounded-xl hover:bg-primary hover:text-white transition-colors">View
                        Profile</button>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  Stats Banner  */}
    <motion.section className="py-16" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6">
            <div
                className="bg-gradient-to-r from-l-primary to-l-primary-container rounded-[2.5rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-center lg:text-left">
                    <h2 className="text-4xl lg:text-6xl font-black mb-4 text-inherit">Near-Craft by the numbers</h2>
                    <p className="text-l-primary-fixed/80 text-lg">Serving our local community with pride and quality.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-16 relative z-10">
                    <div className="text-center">
                        <span className="block text-5xl lg:text-7xl font-black mb-2">50K+</span>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-80">Verified Users</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-5xl lg:text-7xl font-black mb-2">120K+</span>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-80">Services Offered</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  Testimonials  */}
    <motion.section className="py-24 bg-l-surface-container-low overflow-hidden" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-l-headline text-4xl font-extrabold text-l-on-surface text-center mb-16">What our community says
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-3xl shadow-sm transform hover:-translate-y-2 transition-transform">
                    <Quote className="w-12 h-12 text-l-primary" />
                    <p className="text-lg font-medium text-l-on-surface mb-8 italic leading-relaxed">"Finding a reliable plumber who
                        actually shows up on time is rare. Near-Craft made it happen in 10 minutes."
                    </p>
                    <div className="flex items-center gap-4">
                        <img className="w-12 h-12 rounded-full object-cover" data-alt="Testimonial author 1"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOQ7bDKY7sr-tFyrRAU1SI09HlS5cqcH-eaSziW6PaqErBctBLp_OW4REiC2Efa1sK5vpSXVHu3PySOdaip1uFq07WDA7A9De-JHSChWTj62VcStJ7y_UJS0YYZKY6EevCXssmQkbpRRX4Bk5nay9pjF1_CqJa7b8rYtf9vWn6eaCtjc8yNgiwey9M7Z03xBOHIToToiAJp6ZzyAcm0oEd8eT4TcFIdUOKBAOU8hpqXpjND-uKLxaifysu0MopvzjKj7egonU25HY" />
                        <div>
                            <h4 className="font-bold text-inherit">Thomas Wright</h4>
                            <p className="text-xs text-l-outline font-bold">Homeowner</p>
                        </div>
                    </div>
                </div>
                <div
                    className="bg-white p-10 rounded-3xl shadow-lg border-b-4 border-l-primary transform hover:-translate-y-2 transition-transform">
                    <Quote className="w-12 h-12 text-l-primary" />
                    <p className="text-lg font-medium text-l-on-surface mb-8 italic leading-relaxed">"The professionals here are
                        incredible. I've renovated my entire house through this platform with zero friction."</p>
                    <div className="flex items-center gap-4">
                        <img className="w-12 h-12 rounded-full object-cover" data-alt="Testimonial author 2"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfZ3I28F0m3VH1zZWxli6gLssoQgXYhPWbp4TE7HYI-L1hgfJ0vlf-w9NR8TnAuY55Y9e8ublsWcQm35MKAO-959e8mxuxrrtv8tdmBxsH1vmbL9pcZLaYQmm9n3p_-Xqi_2ByxaEUPrMvgtQvuIYQqeSFDJzdCm96EzfTcZOiT0TizZ_0g_bs4nNWsYwpPKeVHn5qw3oeOCvOFKfZVzig6ydzm7mSxV50dlAqlr8mAVcFsJ3Rxy4G2U22CgoVk4B2G4yNaQLjqfc" />
                        <div>
                            <h4 className="font-bold text-inherit">Sarah Palmer</h4>
                            <p className="text-xs text-l-outline font-bold">Property Manager</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-3xl shadow-sm transform hover:-translate-y-2 transition-transform">
                    <Quote className="w-12 h-12 text-l-primary" />
                    <p className="text-lg font-medium text-l-on-surface mb-8 italic leading-relaxed">"Professional, reliable, and
                        affordable. The standard of work here is significantly higher than other local directories."</p>
                    <div className="flex items-center gap-4">
                        <img className="w-12 h-12 rounded-full object-cover" data-alt="Testimonial author 3"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT1qcIuaC2v7g46VYR4phpBqNAC3QDwnSnZpD6IEbnUApsLnOS0Vmtmbdmh_6zEyWxnZpFCmobcaQoSLM6dL-htLMkxiX1B7WpzuvLWgzbX2x8hZ_FGvjeH2qeA2VgQjiYTi8mjG3CJgxfi5UCORObVKR8u7JrhH4Kb2fQa1Z0NgWQq7sTwcWQs_WFrCY4zxBr9qBzSfYEQxAsvGd0LYMQpt0_XIpdSYNCyy-XIwwj-MMde-gaGXxFO4X9cXGrw-6y9XT8MH648zQ" />
                        <div>
                            <h4 className="font-bold text-inherit">Julian Banks</h4>
                            <p className="text-xs text-l-outline font-bold">Local Business Owner</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  Review Breakdown  */}
    <motion.section className="py-24 bg-l-surface" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-3xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="text-center md:text-left">
                    <h2 className="text-7xl font-black text-l-on-surface mb-2">4.9</h2>
                    <div className="flex gap-1 text-l-tertiary-container mb-4 justify-center md:justify-start">
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <StarHalf className="w-5 h-5 fill-current" />
                    </div>
                    <p className="text-l-outline font-bold uppercase tracking-widest text-xs">Based on 12,480 reviews</p>
                </div>
                <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold w-12">5 Star</span>
                        <div className="flex-1 h-3 bg-l-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-l-primary w-[92%] rounded-full"></div>
                        </div>
                        <span className="text-xs font-bold w-8">92%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold w-12">4 Star</span>
                        <div className="flex-1 h-3 bg-l-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-l-primary w-[6%] rounded-full"></div>
                        </div>
                        <span className="text-xs font-bold w-8">6%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold w-12">3 Star</span>
                        <div className="flex-1 h-3 bg-l-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-l-primary w-[1%] rounded-full"></div>
                        </div>
                        <span className="text-xs font-bold w-8">1%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold w-12">2 Star</span>
                        <div className="flex-1 h-3 bg-l-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-l-primary w-[0.5%] rounded-full"></div>
                        </div>
                        <span className="text-xs font-bold w-8">&lt;1%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold w-12">1 Star</span>
                        <div className="flex-1 h-3 bg-l-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-l-primary w-[0.5%] rounded-full"></div>
                        </div>
                        <span className="text-xs font-bold w-8">&lt;1%</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  CTA Section  */}
    <motion.section className="py-24" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <div className="max-w-7xl mx-auto px-6">
            <div
                className="bg-l-surface-container-lowest rounded-[3rem] p-12 lg:p-24 border border-l-outline-variant/20 shadow-xl text-center relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 w-64 h-64 bg-l-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2">
                </div>
                <h2 className="font-l-headline text-5xl lg:text-6xl font-extrabold text-l-on-surface mb-8 tracking-tighter">
                    Ready to Get Started?</h2>
                <p className="text-l-on-surface-variant text-lg max-w-2xl mx-auto mb-12">Whether you're looking to hire the
                    best local professional or find your next gig, Near-Craft is the bridge to your success.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link to={user ? "/jobs/new" : "/signup"} className="px-10 py-5 bg-l-primary text-white font-black rounded-2xl shadow-xl shadow-l-primary/20 hover:scale-105 transition-transform flex items-center justify-center">Find a Professional</Link>
                    <Link to={user ? "/jobs" : "/signup"} className="px-10 py-5 bg-l-secondary-container text-l-on-secondary-container font-black rounded-2xl hover:scale-105 transition-transform flex items-center justify-center">Become a Pro</Link>
                </div>
            </div>
        </div>
    </motion.section>
    {/*  Footer  */}
    <footer className="bg-slate-900 text-slate-400 font-['Inter'] text-sm leading-relaxed w-full pt-16 pb-8">
        <div
            className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 border-t border-slate-800 pt-16">
            <div className="col-span-2 lg:col-span-1">
                <span className="text-2xl font-black text-white mb-6 block">Near-Craft</span>
                <p className="text-slate-500 mb-8 max-w-xs">Connecting specialized talent with ambitious projects since
                    2024.</p>
                <div className="flex gap-4">
                    <a className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                        href="#">
                        <Globe className="w-6 h-6 text-white" />
                    </a>
                    <a className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"
                        href="#">
                        <AtSign className="w-6 h-6 text-white" />
                    </a>
                </div>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6">Categories</h4>
                <ul className="space-y-4">
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Plumbing & Electrical</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Painting &amp; Carpentry</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity" href="#">Home
                            Cleaning</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Carpentry &amp; Handyman</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6">Community</h4>
                <ul className="space-y-4">
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Events</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Blog</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Forum</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Podcast</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6">Company</h4>
                <ul className="space-y-4">
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">About</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Careers</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Press</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6">Support</h4>
                <ul className="space-y-4">
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Help Center</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Safety</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Privacy</a></li>
                    <li><a className="hover:text-red-400 underline-offset-4 hover:underline transition-opacity"
                            href="#">Terms</a></li>
                </ul>
            </div>
        </div>
        <div
            className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">© 2024 Near-Craft Inc. Local Excellence in Gig Work.</p>
            <div className="flex gap-8">
                <a className="text-xs hover:text-white transition-colors" href="#">Privacy Policy</a>
                <a className="text-xs hover:text-white transition-colors" href="#">Terms of Service</a>
                <a className="text-xs hover:text-white transition-colors" href="#">Cookie Settings</a>
            </div>
        </div>
    </footer>

        </div>
    );
}
