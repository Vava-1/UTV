import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Content } from '@/types';
import api from '@/utils/api';
import { Calendar, MapPin, Clock, Ticket, Search, Users, Music, X, Plus, Minus, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/PageWrapper';
import { useToast } from '@/components/Toast';

// ─── Ticket Purchase Modal ─────────────────────────────────────────────────────
function TicketModal({ concert, onClose }: { concert: Content; onClose: () => void }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const maxTickets = Math.min(concert.available_tickets ?? 10, 10);
  const total = (Number(concert.ticket_price) * quantity).toFixed(2);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/tickets/purchase', {
        concert_id: concert.id,
        quantity,
      });
      window.location.href = res.data.checkout_url;
    } catch {
      showToast('Failed to create checkout session. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#0f0e0c] border border-[#2a2515] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-[#1e1a12]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Ticket size={16} className="text-rose-400" />
            <span className="text-xs text-rose-400 tracking-widest uppercase font-medium">Purchase Tickets</span>
          </div>
          <h2 className="text-xl font-bold text-white font-serif pr-8">{concert.title}</h2>
          {concert.venue && (
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
              <MapPin size={12} /> {concert.venue}
            </p>
          )}
          {concert.event_date && (
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar size={12} /> {new Date(concert.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Availability */}
          {concert.available_tickets !== null && concert.available_tickets <= 10 && concert.available_tickets > 0 && (
            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={14} />
              Only {concert.available_tickets} tickets remaining!
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs text-slate-400 mb-3 tracking-widest uppercase">Number of Tickets</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-3xl font-bold text-white w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(maxTickets, q + 1))}
                disabled={quantity >= maxTickets}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Price per ticket</span>
              <span className="text-white">${Number(concert.ticket_price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Quantity</span>
              <span className="text-white">×{quantity}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-amber-400">${total}</span>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-4 bg-amber-500 text-[#09090b] font-bold tracking-widest uppercase rounded-xl hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard size={18} />
                {isAuthenticated ? 'Proceed to Payment' : 'Login to Purchase'}
              </>
            )}
          </button>

          <p className="text-xs text-slate-600 text-center">Secure payment powered by Stripe. Your ticket will be emailed to you.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Concerts Page ─────────────────────────────────────────────────────────────
export function ConcertsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [concerts, setConcerts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcert, setSelectedConcert] = useState<Content | null>(null);

  useEffect(() => {
    api.get('/tickets/concerts')
      .then(res => setConcerts(res.data))
      .catch(() => showToast('Failed to load concerts', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = concerts.filter(c =>
    !searchQuery ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.venue && c.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                  <div className="h-4 bg-slate-800 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <PageWrapper title={t('nav.concerts')} subtitle={t('concerts.subtitle')} icon={<Calendar size={32} />}>
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('concerts.searchPlaceholder', 'Search concerts or venues...')}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>

          {/* Concerts List */}
          <div className="space-y-4">
            {filtered.map((concert, i) => (
              <motion.div
                key={concert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-rose-500/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Cover Image */}
                  {concert.cover_image_url && (
                    <div className="md:w-48 h-40 md:h-auto flex-shrink-0 overflow-hidden">
                      <img
                        src={concert.cover_image_url}
                        alt={concert.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row flex-1 p-6 gap-6">
                    {/* Date Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex flex-col items-center justify-center border border-rose-500/20">
                        <span className="text-3xl font-bold text-rose-400 leading-none">
                          {concert.event_date ? new Date(concert.event_date).getDate() : '--'}
                        </span>
                        <span className="text-xs text-rose-400 uppercase tracking-widest mt-1">
                          {concert.event_date ? new Date(concert.event_date).toLocaleDateString('en-US', { month: 'short' }) : ''}
                        </span>
                        <span className="text-xs text-slate-600 mt-0.5">
                          {concert.event_date ? new Date(concert.event_date).getFullYear() : ''}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 font-serif">{concert.title}</h3>
                      {concert.description && (
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{concert.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-400">
                        {concert.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-rose-400 flex-shrink-0" />
                            {concert.venue}
                          </span>
                        )}
                        {concert.event_date && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-rose-400 flex-shrink-0" />
                            {new Date(concert.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {concert.available_tickets !== null && (
                          <span className={`flex items-center gap-1.5 ${concert.available_tickets <= 20 ? 'text-amber-400' : ''}`}>
                            <Users size={14} className="flex-shrink-0" />
                            {concert.available_tickets} tickets left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex flex-col items-end justify-center gap-3 flex-shrink-0">
                      {concert.ticket_price && (
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase tracking-wider">From</p>
                          <p className="text-3xl font-bold text-white font-serif">${concert.ticket_price}</p>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedConcert(concert)}
                        disabled={concert.available_tickets === 0}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 ${
                          concert.available_tickets === 0
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 active:scale-95'
                        }`}
                      >
                        <Ticket size={16} />
                        {concert.available_tickets === 0 ? 'Sold Out' : 'Get Tickets'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 px-4"
            >
              <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                <Calendar size={40} className="text-rose-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Concerts</h3>
              <p className="text-slate-400 text-center max-w-md">
                {searchQuery
                  ? 'No concerts match your search.'
                  : 'Stay tuned for upcoming classical and gospel music concerts.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <Music size={16} /> Clear Search
                </button>
              )}
            </motion.div>
          )}
        </div>
      </PageWrapper>

      {/* Ticket Purchase Modal */}
      <AnimatePresence>
        {selectedConcert && (
          <TicketModal
            concert={selectedConcert}
            onClose={() => setSelectedConcert(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
