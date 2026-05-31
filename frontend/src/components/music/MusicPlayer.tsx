import { usePlayer } from "@/hooks/usePlayer";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  Download,
  Shuffle,
  Repeat,
} from "lucide-react";

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    toggle,
    seek,
    setVolume,
    playNext,
    playPrev,
    close,
  } = usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration ? (progress / duration) * 100 : 0;
  const currentTime = `${Math.floor(progress / 60)}:${String(Math.floor(progress % 60)).padStart(2, "0")}`;
  const totalTime = duration
    ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`
    : "0:00";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-utv-bg border-t-2 border-utv-gold shadow-2xl">
      {/* Progress Bar */}
      <div
        className="h-1 bg-utv-border cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          seek(percent * duration);
        }}
      >
        <div
          className="h-full bg-utv-gold relative group-hover:brightness-110 transition-all"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-utv-gold rounded-full opacity-0 group-hover:opacity-100 shadow-lg" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          <img
            src={currentTrack.cover_url || "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=100"}
            alt={currentTrack.title}
            className="w-10 h-10 rounded object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-utv-cream truncate">{currentTrack.title}</p>
            <p className="text-xs text-utv-body truncate">{currentTrack.composer}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-4">
            <button className="text-utv-body hover:text-utv-gold transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={playPrev}
              className="text-utv-body hover:text-utv-cream transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={toggle}
              className="w-10 h-10 bg-utv-gold rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-utv-bg fill-utv-bg" />
              ) : (
                <Play className="w-5 h-5 text-utv-bg fill-utv-bg ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              className="text-utv-body hover:text-utv-cream transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button className="text-utv-body hover:text-utv-gold transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-utv-body mt-1">
            <span>{currentTime}</span>
            <span>/</span>
            <span>{totalTime}</span>
          </div>
        </div>

        {/* Volume + Close */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <Volume2 className="w-4 h-4 text-utv-body" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-utv-gold"
          />
          <button
            onClick={close}
            className="text-utv-body hover:text-red-400 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
