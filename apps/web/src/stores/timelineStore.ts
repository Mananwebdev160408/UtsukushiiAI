import { create } from 'zustand';
import type { BeatMarker } from '@/types';

interface TimelineState {
  // Playback
  currentTime: number;
  isPlaying: boolean;
  duration: number;

  // Audio
  bpm: number | null;
  beats: BeatMarker[];
  waveformData: number[];

  // Scrubbing
  isScrubbing: boolean;

  // Loop
  loopStart: number | null;
  loopEnd: number | null;
  isLooping: boolean;

  // Actions
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setDuration: (duration: number) => void;
  setBpm: (bpm: number | null) => void;
  setBeats: (beats: BeatMarker[]) => void;
  setWaveformData: (data: number[]) => void;
  setScrubbing: (scrubbing: boolean) => void;
  setLoopRange: (start: number | null, end: number | null) => void;
  toggleLooping: () => void;
  seekToNextBeat: () => void;
  seekToPrevBeat: () => void;
  reset: () => void;
}

export const useTimelineStore = create<TimelineState>()((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  bpm: null,
  beats: [],
  waveformData: [],
  isScrubbing: false,
  loopStart: null,
  loopEnd: null,
  isLooping: false,

  setCurrentTime: (currentTime) => set({ currentTime }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setDuration: (duration) => set({ duration }),
  setBpm: (bpm) => set({ bpm }),
  setBeats: (beats) => set({ beats }),
  setWaveformData: (waveformData) => set({ waveformData }),
  setScrubbing: (isScrubbing) => set({ isScrubbing }),
  setLoopRange: (start, end) => set({ loopStart: start, loopEnd: end }),
  toggleLooping: () => set((s) => ({ isLooping: !s.isLooping })),
  seekToNextBeat: () => {
    const { currentTime, beats } = get();
    const next = beats.find((b) => b.time > currentTime + 0.01);
    if (next) set({ currentTime: next.time });
  },
  seekToPrevBeat: () => {
    const { currentTime, beats } = get();
    const prev = [...beats].reverse().find((b) => b.time < currentTime - 0.01);
    if (prev) set({ currentTime: prev.time });
  },
  reset: () =>
    set({
      currentTime: 0,
      isPlaying: false,
      isScrubbing: false,
      loopStart: null,
      loopEnd: null,
    }),
}));
