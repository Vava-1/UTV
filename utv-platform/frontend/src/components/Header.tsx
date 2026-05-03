import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogIn, User, Globe } from 'lucide-react';

const navItems = [
  { path: '/discover', label: 'Discover' },
  { path: '/books', label: 'Books' },
  { path: '/concerts', label: 'Concerts' },
  { path: '/artists', label: 'Artists' },
  { path: '/library', label: 'Library' },
  { path: '/contact', label: 'Contact' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-sm border-b border-[#1e1a12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="UNA TANTUM VOCE Logo" 
              className="w-9 h-9 object-contain"
              onError={(e) => {
                // Fallback to text logo if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="flex items-center" style={{ display: 'none' }}>
              <div className="w-9 h-9 bg-amber-500 flex items-center justify-center rounded-sm">
                <span className="text-[#09090b] font-bold text-sm">UTV</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest font-serif leading-none">
                UNA TANTUM VOCE
              </h1>
              <p className="text-xs text-amber-500 tracking-[0.2em] uppercase mt-0.5">
                MUSIC DEVELOPMENT FOR ALL
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-amber-500'
                    : 'text-[#9a9080] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {/* Language Switch */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm text-[#9a9080] hover:text-white bg-[#111109] border border-[#1e1a12] rounded-sm transition-colors"
              >
                <Globe size={16} />
                <span>{currentLang}</span>
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#111109] border border-[#1e1a12] rounded-sm shadow-lg z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        i18n.language === lang.code
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-[#9a9080] hover:text-white hover:bg-[#1a1813]'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign In / User */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#111109] border border-[#1e1a12] rounded-sm">
                <User size={16} className="text-amber-500" />
                <span className="text-sm text-[#c8c0b0]">
                  {user?.first_name || user?.email}
                </span>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:block text-sm text-[#9a9080] hover:text-white transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Join Now Button */}
            <Link
              to="/register"
              className="px-6 py-2 bg-amber-500 text-[#09090b] text-sm font-bold tracking-wider hover:bg-amber-400 transition-colors rounded-sm"
            >
              JOIN NOW
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-[#9a9080] hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1e1a12] py-4">
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
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-[#9a9080] hover:text-white transition-colors px-2 py-1"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
