export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: string;
  audioUrl: string;
  coverUrl: string;
  upvotes: number;
  uploadedAt: string;
  isCustom?: boolean;
}

export interface SoundFX {
  id: string;
  name: string;
  color: string;
  shortcut: string;
  type: 'synth' | 'noise' | 'beep' | 'bass' | 'laser';
}

export interface RemixRequest {
  id: string;
  clientName: string;
  email: string;
  songName: string;
  genre: string;
  notes: string;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isEcoMode: boolean;
  isLowBandwidth: boolean;
  currentTime: number;
  duration: number;
  bassLevel: number; // 0-100
  midLevel: number;  // 0-100
  trebleLevel: number; // 0-100
}
