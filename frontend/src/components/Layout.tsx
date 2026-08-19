import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import {
  Menu, X, Globe, User, LogOut, ShoppingCart,
  ChevronDown, Shield,
} from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'sw', name: 'Kiswahili' },
];

function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setCartCount(0); return; }
    api.get('/orders/cart')
      .then(res => setCartCount(Array.isArray(res.data) ? res.data.length : 0))
      .catch(() => setCartCount(0));
  }, [isAuthenticated]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  const currentLang = languages.find(l => l.code === i18n.language)?.name || 'English';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Nav items — uses translations
  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/videos', label: t('nav.videos') },
    { path: '/music', label: t('nav.audios') },
    { path: '/scores', label: t('nav.sheets') },
    { path: '/concerts', label: t('nav.events') },
    { path: '/books', label: t('nav.books') },
    { path: '/about', label: t('nav.about') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand — uses logo image, not music symbol */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="UTV Logo"
              className="w-10 h-10 rounded-lg object-cover group-hover:scale-110 transition-transform"
              onError={(e) => {
                // Fallback to text if logo fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-blue-900 tracking-tight font-serif leading-none">
                UTV
              </h1>
              <p className="text-[9px] text-gray-500 tracking-widest uppercase mt-0.5">
                {t('footer.musicForAll')}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'text-blue-800 bg-blue-50 border-b-2 border-yellow-400'
                    : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Globe size={16} />
                <span className="hidden lg:inline">{currentLang}</span>
                <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                  >
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          i18n.language === lang.code
                            ? 'text-blue-800 bg-blue-50 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className={`relative p-2 rounded-lg transition-colors ${
                  isActive('/cart')
                    ? 'text-blue-800 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-yellow-400 text-blue-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User menu (Login button REMOVED per user request) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700 max-w-[100px] truncate">
                    {user?.first_name || user?.email}
                  </span>
                  <ChevronDown size={12} className="text-gray-400 hidden sm:block" />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                    >
                      <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors">
                        <ShoppingCart size={14} /> My Orders
                      </Link>
                      <Link to="/tickets" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors">
                        <User size={14} /> My Tickets
                      </Link>
                      {isAdmin && (
                        <Link to="/admin-secure-portal" className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-800 hover:bg-blue-50 transition-colors font-medium">
                          <Shield size={14} /> {t('nav.admin')}
                        </Link>
                      )}
                      <hr className="border-gray-100" />
                      <button
                        onClick={() => { logout(); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="py-3 space-y-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'text-blue-800 bg-blue-50 font-medium'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {/* Mobile language */}
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Globe size={12} /> Language
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`px-2 py-1 text-xs rounded ${
                          i18n.language === lang.code
                            ? 'bg-blue-800 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {lang.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
      <main className="min-h-screen pt-16">
        <Outlet />
      </main>
      <Footer />
      <GlobalAudioPlayer />
      <ChatWidget />
    </div>
  );
}

// Re-export these so they're available from Layout
import { Footer } from './Footer';
import { GlobalAudioPlayer } from './GlobalAudioPlayer';
import { ChatWidget } from './ChatWidget';
