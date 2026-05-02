import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { Calendar, MapPin, Clock, Ticket, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function ConcertsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [concerts, setConcerts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/tickets/concerts').then(res => setConcerts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = concerts.filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || (c.venue && c.venue.toLowerCase().includes(searchQuery.toLowerCase())));

  const buyTicket = async (id: number) => {
    if (!isAuthenticated) { alert('Please login first'); return; }
    try { const res = await api.post('/tickets/purchase', { concert_id: id, quantity: 1 }); window.location.href = res.data.checkout_url; } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Calendar size={28} className="text-rose-400" /><h1 className="text-3xl font-bold text-white">{t('concerts.title')}</h1></div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search concerts..." className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50" />
      </div>
      <div className="space-y-4">
        {filtered.map((concert, i) => (
          <motion.div key={concert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-rose-500/10 rounded-xl flex flex-col items-center justify-center border border-rose-500/20">
                  <span className="text-2xl font-bold text-rose-400">{concert.event_date ? new Date(concert.event_date).getDate() : '--'}</span>
                  <span className="text-xs text-rose-400 uppercase">{concert.event_date ? new Date(concert.event_date).toLocaleDateString('en-US', { month: 'short' }) : ''}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{concert.title}</h3>
                {concert.description && <p className="text-sm text-slate-400 mb-3">{concert.description}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {concert.venue && <span className="flex items-center gap-1"><MapPin size={14} className="text-rose-400" /> {concert.venue}</span>}
                  {concert.event_date && <span className="flex items-center gap-1"><Clock size={14} className="text-rose-400" /> {new Date(concert.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                  {concert.available_tickets !== null && <span className="flex items-center gap-1"><Users size={14} className="text-rose-400" /> {concert.available_tickets} left</span>}
                </div>
              </div>
              <div className="flex flex-col items-end justify-center gap-3">
                {concert.ticket_price && <div className="text-2xl font-bold text-white">${concert.ticket_price}</div>}
                <button onClick={() => buyTicket(concert.id)} disabled={concert.available_tickets === 0}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${concert.available_tickets === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-400 text-white'}`}>
                  <Ticket size={16} /> {concert.available_tickets === 0 ? t('concerts.soldOut') : t('concerts.buyTickets')}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16"><Calendar size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No upcoming concerts</p></div>}
    </div>
  );
}
