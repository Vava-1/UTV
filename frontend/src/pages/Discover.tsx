import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '@/components/PageWrapper';
import { Music, Play, Headphones, Radio, Mic2, Guitar, Drum, Piano, Disc } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { icon: Music, label: 'Classical', desc: 'Timeless classical masterpieces', color: 'from-amber-500/20 to-orange-500/20' },
  { icon: Mic2, label: 'Gospel', desc: 'Spiritual and uplifting gospel music', color: 'from-emerald-500/20 to-teal-500/20' },
  { icon: Headphones, label: 'Contemporary', desc: 'Modern musical expressions', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: Radio, label: 'Traditional', desc: 'Cultural and traditional sounds', color: 'from-purple-500/20 to-pink-500/20' },
  { icon: Guitar, label: 'Instrumental', desc: 'Pure instrumental compositions', color: 'from-rose-500/20 to-red-500/20' },
  { icon: Drum, label: 'Rhythmic', desc: 'Percussion and rhythm focused', color: 'from-yellow-500/20 to-amber-500/20' },
  { icon: Piano, label: 'Orchestral', desc: 'Full orchestra performances', color: 'from-indigo-500/20 to-violet-500/20' },
  { icon: Disc, label: 'Rare Finds', desc: 'Unique and rare recordings', color: 'from-slate-500/20 to-gray-500/20' },
];

export function DiscoverPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper
      title={t('nav.discover', 'Discover')}
      subtitle="Explore our rich collection of classical and gospel music, curated for your spiritual and cultural enrichment."
      icon={<Music size={32} />}
    >
      {/* Featured Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Play size={24} className="text-amber-500" />
          Featured Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Link to="/music">
                <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${category.color} border border-[#1e1a12]/50 p-6 hover:border-amber-500/30 transition-all duration-300 cursor-pointer`}>
                  <div className="relative z-10">
                    <category.icon size={32} className="text-amber-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-lg font-bold text-white mb-2">{category.label}</h3>
                    <p className="text-sm text-[#9a9080]">{category.desc}</p>
                  </div>
                  <div className="absolute inset-0 bg-[#09090b]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                      <Play size={20} className="text-[#09090b] ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link to="/library">
          <div className="group rounded-xl bg-[#111109] border border-[#1e1a12]/50 p-6 hover:border-amber-500/30 transition-all duration-300">
            <Headphones size={28} className="text-amber-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Your Library</h3>
            <p className="text-sm text-[#9a9080]">Access your saved music and playlists</p>
          </div>
        </Link>
        <Link to="/concerts">
          <div className="group rounded-xl bg-[#111109] border border-[#1e1a12]/50 p-6 hover:border-amber-500/30 transition-all duration-300">
            <Radio size={28} className="text-amber-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Live Concerts</h3>
            <p className="text-sm text-[#9a9080]">Upcoming performances and events</p>
          </div>
        </Link>
        <Link to="/books">
          <div className="group rounded-xl bg-[#111109] border border-[#1e1a12]/50 p-6 hover:border-amber-500/30 transition-all duration-300">
            <Disc size={28} className="text-amber-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Books & Scores</h3>
            <p className="text-sm text-[#9a9080]">Musical literature and sheet music</p>
          </div>
        </Link>
      </motion.div>
    </PageWrapper>
  );
}
