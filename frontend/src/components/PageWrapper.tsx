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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-6"
        >
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-800 bg-white border border-gray-200 rounded-lg transition-all hover:border-blue-300 hover:bg-blue-50"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-800 bg-white border border-gray-200 rounded-lg transition-all hover:border-blue-300 hover:bg-blue-50"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </motion.div>

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            {icon && <div className="text-blue-800">{icon}</div>}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-blue-900 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-gray-600 text-lg mt-2 max-w-2xl">
              {subtitle}
            </p>
          )}
          <div className="h-1 w-24 bg-yellow-400 mt-4 rounded-full" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
