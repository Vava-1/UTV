import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket as TicketType } from '@/types';
import api from '@/utils/api';
import { Ticket, MapPin, Clock, QrCode, Calendar, CheckCircle2, Printer, Music2 } from 'lucide-react';

type TicketWithQR = TicketType & { qr_code_url?: string | null };

export function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithQR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/my-tickets').then(res => setTickets(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handlePrint = (ticket: TicketWithQR) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Ticket ${ticket.ticket_number}</title>
          <style>
            body { font-family: 'Georgia', serif; margin: 0; padding: 40px; background: #fff; color: #111; }
            .ticket { border: 2px solid #09090b; border-radius: 16px; overflow: hidden; max-width: 600px; margin: 0 auto; }
            .ticket-header { background: #09090b; color: #fff; padding: 24px; display: flex; align-items: center; gap: 12px; }
            .ticket-body { display: flex; padding: 0; }
            .ticket-info { flex: 1; padding: 24px; border-right: 2px dashed #ddd; }
            .ticket-qr { padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
            .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 2px; }
            .value { font-size: 15px; font-weight: 600; color: #111; }
            .number { font-size: 22px; font-weight: 700; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; }
            .valid { background: #dcfce7; color: #15803d; }
            .checked { background: #dbeafe; color: #1d4ed8; }
            img.qr { width: 120px; height: 120px; border-radius: 8px; }
            .qr-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">
              <div style="width:36px;height:36px;background:rgba(245,158,11,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">🎵</div>
              <div>
                <div style="font-size:18px;font-weight:700;">UNA TANTUM VOCE</div>
                <div style="font-size:12px;color:#9ca3af;">Official Concert Ticket</div>
              </div>
            </div>
            <div class="ticket-body">
              <div class="ticket-info">
                <div class="label">Ticket Number</div>
                <div class="number">${ticket.ticket_number}</div>
                <div style="margin-top:16px">
                  <div class="label">Concert</div>
                  <div class="value">Concert #${ticket.concert_id}</div>
                </div>
                ${ticket.seat_info ? `<div style="margin-top:12px"><div class="label">Seat</div><div class="value">${ticket.seat_info}</div></div>` : ''}
                <div style="margin-top:12px">
                  <div class="label">Purchased</div>
                  <div class="value">${new Date(ticket.purchased_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style="margin-top:12px">
                  <div class="label">Price Paid</div>
                  <div class="value">$${Number(ticket.price_paid).toFixed(2)}</div>
                </div>
                <div style="margin-top:16px">
                  <span class="badge ${ticket.checked_in ? 'checked' : 'valid'}">${ticket.checked_in ? '✓ Checked In' : '● Valid'}</span>
                </div>
              </div>
              <div class="ticket-qr">
                ${ticket.qr_code_url
                  ? `<img class="qr" src="${ticket.qr_code_url}" alt="QR Code" />`
                  : '<div style="width:120px;height:120px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:48px;">⬛</div>'}
                <div class="qr-label">Scan to verify</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
          <Ticket size={20} className="text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">My Tickets</h1>
          <p className="text-sm text-slate-500">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tickets.map((ticket, i) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl"
          >
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3 flex items-center justify-between border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500/20 rounded-md flex items-center justify-center">
                  <Music2 size={12} className="text-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">UNA TANTUM VOCE</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Official Ticket</span>
            </div>

            {/* Body: two-tone layout */}
            <div className="flex">
              {/* Left: Info section */}
              <div className="flex-1 p-5 space-y-3 border-r border-dashed border-slate-700/60">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Ticket No.</p>
                  <p className="text-lg font-bold text-white font-mono tracking-wide">{ticket.ticket_number}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar size={13} className="text-rose-400 flex-shrink-0" />
                  <span>Concert <span className="text-white font-medium">#{ticket.concert_id}</span></span>
                </div>

                {ticket.seat_info && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin size={13} className="text-amber-400 flex-shrink-0" />
                    <span>Seat: <span className="text-white font-medium">{ticket.seat_info}</span></span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={13} className="text-slate-500 flex-shrink-0" />
                  <span>{new Date(ticket.purchased_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">${Number(ticket.price_paid).toFixed(2)}</p>
                  {ticket.checked_in ? (
                    <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/20 px-3 py-1.5 rounded-full font-medium">
                      <CheckCircle2 size={12} /> Checked In
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Valid
                    </span>
                  )}
                </div>
              </div>

              {/* Right: QR section */}
              <div className="w-36 flex flex-col items-center justify-center p-5 gap-3 bg-slate-800/30">
                {ticket.qr_code_url ? (
                  <div className="bg-white p-2 rounded-xl shadow-md">
                    <img
                      src={ticket.qr_code_url}
                      alt="QR Code"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <QrCode size={44} className="text-slate-800" />
                  </div>
                )}
                <p className="text-[10px] text-slate-500 uppercase tracking-wider text-center">Scan to verify</p>
              </div>
            </div>

            {/* Footer: Print Button */}
            <div className="border-t border-slate-800 px-5 py-3 flex items-center justify-between bg-slate-800/20">
              <p className="text-xs text-slate-600 font-mono">ID: {ticket.id}</p>
              <button
                onClick={() => handlePrint(ticket)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <Printer size={12} />
                Print Ticket
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {tickets.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Ticket size={32} className="text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No tickets yet</h2>
          <p className="text-slate-500">Purchase concert tickets to see them here</p>
        </div>
      )}
    </div>
  );
}
