import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { UTVLogo } from './UTVLogo';
import { useTranslation } from 'react-i18next';
import { TypewriterText } from './TypewriterText';
import { Globe, Menu, X, User, LogIn, LogOut, Settings } from 'lucide-react';

export function HeroSection() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const navItems = [
    { path: '/discover', label: 'Discover' },
    { path: '/books', label: 'Books' },
    { path: '/concerts', label: 'Concerts' },
    { path: '/library', label: 'Library' },
  ];

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
    setIsMobileMenuOpen(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language)?.name || 'English';

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#09090b] overflow-hidden">
      {/* Professional Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#1a1812] to-[#0a0a08]" />
      
      {/* Top Navigation Bar - Fixed Position */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/98 backdrop-blur-md border-b border-[#1e1a12]/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Top Left */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative group">
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
            </div>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs sm:text-sm font-medium transition-all duration-300 px-3 py-2 rounded-md ${
                    location.pathname === item.path
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-[#9a9080] hover:text-white hover:bg-[#1a1813]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switch */}
              <div className="relative">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-[#9a9080] hover:text-white bg-[#111109]/80 border border-[#1e1a12]/50 rounded-md transition-all duration-300 hover:bg-[#1a1813] hover:border-amber-500/50"
                >
                  <Globe size={14} className="flex-shrink-0" />
                  <span className="hidden sm:inline">{currentLang}</span>
                </button>
                
                {isMobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-[#111109]/95 backdrop-blur-md border border-[#1e1a12]/50 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition-all duration-200 ${
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

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-[#9a9080] hover:text-white bg-[#111109]/80 border border-[#1e1a12]/50 rounded-md transition-all duration-300 hover:bg-[#1a1813] hover:border-amber-500/50"
                >
                  <User size={14} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#111109]/95 backdrop-blur-md border border-[#1e1a12]/50 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      <Link
                        to="/login"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-[#9a9080] hover:text-white hover:bg-[#1a1813] transition-all duration-200"
                      >
                        <LogIn size={14} />
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-[#9a9080] hover:text-white hover:bg-[#1a1813] transition-all duration-200"
                      >
                        <User size={14} />
                        Create Account
                      </Link>
                      <div className="border-t border-[#1e1a12]/50 my-2"></div>
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-[#9a9080] hover:text-white hover:bg-[#1a1813] transition-all duration-200"
                      >
                        <Settings size={14} />
                        Settings
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-[#9a9080] hover:text-white transition-colors p-2 rounded-md hover:bg-[#1a1813]"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-[#1e1a12]/50 py-4">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-colors px-3 py-2 ${
                      location.pathname === item.path
                        ? 'text-amber-500 bg-amber-500/10'
                        : 'text-[#9a9080] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-3 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pt-20 sm:pt-24">
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
            className="flex justify-center mb-8 sm:mb-12"
          >
            <div className="relative group">
              <img 
                src="/logo.png" 
                alt="UNA TANTUM VOCE Logo" 
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-cover rounded-full border-4 border-amber-500/20 shadow-xl sm:shadow-2xl transition-all duration-300 group-hover:border-amber-500/40 group-hover:shadow-3xl"
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

          {/* Main Title with Typewriter Animation */}
          <div className="space-y-2 sm:space-y-4">
            <TypewriterText 
              text="UNA TANTUM VOCE" 
              className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-white leading-tight font-serif tracking-tight"
              delay={0.5}
            />
            <TypewriterText 
              text="music development for all" 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-amber-500 font-light tracking-wide leading-relaxed"
              delay={1.5}
              speed={50}
            />
          </div>
          
          {/* Call to action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/discover" className="px-8 py-4 bg-amber-500 text-[#09090b] text-lg font-bold tracking-wider hover:bg-amber-400 transition-all transform hover:scale-105 rounded-sm">
              {t('hero.cta.discover', 'DISCOVER MUSIC')}
            </Link>
            <Link to="/library" className="px-8 py-4 border border-[#2a2515] text-[#9a9080] text-lg font-medium tracking-wider hover:text-white hover:border-[#4a3a1a] transition-all rounded-sm">
              {t('hero.cta.explore', 'EXPLORE LIBRARY')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
    </section>
  );
}
