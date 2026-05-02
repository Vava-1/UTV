import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Order } from '@/types';
import api from '@/utils/api';
import { Package, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Package size={28} className="text-emerald-400" /><h1 className="text-3xl font-bold text-white">{t('nav.orders')}</h1></div>
      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-sm text-slate-400">Order #{order.id}</p><p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p></div>
              <div>
                {order.status === 'completed' && <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full"><CheckCircle size={12} /> Completed</span>}
                {order.status === 'pending' && <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full"><Clock size={12} /> Pending</span>}
                {order.status === 'failed' && <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full"><AlertCircle size={12} /> Failed</span>}
              </div>
            </div>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-t border-slate-800">
                  <img src={item.content?.cover_image_url || '/default-cover.jpg'} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1"><p className="text-sm text-white">{item.content?.title}</p><p className="text-xs text-slate-400">Qty: {item.quantity}</p></div>
                  <p className="text-sm font-medium text-white">${item.total_price}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800"><p className="text-sm text-slate-400">Total</p><p className="text-lg font-bold text-white">${order.total_amount}</p></div>
          </motion.div>
        ))}
      </div>
      {orders.length === 0 && <div className="text-center py-16"><Package size={48} className="text-slate-700 mx-auto mb-4" /><p className="text-slate-500">No orders yet</p></div>}
    </div>
  );
}
