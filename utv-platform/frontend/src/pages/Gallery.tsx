import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { Image, Search } from 'lucide-react';

export function GalleryPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    api.get('/contents?content_type=gallery&page_size=50').then(res => setItems(res.data.items)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const allImages = items.flatMap(item => (item.image_urls || []).map(url => ({ url, title: item.title })));
  const filtered = allImages.filter(img => !searchQuery || img.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Image size={28} className="text-cyan-400" /><h1 className="text-3xl font-bold text-white">{t('nav.gallery')}</h1></div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search gallery..." className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((img, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-800 cursor-pointer" onClick={() => setSelected(img.url)}>
            <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
              <div className="p-4 w-full opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-sm font-medium text-white">{img.title}</p></div>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><Image size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No images</p></div>}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}
            className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
            <img src={selected} alt="" className="max-w-full max-h-full rounded-lg" />
            <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl" onClick={() => setSelected(null)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
