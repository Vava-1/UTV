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
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-blue-900 border-t border-blue-700 shadow-2xl"
    >
      {isExpanded && (
        <div className="max-w-6xl mx-auto p-4 max-h-64 overflow-y-auto border-b border-blue-700">
          <h3 className="text-sm font-semibold text-blue-200 mb-3">Queue ({queue.length})</h3>
          {queue.map((track, idx) => (
            <div key={`${track.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-800 cursor-pointer">
              <img src={track.cover_image_url || '/default-cover.jpg'} alt={track.title} className="w-10 h-10 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{track.title}</p>
                <p className="text-xs text-blue-300">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          {currentTrack && (
            <>
              <img src={currentTrack.cover_image_url || '/default-cover.jpg'} alt={currentTrack.title} className="w-12 h-12 rounded-lg object-cover shadow-lg" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-blue-300 truncate">{currentTrack.artist}</p>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button onClick={previous} className="text-blue-200 hover:text-white transition-colors">
              <SkipBack size={20} />
            </button>
            <button
              onClick={toggle}
              className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 hover:bg-yellow-500 transition-colors shadow-lg"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={next} className="text-blue-200 hover:text-white transition-colors">
              <SkipForward size={20} />
            </button>
          </div>
          <div className="w-full max-w-md flex items-center gap-2">
            <span className="text-xs text-blue-300 w-10 text-right">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-1.5 bg-blue-700 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * (duration || 1));
              }}
            >
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
            <span className="text-xs text-blue-300 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume + Queue */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-blue-200 hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 accent-yellow-400"
          />
          <button
            onClick={toggleExpanded}
            className={`transition-colors ${isExpanded ? 'text-yellow-400' : 'text-blue-200 hover:text-white'}`}
          >
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
