import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { Library, Search, BookOpen, FileText, Music, Video, Calendar, ChevronRight } from 'lucide-react';

export function LibraryPage() {
  const { t } = useTranslation();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    api.get('/contents?page_size=100').then(res => setContents(res.data.items)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = contents.filter(c => {
    const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || c.content_type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = [
    { id: 'music', label: 'Music', icon: Music }, { id: 'book', label: 'Books', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video }, { id: 'score', label: 'Scores', icon: FileText },
    { id: 'concert', label: 'Concerts', icon: Calendar },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Library size={28} className="text-amber-400" /><h1 className="text-3xl font-bold text-white">{t('nav.library')}</h1></div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedType('')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedType === '' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>All</button>
        {types.map(t => (
          <button key={t.id} onClick={() => setSelectedType(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedType === t.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search the library..." className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((content, i) => (
          <motion.div key={content.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-all group cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                {content.content_type === 'music' && <Music size={20} className="text-amber-400" />}
                {content.content_type === 'book' && <BookOpen size={20} className="text-emerald-400" />}
                {content.content_type === 'video' && <Video size={20} className="text-blue-400" />}
                {content.content_type === 'score' && <FileText size={20} className="text-purple-400" />}
                {content.content_type === 'concert' && <Calendar size={20} className="text-rose-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">{content.title}</h3>
                <p className="text-xs text-slate-500 capitalize">{content.content_type}</p>
                {content.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{content.description}</p>}
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center py-20 px-4"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent flex items-center justify-center mb-6">
            <Library size={48} className="text-amber-500/50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{t('library.empty.title', 'Your Library is Empty')}</h3>
          <p className="text-slate-400 text-center max-w-md mb-8">
            {t('library.empty.description', 'Start exploring our collection of classical and gospel music, books, and more to build your personal library.')}
          </p>
          <a
            href="/discover"
            className="px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-all flex items-center gap-2"
          >
            <BookOpen size={18} />
            {t('library.empty.cta', 'Explore the Catalog')}
          </a>
        </motion.div>
      )}
    </div>
  );
}
