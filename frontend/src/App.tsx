import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { AIAssistantWidget } from "@/components/ai/AIAssistantWidget";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { HomePage } from "@/pages/HomePage";
import { MusicLibraryPage } from "@/pages/MusicLibraryPage";
import { BookstorePage } from "@/pages/BookstorePage";
import { EventsPage } from "@/pages/EventsPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutSuccessPage } from "@/pages/CheckoutSuccessPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";
import { AdminMusicPage } from "@/pages/AdminMusicPage";
import { AdminBooksPage } from "@/pages/AdminBooksPage";
import { AdminScoresPage } from "@/pages/AdminScoresPage";
import { AdminVideosPage } from "@/pages/AdminVideosPage";
import { AdminEventsPage } from "@/pages/AdminEventsPage";
import { AdminOrdersPage } from "@/pages/AdminOrdersPage";
import { AdminTicketsPage } from "@/pages/AdminTicketsPage";
import { AdminAnalyticsPage } from "@/pages/AdminAnalyticsPage";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Users, Music, BookOpen, FileMusic, Video, Calendar, ShoppingCart, Ticket, BarChart3, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin-secure-portal", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin-secure-portal/users", icon: Users, label: "Users" },
    { href: "/admin-secure-portal/music", icon: Music, label: "Music" },
    { href: "/admin-secure-portal/books", icon: BookOpen, label: "Books" },
    { href: "/admin-secure-portal/scores", icon: FileMusic, label: "Scores" },
    { href: "/admin-secure-portal/videos", icon: Video, label: "Videos" },
    { href: "/admin-secure-portal/events", icon: Calendar, label: "Events" },
    { href: "/admin-secure-portal/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin-secure-portal/tickets", icon: Ticket, label: "Tickets" },
    { href: "/admin-secure-portal/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-utv-bg-light border-r border-utv-border fixed left-0 top-16 bottom-0 overflow-y-auto hidden md:block">
        <div className="p-4">
          <p className="text-xs font-semibold text-utv-body uppercase tracking-wider mb-3 px-3">Admin Portal</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  location.pathname === item.href
                    ? "bg-utv-gold/10 text-utv-gold"
                    : "text-utv-body hover:text-utv-cream hover:bg-utv-border"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6">
        <Routes>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="music" element={<AdminMusicPage />} />
          <Route path="books" element={<AdminBooksPage />} />
          <Route path="scores" element={<AdminScoresPage />} />
          <Route path="videos" element={<AdminVideosPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-utv-bg">
      <Navbar />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Routes>
        <Route path="/" element={<><HomePage /><Footer /></>} />
        <Route path="/music" element={<><MusicLibraryPage /><Footer /></>} />
        <Route path="/books" element={<><BookstorePage /><Footer /></>} />
        <Route path="/events" element={<><EventsPage /><Footer /></>} />
        <Route path="/cart" element={<><CartPage /><Footer /></>} />
        <Route path="/checkout/success" element={<><CheckoutSuccessPage /><Footer /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<><ProfilePage /><Footer /></>} />
        <Route path="/admin-secure-portal/*" element={<AdminLayout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <MusicPlayer />
      <AIAssistantWidget />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A2540",
            color: "#F0EBE0",
            border: "1px solid #2A3550",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </CartProvider>
    </AuthProvider>
  );
}
