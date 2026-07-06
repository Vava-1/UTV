import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
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

  // Real audio element — the previous version had no <audio>, so Play did nothing
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create the audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = state.volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const onLoadedMetadata = () => setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    const onEnded = () => setState(prev => {
      // Auto-advance to next track
      if (prev.currentIndex < prev.queue.length - 1) {
        const idx = prev.currentIndex + 1;
        const nextTrack = prev.queue[idx];
        audio.src = nextTrack.audio_url || '';
        audio.play().catch(() => {});
        return { ...prev, currentIndex: idx, currentTrack: nextTrack, isPlaying: true, currentTime: 0 };
      }
      return { ...prev, isPlaying: false, currentTime: 0 };
    });
    const onPlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const onPause = () => setState(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const play = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.audio_url || '';
    audio.play().catch(err => console.error('[AudioPlayer] Play failed:', err));
    setState(prev => ({ ...prev, isPlaying: true, currentTrack: track, currentTime: 0 }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      audio.play().catch(err => console.error('[AudioPlayer] Play failed:', err));
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex < prev.queue.length - 1) {
        const idx = prev.currentIndex + 1;
        const track = prev.queue[idx];
        const audio = audioRef.current;
        if (audio) {
          audio.src = track.audio_url || '';
          audio.play().catch(() => {});
        }
        return { ...prev, currentIndex: idx, currentTrack: track, isPlaying: true, currentTime: 0 };
      }
      return prev;
    });
  }, []);

  const previous = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex > 0) {
        const idx = prev.currentIndex - 1;
        const track = prev.queue[idx];
        const audio = audioRef.current;
        if (audio) {
          audio.src = track.audio_url || '';
          audio.play().catch(() => {});
        }
        return { ...prev, currentIndex: idx, currentTrack: track, isPlaying: true, currentTime: 0 };
      }
      return prev;
    });
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    if (audioRef.current) audioRef.current.volume = clamped;
    setState(prev => ({ ...prev, volume: clamped }));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => ({ ...prev, queue: prev.queue.filter((_, i) => i !== index) }));
  }, []);

  const clearQueue = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setState(prev => ({ ...prev, queue: [], currentTrack: null, currentIndex: -1, isPlaying: false }));
  }, []);

  const toggleExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  }, []);

  const setQueue = useCallback((tracks: Track[], startIndex: number = 0) => {
    const track = tracks[startIndex];
    const audio = audioRef.current;
    if (audio && track) {
      audio.src = track.audio_url || '';
      audio.play().catch(() => {});
    }
    setState(prev => ({
      ...prev, queue: tracks, currentTrack: track,
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
