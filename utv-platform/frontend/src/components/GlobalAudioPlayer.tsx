import React from 'react';
import { motion } from 'framer-motion';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic } from 'lucide-react';

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function GlobalAudioPlayer() {
  const { isPlaying, currentTrack, currentTime, duration, volume, queue, isExpanded, toggle, next, previous, seek, setVolume, toggleExpanded } = useAudioPlayer();

  if (!currentTrack && queue.length === 0) return null;

  return (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50">
      {isExpanded && (
        <div className="max-w-6xl mx-auto p-4 max-h-64 overflow-y-auto border-b border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Queue ({queue.length})</h3>
          {queue.map((track, idx) => (
            <div key={`${track.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer">
              <img src={track.cover_image_url || '/default-cover.jpg'} alt={track.title} className="w-10 h-10 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{track.title}</p>
                <p className="text-xs text-slate-400">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          {currentTrack && (
            <>
              <img src={currentTrack.cover_image_url || '/default-cover.jpg'} alt={currentTrack.title} className="w-12 h-12 rounded-lg object-cover shadow-lg" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
            </>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button onClick={previous} className="text-slate-300 hover:text-white"><SkipBack size={20} /></button>
            <button onClick={toggle} className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 hover:bg-amber-400">
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={next} className="text-slate-300 hover:text-white"><SkipForward size={20} /></button>
          </div>
          <div className="w-full max-w-md flex items-center gap-2">
            <span className="text-xs text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-slate-700 rounded-full cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * (duration || 1));
            }}>
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
            </div>
            <span className="text-xs text-slate-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-slate-400 hover:text-white">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 h-1 accent-amber-500" />
          <button onClick={toggleExpanded} className={`text-slate-400 hover:text-white ${isExpanded ? 'text-amber-500' : ''}`}>
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
