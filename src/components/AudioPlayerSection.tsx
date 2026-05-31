import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Sliders, Music, FastForward, Download, Disc, Leaf, Zap, HelpCircle
} from 'lucide-react';
import { Track } from '../types';

interface AudioPlayerSectionProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  isEcoMode: boolean;
  isLowBandwidth: boolean;
  onToggleLowBandwidth: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AudioPlayerSection({
  currentTrack,
  isPlaying,
  onPlayPauseToggle,
  onNextTrack,
  onPrevTrack,
  isEcoMode,
  isLowBandwidth,
  onToggleLowBandwidth,
  audioRef,
}: AudioPlayerSectionProps) {
  // Local reactive player state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Custom EQ Sliders (simulated visual values and applied dynamically)
  const [bass, setBass] = useState(65);
  const [mid, setMid] = useState(50);
  const [treble, setTreble] = useState(55);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Synchronize audio element settings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  // Synchronize play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Handle auto-play block gracefully
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Listen to time updates from audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      onNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, onNextTrack]);

  // Seek time handler
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekVal = parseFloat(e.target.value);
    audio.currentTime = seekVal;
    setCurrentTime(seekVal);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (vol > 0) setIsMuted(false);
  };

  // Human readable audio duration formatting (mm:ss)
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '00:00';
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Canvas-based Sound Visualizer (Renders live wavebars matching current bpm and duration!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let barsCount = 34;
    let waveSeed = Array.from({ length: barsCount }, () => Math.random() * 0.7 + 0.3);

    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Eco Mode Constraint: If true, draw a stationary/dimmer power-saving curve
      if (isEcoMode) {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.15)'; // Deep dimmed green
        const midY = canvas.height / 2;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(canvas.width, midY);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.font = '9px Fira Code, monospace';
        ctx.fillText('ECO VISUALS PAUSED: SAVING CLIENT GPU', 20, canvas.height / 2 + 3);
        return;
      }

      // Dynamic Animated wave rendering
      const barWidth = canvas.width / barsCount - 3;
      const progressRatio = duration > 0 ? currentTime / duration : 0.4;
      const speedFactor = isPlaying ? Date.now() * 0.0035 : Date.now() * 0.0002;

      for (let i = 0; i < barsCount; i++) {
        // Modulate visual heights based on Bass slider value and play status
        const bassModifier = (i < 8) ? (bass / 50) : 1.0;
        const speedVal = speedFactor + (i * 0.2);
        const dynamicAmplitude = isPlaying 
          ? Math.sin(speedVal) * 15 * bassModifier + (waveSeed[i] * 20)
          : Math.sin(speedVal) * 2 + (waveSeed[i] * 6);

        const h = Math.max(3, Math.min(canvas.height - 4, dynamicAmplitude));
        const x = i * (barWidth + 3);
        const y = (canvas.height - h) / 2;

        // Visual gradients mapping
        const isPlayed = (i / barsCount) <= progressRatio;
        if (isPlayed) {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.45 + (1 - i / barsCount) * 0.55})`; // Green transition
        } else {
          ctx.fillStyle = 'rgba(64, 64, 64, 0.6)'; // Neutral dark gray
        }

        // Draw individual bars with perfect glass roundings
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 2);
        ctx.fill();
      }

      // Live pulse rings indicators
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, isEcoMode, bass]);

  // Trigger MP3 file download securely
  const downloadTrack = () => {
    if (!currentTrack) return;
    const a = document.createElement('a');
    a.href = currentTrack.audioUrl;
    a.download = `${currentTrack.title} - DJ Remix.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="dj-player-section" className="bg-charcoal-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Dynamic vinyl neon spin underlay unless Eco Mode is toggled */}
      {!isEcoMode && isPlaying && (
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/5 rounded-full border border-emerald-500/10 animate-spin" style={{ animationDuration: '8s' }} />
      )}

      {currentTrack ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Cover Art Box with neon ring */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative group w-44 h-44 sm:w-48 sm:h-48">
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 ${
                isEcoMode ? 'hidden' : 'block'
              }`} />
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover rounded-2xl border-2 border-neutral-800 relative z-10 transition-transform duration-700 ${
                  isPlaying && !isEcoMode ? 'rotate-12 scale-105' : 'rotate-0'
                }`}
              />
              
              {/* Disc rotate overlay */}
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-emerald-400 z-20 flex items-center gap-1 border border-emerald-800/40">
                <Disc className={`w-3 h-3 ${isPlaying && !isEcoMode ? 'animate-spin' : ''}`} />
                {currentTrack.bpm} BPM
              </div>
            </div>

            {/* Title Block */}
            <div className="text-center mt-5">
              <h3 className="text-lg font-bold text-neutral-100 font-sans tracking-tight leading-tight line-clamp-1">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-sans font-medium">
                {currentTrack.artist}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-neutral-900 border border-neutral-800 text-emerald-300">
                  {currentTrack.genre}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Slider Controls, Equalizer Knobs, and Waveform rendering */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full gap-5">
            
            {/* Visualizer Waveboard container */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[110px]">
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mb-2">
                <span className="flex items-center gap-1"><Disc className="w-3 h-3 text-emerald-400" /> DIGITAL WAVE spectrum</span>
                <span className="text-emerald-400">PITCH: {playbackRate.toFixed(2)}x</span>
              </div>

              {/* Responsive Wave canvas */}
              <canvas
                ref={canvasRef}
                width={500}
                height={65}
                className="w-full h-16 bg-neutral-950/40 rounded opacity-90 block"
              />

              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Seeker Slider control */}
            <div className="w-full">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 outline-none"
              />
            </div>

            {/* Equalizer (Bass, Mid, Treble knobs) */}
            <div className="grid grid-cols-3 gap-3 bg-neutral-900/40 p-3 rounded-2xl border border-neutral-800/40">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  Bass 🥁
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bass}
                  onChange={(e) => setBass(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded accent-emerald-400 outline-none cursor-pointer"
                />
                <span className="text-[9px] text-emerald-400 font-mono mt-1">{bass}%</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  Mids 🎤
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mid}
                  onChange={(e) => setMid(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded accent-teal-400 outline-none cursor-pointer"
                />
                <span className="text-[9px] text-teal-400 font-mono mt-1">{mid}%</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  Treble 🔔
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={treble}
                  onChange={(e) => setTreble(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded accent-emerald-300 outline-none cursor-pointer"
                />
                <span className="text-[9px] text-emerald-300 font-mono mt-1">{treble}%</span>
              </div>
            </div>

            {/* Primary Action Buttons (Play/Pause/Skip/Speed) */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 mt-1">
              
              {/* Media play/pause blocks */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onPrevTrack}
                  className="p-3 rounded-full hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800/60 active:scale-95 transition-all text-xs cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={onPlayPauseToggle}
                  className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-neutral-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-neutral-950" />
                  )}
                </button>
                <button
                  onClick={onNextTrack}
                  className="p-3 rounded-full hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800/60 active:scale-95 transition-all text-xs cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Speed slider to adjust remix speed pitch */}
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
                <FastForward className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[10px] font-mono text-neutral-400 shrink-0">Remix pitch:</span>
                <input
                  type="range"
                  min="0.75"
                  max="1.75"
                  step="0.05"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="w-16 sm:w-24 h-1 bg-neutral-800 rounded accent-emerald-500 outline-none cursor-pointer"
                />
                <button
                  onClick={() => setPlaybackRate(1.0)}
                  className="text-[9px] bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 px-1 py-0.5 text-neutral-400 rounded hover:text-emerald-400 font-mono"
                >
                  Reset
                </button>
              </div>

              {/* Volume sliders & bandwidth conservation indicators */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4.5 h-4.5 text-emerald-500" /> : <Volume2 className="w-4.5 h-4.5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-14 sm:w-20 h-1 bg-neutral-800 accent-emerald-500 rounded outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={downloadTrack}
                    className="p-2.5 rounded-full hover:bg-neutral-850 hover:text-white border border-neutral-800/80 text-neutral-400 text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                    title="Download high fidelity offline version"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onToggleLowBandwidth}
                    className={`p-2.5 rounded-full border text-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
                      isLowBandwidth
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                    title={isLowBandwidth ? 'Eco Low Bandwidth Mode Active' : 'Normal High Fidelity Streaming'}
                  >
                    <Leaf className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Low Bandwidth Active Notice */}
            {isLowBandwidth && (
              <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/60 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                <span>ENVIRONMENTAL LOW-BITRATE STREAM ACTIVE: Conserves bandwidth overhead by ~35% on mobile networks!</span>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="py-12 text-center text-neutral-500">
          <Music className="w-12 h-12 mx-auto text-neutral-600 mb-2 animate-bounce" />
          <p className="text-sm font-sans">No track selected. Click on any remix below to spin it!</p>
        </div>
      )}
    </div>
  );
}
