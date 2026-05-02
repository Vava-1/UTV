import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Ticket as TicketType } from '@/types';
import api from '@/utils/api';
import { Ticket, MapPin, Clock, QrCode, Users, Calendar } from 'lucide-react';

export function TicketsPage() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/my-tickets').then(res => setTickets(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Ticket size={28} className="text-rose-400" /><h1 className="text-3xl font-bold text-white">{t('nav.tickets')}</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((ticket, i) => (
          <motion.div key={ticket.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Calendar size={16} className="text-rose-400" /><span className="text-sm text-slate-300">Concert Ticket</span></div>
                <span className={`text-xs px-2 py-1 rounded-full ${ticket.checked_in ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{ticket.checked_in ? 'Checked In' : 'Valid'}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{ticket.ticket_number}</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2"><MapPin size={14} /> Concert #{ticket.concert_id}</div>
                {ticket.seat_info && <div className="flex items-center gap-2"><Ticket size={14} /> Seat: {ticket.seat_info}</div>}
                <div className="flex items-center gap-2"><Clock size={14} /> Purchased: {new Date(ticket.purchased_at).toLocaleDateString()}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <p className="text-lg font-bold text-white">${ticket.price_paid}</p>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center"><QrCode size={24} className="text-slate-900" /></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {tickets.length === 0 && <div className="text-center py-16"><Ticket size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No tickets purchased yet</p></div>}
    </div>
  );
}
