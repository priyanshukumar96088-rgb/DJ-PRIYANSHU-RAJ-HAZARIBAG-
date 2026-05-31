import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Disc, MessageSquare, UploadCloud, Leaf, Zap, HelpCircle,
  Play, Pause, Sliders, Music, CheckCircle, Info, Heart, ArrowUpRight, Check,
  Youtube, Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, User, Star, ShieldAlert
} from 'lucide-react';
import { Track, RemixRequest } from './types';
import { INITIAL_TRACKS } from './data/songs';
import DjSoundboard from './components/DjSoundboard';
import AudioPlayerSection from './components/AudioPlayerSection';
import TrackList from './components/TrackList';
import UploadSection from './components/UploadSection';
import RequestSection from './components/RequestSection';
import BrandLogo from './components/BrandLogo';
import OwnerPhoto from './components/OwnerPhoto';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEcoMode, setIsEcoMode] = useState(false);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // In-memory / persistent remix inquiries list
  const [requests, setRequests] = useState<RemixRequest[]>([
    {
      id: 'req-1',
      clientName: 'Rahul DJ Setup',
      email: 'rahul.dj@gmail.com',
      songName: 'Kamar Left Right (Vibration EDM Slam)',
      genre: 'Bhojpuri Dj Remix ( Edm )',
      notes: 'Need high-voltage bass drop for setup testing!',
      status: 'accepted',
      createdAt: '3 hours ago',
    },
    {
      id: 'req-2',
      clientName: 'Sanjay Hazaribag',
      email: 'sanjay.haz@gmail.com',
      songName: 'Mahadev Trance (Vibration Bass)',
      genre: 'Bhakti Dj Remix ( Edm )',
      notes: 'Please add active ambient dhol beats with heavy voice-tag overlays.',
      status: 'accepted',
      createdAt: '1 day ago',
    },
  ]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Tracks from initial dataset + localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dj_all_tracks');
      let loadedTracks = INITIAL_TRACKS;
      if (stored) {
        const parsed = JSON.parse(stored) as Track[];
        if (parsed && parsed.length > 0) {
          loadedTracks = parsed;
        }
      }
      setTracks(loadedTracks);
      if (!stored) {
        localStorage.setItem('dj_all_tracks', JSON.stringify(INITIAL_TRACKS));
      }

      // Support shareable links: auto-select track if provided in query param
      const params = new URLSearchParams(window.location.search);
      const trackIdParam = params.get('track');
      if (trackIdParam) {
        const sharedTrack = loadedTracks.find((t) => t.id === trackIdParam);
        if (sharedTrack) {
          setCurrentTrack(sharedTrack);
          setIsPlaying(true);
          return;
        }
      }

      if (loadedTracks.length > 0) {
        setCurrentTrack(loadedTracks[0]);
      }
    } catch (e) {
      setTracks(INITIAL_TRACKS);
      if (INITIAL_TRACKS.length > 0) {
        setCurrentTrack(INITIAL_TRACKS[0]);
      }
    }
  }, []);

  // Save custom tracks back to localStorage whenever we add a new one
  const handleAddTrack = (newTrackData: Omit<Track, 'id' | 'upvotes' | 'uploadedAt'>) => {
    const freshTrack: Track = {
      ...newTrackData,
      id: `custom-track-${Date.now()}`,
      upvotes: 1,
      uploadedAt: 'Just now',
    };

    const updatedTracks = [freshTrack, ...tracks];
    setTracks(updatedTracks);
    localStorage.setItem('dj_all_tracks', JSON.stringify(updatedTracks));

    setCurrentTrack(freshTrack);
    setIsPlaying(true);
  };

  // Upvote increments
  const handleUpvoteTrack = (trackId: string) => {
    const updated = tracks.map((track) => {
      if (track.id === trackId) {
        return { ...track, upvotes: track.upvotes + 1 };
      }
      return track;
    });

    setTracks(updated);
    localStorage.setItem('dj_all_tracks', JSON.stringify(updated));
  };

  // Delete Track handler
  const handleDeleteTrack = (trackId: string) => {
    const updatedTracks = tracks.filter((t) => t.id !== trackId);
    setTracks(updatedTracks);
    localStorage.setItem('dj_all_tracks', JSON.stringify(updatedTracks));

    if (currentTrack?.id === trackId) {
      if (updatedTracks.length > 0) {
        setCurrentTrack(updatedTracks[0]);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    }
  };

  // Edit Track handler
  const handleEditTrack = (trackId: string, updatedFields: Partial<Track>) => {
    const updatedTracks = tracks.map((track) => {
      if (track.id === trackId) {
        const revised = { ...track, ...updatedFields };
        if (currentTrack?.id === trackId) {
          setCurrentTrack(revised);
        }
        return revised;
      }
      return track;
    });
    setTracks(updatedTracks);
    localStorage.setItem('dj_all_tracks', JSON.stringify(updatedTracks));
  };

  // Reset tracks handler
  const handleResetTracks = () => {
    setTracks(INITIAL_TRACKS);
    localStorage.setItem('dj_all_tracks', JSON.stringify(INITIAL_TRACKS));
    if (INITIAL_TRACKS.length > 0) {
      setCurrentTrack(INITIAL_TRACKS[0]);
    }
  };

  // Client request adding
  const handleAddRequest = (reqData: Omit<RemixRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: RemixRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: 'Just now',
    };

    setRequests([newRequest, ...requests]);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleNextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('priyanshukumar96088@gmail.com');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div
      className={`min-h-screen bg-[#060606] text-neutral-100 transition-all duration-500 pb-16 relative selection:bg-emerald-500 selection:text-neutral-900 ${
        isEcoMode ? 'brightness-90 filter' : ''
      }`}
    >
      {/* Hidden audio element for the core player */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        preload="auto"
      />

      {/* Radiant ambient glow */}
      {!isEcoMode && (
        <div className="absolute inset-x-0 top-0 h-[650px] bg-gradient-to-b from-[#111827]/30 via-transparent to-transparent pointer-events-none z-0" />
      )}

      {/* Dynamic Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-12 h-12 shrink-0 animate-pulse" />
            <div>
              <h1 className="text-sm sm:text-lg font-black tracking-wider font-sans text-neutral-100 flex flex-wrap items-center gap-x-2">
                DJ PRIYANSHU RAJ HAZARIBAG 
                <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800">
                  OFFICIAL
                </span>
              </h1>
              <p className="text-[9.5px] text-neutral-400 font-mono tracking-wider uppercase">Bhojpuri, Bhakti, Nagpuri & Competition remixes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Eco mode energy saving toggler */}
            <button
              onClick={() => setIsEcoMode(!isEcoMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono tracking-wide transition-all border cursor-pointer ${
                isEcoMode
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-950 border-neutral-800/80 text-emerald-400 hover:bg-neutral-900'
              }`}
              title="Eco Energy Saving Toggle"
            >
              <Leaf className={`w-4 h-4 ${isEcoMode ? 'fill-neutral-950 animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isEcoMode ? 'ECO ACTIVE' : 'ECO SAVINGS'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 space-y-8">
        
        {/* Top Hero Showcase & Brand Statement */}
        <section className="bg-gradient-to-r from-neutral-950/95 to-neutral-900/60 p-5 sm:p-7 rounded-3xl border border-neutral-800/70 relative overflow-hidden">
          {/* Subtle neon grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/80 text-red-400 font-semibold border border-red-900/50 text-[10.5px] font-mono rounded-full uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-red-400" /> Bhojpuri, Nagpuri, Hindi & Bhakti Setup Master
              </div>
              <h2 className="text-xl sm:text-3.5xl font-black font-sans text-neutral-100 tracking-tight leading-tight">
                Welcome to Visit My Website
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl">
                Hazaribag (Jharkhand) ke sabse viral and fast EDM remixes ka hub! Yahan aap direct free MP3 download access pa sakte hain, upvote karke support kar sakte hain, aur apna custom dance mix request bhi send kar sakte hain.
              </p>

              {/* 3 Required Hindi Announcement Strips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                <div className="p-3.5 bg-neutral-950/85 border border-neutral-800 rounded-xl relative overflow-hidden group">
                  <div className="absolute -right-3 -bottom-3 text-neutral-900 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                    <Music className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">📢 SPECIAL OFFER</span>
                  <p className="text-xs text-neutral-200 font-semibold font-sans leading-normal">
                    Dj Bhaiyon ke liye Apne dj Setup ya Apne naam Se Dj Song Banawana hoga to Mere Se contact kare.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/85 border border-neutral-800 rounded-xl relative overflow-hidden group">
                  <div className="absolute -right-3 -bottom-3 text-neutral-900 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">💬 VOICE TAG</span>
                  <p className="text-xs text-neutral-200 font-semibold font-sans leading-normal">
                    Apne naam ka Dj Voice Tag banwane ke hame WhatsApp Me dm kare.
                  </p>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-neutral-950 to-neutral-950 border border-neutral-800 rounded-xl relative overflow-hidden group">
                  <div className="absolute -right-3 -bottom-3 text-neutral-900 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                    <Sliders className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold block mb-1">⚡ ALL REMIXES</span>
                  <p className="text-xs text-neutral-200 font-semibold font-sans leading-normal">
                    Hamare yeha sabhi prakar ke dj Remix Ki jata hai. Special vibration bass mix.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Bar for WhatsApp Inquiries */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#090909]/95 border border-emerald-500/20 shrink-0 text-left relative overflow-hidden self-stretch flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-emerald-400 font-mono block uppercase tracking-wider font-extrabold mb-1">
                  🟢 INSTANT CONTACT CHANNEL
                </span>
                <span className="text-lg sm:text-2xl font-black font-sans text-neutral-100 flex items-center gap-1.5">
                  Direct WhatsApp
                </span>
                <p className="text-[11.5px] text-neutral-400 mt-2 leading-relaxed">
                  Apne DJ Setups ya voice tags ka fast booking ke liye, ya WhatsApp conversation start karne ke liye niche direct click karein:
                </p>
              </div>

              <div className="mt-4 pt-1 space-y-2">
                <a
                  href="https://wa.me/919229053264?text=Hello%20DJ%20Priyanshu%20Raj%2C%20mujhe%20apne%20naam%20ka%20DJ%20Voice%2520Tag%20%2F%20Song%20banwana%20hai."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-emerald-500/10 uppercase"
                >
                  <MessageCircle className="w-4 h-4 fill-neutral-950" />
                  DM ON WHATSAPP NOW
                </a>
                <p className="text-[9.5px] text-neutral-500 font-mono text-center">Active 24/7 • Fast Response Guaranteed</p>
              </div>
            </div>

          </div>
        </section>

        {/* Live Audio Player Stage */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visualizers, Soundboard, and Live Decks */}
          <div className="lg:col-span-8 space-y-8">
            <AudioPlayerSection
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayPauseToggle={handlePlayPause}
              onNextTrack={handleNextTrack}
              onPrevTrack={handlePrevTrack}
              isEcoMode={isEcoMode}
              isLowBandwidth={isLowBandwidth}
              onToggleLowBandwidth={() => setIsLowBandwidth(!isLowBandwidth)}
              audioRef={audioRef}
            />

            {/* Soundboard */}
            <DjSoundboard isEcoMode={isEcoMode} />
          </div>

          {/* Track Queue & Bio Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Owner Spotlight section */}
            <OwnerPhoto />

            {/* Track Queue list with full admin features */}
            <TrackList
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onSelectTrack={handleSelectTrack}
              onUpvoteTrack={handleUpvoteTrack}
              onEditTrack={handleEditTrack}
              onDeleteTrack={handleDeleteTrack}
              onResetTracks={handleResetTracks}
            />

            {/* Quick Contacts Directory card */}
            <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-900 relative overflow-hidden">
              <h4 className="text-xs font-bold font-mono uppercase text-amber-500 tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-neutral-850">
                <Star className="w-4 h-4" /> DJ PRIYANSHU OFFICIAL INFO
              </h4>
              <div className="mt-4 space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 block">Owner Name</span>
                    <p className="text-xs text-neutral-200 font-semibold">Priyanshu Kumar</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 block">Location</span>
                    <p className="text-xs text-neutral-200 font-semibold text-amber-500">Hazaribag, Jharkhand (India)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 block">WhatsApp Mobile Contact</span>
                    <a href="https://wa.me/919229053264" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 font-bold hover:underline">
                      +91 92290 53264
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 block">Email Address (Business Only)</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        onClick={copyEmailToClipboard}
                        className="text-xs text-neutral-200 hover:text-amber-400 hover:underline text-left"
                        title="Click to copy email"
                      >
                        priyanshukumar96088@gmail.com
                      </button>
                      {copiedText && (
                        <span className="text-[8.5px] font-mono bg-amber-500 text-neutral-900 px-1 py-0.25 rounded font-bold">
                          COPIED
                        </span>
                      )}
                    </div>
                    <span className="mt-1 inline-block text-[9px] bg-red-950/80 text-red-400 border border-red-900/40 px-1.5 py-0.25 rounded font-semibold">
                      ⚠️ Do not send spam messages
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DMCA Copyright Protection Seal & Compliance Card */}
            <div className="bg-neutral-950 p-5 rounded-2xl border border-red-900/30 relative overflow-hidden bg-gradient-to-br from-neutral-950 to-red-950/10">
              {/* Decorative mini logo element background */}
              <div className="absolute top-0 right-0 p-3 text-red-500/10">
                <ShieldAlert className="w-16 h-16 pointer-events-none" />
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black font-sans uppercase tracking-wider text-red-400">DMCA Copyright Protected</h4>
                    <span className="text-[8px] font-mono bg-red-950 text-red-400 border border-red-920 px-1.5 py-0.25 rounded font-bold uppercase tracking-wider">
                      ★ Official Shield
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  Hum dusre music creators ke copyright ka poora samman karte hain. Agar is website ki kisi remix audio ya image se koi copyright complaint hai, toh instant action ke liye neeche click karein.
                </p>

                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-850 space-y-1 text-[10px] text-neutral-400">
                  <span className="font-mono text-red-400 font-bold block">🚨 FASTRACK TAKE-DOWN:</span>
                  <p className="leading-normal">
                    Takedown request receive hote hi us content ko <span className="text-white font-bold">24 Hours ke andar</span> hata diya jayega. Koi legal tension nahi!
                  </p>
                </div>

                <div className="space-y-1.5 pt-1.5">
                  <a
                    href="mailto:priyanshukumar96088@gmail.com?subject=DMCA%20Remix%20Takedown%20Notification&body=Hello%20DJ%20Priyanshu%20Raj%2C%0A%0AI%20am%20the%20copyright%20owner%20of%20the%20following%20song.%20Kindly%20takedown%20this%20remix%20from%20your%20website%3A%0A%0A-%20Remix%20Title%3A%20%0A-%20URL%20on%20your%20Site%3A%20%0A%0AThank%20you!"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-red-950/40 hover:bg-red-900/80 hover:text-white text-red-400 border border-red-900/40 hover:border-red-500 rounded-xl font-bold font-mono text-[9px] uppercase transition-all tracking-wide cursor-pointer"
                  >
                    🚀 REPORT INFRINGEMENT / INTAQAL
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Upload and Request Boards side-by-side */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UploadSection onAddTrack={handleAddTrack} isEcoMode={isEcoMode} />
          <RequestSection requests={requests} onAddRequest={handleAddRequest} isEcoMode={isEcoMode} />
        </section>

      </main>

      {/* Social Media Linkage Deck & Custom styled footer */}
      <footer className="mt-20 border-t border-neutral-900 pt-10 text-center text-xs text-neutral-550 relative z-30">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          
          <div className="flex flex-col items-center justify-center gap-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-neutral-400">FIND ME ON SOCIALS & STREAMS</h4>
            <div className="flex flex-wrap items-center justify-center gap-3">
              
              {/* YouTube */}
              <a
                href="https://youtube.com/@djpriyanshurajhazaribaghno1?si=KIq8qFRuV196JnCl"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-red-400 rounded-xl transition-all font-semibold font-mono text-xs cursor-pointer shadow-sm hover:shadow-red-500/5 hover:-translate-y-0.5"
              >
                <Youtube className="w-4 h-4 fill-red-400" />
                Dj Priyanshu Raj Hazaribag
              </a>

              {/* Instagram @dj_priyanshu_raj_hazaribag */}
              <a
                href="https://instagram.com/dj_priyanshu_raj_hazaribag"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-pink-950/20 hover:bg-pink-950/50 border border-pink-900/30 text-pink-300 rounded-xl transition-all font-semibold font-mono text-xs cursor-pointer shadow-sm hover:shadow-pink-500/5 hover:-translate-y-0.5"
              >
                <Instagram className="w-4 h-4" />
                @dj_priyanshu_raj_hazaribag
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/search/top/?q=Priyanshu%20Raj"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-sky-950/20 hover:bg-sky-950/50 border border-sky-900/30 text-sky-400 rounded-xl transition-all font-semibold font-mono text-xs cursor-pointer shadow-sm hover:shadow-sky-500/3 hover:-translate-y-0.5"
              >
                <Facebook className="w-4 h-4 fill-sky-400" />
                Priyanshu Raj
              </a>

              {/* WhatsApp direct DM */}
              <a
                href="https://wa.me/919229053264"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-950/20 hover:bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 rounded-xl transition-all font-semibold font-mono text-xs cursor-pointer shadow-sm hover:shadow-emerald-500/3 hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400" />
                +91 92290 53264
              </a>

            </div>
          </div>

          <div className="border-t border-neutral-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-neutral-400 font-extrabold uppercase font-sans tracking-wide text-[10.5px]">DJ PRIYANSHU RAJ HAZARIBAG</p>
              <p className="text-neutral-500 font-mono text-[9px] mt-0.5">© 2026 Official Remix Platform. Direct digital stream powered by Cleanhitz server.</p>
            </div>
            
            <div className="flex gap-4 font-mono text-[9.5px] text-neutral-400">
              <a href="#" className="hover:text-emerald-400 transition-colors uppercase">TOP OF DECK</a>
              <span>•</span>
              <a href="#request-sec" className="hover:text-emerald-400 transition-colors uppercase">SEND REQUEST</a>
              <span>•</span>
              <a href="#upload-sec" className="hover:text-emerald-400 transition-colors uppercase">UPLOAD REMIX</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
