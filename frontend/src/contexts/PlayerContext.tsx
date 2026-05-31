import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Music } from "@/types";

interface PlayerState {
  currentTrack: Music | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playlist: Music[];
}

interface PlayerContextType extends PlayerState {
  play: (track: Music) => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  playNext: () => void;
  playPrev: () => void;
  addToPlaylist: (track: Music) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
    playlist: [],
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const play = useCallback((track: Music) => {
    cleanup();
    const audio = new Audio(track.audio_url);
    audio.volume = state.volume;
    audioRef.current = audio;

    audio.play().catch(() => {});

    setState((s) => ({
      ...s,
      currentTrack: track,
      isPlaying: true,
      duration: track.duration_seconds || 0,
      progress: 0,
    }));

    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        setState((s) => ({
          ...s,
          progress: audioRef.current?.currentTime || 0,
        }));
      }
    }, 1000);

    audio.addEventListener("ended", () => {
      setState((s) => ({ ...s, isPlaying: false, progress: 0 }));
    });
  }, [cleanup, state.volume]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else if (state.currentTrack) {
      audioRef.current?.play().catch(() => {});
      setState((s) => ({ ...s, isPlaying: true }));
    }
  }, [state.isPlaying, state.currentTrack, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState((s) => ({ ...s, progress: time }));
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setState((s) => ({ ...s, volume: vol }));
  }, []);

  const playNext = useCallback(() => {
    if (!state.currentTrack || state.playlist.length === 0) return;
    const idx = state.playlist.findIndex((t) => t.id === state.currentTrack!.id);
    const next = state.playlist[(idx + 1) % state.playlist.length];
    if (next) play(next);
  }, [state.currentTrack, state.playlist, play]);

  const playPrev = useCallback(() => {
    if (!state.currentTrack || state.playlist.length === 0) return;
    const idx = state.playlist.findIndex((t) => t.id === state.currentTrack!.id);
    const prev = state.playlist[(idx - 1 + state.playlist.length) % state.playlist.length];
    if (prev) play(prev);
  }, [state.currentTrack, state.playlist, play]);

  const addToPlaylist = useCallback((track: Music) => {
    setState((s) => {
      if (s.playlist.find((t) => t.id === track.id)) return s;
      return { ...s, playlist: [...s.playlist, track] };
    });
  }, []);

  const close = useCallback(() => {
    cleanup();
    setState((s) => ({
      ...s,
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
    }));
  }, [cleanup]);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        toggle,
        seek,
        setVolume,
        playNext,
        playPrev,
        addToPlaylist,
        close,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
