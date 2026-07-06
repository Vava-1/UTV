import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Content } from '@/types';
import api from '@/utils/api';
import { Play, Pause, Search, Music, ListMusic, Clock, Radio } from 'lucide-react';

export function MusicPage() {
  const { t } = useTranslation();
  const { play, pause, currentTrack, isPlaying, setQueue } = useAudioPlayer();
  const [tracks, setTracks] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string>('all');

  useEffect(() => {
    api.get('/contents?content_type=music&page_size=50')
      .then(res => setTracks(res.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const genres = ['all', ...Array.from(new Set(tracks.map(t => t.genre).filter(Boolean))) as string[]];

  const filtered = tracks.filter(t => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.artist && t.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = activeGenre === 'all' || t.genre === activeGenre;
    return matchesSearch && matchesGenre;
  });

  const handlePlay = (track: Content, index: number) => {
    const trackData = { id: track.id, title: track.title, artist: track.artist || 'UNA TANTUM VOCE', album: track.album, audio_url: track.audio_url, cover_image_url: track.cover_image_url, duration: track.duration || 0 };
    if (currentTrack?.id === track.id) {
      if (isPlaying) pause();
      else play(trackData);
    } else {
      // Set queue to all filtered tracks starting from clicked
      const queue = filtered.slice(index).map(t => ({
        id: t.id, title: t.title, artist: t.artist || 'UNA TANTUM VOCE',
        album: t.album, audio_url: t.audio_url, cover_image_url: t.cover_image_url, duration: t.duration || 0
      }));
      if (setQueue) setQueue(queue);
      play(trackData);
    }
  };

  const playAll = () => {
    if (filtered.length === 0) return;
    const queue = filtered.map(t => ({
      id: t.id, title: t.title, artist: t.artist || 'UNA TANTUM VOCE',
      album: t.album, audio_url: t.audio_url, cover_image_url: t.cover_image_url, duration: t.duration || 0
    }));
    if (setQueue) setQueue(queue);
    play(queue[0]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Music size={20} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">Music</h1>
            <p className="text-sm text-slate-500">Loading tracks...</p>
          </div>
        </div>
        <div className="space-y-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-4 animate-pulse flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-800 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800 rounded w-1/5" />
              </div>
              <div className="h-3 bg-slate-800 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Music size={20} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">{t('music.title', 'Music Library')}</h1>
            <p className="text-sm text-slate-500">{filtered.length} tracks</p>
          </div>
        </div>
        <button
          onClick={playAll}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-[#09090b] rounded-xl font-bold text-sm hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50"
        >
          <Radio size={16} /> Play All
        </button>
      </div>

      {/* Search + Genre Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tracks or artists..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        {genres.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  activeGenre === genre
                    ? 'bg-amber-500 text-[#09090b]'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Now Playing Banner */}
      {currentTrack && isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
        >
          <div className="flex gap-0.5 items-end h-4">
            {[1,2,3].map(i => (
              <motion.div
                key={i}
                className="w-1 bg-amber-500 rounded-full"
                animate={{ height: ['4px', '14px', '6px', '12px', '4px'] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="text-amber-400 text-sm font-medium">Now Playing:</span>
          <span className="text-white text-sm">{currentTrack.title}</span>
          <span className="text-slate-500 text-sm">— {currentTrack.artist}</span>
        </motion.div>
      )}

      {/* Track List */}
      <div className="space-y-1">
        {/* Header Row */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-xs text-slate-600 uppercase tracking-widest border-b border-slate-800/50">
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span className="hidden sm:block">Album</span>
          <span className="flex items-center gap-1"><Clock size={11} /></span>
        </div>

        {filtered.map((track, i) => {
          const active = currentTrack?.id === track.id;
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              onClick={() => handlePlay(track, i)}
              className={`group grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-4 py-3 rounded-xl cursor-pointer transition-all ${
                active
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {/* Track number / Play button */}
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {active && isPlaying ? (
                  <div className="flex gap-0.5 items-end h-4">
                    {[1,2,3].map(j => (
                      <motion.div
                        key={j}
                        className="w-0.5 bg-amber-500 rounded-full"
                        animate={{ height: ['3px', '12px', '5px', '10px', '3px'] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.15 }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <span className={`text-sm group-hover:hidden ${active ? 'text-amber-500' : 'text-slate-600'}`}>{i + 1}</span>
                    <Play size={14} className="text-white hidden group-hover:block ml-0.5" />
                  </>
                )}
              </div>

              {/* Title + Artist */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden">
                  {track.cover_image_url ? (
                    <img src={track.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music size={14} className="text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${active ? 'text-amber-400' : 'text-white'}`}>{track.title}</p>
                  <p className="text-xs text-slate-500 truncate">{track.artist || 'UNA TANTUM VOCE'}</p>
                </div>
              </div>

              {/* Album */}
              <span className="hidden sm:block text-sm text-slate-500 truncate max-w-[120px]">{track.album || '—'}</span>

              {/* Duration */}
              <span className="text-xs text-slate-500 tabular-nums">
                {track.duration
                  ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                  : '--:--'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
            <ListMusic size={36} className="text-amber-500/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tracks found</h3>
          <p className="text-slate-500 text-center">
            {searchQuery ? 'Try a different search term.' : 'The music library is being curated. Check back soon.'}
          </p>
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setActiveGenre('all'); }} className="mt-4 text-amber-500 text-sm hover:underline">
              Clear filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
