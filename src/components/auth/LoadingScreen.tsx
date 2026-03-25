import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#F8F9FA] font-body text-slate-900 overflow-hidden flex flex-col items-center justify-center selection:bg-primary/20 z-[9999]">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E63946]/5 rounded-full blur-[120px] animate-pulse"></div>
        <div 
          className="absolute inset-0 opacity-[0.02] mix-blend-multiply" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC6ekgqDHlMLhWs8_zEepikjZspb5PbiyNtrsdsbKp940MzW5TWrOIAilTZCw7PVcY35z4MqtRhKxObNjkTmKszHOEuq0m0OkpIlnONBGpwgXtsiO20AfFQdf-g3WsgBjmU75x3lXaQf6NNi6CI3lVgafL7-bICjWVeNp-p3fHsHi4IdcgfTyQQcsPIuyRaw-aQYkRcCZkbuwR41H62QikpXcmeh6pQhYwucAsTBCcaUaK2pCpUZpTGeI16gNvGNlfDH97X3EIwMWg')", 
            backgroundSize: "200px" 
          }}
        ></div>
      </div>

      {/* Perfectly Centered Main Container */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-md px-6 w-full">
        {/* Brand Identity */}
        <div className="mb-12">
          <div className="text-2xl font-black italic text-[#E63946] font-headline tracking-tight">
            GigUp
          </div>
        </div>

        {/* Velocity Indicator (Circular Spinner + Icon) */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
          {/* Background Ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-200"></div>
          {/* Spinning Gradient Ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#E63946] border-r-[#E63946]/20 animate-spin transition-all duration-[1500ms] linear infinite"></div>
          {/* Core Icon Hub */}
          <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(230,57,70,0.1)] border border-slate-100">
            <span className="material-symbols-outlined text-[#E63946] text-4xl">
              lock
            </span>
          </div>
        </div>

        {/* Typography Focal Point */}
        <div className="space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-slate-900 tracking-tight">
            Authenticating<span className="text-[#E63946]">...</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            Establishing a secure tunnel to your <span className="text-slate-900">professional workspace</span> and syncing real-time tasks.
          </p>
        </div>

        {/* Kinetic Progress Bar */}
        <div className="w-full max-w-[280px] space-y-4">
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E63946]/15 to-transparent bg-[length:200%_100%] animate-shimmer opacity-100"></div>
            <div className="h-full bg-[#E63946] w-2/3 rounded-full relative shadow-[0_0_8px_rgba(230,57,70,0.3)]"></div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-label font-bold uppercase tracking-[0.25em] text-slate-400">
              Encrypted Connection Stable
            </span>
          </div>
        </div>
      </main>

      {/* Balanced Bottom Actions */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center h-24 px-8">
        <div className="flex items-center gap-12">
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all duration-300 group">
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">support_agent</span>
            <span className="font-label text-[11px] font-bold uppercase tracking-widest">Support</span>
          </button>
          <div className="w-px h-4 bg-slate-200"></div>
          <button className="flex items-center gap-2 text-slate-400 hover:text-[#E63946] transition-all duration-300 group">
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">close</span>
            <span className="font-label text-[11px] font-bold uppercase tracking-widest">Cancel</span>
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
