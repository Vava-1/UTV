import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/HeroSection';
import { MissionSection } from '@/components/MissionSection';
import api from '@/utils/api';
import { Content } from '@/types';
import {
  Music, BookOpen, Calendar, Play, ArrowRight, Users,
  Award, Globe, Star, ChevronRight, Mail
} from 'lucide-react';

// ─── Featured Music Section ───────────────────────────────────────────────────
function FeaturedMusicSection() {
  const [tracks, setTracks] = useState<Content[]>([]);

  useEffect(() => {
    api.get('/contents?content_type=music&is_featured=true&page_size=6')
      .then(res => setTracks(res.data.items || []))
      .catch(() => {});
  }, []);

  if (tracks.length === 0) return null;

  return (
    <section className="py-16 px-4 md:px-8 bg-[#0a0a08]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Music size={18} className="text-amber-500" />
              <span className="text-xs text-amber-500 tracking-[0.3em] uppercase font-medium">Featured</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Selected Compositions</h2>
          </div>
          <Link
            to="/music"
            className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
          >
            All Music <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to="/music"
                className="group flex items-center gap-4 bg-[#111109] border border-[#1e1a12] rounded-xl p-4 hover:border-amber-500/30 transition-all"
              >
                <div className="relative w-14 h-14 rounded-lg bg-[#1a1813] flex-shrink-0 overflow-hidden">
                  {track.cover_image_url ? (
                    <img src={track.cover_image_url} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music size={20} className="text-amber-500/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{track.title}</p>
                  <p className="text-[#6a6055] text-xs mt-0.5 truncate">{track.artist || 'UNA TANTUM VOCE'}</p>
                  {track.duration && (
                    <p className="text-[#4a4035] text-xs mt-1">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { icon: Music, value: '50+', label: 'Compositions' },
    { icon: BookOpen, value: '12', label: 'Publications' },
    { icon: Calendar, value: '200+', label: 'Performances' },
    { icon: Globe, value: '7', label: 'Languages' },
  ];

  return (
    <section className="py-16 border-y border-[#1e1a12] bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon size={24} className="text-amber-500 mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-white font-serif">{stat.value}</div>
              <div className="text-[#6a6055] text-sm mt-1 tracking-wider uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Upcoming Concerts Section ────────────────────────────────────────────────
function UpcomingConcertsSection() {
  const [concerts, setConcerts] = useState<Content[]>([]);

  useEffect(() => {
    api.get('/contents?content_type=concert&page_size=3')
      .then(res => setConcerts(res.data.items || []))
      .catch(() => {});
  }, []);

  if (concerts.length === 0) return null;

  return (
    <section className="py-16 px-4 md:px-8 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-amber-500" />
              <span className="text-xs text-amber-500 tracking-[0.3em] uppercase font-medium">Coming Up</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Upcoming Concerts</h2>
          </div>
          <Link
            to="/concerts"
            className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
          >
            All Events <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {concerts.map((concert, i) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to="/concerts"
                className="group flex items-center gap-6 bg-[#111109] border border-[#1e1a12] rounded-xl p-5 hover:border-amber-500/30 transition-all"
              >
                {concert.event_date && (
                  <div className="text-center flex-shrink-0 w-14">
                    <div className="text-2xl font-bold text-amber-500 font-serif leading-none">
                      {new Date(concert.event_date).getDate()}
                    </div>
                    <div className="text-xs text-[#6a6055] uppercase tracking-wider mt-1">
                      {new Date(concert.event_date).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold group-hover:text-amber-500 transition-colors truncate">
                    {concert.title}
                  </h3>
                  {concert.venue && (
                    <p className="text-[#6a6055] text-sm mt-1">{concert.venue}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {concert.ticket_price && (
                    <span className="text-amber-500 font-bold">${concert.ticket_price}</span>
                  )}
                  <ChevronRight size={16} className="text-[#4a4035] group-hover:text-amber-500 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Books Section ───────────────────────────────────────────────────
function FeaturedBooksSection() {
  const [books, setBooks] = useState<Content[]>([]);

  useEffect(() => {
    api.get('/contents?content_type=book&page_size=4')
      .then(res => setBooks(res.data.items || []))
      .catch(() => {});
  }, []);

  if (books.length === 0) return null;

  return (
    <section className="py-16 px-4 md:px-8 bg-[#0a0a08]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-amber-500" />
              <span className="text-xs text-amber-500 tracking-[0.3em] uppercase font-medium">Publications</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Books & Scores</h2>
          </div>
          <Link
            to="/books"
            className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
          >
            Browse All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to="/books"
                className="group block bg-[#111109] border border-[#1e1a12] rounded-xl overflow-hidden hover:border-amber-500/30 transition-all"
              >
                <div className="aspect-[3/4] bg-[#1a1813] relative overflow-hidden">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={32} className="text-amber-500/30" />
                    </div>
                  )}
                  {book.price && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-[#09090b] text-xs font-bold px-2 py-0.5 rounded-full">
                      ${book.price}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium truncate">{book.title}</h3>
                  {book.author && (
                    <p className="text-[#6a6055] text-xs mt-1 truncate">{book.author}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter Section ───────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await api.post('/newsletter/subscribe', { email });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-[#09090b] border-t border-[#1e1a12]">
      <div className="max-w-2xl mx-auto text-center">
        <Mail size={32} className="text-amber-500 mx-auto mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-white font-serif mb-3">
          Stay in the Music
        </h2>
        <p className="text-[#6a6055] mb-8 leading-relaxed">
          Receive updates about new compositions, upcoming concerts, educational resources,
          and exclusive content directly to your inbox.
        </p>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6"
          >
            <Star size={24} className="text-amber-500 mx-auto mb-2" />
            <p className="text-amber-500 font-semibold">Thank you for subscribing!</p>
            <p className="text-[#6a6055] text-sm mt-1">Check your inbox for a welcome message.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-[#111109] border border-[#2a2515] rounded-lg px-4 py-3 text-sm text-white placeholder-[#4a4035] focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-amber-500 text-[#09090b] font-bold text-sm tracking-wider rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export function Home() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <MissionSection />
      <FeaturedMusicSection />
      <UpcomingConcertsSection />
      <FeaturedBooksSection />
      <NewsletterSection />
    </div>
  );
}
