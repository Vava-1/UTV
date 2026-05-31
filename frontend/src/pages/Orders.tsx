import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Order } from '@/types';
import api from '@/utils/api';
import { Package, Download, CheckCircle, Clock, AlertCircle, ShoppingBag, FileText, Music, ArrowRight, RefreshCw } from 'lucide-react';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (contentId: number, title: string) => {
    setDownloading(contentId);
    try {
      const response = await api.get(`/uploads/download/${contentId}`, { responseType: 'blob' });
      // If it's a JSON response (URL redirect for audio/video)
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank');
        return;
      }
      // PDF blob download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UTV_${title.replace(/\s+/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      // If backend returns JSON with download_url (audio files)
      if (err.response?.data?.download_url) {
        window.open(err.response.data.download_url, '_blank');
      }
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Package size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">My Orders</h1>
            <p className="text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Link to="/books" className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors">
          Shop More <ArrowRight size={14} />
        </Link>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
          >
            {/* Order Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Order</p>
                <p className="text-white font-semibold">#{order.id}</p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                {order.status === 'completed' && <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-full"><CheckCircle size={12} /> Completed</span>}
                {order.status === 'pending' && <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/20 px-3 py-1.5 rounded-full"><Clock size={12} /> Pending</span>}
                {order.status === 'failed' && <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/20 px-3 py-1.5 rounded-full"><AlertCircle size={12} /> Failed</span>}
                {order.status === 'refunded' && <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/20 px-3 py-1.5 rounded-full"><RefreshCw size={12} /> Refunded</span>}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-800/60">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-5">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                    {item.content?.cover_image_url ? (
                      <img src={item.content.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.content?.content_type === 'music' ? <Music size={20} className="text-slate-600" /> : <FileText size={20} className="text-slate-600" />}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.content?.title || `Item #${item.content_id}`}</p>
                    {item.content?.author && <p className="text-sm text-slate-500 mt-0.5">{item.content.author}</p>}
                    <p className="text-xs text-slate-600 mt-1 capitalize">{item.content?.content_type} · Qty: {item.quantity}</p>
                  </div>

                  {/* Price + Download */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-white font-semibold">${Number(item.total_price).toFixed(2)}</p>
                    {order.status === 'completed' && item.content && ['book', 'score', 'music'].includes(item.content.content_type) && (
                      <button
                        onClick={() => handleDownload(item.content_id, item.content?.title || 'file')}
                        disabled={downloading === item.content_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {downloading === item.content_id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <Download size={12} />
                        )}
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Total */}
            <div className="flex justify-between items-center px-5 py-4 bg-slate-800/30">
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-xl font-bold text-white">${Number(order.total_amount).toFixed(2)} <span className="text-sm text-slate-500 font-normal">{order.currency}</span></p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty */}
      {orders.length === 0 && (
        <div className="text-center py-20">
          <ShoppingBag size={56} className="text-slate-700 mx-auto mb-5" />
          <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
          <p className="text-slate-500 mb-6">Browse our collection and find something you love</p>
          <Link to="/books" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-400 transition-colors">
            Browse Store <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
