import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UTVLogo } from './UTVLogo';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogIn, User } from 'lucide-react';

const navItems = [
  { path: '/discover', label: 'Discover' },
  { path: '/books', label: 'Books' },
  { path: '/concerts', label: 'Concerts' },
  { path: '/artists', label: 'Artists' },
  { path: '/library', label: 'Library' },
];

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-sm border-b border-[#1e1a12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <UTVLogo size="default" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest font-serif leading-none">
                UTV CLASSICAL
              </h1>
              <p className="text-xs text-amber-500 tracking-[0.2em] uppercase mt-0.5">
                GOSPEL
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
