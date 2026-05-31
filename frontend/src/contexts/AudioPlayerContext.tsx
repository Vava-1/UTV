import React, { createContext, useContext, useState, useCallback } from 'react';
import { Track } from '@/types';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  currentIndex: number;
  isExpanded: boolean;
}

interface AudioPlayerContextType extends AudioPlayerState {
  play: (track: Track) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleExpanded: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false, currentTrack: null, currentTime: 0,
    duration: 0, volume: 0.8, queue: [], currentIndex: -1, isExpanded: false,
  });

  const play = useCallback((track: Track) => {
    setState(prev => ({ ...prev, isPlaying: true, currentTrack: track }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const next = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex < prev.queue.length - 1) {
        const idx = prev.currentIndex + 1;
        return { ...prev, currentIndex: idx, currentTrack: prev.queue[idx], isPlaying: true };
      }
      return prev;
    });
  }, []);

  const previous = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex > 0) {
        const idx = prev.currentIndex - 1;
        return { ...prev, currentIndex: idx, currentTrack: prev.queue[idx], isPlaying: true };
      }
      return prev;
    });
  }, []);

  const seek = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((v: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, v)) }));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => ({ ...prev, queue: prev.queue.filter((_, i) => i !== index) }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({ ...prev, queue: [] }));
  }, []);

  const toggleExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  }, []);

  const setQueue = useCallback((tracks: Track[], startIndex: number = 0) => {
    setState(prev => ({
      ...prev, queue: tracks, currentTrack: tracks[startIndex],
      currentIndex: startIndex, isPlaying: true, currentTime: 0,
    }));
  }, []);

  return (
    <AudioPlayerContext.Provider value={{
      ...state, play, pause, toggle, next, previous,
      seek, setVolume, addToQueue, removeFromQueue, clearQueue, toggleExpanded, setQueue,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}
