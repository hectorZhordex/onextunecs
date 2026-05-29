import { create } from 'zustand';
import { Track } from '@workspace/api-client-react';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  playTrack: (track: Track, queue?: Track[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  volume: 0.8,

  playTrack: (track, queue = []) => 
    set(() => ({ currentTrack: track, isPlaying: true, queue })),
    
  pauseTrack: () => set({ isPlaying: false }),
  
  resumeTrack: () => set({ isPlaying: true }),
  
  nextTrack: () => set((state) => {
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    if (currentIndex >= 0 && currentIndex < state.queue.length - 1) {
      return { currentTrack: state.queue[currentIndex + 1], isPlaying: true };
    }
    return state;
  }),
  
  prevTrack: () => set((state) => {
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    if (currentIndex > 0) {
      return { currentTrack: state.queue[currentIndex - 1], isPlaying: true };
    }
    return state;
  }),
  
  setVolume: (volume) => set({ volume }),
  
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] }))
}));
