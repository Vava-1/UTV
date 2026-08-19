import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Music as MusicIcon, Play, Pause, Search, Clock, Headphones, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { Content, ContentListResponse } from '@/types';
import { PageWrapper } from '@/components/PageWrapper';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useToast } from '@/components/Toast';

export function MusicPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { play, pause, isPlaying, currentTrack, toggle } = useAudioPlayer();
  const [tracks, setTracks] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/contents', { params: { content_type: 'music', page_size: 50 } })
      .then((res: { data: ContentListResponse }) => setTracks(res.data.items))
      .catch(() => showToast('Failed to load music', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = tracks.filter(tr =>
    !search ||
    tr.title.toLowerCase().includes(search.toLowerCase()) ||
    (tr.artist && tr.artist.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlay = (track: Content) => {
    if (currentTrack?.id === track.id) {
      toggle();
    } else {
      play({
        id: track.id,
        title: track.title,
        artist: track.artist || 'UTV',
        album: track.album,
        audio_url: track.audio_url,
        cover_image_url: track.cover_image_url,
        duration: track.duration || 0,
      });
    }
  };

  if (loading) {
    return (
      <PageWrapper title={t('pages.music.title')} subtitle={t('pages.music.subtitle')} icon={<MusicIcon size={32} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={t('pages.music.title')} subtitle={t('pages.music.subtitle')} icon={<MusicIcon size={32} />}>
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search music..."
            className="input-field pl-10"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Headphones size={14} className="text-blue-800" />
            {filtered.length} tracks
          </span>
        </div>

        {/* Track list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <MusicIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No music available yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentlyPlaying = isCurrent && isPlaying;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                  onClick={() => handlePlay(track)}
                >
                  {/* Play button / Cover */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-blue-100 flex-shrink-0">
                    {track.cover_image_url ? (
                      <img src={track.cover_image_url || undefined} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MusicIcon size={20} className="text-blue-400" />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isCurrentlyPlaying ? (
                        <Pause size={20} className="text-yellow-400" fill="currentColor" />
                      ) : (
                        <Play size={20} className="text-white" fill="currentColor" />
                      )}
                    </div>
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                      {track.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {track.artist || 'UNA TANTUM VOCE'}
                      {track.album && ` · ${track.album}`}
                    </p>
                  </div>

                  {/* Genre badge */}
                  {track.genre && (
                    <span className="hidden sm:inline badge-blue">{track.genre}</span>
                  )}

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-sm text-gray-400 flex-shrink-0">
                    <Clock size={12} />
                    {formatDuration(track.duration || undefined)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
