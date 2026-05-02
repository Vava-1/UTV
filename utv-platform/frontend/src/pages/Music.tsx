import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Content } from '@/types';
import api from '@/utils/api';
import { Play, Pause, Search, Music } from 'lucide-react';

export function MusicPage() {
  const { t } = useTranslation();
  const { play, pause, currentTrack, isPlaying, setQueue } = useAudioPlayer();
  const [tracks, setTracks] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/contents?content_type=music&page_size=50').then(res => setTracks(res.data.items)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = tracks.filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.artist && t.artist.toLowerCase().includes(searchQuery.toLowerCase())));

  const handlePlay = (track: Content) => {
    const data = { id: track.id, title: track.title, artist: track.artist || 'Unknown', album: track.album, audio_url: track.audio_url, cover_image_url: track.cover_image_url, duration: track.duration || 0 };
    if (currentTrack?.id === track.id) { if (isPlaying) pause(); }
    else play(data);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Music size={28} className="text-amber-500" /><h1 className="text-3xl font-bold text-white">{t('music.title')}</h1></div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tracks..." className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((track, i) => (
          <motion.div key={track.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="group bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-all cursor-pointer" onClick={() => handlePlay(track)}>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                <img src={track.cover_image_url || '/default-cover.jpg'} alt={track.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCurrent(track, currentTrack) && isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate ${isCurrent(track, currentTrack) ? 'text-amber-500' : 'text-white'}`}>{track.title}</h3>
                <p className="text-sm text-slate-400 truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-slate-500">{track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '--:--'}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><Music size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No tracks found</p></div>}
    </div>
  );
}

function isCurrent(track: Content, current: { id: number } | null) { return current?.id === track.id; }
