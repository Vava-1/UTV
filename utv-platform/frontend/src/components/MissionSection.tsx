import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Music, Users, GraduationCap } from 'lucide-react';

export function MissionSection() {
  const features = [
    {
      icon: Music,
      title: "Educational Music",
      description: "Musical compositions that carry educational, moral, and spiritual messages for holistic development."
    },
    {
      icon: BookOpen,
      title: "Formative Literature",
      description: "Philosophical and educational books that help navigate life's challenges with wisdom."
    },
    {
      icon: Users,
      title: "Cultural Events",
      description: "Concerts, workshops, and cultural events that foster both entertainment and education."
    },
    {
      icon: GraduationCap,
      title: "Music Education",
      description: "Training programs and schools for children, youth, and adults to develop musical talent."
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#111109]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 font-serif leading-tight">
            Music & Thought for
            <span className="text-amber-500">Human Formation</span>
          </h2>
          <p className="text-base sm:text-lg text-[#9a9080] max-w-3xl mx-auto leading-relaxed px-4">
            An integrated initiative that promotes music alongside formative literature, 
            creating artistic works that inspire, educate, and transform society through 
            educational, moral, and spiritual messages.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="text-center group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
                <feature.icon size={20} className="sm:size-24 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-amber-500 transition-colors">{feature.title}</h3>
              <p className="text-sm sm:text-base text-[#9a9080] leading-relaxed px-2">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-[#09090b] border border-[#1e1a12] rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-4 font-serif">
              Our Vision
            </h3>
            <p className="text-[#c8c0b0] leading-relaxed max-w-2xl mx-auto">
              To become a center of artistic and intellectual production that contributes to 
              the cultural, moral, and educational development of society by uniting music 
              and thought in a single, transformative vision.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
