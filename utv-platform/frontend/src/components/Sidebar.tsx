import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Info,
  Music,
  BookOpen,
  Video,
  FileText,
  Calendar,
  Image,
  Library,
  ChevronDown,
  Globe,
  User,
  LogIn,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "nav.home" },
  { path: "/about", icon: Info, label: "nav.about" },
  { path: "/music", icon: Music, label: "nav.music" },
  { path: "/books", icon: BookOpen, label: "nav.books" },
  { path: "/videos", icon: Video, label: "nav.videos" },
  { path: "/scores", icon: FileText, label: "nav.scores" },
  { path: "/concerts", icon: Calendar, label: "nav.concerts" },
  { path: "/gallery", icon: Image, label: "nav.gallery" },
  { path: "/library", icon: Library, label: "nav.library" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "sw", name: "Kiswahili" },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const currentLang =
    languages.find((l) => l.code === i18n.language)?.name || "English";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden w-9 h-9 bg-[#0f0e0c] border border-[#2a2515] rounded flex items-center justify-center text-amber-500"
      >
        {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobileOpen ? 0 : "-100%",
          opacity: isMobileOpen ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-60 bg-[#09090b] border-r border-[#1e1a12] z-[55] flex flex-col lg:translate-x-0 lg:opacity-100"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#1e1a12]">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="w-9 h-9 bg-amber-500 flex items-center justify-center rounded-sm flex-shrink-0">
              <Music className="text-[#09090b]" size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-widest font-serif leading-none">
                UTV
              </h1>
              <p className="text-[9px] text-amber-500/70 tracking-[0.2em] uppercase mt-0.5">
                Una Tantum Voce
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all border-l-2 ${
                  active
                    ? "border-amber-500 bg-amber-500/8 text-amber-400"
                    : "border-transparent text-[#6a6055] hover:text-[#c8c0b0] hover:bg-[#1a1813]"
                }`}
              >
                <item.icon size={16} />
                <span className="text-[13px] font-medium tracking-wide">
                  {t(item.label)}
                </span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin-secure-portal"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all border-l-2 mt-4 ${
                location.pathname.startsWith("/admin")
                  ? "border-red-500 bg-red-500/8 text-red-400"
                  : "border-transparent text-[#6a6055] hover:text-red-400 hover:bg-[#1a1813]"
              }`}
            >
              <Shield size={16} />
              <span className="text-[13px] font-medium tracking-wide">
                {t("nav.admin")}
              </span>
            </Link>
          )}
        </nav>

        {/* Bottom: language + user */}
        <div className="p-3 border-t border-[#1e1a12] space-y-2">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#6a6055] hover:text-[#c8c0b0] bg-[#111109] rounded-sm border border-[#1e1a12] transition-colors"
            >
              <Globe size={14} />
              <span>{currentLang}</span>
              <ChevronDown
                size={12}
                className={`ml-auto transition-transform ${isLangOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-[#111109] border border-[#2a2515] rounded-sm overflow-hidden shadow-xl z-10"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-2 text-left text-[12px] transition-colors ${
                        i18n.language === lang.code
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-[#9a9080] hover:bg-[#1a1813] hover:text-[#c8c0b0]"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User / Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 w-full px-3 py-2 bg-[#111109] border border-[#1e1a12] rounded-sm hover:border-[#2a2515] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-amber-500" />
                </div>
                <span className="text-[12px] text-[#c8c0b0] truncate">
                  {user?.first_name || user?.email}
                </span>
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 right-0 mb-1 bg-[#111109] border border-[#2a2515] rounded-sm overflow-hidden shadow-xl"
                  >
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] text-red-400 hover:bg-[#1a1813] transition-colors"
                    >
                      <LogOut size={13} />
                      {t("nav.logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-amber-500 text-[#09090b] rounded-sm hover:bg-amber-400 transition-colors text-[12px] font-bold tracking-wide"
            >
              <LogIn size={14} />
              {t("nav.login")}
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-[54] lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
