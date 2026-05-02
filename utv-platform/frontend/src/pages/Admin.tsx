import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { AnalyticsSummary, Content, User } from '@/types';
import { Shield, Users, ShoppingBag, DollarSign, Ticket, TrendingUp, BarChart3, Package } from 'lucide-react';

export function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const [tab, setTab] = useState<'dashboard' | 'contents' | 'users'>('dashboard');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!isLoading && !isAdmin) navigate('/'); }, [isAdmin, isLoading, navigate]);
  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  const fetchData = async () => {
    try { const res = await api.get('/admin/analytics'); setAnalytics(res.data); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchContents = async () => { setLoading(true); try { const res = await api.get('/admin/contents'); setContents(res.data); } catch (e) {} finally { setLoading(false); } };
  const fetchUsers = async () => { setLoading(true); try { const res = await api.get('/admin/users'); setUsers(res.data); } catch (e) {} finally { setLoading(false); } };

  useEffect(() => { if (tab === 'contents') fetchContents(); if (tab === 'users') fetchUsers(); }, [tab]);

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'contents', label: 'Contents', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Shield size={28} className="text-red-400" /><div><h1 className="text-3xl font-bold text-white">Admin Portal</h1><p className="text-sm text-slate-400">UTV Management Dashboard</p></div></div>
      <div className="flex gap-2 border-b border-slate-800 pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'dashboard' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={analytics.total_users} icon={Users} color="text-blue-400" bg="bg-blue-500/10" />
            <StatCard title="Total Orders" value={analytics.total_orders} icon={ShoppingBag} color="text-emerald-400" bg="bg-emerald-500/10" />
            <StatCard title="Total Revenue" value={`$${Number(analytics.total_revenue).toFixed(2)}`} icon={DollarSign} color="text-amber-400" bg="bg-amber-500/10" />
            <StatCard title="Tickets Sold" value={analytics.total_tickets_sold} icon={Ticket} color="text-rose-400" bg="bg-rose-500/10" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {analytics.recent_orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <div><p className="text-sm text-white">Order #{o.id}</p><p className="text-xs text-slate-400">{o.customer_email}</p></div>
                    <div className="text-right"><p className="text-sm font-medium text-emerald-400">${o.total_amount}</p><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{o.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Content</h3>
              <div className="space-y-3">
                {analytics.popular_content.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                    <img src={c.cover_image_url || '/default-cover.jpg'} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{c.title}</p><p className="text-xs text-slate-400">{c.content_type}</p></div>
                    <div className="flex items-center gap-1 text-xs text-slate-500"><TrendingUp size={12} />{c.view_count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === 'contents' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800 text-left"><th className="px-4 py-3 text-slate-400 font-medium">Title</th><th className="px-4 py-3 text-slate-400 font-medium">Type</th><th className="px-4 py-3 text-slate-400 font-medium">Status</th><th className="px-4 py-3 text-slate-400 font-medium">Views</th></tr></thead>
            <tbody>
              {contents.map(c => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={c.cover_image_url || '/default-cover.jpg'} alt="" className="w-8 h-8 rounded object-cover" /><span className="text-white">{c.title}</span></div></td>
                  <td className="px-4 py-3 capitalize text-slate-300">{c.content_type}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{c.is_published ? 'Published' : 'Draft'}</span></td>
                  <td className="px-4 py-3 text-slate-400">{c.view_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'users' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800 text-left"><th className="px-4 py-3 text-slate-400 font-medium">User</th><th className="px-4 py-3 text-slate-400 font-medium">Email</th><th className="px-4 py-3 text-slate-400 font-medium">Role</th><th className="px-4 py-3 text-slate-400 font-medium">Status</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Users size={14} className="text-slate-400" /></div><span className="text-white">{u.first_name || u.email}</span></div></td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.role}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}><Icon size={20} className={color} /></div>
        <TrendingUp size={16} className="text-slate-600" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{title}</p>
    </motion.div>
  );
}
