import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { Content, User, Order } from '@/types';
import {
  Shield, Users, ShoppingBag, DollarSign, Ticket, TrendingUp,
  BarChart3, Package, Mail, Plus, Trash2, Edit, Eye, EyeOff,
  RefreshCw, Send, Download, ChevronDown, Music, BookOpen,
  Video, FileText, Calendar, Image, Library, Settings, X,
  UserCheck, UserX, CheckCircle2, Youtube, Upload, Link2
} from 'lucide-react';

type Tab = 'dashboard' | 'contents' | 'videos' | 'newsletter' | 'orders' | 'users' | 'settings';

// ─── Content Creation Modal ────────────────────────────────────────────────────

const CONTENT_TYPES = ['music', 'book', 'video', 'score', 'concert', 'gallery', 'library'] as const;

interface ContentFormData {
  title: string;
  content_type: string;
  description: string;
  price: string;
  audio_url: string;
  pdf_url: string;
  video_url: string;
  cover_image_url: string;
  artist: string;
  author: string;
  is_featured: boolean;
  is_published: boolean;
}

const emptyForm: ContentFormData = {
  title: '',
  content_type: 'music',
  description: '',
  price: '',
  audio_url: '',
  pdf_url: '',
  video_url: '',
  cover_image_url: '',
  artist: '',
  author: '',
  is_featured: false,
  is_published: false,
};

function AddContentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<ContentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof ContentFormData, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/contents', {
        title: form.title,
        content_type: form.content_type,
        description: form.description || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        audio_url: form.audio_url || undefined,
        pdf_url: form.pdf_url || undefined,
        video_url: form.video_url || undefined,
        cover_image_url: form.cover_image_url || undefined,
        artist: form.artist || undefined,
        author: form.author || undefined,
        is_featured: form.is_featured,
        is_published: form.is_published,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create content');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors';
  const labelCls = 'block text-xs text-slate-400 mb-1';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Plus size={14} className="text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-white">Add Content</h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Title <span className="text-red-400">*</span></label>
                <input
                  className={inputCls}
                  placeholder="Content title"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Content Type</label>
                <select
                  className={inputCls}
                  value={form.content_type}
                  onChange={e => set('content_type', e.target.value)}
                >
                  {CONTENT_TYPES.map(t => (
                    <option key={t} value={t} className="bg-slate-800 capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Optional description..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            {/* Price + Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Price (USD)</label>
                <input
                  className={inputCls}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00 (leave blank = free)"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Cover Image URL</label>
                <input
                  className={inputCls}
                  placeholder="https://..."
                  value={form.cover_image_url}
                  onChange={e => set('cover_image_url', e.target.value)}
                />
              </div>
            </div>

            {/* Artist / Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Artist</label>
                <input
                  className={inputCls}
                  placeholder="Artist name"
                  value={form.artist}
                  onChange={e => set('artist', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Author</label>
                <input
                  className={inputCls}
                  placeholder="Author name"
                  value={form.author}
                  onChange={e => set('author', e.target.value)}
                />
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Media URLs</p>
              <div>
                <label className={labelCls}>Audio URL</label>
                <input className={inputCls} placeholder="https://... (mp3, wav)" value={form.audio_url} onChange={e => set('audio_url', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>PDF URL</label>
                <input className={inputCls} placeholder="https://... (pdf)" value={form.pdf_url} onChange={e => set('pdf_url', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Video URL</label>
                <input className={inputCls} placeholder="https://... (mp4, youtube)" value={form.video_url} onChange={e => set('video_url', e.target.value)} />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => set('is_featured', !form.is_featured)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${form.is_featured ? 'bg-amber-500' : 'bg-slate-700'}`}
                  style={{ height: '22px', width: '40px' }}
                >
                  <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-[18px]' : ''}`} />
                </button>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Featured</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => set('is_published', !form.is_published)}
                  className={`relative rounded-full transition-colors ${form.is_published ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  style={{ height: '22px', width: '40px' }}
                >
                  <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-[18px]' : ''}`} />
                </button>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Published</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            {/* Submit */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-900 font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                {saving ? 'Creating...' : 'Create Content'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/users');
      setUsers(r.data);
    } catch {}
    finally { setLoading(false); }
  };

  const toggleActive = async (userId: number) => {
    setToggling(userId);
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch {}
    finally { setToggling(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{users.length} users total</p>
        <button onClick={fetchUsers} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-3 text-slate-400 font-medium">#</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Name</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Email</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Role</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Joined</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-500 text-xs">{u.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-white truncate max-w-[140px]">{u.full_name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    u.role === 'moderator' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>{u.role || 'user'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 w-fit text-xs px-2 py-0.5 rounded-full ${u.is_active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active !== false ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {u.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at || u.joined_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(u.id)}
                    disabled={toggling === u.id}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                      u.is_active !== false
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {toggling === u.id ? (
                      <RefreshCw size={11} className="animate-spin" />
                    ) : u.is_active !== false ? (
                      <UserX size={11} />
                    ) : (
                      <UserCheck size={11} />
                    )}
                    {u.is_active !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users size={32} className="mx-auto mb-3 opacity-50" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Videos Tab (YouTube sync + upload + URL paste) ──────────────────────────

function VideosTab() {
  const [videos, setVideos] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/contents', { params: { content_type: 'video' } });
      setVideos(r.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVideos(); }, []);

  const syncYouTube = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const r = await api.post('/youtube/sync', null, { params: { max_results: 50 } });
      setSyncResult(`Sync complete: ${r.data.created} new, ${r.data.synced - r.data.created} updated, ${r.data.errors} errors.`);
      fetchVideos();
    } catch (err: any) {
      setSyncResult(err?.response?.data?.detail || 'Sync failed. Is YOUTUBE_API_KEY configured?');
    } finally {
      setSyncing(false);
    }
  };

  const addVideoByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    setAdding(true);
    try {
      // Extract YouTube ID or use URL directly
      let youtubeId: string | undefined;
      let platform = 'direct';
      const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        youtubeId = ytMatch[1];
        platform = 'youtube';
      }

      await api.post('/contents', {
        title: videoTitle || (platform === 'youtube' ? `YouTube Video ${youtubeId}` : 'Untitled Video'),
        slug: `video-${Date.now()}`,
        content_type: 'video',
        description: videoDesc || undefined,
        video_url: videoUrl,
        platform,
        youtube_id: youtubeId,
        is_published: true,
        is_featured: false,
      });
      setShowAddVideo(false);
      setVideoUrl(''); setVideoTitle(''); setVideoDesc('');
      fetchVideos();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to add video');
    } finally {
      setAdding(false);
    }
  };

  const deleteVideo = async (id: number) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.delete(`/contents/${id}`);
      fetchVideos();
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* YouTube Sync Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Youtube size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">YouTube Channel Sync</h3>
              <p className="text-xs text-slate-400">Sync videos from @UNATANTUMVOCEOFFICIAL</p>
            </div>
          </div>
          <button
            onClick={syncYouTube}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {syncing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        {syncResult && (
          <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-sm text-slate-300">
            {syncResult}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">
          Requires YOUTUBE_API_KEY in backend .env. Get a key at{' '}
          <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
            Google Cloud Console
          </a>.
        </p>
      </div>

      {/* Add Video by URL */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Link2 size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Add Video by URL</h3>
              <p className="text-xs text-slate-400">Paste a YouTube, Vimeo, or direct video URL</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddVideo(!showAddVideo)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
          >
            <Plus size={14} /> Add Video
          </button>
        </div>
        {showAddVideo && (
          <form onSubmit={addVideoByUrl} className="mt-4 space-y-3">
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            <input
              type="text"
              placeholder="Video title (optional — auto-generated for YouTube)"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            <textarea
              placeholder="Description (optional)"
              value={videoDesc}
              onChange={e => setVideoDesc(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 resize-none"
            />
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {adding ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              {adding ? 'Adding...' : 'Add Video'}
            </button>
          </form>
        )}
      </div>

      {/* Video List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">All Videos ({videos.length})</h3>
        </div>
        <div className="divide-y divide-slate-800/60">
          {videos.map(v => (
            <div key={v.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-16 h-10 rounded bg-slate-800 flex-shrink-0 overflow-hidden">
                {v.thumbnail_url || v.cover_image_url ? (
                  <img src={(v.thumbnail_url || v.cover_image_url) || undefined} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Youtube size={16} className="text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{v.title}</p>
                <p className="text-xs text-slate-500">
                  {v.platform === 'youtube' ? 'YouTube' : v.platform || 'Direct'} · {v.youtube_id || 'No ID'}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${v.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {v.is_published ? 'Published' : 'Draft'}
              </span>
              <button
                onClick={() => deleteVideo(v.id)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {videos.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <Youtube size={24} className="mx-auto mb-2 opacity-50" />
              <p>No videos yet. Sync from YouTube or add by URL.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────

export function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading, user } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [analytics, setAnalytics] = useState<any>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddContent, setShowAddContent] = useState(false);

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
    { id: 'videos', label: 'Videos', icon: Youtube },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Add Content Modal */}
      {showAddContent && (
        <AddContentModal
          onClose={() => setShowAddContent(false)}
          onSuccess={() => { if (tab === 'contents') fetchContents(); }}
        />
      )}

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

      {/* Videos Tab */}
      {tab === 'videos' && <VideosTab />}

      {/* Contents Tab */}
      {tab === 'contents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{contents.length} items total</p>
            <button
              onClick={() => setShowAddContent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
            >
              <Plus size={14} /> Add Content
            </button>
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
                <p>No content yet. Click "Add Content" to get started.</p>
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

      {/* Users Tab */}
      {tab === 'users' && <UsersTab />}

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
