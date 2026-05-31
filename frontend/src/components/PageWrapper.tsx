import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
}

export function PageWrapper({ children, title, subtitle, icon, showBackButton = true }: PageWrapperProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090b] via-[#1a1812] to-[#0a0a08]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#9a9080] hover:text-amber-500 bg-[#111109]/80 border border-[#1e1a12]/50 rounded-lg transition-all duration-300 hover:border-amber-500/50 hover:bg-[#1a1813]"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#9a9080] hover:text-amber-500 bg-[#111109]/80 border border-[#1e1a12]/50 rounded-lg transition-all duration-300 hover:border-amber-500/50 hover:bg-[#1a1813]"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </motion.div>

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            {icon && <div className="text-amber-500">{icon}</div>}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[#9a9080] text-lg mt-2 max-w-2xl">
              {subtitle}
            </p>
          )}
          <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-transparent mt-4 rounded-full" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
