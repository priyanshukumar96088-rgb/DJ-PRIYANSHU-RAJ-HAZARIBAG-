import React, { useState, useRef } from 'react';
import { UploadCloud, Music, ArrowRight, Video, Sparkles, Image, CheckCircle, Disc } from 'lucide-react';
import { Track } from '../types';

interface UploadSectionProps {
  onAddTrack: (newTrack: Omit<Track, 'id' | 'upvotes' | 'uploadedAt'>) => void;
  isEcoMode: boolean;
}

export default function UploadSection({ onAddTrack, isEcoMode }: UploadSectionProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Bollywood Electro / Club Mix');
  const [bpm, setBpm] = useState(128);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Genre Options standard for India / Electro club mixes
  const genreOptions = [
    'Bollywood Electro / Club Mix',
    'Punjabi Dhol Bass Remix',
    'Psytrance / Goa Techno',
    'Retro Pop Remix',
    'Mridangam Organic Lo-Fi',
    'Progressive House Beat'
  ];

  // Drag and Drop Handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  // Autogenerate a design cover art using free public themes if not provided
  const getRandomCoverArt = () => {
    const artOptions = [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60'
    ];
    return artOptions[Math.floor(Math.random() * artOptions.length)];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist) {
      alert('Please fill out the Song Title and DJ Name!');
      return;
    }

    setIsLoading(true);

    // Read audio file either as local blob url or fallback string
    let audioStreamingUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'; // High stability backup beat
    if (audioFile) {
      audioStreamingUrl = URL.createObjectURL(audioFile);
    } else if (audioUrlInput) {
      audioStreamingUrl = audioUrlInput;
    }

    const coverArtChoice = coverUrl || getRandomCoverArt();

    setTimeout(() => {
      onAddTrack({
        title: title,
        artist: artist,
        genre: genre,
        bpm: Number(bpm) || 128,
        duration: '03:30', // Default duration approximation
        audioUrl: audioStreamingUrl,
        coverUrl: coverArtChoice,
        isCustom: true
      });

      setIsLoading(false);
      setIsSuccess(true);
      
      // Clear values
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setAudioUrlInput('');
      setCoverUrl('');

      setTimeout(() => setIsSuccess(false), 3500);
    }, 1000);
  };

  return (
    <div id="dj-upload-tracks-section" className="bg-charcoal-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {!isEcoMode && (
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-800/40 text-emerald-400">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-100 font-sans tracking-tight">
            DJ Upload Station
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Add your own remix track to the list! You can upload custom audio files or paste stream links.
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-semibold">Track Uploaded Successfully!</p>
            <p className="text-[10px] text-emerald-500">Your custom DJ Remix has been added to the library queue.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Remix Track Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dilbar Dilbar (Urban Club Bass Mix)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 text-neutral-200 text-xs px-3.5 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              DJ / Remixer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DJ Priyanshu Remix"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-neutral-950 text-neutral-200 text-xs px-3.5 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              BPM (Beats Per Minute)
            </label>
            <input
              type="number"
              min="40"
              max="240"
              placeholder="128"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full bg-neutral-950 text-neutral-200 text-xs px-3.5 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Genre Category
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-neutral-950 text-neutral-200 text-xs px-3.5 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
            >
              {genreOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag and drop module */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
            Audio Upload Channel (Select file or input stream url)
          </label>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-950/20' 
                : audioFile 
                  ? 'border-emerald-800/80 bg-neutral-950/40' 
                  : 'border-neutral-800 bg-neutral-950/20 hover:border-neutral-700/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {audioFile ? (
              <div className="flex flex-col items-center justify-center">
                <Disc className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs font-semibold text-neutral-200 mt-2">{audioFile.name}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Ready to mount ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-emerald-400" />
                <p className="text-xs font-semibold text-neutral-300">Drag & drop remix audio file here</p>
                <p className="text-[10px] text-neutral-500 mt-1">Supports MP3, WAV, M4A or OGG. Or tap to browse files.</p>
              </div>
            )}
          </div>
        </div>

        {/* Alternate Audio Stream URL */}
        {!audioFile && (
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Or Paste Web Audio Stream URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/stream-track-9.mp3"
              value={audioUrlInput}
              onChange={(e) => setAudioUrlInput(e.target.value)}
              className="w-full bg-neutral-950 text-neutral-200 text-xs px-3.5 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>
        )}

        {/* Cover Art input */}
        <div>
          <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
            Cover Art Image URL (Optional)
          </label>
          <input
            type="url"
            placeholder="Paste unsplash or web link, or leave blank to autogenerate vibrant DJ lights theme"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full bg-neutral-950 text-neutral-200 text-xs px-3.5 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Submit track action button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-850 text-neutral-950 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg hover:shadow-emerald-500/12 active:scale-95 cursor-pointer"
        >
          {isLoading ? (
            <span>Processing Audio Spectrum...</span>
          ) : (
            <>
              <span>Release & Upload Remix</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
