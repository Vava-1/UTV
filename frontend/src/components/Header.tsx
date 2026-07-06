import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogIn, User, Globe } from 'lucide-react';

const navItems = [
  { path: '/discover', labelKey: 'header.discover' },
  { path: '/books', labelKey: 'header.books' },
  { path: '/concerts', labelKey: 'header.concerts' },
  { path: '/artists', labelKey: 'header.artists' },
  { path: '/library', labelKey: 'header.library' },
  { path: '/contact', labelKey: 'header.contact' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangDropdownOpen(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language)?.name || 'English';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/98 backdrop-blur-md border-b border-[#1e1a12]/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo - Professional Design */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="UNA TANTUM VOCE Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-full border border-amber-500/20 shadow-md transition-all duration-300 group-hover:border-amber-500/40 group-hover:shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ display: 'none' }}>
                <span className="text-[#09090b] font-bold text-xs sm:text-sm">UTV</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wider font-serif leading-none transition-colors group-hover:text-amber-500">
                UNA TANTUM VOCE
              </h1>
              <p className="text-xs sm:text-sm text-amber-500 tracking-[0.15em] uppercase mt-1 font-medium">
                MUSIC DEVELOPMENT FOR ALL
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - Clean Design */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-all duration-300 px-3 py-2 rounded-md ${
                  location.pathname === item.path
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-[#9a9080] hover:text-white hover:bg-[#1a1813]'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right side buttons - Professional Layout */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switch - Enhanced */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-[#9a9080] hover:text-white bg-[#111109]/80 border border-[#1e1a12]/50 rounded-md transition-all duration-300 hover:bg-[#1a1813] hover:border-amber-500/50"
              >
                <Globe size={14} className="flex-shrink-0" />
                <span className="hidden sm:inline">{currentLang}</span>
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#111109]/95 backdrop-blur-md border border-[#1e1a12]/50 rounded-lg shadow-xl z-50">
                  <div className="py-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm transition-all duration-200 ${
                          i18n.language === lang.code
                            ? 'text-amber-500 bg-amber-500/15'
                            : 'text-[#9a9080] hover:text-white hover:bg-[#1a1813]'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sign In / User - Clean Design */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#111109]/60 border border-[#1e1a12]/40 rounded-md">
                <User size={14} className="text-amber-500 flex-shrink-0" />
                <span className="text-sm text-[#c8c0b0] truncate max-w-24 sm:max-w-none">
                  {user?.first_name || user?.email}
                </span>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block text-sm text-[#9a9080] hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-[#1a1813]"
              >
                {t('header.signIn')}
              </Link>
            )}

            {/* Join Now Button - Professional */}
            <Link
              to="/register"
              className="px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#09090b] text-sm sm:text-xs font-bold tracking-wider transition-all duration-300 rounded-md shadow-md hover:shadow-lg"
            >
              {t('header.joinNow')}
            </Link>

            {/* Mobile menu toggle - Enhanced */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-[#9a9080] hover:text-white transition-colors p-2 rounded-md hover:bg-[#1a1813]"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1e1a12]/50 py-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors px-2 py-1 ${
                    location.pathname === item.path
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-[#9a9080] hover:text-white'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-[#9a9080] hover:text-white transition-colors px-2 py-1"
                >
                  {t('header.signIn')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
