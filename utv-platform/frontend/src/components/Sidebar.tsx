import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Info, Music, BookOpen, Video, FileText, Calendar, Image, Library, ChevronDown, Globe, User, LogIn, LogOut, Shield, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'nav.home' },
  { path: '/about', icon: Info, label: 'nav.about' },
  { path: '/music', icon: Music, label: 'nav.music' },
  { path: '/books', icon: BookOpen, label: 'nav.books' },
  { path: '/videos', icon: Video, label: 'nav.videos' },
  { path: '/scores', icon: FileText, label: 'nav.scores' },
  { path: '/concerts', icon: Calendar, label: 'nav.concerts' },
  { path: '/gallery', icon: Image, label: 'nav.gallery' },
  { path: '/library', icon: Library, label: 'nav.library' },
];

const languages = [
  { code: 'en', name: 'English' }, { code: 'fr', name: 'Francais' },
  { code: 'es', name: 'Espanol' }, { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' }, { code: 'pt', name: 'Portugues' },
  { code: 'rw', name: 'Kinyarwanda' }, { code: 'sw', name: 'Kiswahili' },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => { i18n.changeLanguage(lng); setIsLangOpen(false); };

  return (
    <>
      <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="fixed top-4 left-4 z-[60] lg:hidden w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg">
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <motion.aside
        initial={false}
        animate={{ x: isMobileOpen ? 0 : '-100%', opacity: isMobileOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-[55] flex flex-col lg:translate-x-0 lg:opacity-100 shadow-2xl"
      >
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Music className="text-slate-900" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">UTV</h1>
              <p className="text-[10px] text-amber-500 tracking-widest uppercase">Una Tantum Voce</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <item.icon size={18} />
                <span className="text-sm font-medium">{t(item.label)}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin-secure-portal" onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mt-4 ${location.pathname.startsWith('/admin') ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'}`}>
              <Shield size={18} />
              <span className="text-sm font-medium">{t('nav.admin')}</span>
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="relative">
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800/50 rounded-lg transition-colors">
              <Globe size={16} />
              <span>{languages.find(l => l.code === i18n.language)?.name || 'English'}</span>
              <ChevronDown size={14} className="ml-auto" />
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${i18n.language === lang.code ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:bg-slate-700'}`}>
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 w-full px-3 py-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <User size={16} className="text-amber-500" />
                </div>
                <span className="text-sm text-white truncate">{user?.first_name || user?.email}</span>
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                    <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors">
                      <LogOut size={14} /> {t('nav.logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium">
              <LogIn size={16} /> {t('nav.login')}
            </Link>
          )}
        </div>
      </motion.aside>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/50 z-[54] lg:hidden backdrop-blur-sm" />
        )}
      </AnimatePresence>
    </>
  );
}
