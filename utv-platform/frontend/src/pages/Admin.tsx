import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { Content, User, Order } from '@/types';
import {
  Shield, Users, ShoppingBag, DollarSign, Ticket, TrendingUp,
  BarChart3, Package, Mail, Plus, Trash2, Edit, Eye, EyeOff,
  RefreshCw, Send, Download, ChevronDown, Music, BookOpen,
  Video, FileText, Calendar, Image, Library, Settings, X
} from 'lucide-react';

type Tab = 'dashboard' | 'contents' | 'newsletter' | 'orders' | 'settings';

export function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading, user } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [analytics, setAnalytics] = useState<any>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!isLoading && !isAdmin) navigate('/'); }, [isAdmin, isLoading, navigate]);
  useEffect(() => { if (isAdmin) fetchDashboard(); }, [isAdmin]);
  useEffect(() => {
    if (tab === 'contents') fetchContents();
    if (tab === 'orders') fetchOrders();
    if (tab === 'newsletter') fetchSubscribers();
  }, [tab]);

  const fetchDashboard = async () => {
    try { const r = await api.get('/admin/analytics'); setAnalytics(r.data); } catch {}
    finally { setLoading(false); }
  };
  const fetchContents = async () => { try { const r = await api.get('/admin/contents'); setContents(r.data); } catch {} };
  const fetchOrders = async () => { try { const r = await api.get('/admin/orders'); setOrders(r.data); } catch {} };
  const fetchSubscribers = async () => { try { const r = await api.get('/newsletter/subscribers'); setSubscribers(r.data); } catch {} };

  const deleteContent = async (id: number) => {
    if (!confirm('Delete this content?')) return;
    try { await api.delete(`/contents/${id}`); fetchContents(); } catch {}
  };
  const togglePublish = async (c: Content) => {
    try { await api.put(`/contents/${c.id}`, { is_published: !c.is_published }); fetchContents(); } catch {}
  };
  const refundOrder = async (id: number) => {
    if (!confirm('Mark order as refunded?')) return;
    try { await api.post(`/admin/orders/${id}/refund`); fetchOrders(); } catch {}
  };
  const deleteSubscriber = async (id: number) => {
    if (!confirm('Remove subscriber?')) return;
    try { await api.delete(`/newsletter/subscribers/${id}`); fetchSubscribers(); } catch {}
  };

  if (isLoading) return <Spinner />;
  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'contents', label: 'Content', icon: Package },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield size={28} className="text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm text-slate-400">Logged in as {user?.email}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-slate-800 pb-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Users" value={analytics.total_users} icon={Users} color="text-blue-400" bg="bg-blue-500/10" />
            <StatCard title="Orders" value={analytics.total_orders} icon={ShoppingBag} color="text-emerald-400" bg="bg-emerald-500/10" />
            <StatCard title="Revenue" value={`$${Number(analytics.total_revenue).toFixed(2)}`} icon={DollarSign} color="text-amber-400" bg="bg-amber-500/10" />
            <StatCard title="Tickets Sold" value={analytics.total_tickets_sold} icon={Ticket} color="text-rose-400" bg="bg-rose-500/10" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h3 className="text-base font-semibold text-white mb-4">Recent Orders</h3>
              <div className="space-y-2">
                {analytics.recent_orders?.slice(0, 6).map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                    <div><p className="text-sm text-white">Order #{o.id}</p><p className="text-xs text-slate-500">{o.customer_email}</p></div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-400">${o.total_amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h3 className="text-base font-semibold text-white mb-4">Popular Content</h3>
              <div className="space-y-2">
                {analytics.popular_content?.slice(0, 6).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0">
                    <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 overflow-hidden">
                      {c.cover_image_url ? <img src={c.cover_image_url} alt="" className="w-full h-full object-cover" /> : <Music size={14} className="m-auto text-slate-600 mt-1.5" />}
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{c.title}</p><p className="text-xs text-slate-500 capitalize">{c.content_type}</p></div>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><TrendingUp size={10} />{c.view_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contents Tab */}
      {tab === 'contents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{contents.length} items total</p>
            <a href="/docs#/Contents/create_content_api_contents_post" target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors">
              <Plus size={14} /> Add via API Docs
            </a>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 text-slate-400 font-medium">Title</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Type</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Price</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Views</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contents.map(c => (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 overflow-hidden">
                          {c.cover_image_url ? <img src={c.cover_image_url} alt="" className="w-full h-full object-cover" /> : <ContentIcon type={c.content_type} />}
                        </div>
                        <span className="text-white truncate max-w-[180px]">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{c.content_type}</td>
                    <td className="px-4 py-3 text-slate-400">{c.price ? `$${c.price}` : 'Free'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePublish(c)}
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${c.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {c.is_published ? <><Eye size={10} />Published</> : <><EyeOff size={10} />Draft</>}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{c.view_count}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteContent(c.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {contents.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Package size={32} className="mx-auto mb-3 opacity-50" />
                <p>No content yet. Add content via the API or Swagger docs at <code>/docs</code></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Newsletter Tab */}
      {tab === 'newsletter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-white">{subscribers.length}</p>
              <p className="text-sm text-slate-400 mt-1">Total Subscribers</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-emerald-400">{subscribers.filter(s => s.is_active).length}</p>
              <p className="text-sm text-slate-400 mt-1">Active</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-slate-400">{subscribers.filter(s => !s.is_active).length}</p>
              <p className="text-sm text-slate-400 mt-1">Unsubscribed</p>
            </div>
          </div>
          <NewsletterComposer />
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Subscribers</h3>
            </div>
            <div className="divide-y divide-slate-800/60">
              {subscribers.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-white">{s.name || s.email}</p>
                    <p className="text-xs text-slate-500">{s.email} · {s.language}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {s.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                    <button onClick={() => deleteSubscriber(s.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {subscribers.length === 0 && (
                <div className="text-center py-10 text-slate-500"><Mail size={24} className="mx-auto mb-2 opacity-50" /><p>No subscribers yet</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-4 py-3 text-slate-400 font-medium">#</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Customer</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Amount</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Date</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400">#{o.id}</td>
                  <td className="px-4 py-3"><p className="text-white">{o.customer_name || '—'}</p><p className="text-xs text-slate-500">{o.customer_email}</p></td>
                  <td className="px-4 py-3 font-medium text-emerald-400">${o.total_amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      o.status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {o.status === 'completed' && (
                      <button onClick={() => refundOrder(o.id)} className="text-xs px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors">
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-slate-500"><ShoppingBag size={32} className="mx-auto mb-3 opacity-50" /><p>No orders yet</p></div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function NewsletterComposer() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const send = async () => {
    if (!subject || !body) return;
    setStatus('sending');
    try {
      const r = await api.post('/newsletter/send', { subject, body_html: body, body_text: body.replace(/<[^>]+>/g, '') });
      setResult(r.data);
      setStatus('done');
      setSubject('');
      setBody('');
    } catch { setStatus('error'); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2"><Send size={16} className="text-amber-500" />Compose Newsletter</h3>
      <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line..."
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
      <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Email body (HTML supported)..."
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none font-mono" />
      <div className="flex items-center gap-3">
        <button onClick={send} disabled={status === 'sending' || !subject || !body}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-900 font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors disabled:opacity-50">
          <Send size={14} />{status === 'sending' ? 'Sending...' : 'Send to All Subscribers'}
        </button>
        {status === 'done' && result && <p className="text-sm text-emerald-400">Sent: {result.sent} · Failed: {result.failed}</p>}
        {status === 'error' && <p className="text-sm text-red-400">Send failed. Check email config.</p>}
      </div>
    </div>
  );
}

function SettingsTab() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const changePassword = async () => {
    if (password !== confirm) { setMsg('Passwords do not match'); return; }
    if (password.length < 8) { setMsg('Minimum 8 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/me', { password });
      setMsg('Password updated successfully');
      setPassword(''); setConfirm('');
    } catch { setMsg('Failed to update password'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2"><Settings size={16} className="text-amber-500" />Change Password</h3>
        <div className="space-y-3">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
        </div>
        {msg && <p className={`text-sm ${msg.includes('successfully') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
        <button onClick={changePassword} disabled={saving}
          className="px-5 py-2.5 bg-amber-500 text-slate-900 font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Update Password'}
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
        <h3 className="text-base font-semibold text-white flex items-center gap-2"><Shield size={16} className="text-amber-500" />API Configuration</h3>
        <p className="text-sm text-slate-400">Configure payment and storage keys via environment variables on Render.com dashboard.</p>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          {['STRIPE_SECRET_KEY','STRIPE_PUBLISHABLE_KEY','AWS_ACCESS_KEY_ID','EMAIL_USER','EMAIL_PASS','OPENAI_API_KEY'].map(k => (
            <div key={k} className="bg-slate-800 rounded px-3 py-2 font-mono text-slate-400">{k}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentIcon({ type }: { type: string }) {
  const icons: Record<string, any> = { music: Music, book: BookOpen, video: Video, score: FileText, concert: Calendar, gallery: Image, library: Library };
  const Icon = icons[type] || Package;
  return <Icon size={14} className="text-slate-600 m-auto mt-1.5" />;
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}><Icon size={18} className={color} /></div>
        <TrendingUp size={14} className="text-slate-700" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{title}</p>
    </motion.div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
}
