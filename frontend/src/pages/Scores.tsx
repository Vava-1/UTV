import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { FileText, Search, ShoppingCart, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function ScoresPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [scores, setScores] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/contents?content_type=score&page_size=50').then(res => setScores(res.data.items)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = scores.filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || (s.author && s.author.toLowerCase().includes(searchQuery.toLowerCase())));

  const addToCart = async (id: number) => {
    if (!isAuthenticated) { alert('Please login first'); return; }
    try { await api.post('/orders/cart', { content_id: id, quantity: 1 }); alert('Added to cart!'); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><FileText size={28} className="text-purple-400" /><h1 className="text-3xl font-bold text-white">{t('scores.title')}</h1></div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search sheet music..." className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((score, i) => (
          <motion.div key={score.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all group">
            <div className="aspect-[3/4] relative overflow-hidden bg-slate-800">
              <img src={score.cover_image_url || '/default-score.jpg'} alt={score.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {score.price && <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">${score.price}</div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-1 line-clamp-2">{score.title}</h3>
              {score.author && <p className="text-sm text-slate-400 mb-2">{score.author}</p>}
              <div className="flex gap-2">
                {score.price ? (
                  <button onClick={() => addToCart(score.id)} className="flex-1 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart size={14} /> {t('books.addToCart')}
                  </button>
                ) : (
                  <button onClick={() => addToCart(score.id)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Download size={14} /> {t('books.download')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><FileText size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No scores found</p></div>}
    </div>
  );
}
