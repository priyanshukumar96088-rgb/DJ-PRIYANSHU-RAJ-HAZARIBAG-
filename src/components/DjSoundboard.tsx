import React, { useState } from 'react';
import { Play, Volume2, ShieldAlert, Sparkles, Disc, RefreshCw } from 'lucide-react';
import { DjAudioEngine } from '../utils/audioEngine';

interface DjSoundboardProps {
  isEcoMode: boolean;
}

export default function DjSoundboard({ isEcoMode }: DjSoundboardProps) {
  const [isScratching, setIsScratching] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const fxPads = [
    {
      name: '🔥 Bass Drop',
      desc: 'Sub-bass impact drop',
      color: 'from-emerald-500 to-teal-600',
      action: () => DjAudioEngine.playBassDrop(),
      key: 'Q',
    },
    {
      name: '🚨 Rave Siren',
      desc: 'Techno modulation sweep',
      color: 'from-green-500 to-emerald-600',
      action: () => DjAudioEngine.playRaveSiren(),
      key: 'W',
    },
    {
      name: '⚡ Laser Shoot',
      desc: 'High pitch drop trigger',
      color: 'from-emerald-600 to-green-700',
      action: () => DjAudioEngine.playLaserSweep(),
      key: 'E',
    },
    {
      name: '🌟 Echo Blip',
      desc: 'Ambient chime feedback',
      color: 'from-emerald-400 to-teal-500',
      action: () => DjAudioEngine.playRetroBlip(),
      key: 'R',
    },
    {
      name: '💨 Noise Sizzle',
      desc: 'Highpass white-noise sweep',
      color: 'from-teal-500 to-indigo-600',
      action: () => DjAudioEngine.playEcoSizzle(),
      key: 'T',
    },
    {
      name: '🎛️ Scratch SFX',
      desc: 'Retro vinyl scratch cut',
      color: 'from-indigo-500 to-purple-600',
      action: () => DjAudioEngine.playVinylScratch(),
      key: 'Y',
    },
  ];

  // Turntable interaction
  const handleScratchStart = () => {
    setIsScratching(true);
    DjAudioEngine.playVinylScratch();
  };

  const handleScratchMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScratching) return;
    // Rotate the disc based on mouse cursor coordinates slightly
    setRotationAngle((prev) => (prev + 12) % 360);
    // Play scratching sound periodically
    if (Math.random() < 0.15) {
      DjAudioEngine.playVinylScratch();
    }
  };

  const handleScratchEnd = () => {
    setIsScratching(false);
  };

  // Listen to keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Ignore inside input fields
      }
      const key = e.key.toUpperCase();
      const pad = fxPads.find((p) => p.key === key);
      if (pad) {
        e.preventDefault();
        pad.action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="dj-synth-soundboard" className="bg-charcoal-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative ambient ring glow unless Eco Mode is active */}
      {!isEcoMode && (
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              Live Sound Mixer
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-100 mt-1 font-sans tracking-tight">
            DJ Trigger Soundboard
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Press Q, W, E, R, T, Y keys to trigger energetic drops live over the beats!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            AUDIO LATENCY: <span className="text-emerald-400 font-bold">~1.2ms</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* FX Drums Triggers (9 columns wide on desktop) */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {fxPads.map((pad) => (
            <button
              key={pad.name}
              onClick={pad.action}
              className={`p-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800 text-left transition-all duration-200 group active:scale-95 flex flex-col justify-between h-28 relative hover:border-emerald-600/50 cursor-pointer ${
                isEcoMode ? 'border-neutral-800 hover:shadow-none' : 'hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-xl">{pad.name.split(' ')[0]}</span>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 group-hover:text-emerald-400 group-hover:border-emerald-800/80">
                  {pad.key}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200 mt-2 font-sans group-hover:text-emerald-300">
                  {pad.name.substring(2)}
                </h3>
                <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                  {pad.desc}
                </p>
              </div>

              {/* Accent colored line under pad */}
              <div className={`absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r ${pad.color} opacity-30 group-hover:opacity-100 rounded-full transition-opacity`} />
            </button>
          ))}
        </div>

        {/* Scratch Turntable section (4 columns wide on desktop) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl relative">
          <div className="text-center mb-3">
            <span className="text-[11px] font-mono text-neutral-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> Analog Vinyl Deck
            </span>
            <p className="text-[10px] text-neutral-500">Drag/Scratch with cursor</p>
          </div>

          {/* Turntable interactive disc representation */}
          <div
            onMouseDown={handleScratchStart}
            onMouseMove={handleScratchMove}
            onMouseUp={handleScratchEnd}
            onMouseLeave={handleScratchEnd}
            onTouchStart={handleScratchStart}
            onTouchEnd={handleScratchEnd}
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transition: isScratching ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            className={`w-40 h-40 rounded-full bg-radial from-neutral-800 via-neutral-950 to-neutral-900 border-4 border-neutral-800 shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing relative select-none group ${
              isScratching ? 'border-emerald-500/60' : 'border-neutral-800'
            }`}
          >
            {/* Vinyl grooves patterns inside */}
            <div className="absolute inset-2 rounded-full border border-neutral-800/40 opacity-70" />
            <div className="absolute inset-5 rounded-full border border-neutral-800/30 opacity-70" />
            <div className="absolute inset-8 rounded-full border border-neutral-800/20 opacity-50" />
            <div className="absolute inset-12 rounded-full border border-neutral-800/15" />

            {/* Turntable stylus bar pointer indicator line */}
            <div className="absolute top-0 right-1/2 w-1.5 h-1/2 bg-gradient-to-b from-emerald-500 to-transparent opacity-20 group-hover:opacity-40 pointer-events-none" />

            {/* Center Sticker plate */}
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg relative z-10">
              <div className="w-3 h-3 rounded-full bg-neutral-900 border border-emerald-300" />
            </div>

            {/* Visual spinning visual mark */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-pink-500 rounded-full" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-teal-400 rounded-full" />
          </div>

          <div className="mt-4 flex items-center gap-1">
            <span
              className={`text-[9.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                isScratching ? 'bg-pink-950 text-pink-400 border border-pink-900' : 'bg-neutral-900 text-neutral-500'
              }`}
            >
              {isScratching ? 'Vinyl Scratch Event' : 'Ready to Cue'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
