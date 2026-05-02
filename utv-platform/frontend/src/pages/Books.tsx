import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { BookOpen, Search, ShoppingCart, Download, User, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function BooksPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/contents?content_type=book&page_size=50').then(res => setBooks(res.data.items)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = books.filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase())));

  const addToCart = async (id: number) => {
    if (!isAuthenticated) { alert('Please login first'); return; }
    try { await api.post('/orders/cart', { content_id: id, quantity: 1 }); alert('Added to cart!'); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><BookOpen size={28} className="text-emerald-400" /><h1 className="text-3xl font-bold text-white">{t('books.title')}</h1></div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search books..." className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((book, i) => (
          <motion.div key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all group">
            <div className="aspect-[3/4] relative overflow-hidden bg-slate-800">
              <img src={book.cover_image_url || '/default-book.jpg'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {book.price && <div className="absolute top-3 right-3 bg-emerald-500 text-slate-900 px-3 py-1 rounded-full text-sm font-bold">${book.price}</div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-1 line-clamp-2">{book.title}</h3>
              {book.author && <p className="text-sm text-slate-400 flex items-center gap-1 mb-2"><User size={12} /> {book.author}</p>}
              {book.publisher && <p className="text-xs text-slate-500 flex items-center gap-1 mb-2"><Building size={12} /> {book.publisher}</p>}
              <div className="flex gap-2">
                {book.price ? (
                  <button onClick={() => addToCart(book.id)} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart size={14} /> {t('books.addToCart')}
                  </button>
                ) : (
                  <button onClick={() => addToCart(book.id)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Download size={14} /> {t('books.download')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><BookOpen size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No books found</p></div>}
    </div>
  );
}
