import React, { useState } from 'react';
import { Star, MessageSquare, Plus, Music, Send, BadgeAlert, AlertCircle, Sparkles } from 'lucide-react';
import { RemixRequest } from '../types';

interface RequestSectionProps {
  requests: RemixRequest[];
  onAddRequest: (req: Omit<RemixRequest, 'id' | 'status' | 'createdAt'>) => void;
  isEcoMode: boolean;
}

export default function RequestSection({ requests, onAddRequest, isEcoMode }: RequestSectionProps) {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [songName, setSongName] = useState('');
  const [genre, setGenre] = useState('Bollywood Electro');
  const [notes, setNotes] = useState('');
  const [isDone, setIsDone] = useState(false);

  // Genre Options for Remix Requests
  const requestGenres = [
    'Bollywood Electro',
    'Punjabi Dhol Beats',
    'South Hardcore Bass',
    'Psytrance Goa',
    'Lo-Fi Relaxation',
    'Commercial Club EDM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !email || !songName) {
      alert('Please fill out Name, Contact email and Target song name!');
      return;
    }

    onAddRequest({
      clientName,
      email,
      songName,
      genre,
      notes
    });

    setIsDone(true);
    setClientName('');
    setEmail('');
    setSongName('');
    setNotes('');

    // Clear confirmation after a few moments
    setTimeout(() => setIsDone(false), 4000);
  };

  return (
    <div id="dj-booking-demand-section" className="bg-charcoal-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {!isEcoMode && (
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pitch request form (Column 5 wide on desktop) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold bg-neutral-950 text-emerald-400 border border-neutral-850">
                Remix Request Box
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-100 mt-1 font-sans tracking-tight">
              Submit Remix Demand
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Want a customized mashup for a wedding, party, or club set? Enter details to notify the DJ immediately!
            </p>
          </div>

          {isDone && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-2xl flex items-start gap-2.5 text-xs animate-fade-in">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold">Request Logged in DJ Desk!</p>
                <p className="text-[10px] text-emerald-500">The DJ has received your booking inquiry and will contact you via email.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priyanshu Kumar"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-neutral-950 text-neutral-100 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 text-neutral-100 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                  Target Song *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kesariya"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-100 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                  Remix Vibe Style
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-100 text-xs px-3 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors"
                >
                  {requestGenres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                Custom Instructions / BPM speed demands
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Heavy bass drop needed at the 1:20 mark, make it Punjabi style..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-neutral-950 text-neutral-100 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-600 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-100 hover:bg-white text-neutral-900 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Request to DJ Terminal</span>
            </button>
          </form>
        </div>

        {/* Live dynamic demands queue (Column 7 wide on desktop) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <div className="flex justify-between items-center bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60">
            <span className="text-[11px] font-mono text-neutral-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              📻 Live Request Queue ({requests.length})
            </span>
            <div className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[385px] overflow-y-auto pr-1">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-850 hover:border-neutral-800 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-200">
                        {req.songName} <span className="font-normal text-neutral-500 text-[10px]/5 font-mono">({req.genre})</span>
                      </h3>
                      <p className="text-[10px] text-neutral-450 mt-0.5">
                        Inquired by <span className="text-emerald-400 font-semibold">{req.clientName}</span>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 font-semibold border border-emerald-900">
                      Accepted
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-[10.5px] text-neutral-400 bg-neutral-900/60 p-2 rounded border border-neutral-850 mt-2 font-mono leading-relaxed">
                      💬 "{req.notes}"
                    </p>
                  )}

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono mt-2">
                    <span>STATUS: ACTIVE RADAR</span>
                    <span>{req.createdAt}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-neutral-950/20 border border-dashed border-neutral-850 rounded-2xl">
                <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-500">The request queue is currently empty.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
