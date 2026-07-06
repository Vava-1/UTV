import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play, Search, Youtube, Loader2, Calendar, Clock, X, ExternalLink } from 'lucide-react';
import api from '@/utils/api';
import { Content } from '@/types';
import { PageWrapper } from '@/components/PageWrapper';
import { useToast } from '@/components/Toast';

export function VideosPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [videos, setVideos] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Content | null>(null);

  useEffect(() => {
    api
      .get('/contents', { params: { content_type: 'video', page_size: 50 } })
      .then((res) => setVideos(res.data.items))
      .catch(() => showToast('Failed to load videos', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = videos.filter(
    (v) =>
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      return `${h}:${(m % 60).toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (video: Content) => {
    if (video.youtube_id) {
      return `https://www.youtube.com/embed/${video.youtube_id}?rel=0&modestbranding=1`;
    }
    // Fallback: extract from video_url
    if (video.video_url) {
      const match = video.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
    return null;
  };

  const isYouTubeVideo = (video: Content) => {
    return video.platform === 'youtube' || !!video.youtube_id || (video.video_url && video.video_url.includes('youtube'));
  };

  return (
    <PageWrapper title="Videos" subtitle="Performances, masterclasses & behind-the-scenes" icon={<Youtube size={32} />}>
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6055]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full bg-[#111109] border border-[#2a2515] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6a6055] focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#111109] rounded-xl border border-[#1e1a12] overflow-hidden animate-pulse">
                <div className="aspect-video bg-[#1a1813]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#1a1813] rounded w-3/4" />
                  <div className="h-3 bg-[#1a1813] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Youtube size={48} className="mx-auto text-[#6a6055] mb-4" />
            <p className="text-[#9a9080] mb-2">No videos available yet.</p>
            <p className="text-sm text-[#6a6055]">
              Videos will appear here once the admin syncs from YouTube or uploads content.
            </p>
          </div>
        )}

        {/* Video grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer bg-[#111109] rounded-xl border border-[#1e1a12] overflow-hidden hover:border-amber-500/30 transition-all"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#1a1813] overflow-hidden">
                  {video.thumbnail_url || video.cover_image_url ? (
                    <img
                      src={(video.thumbnail_url || video.cover_image_url) || undefined}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Youtube size={40} className="text-[#4a4035]" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center">
                      <Play size={24} className="text-[#09090b] ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  {video.duration_seconds && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {formatDuration(video.duration_seconds)}
                    </div>
                  )}
                  {/* Platform badge */}
                  {isYouTubeVideo(video) && (
                    <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      <Youtube size={10} fill="currentColor" />
                      YouTube
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-[#9a9080] line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#0f0e0c] rounded-xl border border-[#2a2515] overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>

              {/* Video player */}
              <div className="aspect-video bg-black">
                {isYouTubeVideo(selectedVideo) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo) || undefined}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedVideo.video_url ? (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#6a6055]">
                    Video URL not available
                  </div>
                )}
              </div>

              {/* Video info */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-sm text-[#9a9080] leading-relaxed mb-4">
                    {selectedVideo.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-[#6a6055]">
                  {selectedVideo.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedVideo.created_at).toLocaleDateString()}
                    </span>
                  )}
                  {selectedVideo.duration_seconds && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(selectedVideo.duration_seconds)}
                    </span>
                  )}
                  {selectedVideo.video_url && (
                    <a
                      href={selectedVideo.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Watch on original platform
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
