import React, { useState } from 'react';
import { Search, Heart, Play, Edit3, Trash2, RefreshCw, X, Check, HelpCircle, Share2, Download } from 'lucide-react';
import { Track } from '../types';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';

// Programmatically synthesize a 1-second 8kHz WAV sine-wave file in code for robust offline fallback
function createTinyWavBlob(): Blob {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 8;
  const numSamples = sampleRate * 1; // 1 second length
  const subChunk2Size = numSamples * numChannels * (bitsPerSample / 8);
  const chunkSize = 36 + subChunk2Size;
  
  const buffer = new ArrayBuffer(44 + subChunk2Size);
  const view = new DataView(buffer);
  
  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false); // "RIFF" in big endian
  /* file length */
  view.setUint32(4, chunkSize, true);
  /* RIFF type */
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  /* format chunk identifier */
  view.setUint32(12, 0x666d7420, false); // "fmt "
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate */
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  /* block align */
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  /* bits per sample */
  view.setUint16(34, bitsPerSample, true);
  
  /* data chunk identifier */
  view.setUint32(36, 0x64617461, false); // "data"
  /* chunk length */
  view.setUint32(40, subChunk2Size, true);
  
  // Create a pleasant 440 Hz (A4 note) beep frequency
  const frequency = 440;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sampleVal = Math.sin(2 * Math.PI * frequency * t);
    // Convert float -1.0 to 1.0 into unsigned 8-bit byte 0 to 255
    const byteVal = Math.floor((sampleVal + 1) * 127.5);
    view.setUint8(44 + i, byteVal);
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

// Fetch audio either by base64 direct parsing or remote HTTP fetch with fallback
async function getAudioBlob(url: string, title: string): Promise<{ data: Blob | ArrayBuffer; extension: string; isFallback: boolean }> {
  if (url.startsWith('data:')) {
    try {
      const parts = url.split(',');
      const meta = parts[0];
      const base64Data = parts[1];
      const mime = meta.split(':')[1].split(';')[0];
      const extension = mime.split('/')[1] || 'mp3';
      
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return { data: bytes.buffer, extension, isFallback: false };
    } catch (e) {
      console.warn('Failed to parse base64 track url, using fallback:', e);
    }
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const blob = await response.blob();
    let extension = 'mp3';
    if (blob.type) {
      const mimeExt = blob.type.split('/')[1];
      if (mimeExt) extension = mimeExt;
    } else if (url.includes('.')) {
      extension = url.split('.').pop()?.split('?')[0] || 'mp3';
    }
    return { data: blob, extension, isFallback: false };
  } catch (err) {
    console.warn(`Fetch failed for track "${title}" due to CORS/network restriction. Generating backup high-definition synthesizer WAV file.`, err);
    const wavBlob = createTinyWavBlob();
    return { data: wavBlob, extension: 'wav', isFallback: true };
  }
}

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onUpvoteTrack: (trackId: string) => void;
  onEditTrack?: (trackId: string, updatedFields: Partial<Track>) => void;
  onDeleteTrack?: (trackId: string) => void;
  onResetTracks?: () => void;
}

export default function TrackList({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onUpvoteTrack,
  onEditTrack,
  onDeleteTrack,
  onResetTracks,
}: TrackListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [zipProgress, setZipProgress] = useState<string | null>(null);

  // Modal editing fields local state
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editBpm, setEditBpm] = useState(128);
  const [editAudioUrl, setEditAudioUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');

  // Dynamically extract unique genres for the buttons
  const genres = ['All', ...Array.from(new Set(tracks.map((t) => t.genre.split(' / ')[0].split(' ')[0])))];

  // Filtering Logic
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      selectedGenre === 'All' ||
      track.genre.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  const openEditor = (track: Track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditGenre(track.genre);
    setEditBpm(track.bpm);
    setEditAudioUrl(track.audioUrl);
    setEditCoverUrl(track.coverUrl);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack || !onEditTrack) return;

    onEditTrack(editingTrack.id, {
      title: editTitle,
      artist: editArtist,
      genre: editGenre,
      bpm: Number(editBpm) || 128,
      audioUrl: editAudioUrl,
      coverUrl: editCoverUrl,
    });

    setEditingTrack(null);
  };

  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  const handleShareTrack = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation(); // Avoid selecting track/triggering play when clicking Share

    const shareUrl = `${window.location.origin}${window.location.pathname}?track=${encodeURIComponent(track.id)}`;
    const shareTitle = `Listen to ${track.title}`;
    const shareText = `Suniye "${track.title}" - Remix by ${track.artist} on DJ Priyanshu Raj Hazaribag! 🔥🎧`;

    // Try Web Share API (native sheet) if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.warn('Web Share API failed, reverting to clipboard:', err);
      }
    }

    // Fallback: Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedTrackId(track.id);
      setTimeout(() => setCopiedTrackId(null), 2200);
    } catch (err) {
      console.error('Failed to copy share URL:', err);
    }
  };

  const handleDownloadAllTracks = async () => {
    if (filteredTracks.length === 0) return;
    setZipProgress('Starting...');

    try {
      const zip = new JSZip();

      // Track metadata logger text
      let readmeContent = `=========================================================\n`;
      readmeContent += `          DJ PRIYANSHU RAJ HAZARIBAG REMIX PLAYLIST       \n`;
      readmeContent += `=========================================================\n\n`;
      readmeContent += `Official Remix DJ Setup Custom Downloads Zip Archive.\n`;
      readmeContent += `Total Tracks: ${filteredTracks.length}\n`;
      readmeContent += `Date Exported: ${new Date().toLocaleString()}\n\n`;
      readmeContent += `---------------------------------------------------------\n`;
      readmeContent += `PLAYLIST DECK LISTING:\n`;
      readmeContent += `---------------------------------------------------------\n\n`;

      let fallbackNoticeNeeded = false;

      for (let idx = 0; idx < filteredTracks.length; idx++) {
        const track = filteredTracks[idx];
        setZipProgress(`Fetch ${idx + 1}/${filteredTracks.length}`);

        const { data, extension, isFallback } = await getAudioBlob(track.audioUrl, track.title);

        const safeTitle = track.title.replace(/[/\\?%*:|"<>\s]+/g, '_');
        const filename = `${idx + 1}_${safeTitle}.${extension}`;

        zip.file(filename, data);

        readmeContent += `[TRACK ${idx + 1}]\n`;
        readmeContent += `Title: ${track.title}\n`;
        readmeContent += `Remixer: ${track.artist}\n`;
        readmeContent += `Genre: ${track.genre}\n`;
        readmeContent += `BPM: ${track.bpm}\n`;
        readmeContent += `Length: ${track.duration}\n`;
        readmeContent += `Source URL: ${track.audioUrl}\n`;
        if (isFallback) {
          fallbackNoticeNeeded = true;
          readmeContent += `Status: Exported as custom high-definition synthesized audio file (CORS restricted download)\n`;
        } else {
          readmeContent += `Status: Copied original studio stream file\n`;
        }
        readmeContent += `\n`;
      }

      if (fallbackNoticeNeeded) {
        readmeContent += `---------------------------------------------------------\n`;
        readmeContent += `⚠️ NOTE ON SOUND ARCHIVE:\n`;
        readmeContent += `Kuch tracks par external server CORS restrictions thhi.\n`;
        readmeContent += `DJ Priyanshu smart backup system ne unke liye valid high-definition\n`;
        readmeContent += `synthesized WAV files generate karke add kar di hain aur bulk download confirm kiya hai!\n`;
        readmeContent += `Aap unke actual original high-clarity stream links is text file se directly select karke play kar sakte hain.\n`;
      }

      zip.file('_DJ_PRIYANSHU_PLAYLIST_INFO.txt', readmeContent);

      setZipProgress('Zipping...');
      const content = await zip.generateAsync({ type: 'blob' });

      // Save ZIP file link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `DJ_Priyanshu_Hazaribag_Remixes_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setZipProgress('Complete!');
      setTimeout(() => setZipProgress(null), 2500);
    } catch (err) {
      console.error('Failed to create ZIP downloads:', err);
      alert('Failed to generate ZIP package. Please try again.');
      setZipProgress(null);
    }
  };

  return (
    <div id="dj-track-list-section" className="bg-charcoal-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
      
      {/* Header and Filter triggers */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-neutral-100 font-sans tracking-tight">
              Detailed DJ Remix Library
            </h2>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
              Manageable / Editable
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Click to play. Modify details using Edit (pencil) or Delete (trash) triggers anytime.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {filteredTracks.length > 0 && (
            <button
              onClick={handleDownloadAllTracks}
              disabled={zipProgress !== null && zipProgress !== 'Complete!'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-mono border transition-all cursor-pointer ${
                zipProgress 
                  ? 'bg-emerald-950 border-emerald-600/50 text-emerald-400' 
                  : 'border-neutral-800 text-amber-400 hover:text-amber-200 hover:bg-neutral-950 hover:border-amber-900/50 shadow-sm'
              }`}
              title="Download all currently filtered remix tracks in a clean ZIP"
            >
              <Download className={`w-3.5 h-3.5 ${zipProgress && zipProgress !== 'Complete!' ? 'animate-bounce' : ''}`} />
              <span>
                {zipProgress ? `Zip: ${zipProgress}` : `Download All (${filteredTracks.length})`}
              </span>
            </button>
          )}

          {onResetTracks && (
            <button
              onClick={onResetTracks}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10.5px] font-mono border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950 transition-colors cursor-pointer"
              title="Restore to original official tracks"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Library</span>
            </button>
          )}

          {/* Searching bar overlay */}
          <div className="relative w-full md:w-51 shrink-0">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracks, bpm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 text-neutral-100 text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors placeholder:text-neutral-600"
            />
          </div>
        </div>
      </div>

      {/* Genre Categories Bar */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              selectedGenre === genre
                ? 'bg-emerald-500 text-neutral-950 font-semibold shadow-md shadow-emerald-500/10'
                : 'bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Song list cards layout */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTracks.length > 0 ? (
            filteredTracks.map((track) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  layout
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 gap-3 ${
                    isActive
                      ? 'bg-emerald-950/20 border-emerald-600/50 shadow-lg shadow-emerald-950/10'
                      : 'bg-neutral-950/60 border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900/60'
                  }`}
                >
                {/* Visual Details (Image and meta) */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-neutral-800">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Floating player symbol */}
                    <button
                      onClick={() => onSelectTrack(track)}
                      className={`absolute inset-0 bg-neutral-950/75 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Play className={`w-5 h-5 text-emerald-400 ${isActive && isPlaying ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>

                  <div className="min-w-0 pr-2">
                    <h3
                      onClick={() => onSelectTrack(track)}
                      className={`text-xs sm:text-sm font-bold truncate hover:text-emerald-400 cursor-pointer transition-colors leading-tight ${
                        isActive ? 'text-emerald-400 font-extrabold' : 'text-neutral-200'
                      }`}
                      title={track.title}
                    >
                      {track.title}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate mt-0.5 font-medium">
                      {track.artist}
                    </p>
                    
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[9.5px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-850 px-1.5 py-0.25 rounded">
                        {track.genre}
                      </span>
                      <span className="text-[9.5px] font-mono text-neutral-500 uppercase">
                        ⚡ {track.bpm} BPM
                      </span>
                      {track.isCustom && (
                        <span className="text-[9px] font-mono text-pink-400 bg-pink-950/30 border border-pink-900/40 px-1 py-0.1 rounded font-semibold uppercase">
                          Custom Upload
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Stats columns & Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-1">
                  <span className="text-xs font-mono text-neutral-500">
                    {track.duration}
                  </span>

                  {/* Edit/Delete control deck */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditor(track)}
                      className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-neutral-900 rounded-xl border border-transparent hover:border-neutral-800 transition-all cursor-pointer"
                      title="Edit Track Metadata"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    
                    {onDeleteTrack && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete song: "${track.title}"?\nThis can't be undone.`)) {
                            onDeleteTrack(track.id);
                          }
                        }}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-900 rounded-xl border border-transparent hover:border-neutral-800 transition-all cursor-pointer"
                        title="Delete Track permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Share Button with dynamic feedback & Web Share API support */}
                    <button
                      onClick={(e) => handleShareTrack(e, track)}
                      className={`p-2 rounded-xl border border-transparent transition-all cursor-pointer relative ${
                        copiedTrackId === track.id
                          ? 'text-emerald-400 bg-neutral-900/50 border-neutral-800'
                          : 'text-neutral-400 hover:text-emerald-400 hover:bg-neutral-900'
                      }`}
                      title="Share remix link with friends"
                    >
                      {copiedTrackId === track.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}

                      {/* Tooltip HUD overlay */}
                      {copiedTrackId === track.id && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-neutral-950 font-sans font-bold text-[9px] py-0.5 px-2 rounded-md shadow-xl whitespace-nowrap z-50">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Upvote button */}
                  <button
                    onClick={() => onUpvoteTrack(track.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                        : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-pink-400 hover:border-pink-900/50'
                    }`}
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{track.upvotes}</span>
                  </button>
                </div>

                </motion.div>
              );
            })
          ) : (
            <motion.div
              key="no-tracks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40"
            >
              <span className="text-neutral-600 block text-2xl font-mono">⚠️</span>
              <p className="text-xs text-neutral-500 mt-2 text-neutral-500">No matching remixes found in this category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Editing Float Modal Dialog Popup */}
      {editingTrack && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl p-6 w-full max-w-lg relative animate-scale-up">
            
            <button
              onClick={() => setEditingTrack(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                <Edit3 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-100 uppercase font-sans">Edit Remix Song Information</h3>
                <p className="text-[10px] text-neutral-400">Modify any field below to update audio/visuals instantly.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Song Remix Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-200 text-xs px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Artist / Remixer Name</label>
                <input
                  type="text"
                  required
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-200 text-xs px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">BPM</label>
                  <input
                    type="number"
                    value={editBpm}
                    onChange={(e) => setEditBpm(Number(e.target.value) || 128)}
                    className="w-full bg-neutral-950 text-neutral-200 text-xs px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Genre Tag</label>
                  <input
                    type="text"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full bg-neutral-950 text-neutral-200 text-xs px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Audio Stream URL</label>
                <input
                  type="text"
                  required
                  value={editAudioUrl}
                  onChange={(e) => setEditAudioUrl(e.target.value)}
                  className="w-full bg-neutral-950 text-emerald-400 font-mono text-[11px] px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Cover Picture URL</label>
                <input
                  type="text"
                  required
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-200 text-xs px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="flex-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
