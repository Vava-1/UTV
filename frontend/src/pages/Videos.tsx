import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { Video, Search, ExternalLink } from 'lucide-react';

export function VideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/contents?content_type=video&page_size=50').then(res => setVideos(res.data.items)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter(v => !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getEmbed = (url: string) => {
    if (!url) return '';
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Video size={28} className="text-blue-400" /><h1 className="text-3xl font-bold text-white">Videos</h1></div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search videos..." className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((video, i) => (
          <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
            <div className="aspect-video bg-slate-800">
              {video.video_url ? <iframe src={getEmbed(video.video_url)} title={video.title} className="w-full h-full" allowFullScreen /> : <div className="w-full h-full flex items-center justify-center"><Video size={32} className="text-slate-600" /></div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-1">{video.title}</h3>
              {video.description && <p className="text-sm text-slate-400 line-clamp-2 mb-3">{video.description}</p>}
              <div className="flex items-center gap-2 text-xs text-slate-500"><ExternalLink size={12} /> {video.platform || 'YouTube'} · {video.view_count || 0} views</div>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><Video size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No videos found</p></div>}
    </div>
  );
}
