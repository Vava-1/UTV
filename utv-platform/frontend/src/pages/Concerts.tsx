import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { Calendar, MapPin, Clock, Ticket, Search, Users, Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper } from '@/components/PageWrapper';
import { useToast } from '@/components/Toast';

export function ConcertsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [concerts, setConcerts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/tickets/concerts')
      .then(res => setConcerts(res.data))
      .catch(() => showToast(t('concerts.errorLoading'), 'error'))
      .finally(() => setLoading(false));
  }, [showToast, t]);

  const filtered = concerts.filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || (c.venue && c.venue.toLowerCase().includes(searchQuery.toLowerCase())));

  const buyTicket = async (id: number) => {
    if (!isAuthenticated) { 
      showToast(t('concerts.loginRequired'), 'warning'); 
      return; 
    }
    try { 
      const res = await api.post('/tickets/purchase', { concert_id: id, quantity: 1 }); 
      window.location.href = res.data.checkout_url; 
    } catch (e) { 
      showToast(t('concerts.errorPurchasing'), 'error'); 
    }
  };

  if (loading) {
    return (
      <PageWrapper title={t('nav.concerts')} subtitle={t('concerts.subtitle')} icon={<Calendar size={32} />}>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-slate-800 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-800 rounded w-1/3" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={t('nav.concerts')} subtitle={t('concerts.subtitle')} icon={<Calendar size={32} />}>
      <div className="space-y-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder={t('concerts.searchPlaceholder')}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50" 
          />
        </div>
        <div className="space-y-4">
          {filtered.map((concert, i) => (
            <motion.div 
              key={concert.id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
            >
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
                    {concert.available_tickets !== null && <span className="flex items-center gap-1"><Users size={14} className="text-rose-400" /> {concert.available_tickets} {t('concerts.ticketsLeft')}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-3">
                  {concert.ticket_price && <div className="text-2xl font-bold text-white">${concert.ticket_price}</div>}
                  <button 
                    onClick={() => buyTicket(concert.id)} 
                    disabled={concert.available_tickets === 0}
                    className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${concert.available_tickets === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-400 text-white'}`}
                  >
                    <Ticket size={16} /> {concert.available_tickets === 0 ? t('concerts.soldOut') : t('concerts.buyTickets')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500/10 to-transparent flex items-center justify-center mb-6">
              <Calendar size={48} className="text-rose-500/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('concerts.empty.title', 'No Upcoming Concerts')}</h3>
            <p className="text-slate-400 text-center max-w-md mb-8">
              {searchQuery ? t('concerts.empty.search', 'No concerts match your search.') : t('concerts.empty.description', 'Stay tuned for upcoming classical and gospel music concerts in your area.')}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <Music size={18} />
                {t('concerts.empty.clearSearch', 'Clear Search')}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
