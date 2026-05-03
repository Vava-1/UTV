import React from 'react';
import { motion } from 'framer-motion';
import { UTVLogo } from './UTVLogo';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#09090b] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#111109] to-[#0a0a08]" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Large Circular Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex justify-center mb-12"
          >
            <img 
              src="/logo.png" 
              alt="UNA TANTUM VOCE Logo" 
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-cover rounded-full border-4 border-amber-500/30 shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl" style={{ display: 'none' }}>
              <span className="text-[#09090b] font-bold text-4xl md:text-5xl lg:text-6xl">UTV</span>
            </div>
          </motion.div>

          {/* Main Title with Infinite Fade-in Animation */}
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight font-serif"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
            >
              WHERE <span className="text-amber-500">CLASSICAL</span> MEETS{" "}
              <span className="text-amber-500">GOSPEL</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-[#c8c0b0] font-light tracking-wide"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              One Single Platform. All the Music.
            </motion.p>
          </div>
          
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
