import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Content } from '@/types';
import api from '@/utils/api';
import { Play, BookOpen, Music, Video, FileText, Calendar, Headphones } from 'lucide-react';

export function Home() {
  const { t } = useTranslation();
  const { setQueue } = useAudioPlayer();
  const [featured, setFeatured] = useState<Content[]>([]);
  const [recentMusic, setRecentMusic] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, mRes] = await Promise.all([
          api.get('/contents/featured'),
          api.get('/contents?content_type=music&page_size=6'),
        ]);
        setFeatured(fRes.data);
        setRecentMusic(mRes.data.items);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const playAll = () => {
    if (!recentMusic.length) return;
    setQueue(recentMusic.map(m => ({
      id: m.id, title: m.title, artist: m.artist || 'Unknown', album: m.album,
      audio_url: m.audio_url, cover_image_url: m.cover_image_url, duration: m.duration || 0,
    })), 0);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-16">
      <section className="relative rounded-3xl overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative px-8 py-24 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
              <Headphones size={16} className="text-amber-500" />
              <span className="text-sm text-amber-400">Classical & Gospel Music Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">{t('home.hero')}</h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{t('home.subtitle')}</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/music" className="px-8 py-3 bg-amber-500 text-slate-900 rounded-full font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2">
                <Play size={18} /> {t('home.discover')}
              </Link>
              <Link to="/library" className="px-8 py-3 border border-slate-600 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors">
                {t('home.explore')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {featured.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Featured</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <ContentCard content={item} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {recentMusic.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3"><Music size={24} className="text-amber-500" /><h2 className="text-2xl font-bold text-white">{t('music.title')}</h2></div>
            <button onClick={playAll} className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1"><Play size={16} /> Play All</button>
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {recentMusic.map((track, i) => <MusicRow key={track.id} track={track} index={i} allTracks={recentMusic} />)}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ icon: BookOpen, label: 'Books', path: '/books', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Video, label: 'Videos', path: '/videos', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: FileText, label: 'Scores', path: '/scores', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Calendar, label: 'Concerts', path: '/concerts', color: 'text-rose-400', bg: 'bg-rose-500/10' }].map(item => (
          <Link key={item.path} to={item.path} className="flex flex-col items-center gap-3 p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors group">
            <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <item.icon size={24} className={item.color} />
            </div>
            <span className="text-sm font-medium text-slate-300">{item.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function ContentCard({ content }: { content: Content }) {
  return (
    <Link to={`/${content.content_type}s/${content.id}`} className="group block">
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-800 mb-3">
        <img src={content.cover_image_url || '/default-cover.jpg'} alt={content.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center"><Play size={20} className="text-slate-900 ml-0.5" /></div>
        </div>
      </div>
      <h3 className="font-medium text-white truncate">{content.title}</h3>
      <p className="text-sm text-slate-400 truncate">{content.artist || content.author || content.description}</p>
    </Link>
  );
}

function MusicRow({ track, index, allTracks }: { track: Content; index: number; allTracks: Content[] }) {
  const { play, currentTrack, isPlaying, setQueue } = useAudioPlayer();
  const isCurrent = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isCurrent) return;
    setQueue(allTracks.map(m => ({
      id: m.id, title: m.title, artist: m.artist || 'Unknown', album: m.album,
      audio_url: m.audio_url, cover_image_url: m.cover_image_url, duration: m.duration || 0,
    })), index);
  };

  return (
    <div className={`flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer ${isCurrent ? 'bg-amber-500/10' : 'hover:bg-slate-800/50'}`} onClick={handlePlay}>
      <span className={`text-sm w-6 text-center ${isCurrent ? 'text-amber-500' : 'text-slate-500'}`}>
        {isCurrent && isPlaying ? <span className="text-amber-500">▸</span> : index + 1}
      </span>
      <img src={track.cover_image_url || '/default-cover.jpg'} alt={track.title} className="w-10 h-10 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrent ? 'text-amber-500' : 'text-white'}`}>{track.title}</p>
        <p className="text-xs text-slate-400 truncate">{track.artist}</p>
      </div>
      <span className="text-xs text-slate-500">{track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '--:--'}</span>
    </div>
  );
}
