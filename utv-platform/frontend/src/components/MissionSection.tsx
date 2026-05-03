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
    <section className="py-20 bg-[#111109]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
            Music & Thought for
            <span className="text-amber-500"> Human Formation</span>
          </h2>
          <p className="text-lg text-[#9a9080] max-w-3xl mx-auto leading-relaxed">
            An integrated initiative that promotes music alongside formative literature, 
            creating artistic works that inspire, educate, and transform society through 
            educational, moral, and spiritual messages.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <feature.icon size={28} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-[#9a9080] leading-relaxed">{feature.description}</p>
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
