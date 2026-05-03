import React from 'react';
import { motion } from 'framer-motion';
import { UTVLogo } from './UTVLogo';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#111109] to-[#1a1813]" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <UTVLogo size="large" className="text-amber-500" />
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight font-serif">
            WHERE
            <br />
            <span className="text-amber-500">CLASSICAL</span>
            <br />
            MEETS
            <br />
            <span className="text-amber-500">GOSPEL</span>
          </h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-[#9a9080] mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            One Single Platform. All the Music.
          </motion.p>
          
          {/* Call to action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="px-8 py-4 bg-amber-500 text-[#09090b] text-lg font-bold tracking-wider hover:bg-amber-400 transition-all transform hover:scale-105 rounded-sm">
              DISCOVER MUSIC
            </button>
            <button className="px-8 py-4 border border-[#2a2515] text-[#9a9080] text-lg font-medium tracking-wider hover:text-white hover:border-[#4a3a1a] transition-all rounded-sm">
              EXPLORE LIBRARY
            </button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
    </section>
  );
}
