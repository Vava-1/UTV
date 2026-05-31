import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ShoppingCart, User, Search, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";
  const showSolid = isScrolled || !isHome;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/music", label: t("nav.music") },
    { href: "/books", label: t("nav.books") },
    { href: "/events", label: t("nav.events") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolid
            ? "bg-utv-bg/95 backdrop-blur-md border-b border-utv-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-utv-gold flex items-center justify-center">
                <span className="text-utv-bg font-bold text-sm">U</span>
              </div>
              <span className="font-display text-lg font-bold text-utv-cream hidden sm:block">
                UNA TANTUM VOCE
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-utv-gold ${
                    location.pathname === link.href
                      ? "text-utv-gold"
                      : "text-utv-body"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-utv-body hover:text-utv-gold transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <LanguageSwitcher />

              {/* Cart */}
              <Link
                to="/cart"
                className="p-2 text-utv-body hover:text-utv-gold transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-utv-gold text-utv-bg text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-utv-border transition-colors">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-utv-border flex items-center justify-center">
                        <User className="w-4 h-4 text-utv-body" />
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-utv-bg-light border border-utv-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-utv-body hover:text-utv-gold hover:bg-utv-border transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {t("nav.profile")}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin-secure-portal"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-utv-body hover:text-utv-gold hover:bg-utv-border transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t("nav.admin")}
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-utv-border transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-utv-body hover:text-utv-gold transition-colors"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm bg-utv-gold text-utv-bg px-3 py-1.5 rounded-md font-medium hover:bg-utv-gold/90 transition-colors"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden p-2 text-utv-body hover:text-utv-gold transition-colors"
              >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-utv-border bg-utv-bg-light px-4 py-3">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.search")}
                className="w-full bg-utv-bg border border-utv-border rounded-lg px-4 py-2 text-utv-cream placeholder:text-utv-body/50 focus:outline-none focus:border-utv-gold"
                autoFocus
              />
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-utv-bg/98 backdrop-blur-lg md:hidden pt-16">
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-2xl font-display text-utv-cream hover:text-utv-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="text-lg text-utv-body hover:text-utv-gold transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileOpen(false)}
                  className="bg-utv-gold text-utv-bg px-6 py-2 rounded-lg font-medium"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
