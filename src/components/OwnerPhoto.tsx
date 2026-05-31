import React from 'react';
import { MapPin, User, ShieldCheck } from 'lucide-react';

export default function OwnerPhoto() {
  return (
    <div className="relative group overflow-hidden rounded-2xl border-2 border-amber-600/60 bg-neutral-950 p-3 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
      
      {/* Aspect Ratio container */}
      <div className="relative aspect-square sm:aspect-[4/5] rounded-xl overflow-hidden bg-neutral-900">
        
        {/* Background glow behind image */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-neutral-950/20 to-neutral-950/25 z-10 pointer-events-none" />
        
        <img
          src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80"
          alt="Priyanshu Kumar - DJ Priyanshu Raj Hazaribag Owner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating "OWNER" Neon Badge */}
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-600 text-neutral-950 border border-amber-400 font-mono shadow-md">
            <ShieldCheck className="w-3.5 h-3.5" /> OWNER
          </span>
          <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500 text-neutral-950 border border-emerald-300 font-mono shadow-md">
            PRODUCER
          </span>
        </div>

        {/* Equalizer animation overlay (active DJ vibes) */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between bg-neutral-950/80 backdrop-blur-md p-3 rounded-xl border border-neutral-800">
          <div>
            <span className="text-[9px] font-mono text-amber-400 block uppercase tracking-wider font-extrabold">Remix Director</span>
            <h3 className="text-sm font-black text-neutral-50 tracking-tight font-sans">Priyanshu Kumar</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 font-mono">
              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
              <span>Hazaribag, Jharkhand</span>
            </div>
          </div>
          
          {/* Neon mini equalizer bars */}
          <div className="flex gap-0.5 h-6 items-end">
            <span className="w-0.75 bg-amber-500 rounded-full animate-pulse" style={{ height: '70%', animationDuration: '0.8s' }} />
            <span className="w-0.75 bg-amber-400 rounded-full animate-pulse" style={{ height: '90%', animationDuration: '0.5s' }} />
            <span className="w-0.75 bg-amber-300 rounded-full animate-pulse" style={{ height: '40%', animationDuration: '0.7s' }} />
            <span className="w-0.75 bg-amber-500 rounded-full animate-pulse" style={{ height: '100%', animationDuration: '0.4s' }} />
          </div>
        </div>

      </div>

      {/* Underline Info */}
      <div className="mt-2.5 px-1 pb-1 flex flex-col gap-0.5 text-center sm:text-left">
        <span className="text-[10px] uppercase font-mono text-neutral-500 tracking-widest">PERSONAL IDENTITY</span>
        <p className="text-[11.5px] text-neutral-300 leading-relaxed font-sans font-medium">
          "Dedicated to delivering heavy bass drops, premium clarity, and high-impact setup competition scores."
        </p>
      </div>

    </div>
  );
}
