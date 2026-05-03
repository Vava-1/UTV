import React from 'react';
import { motion } from 'framer-motion';
import { UTVLogo } from './UTVLogo';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#09090b] overflow-hidden">
      {/* Professional Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#1a1812] to-[#0a0a08]" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-3 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {/* Large Circular Logo - Professional sizing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="flex justify-center mb-6 sm:mb-8 md:mb-12"
          >
            <div className="relative group">
              <img 
                src="/logo.png" 
                alt="UNA TANTUM VOCE Logo" 
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-cover rounded-full border-2 sm:border-4 border-amber-500/20 shadow-xl sm:shadow-2xl transition-all duration-300 group-hover:border-amber-500/40 group-hover:shadow-3xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl sm:shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ display: 'none' }}>
                <span className="text-[#09090b] font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">UTV</span>
              </div>
            </div>
          </motion.div>

          {/* Main Title with Professional Animation */}
          <div className="space-y-2 sm:space-y-4">
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-white leading-tight font-serif tracking-tight"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
            >
              WHERE <span className="text-amber-500">CLASSICAL</span>{" "}
              <span className="text-amber-500">MEETS</span>{" "}
              <span className="text-amber-500">GOSPEL</span>
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#c8c0b0] font-light tracking-wide leading-relaxed"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.7
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
