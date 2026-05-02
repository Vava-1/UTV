import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Music, BookOpen, Video, FileText, Calendar, Globe, Heart, Award } from 'lucide-react';

export function AboutPage() {
  const { t } = useTranslation();
  const features = [
    { icon: Music, title: 'Classical & Gospel Music', description: 'A curated collection bridging sacred classical traditions with contemporary gospel expressions.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: BookOpen, title: 'Formative Literature', description: 'Philosophical and spiritual texts designed for personal growth and intellectual formation.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: FileText, title: 'Sheet Music', description: 'Professional scores for choir, solo voice, and instrumental arrangements.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Video, title: 'Video Content', description: 'Performances, teachings, and documentary content from the UTV community.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Calendar, title: 'Live Concerts', description: 'Ticketed events bringing our music and message to venues around the world.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { icon: Globe, title: '8 Languages', description: 'Content accessible in EN, FR, ES, DE, IT, PT, RW, and SW.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-16">
      <section className="text-center py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Music size={40} className="text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">UNA TANTUM VOCE</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">"One Single Voice" — An integrated artistic and educational initiative bridging classical music, gospel traditions, and formative philosophical literature.</p>
        </motion.div>
      </section>
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            UNA TANTUM VOCE exists to create a unified space where the beauty of classical music traditions meets the spiritual depth of gospel music, 
            all while being grounded in formative philosophical literature. We believe that art, faith, and reason are not opposing forces, 
            but complementary voices that together create a richer, more meaningful human experience.
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-400"><Heart size={16} /><span className="text-sm font-medium">United by One Voice</span></div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white text-center mb-8">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}><f.icon size={24} className={f.color} /></div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <Award size={32} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">The Future Academy</h2>
          <p className="text-slate-300 leading-relaxed">
            The UTV Academy will offer courses in music theory, vocal technique, conducting, and philosophical formation — 
            creating a global community where classical and gospel music enthusiasts can discover, learn, and grow together.
          </p>
        </div>
      </section>
    </div>
  );
}
