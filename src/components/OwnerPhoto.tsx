import React from 'react';
import { MapPin, User, ShieldCheck, Sparkles } from 'lucide-react';

export default function OwnerPhoto() {
  return (
    <div className="relative group overflow-hidden rounded-2xl border-2 border-amber-500 bg-neutral-950 p-3.5 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30">
      
      {/* Aspect Ratio container with absolute studio backlight spotlight */}
      <div className="relative aspect-square sm:aspect-[4/5] rounded-xl overflow-hidden bg-neutral-950">
        
        {/* Dynamic Studio Backlight Aura - Golden/Amber Spotlight simulation behind subject */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500/15 blur-[60px] pointer-events-none z-0 animate-pulse" />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-rose-500/10 blur-[45px] pointer-events-none z-0" />
        
        {/* Warm shadow vignetting of custom photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/20 z-10 pointer-events-none" />
        
        <img
          src="https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=800&auto=format&fit=crop&q=95"
          alt="Priyanshu Kumar - DJ Priyanshu Raj Hazaribag Owner Portrait"
          referrerPolicy="no-referrer"
          className="relative z-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04] filter saturate-[1.12] contrast-[1.08] brightness-[1.02]"
        />

        {/* Floating "OWNER" Neon Glowing Badges */}
        <div className="absolute top-3 right-3 z-20 flex gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500 text-neutral-950 border border-amber-300 font-mono shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            <ShieldCheck className="w-3 h-3" /> OWNER
          </span>
          <span className="flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-rose-500 text-white border border-rose-300 font-mono shadow-[0_0_10px_rgba(239,68,68,0.4)]">
            <Sparkles className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} /> REMIXER NO.1
          </span>
        </div>

        {/* Live equalizers and credits overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between bg-neutral-950/90 backdrop-blur-md p-3 rounded-xl border border-neutral-800/80 shadow-lg">
          <div>
            <span className="text-[9px] font-mono text-amber-400 block uppercase tracking-widest font-black">Remix Director</span>
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight font-sans">Priyanshu Kumar</h3>
            <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-neutral-400 font-mono">
              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
              <span>Hazaribag, JH (No.1 Setup)</span>
            </div>
          </div>
          
          {/* Neon orange/gold mini equalizer bars */}
          <div className="flex gap-0.5 h-5.5 items-end shrink-0">
            <span className="w-0.75 bg-amber-500 rounded-full animate-pulse" style={{ height: '70%', animationDuration: '0.8s' }} />
            <span className="w-0.75 bg-amber-400 rounded-full animate-pulse" style={{ height: '90%', animationDuration: '0.5s' }} />
            <span className="w-0.75 bg-rose-500 rounded-full animate-pulse" style={{ height: '40%', animationDuration: '0.7s' }} />
            <span className="w-0.75 bg-amber-500 rounded-full animate-pulse" style={{ height: '100%', animationDuration: '0.4s' }} />
          </div>
        </div>

      </div>

      {/* Underline Headline text */}
      <div className="mt-3 px-1 pb-0.5 flex flex-col gap-0.5 text-center sm:text-left">
        <span className="text-[9px] uppercase font-bold font-mono text-amber-500/80 tracking-widest block">PERSONAL BRAND IDENTITY</span>
        <p className="text-[11px] text-neutral-350 leading-relaxed font-sans font-medium">
          "Hazaribag ka high-voltage remixer. Delivering premium quality bass drops, crisp acoustics, and winning competitive setup scores across India."
        </p>
      </div>

    </div>
  );
}
