import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '@/utils/api';
import { Content } from '@/types';
import {
  Music, BookOpen, Video, FileText, Calendar, Users, ArrowRight,
  Play, Sparkles, Heart, Globe, Star, Quote, ChevronDown,
} from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Content[]>([]);
  const [stats, setStats] = useState({ music: 0, books: 0, videos: 0, scores: 0 });
  const { play } = useAudioPlayer();

  useEffect(() => {
    api.get('/contents/featured').then(res => setFeatured(res.data)).catch(() => {});
    api.get('/contents?content_type=music&page_size=1').then(r => setStats(s => ({ ...s, music: r.data.total }))).catch(() => {});
    api.get('/contents?content_type=book&page_size=1').then(r => setStats(s => ({ ...s, books: r.data.total }))).catch(() => {});
    api.get('/contents?content_type=video&page_size=1').then(r => setStats(s => ({ ...s, videos: r.data.total }))).catch(() => {});
    api.get('/contents?content_type=score&page_size=1').then(r => setStats(s => ({ ...s, scores: r.data.total }))).catch(() => {});
  }, []);

  const modules = [
    { icon: Music, title: 'Music', desc: 'Stream classical & gospel performances', path: '/music', color: 'bg-blue-100 text-blue-800' },
    { icon: Video, title: 'Videos', desc: 'Watch performances & masterclasses', path: '/videos', color: 'bg-yellow-100 text-yellow-800' },
    { icon: BookOpen, title: 'Books', desc: 'Formative philosophical literature', path: '/books', color: 'bg-blue-100 text-blue-800' },
    { icon: FileText, title: 'Scores', desc: 'Sheet music for choirs & ensembles', path: '/scores', color: 'bg-yellow-100 text-yellow-800' },
    { icon: Calendar, title: 'Events', desc: 'Live concerts & ticket purchasing', path: '/concerts', color: 'bg-blue-100 text-blue-800' },
    { icon: Users, title: 'Community', desc: 'Join our global musical family', path: '/discover', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="bg-white">
      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Floating musical notes decoration */}
        <motion.div
          className="absolute top-20 left-10 text-yellow-400 opacity-30"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Music size={48} />
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-16 text-yellow-400 opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Play size={64} fill="currentColor" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-yellow-400 rounded-2xl shadow-2xl"
          >
            <Music size={40} className="text-blue-900" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 tracking-tight"
          >
            UNA TANTUM VOCE
          </motion.h1>

          {/* Latin translation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-yellow-400 text-lg sm:text-xl tracking-[0.3em] uppercase mb-6 font-medium"
          >
            One Single Voice
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Where classical music meets gospel tradition and formative literature.
            Music development for all.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/discover"
              className="btn-accent text-lg px-8 py-4"
            >
              <Sparkles size={20} />
              Explore the Platform
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-all duration-200"
            >
              Join Our Community
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce"
          >
            <ChevronDown size={32} />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-blue-900 text-white py-12">
        <div className="container-utv px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard icon={Music} value={stats.music} label="Music Tracks" />
            <StatCard icon={BookOpen} value={stats.books} label="Books" />
            <StatCard icon={Video} value={stats.videos} label="Videos" />
            <StatCard icon={FileText} value={stats.scores} label="Music Scores" />
          </div>
        </div>
      </section>

      {/* ─── MODULES GRID ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-utv">
          <div className="text-center mb-12">
            <div className="divider-yellow mx-auto mb-4" />
            <h2 className="text-heading mb-3">Explore Our Platform</h2>
            <p className="text-subheading max-w-2xl mx-auto">
              Six integrated modules bringing together classical music, gospel traditions,
              philosophical literature, and live performance into one unified experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={mod.path}
                  className="card p-8 block h-full group"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${mod.color} group-hover:scale-110 transition-transform`}>
                    <mod.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{mod.title}</h3>
                  <p className="text-gray-600">{mod.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-blue-700 font-medium group-hover:gap-2 transition-all">
                    Explore <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MISSION SECTION ─────────────────────────────────────────────── */}
      <section className="bg-blue-50 py-20">
        <div className="container-utv px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="divider-yellow mb-4" />
              <h2 className="text-heading mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                UNA TANTUM VOCE — Latin for "One Single Voice" — represents the unity of
                artistic expression and intellectual formation. We bridge the beauty of
                classical and gospel music with formative philosophical literature.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our platform serves as a music streaming service, digital library,
                e-commerce store, concert ticketing hub, and future academy — all dedicated
                to nurturing both the artistic soul and the formative mind.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="badge-blue"><Heart size={12} /> Classical Music</span>
                <span className="badge-yellow"><Star size={12} /> Gospel Traditions</span>
                <span className="badge-blue"><BookOpen size={12} /> Philosophical Literature</span>
                <span className="badge-yellow"><Globe size={12} /> 8 Languages</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card-blue p-8 rounded-2xl">
                <Quote size={48} className="text-yellow-400 mb-4" />
                <p className="text-xl text-white leading-relaxed mb-6 italic">
                  "Music is the divine way to transport the soul to higher realms.
                  Where words fail, music speaks — Una Tantum Voce, one single voice
                  uniting humanity across cultures and centuries."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Music size={24} className="text-blue-900" />
                  </div>
                  <div>
                    <p className="font-bold text-white">UNA TANTUM VOCE</p>
                    <p className="text-blue-200 text-sm">Music Development for All</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED CONTENT ─────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container-utv">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="divider-yellow mb-4" />
                <h2 className="text-heading">Featured Content</h2>
              </div>
              <Link to="/discover" className="btn-ghost">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 4).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card overflow-hidden group"
                >
                  <div className="aspect-square bg-blue-100 overflow-hidden">
                    {item.cover_image_url ? (
                      <img
                        src={item.cover_image_url || undefined}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={48} className="text-blue-300" />
                      </div>
                    )}
                    {item.is_featured && (
                      <span className="badge-featured absolute top-2 left-2">
                        <Star size={10} /> Featured
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-blue-900 line-clamp-2 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">{item.content_type}</p>
                    {item.content_type === 'music' && item.audio_url && (
                      <button
                        onClick={() => play({
                          id: item.id,
                          title: item.title,
                          artist: item.artist || 'UTV',
                          album: null,
                          audio_url: item.audio_url,
                          cover_image_url: item.cover_image_url,
                          duration: item.duration || 0,
                        })}
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                      >
                        <Play size={14} fill="currentColor" /> Play
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA SECTION ─────────────────────────────────────────────────── */}
      <section className="gradient-blue py-20 text-white">
        <div className="container-utv px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
              Join Our Musical Journey
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Create an account to access exclusive content, purchase books and scores,
              and register for upcoming concerts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-accent text-lg px-8 py-4">
                <Sparkles size={20} />
                Create Free Account
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-all"
              >
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div>
      <Icon className="mx-auto mb-2 text-yellow-400" size={32} />
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-blue-200 text-sm">{label}</p>
    </div>
  );
}
