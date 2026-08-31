import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { ToastProvider } from '@/components/Toast';
import { Layout } from '@/components/Layout';

// Route-level code splitting — each page loads on demand, shrinking the
// initial bundle and improving first-load performance.
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const MusicPage = lazy(() => import('@/pages/Music').then((m) => ({ default: m.MusicPage })));
const BooksPage = lazy(() => import('@/pages/Books').then((m) => ({ default: m.BooksPage })));
const VideosPage = lazy(() => import('@/pages/Videos').then((m) => ({ default: m.VideosPage })));
const ScoresPage = lazy(() => import('@/pages/Scores').then((m) => ({ default: m.ScoresPage })));
const ConcertsPage = lazy(() => import('@/pages/Concerts').then((m) => ({ default: m.ConcertsPage })));
const GalleryPage = lazy(() => import('@/pages/Gallery').then((m) => ({ default: m.GalleryPage })));
const LibraryPage = lazy(() => import('@/pages/Library').then((m) => ({ default: m.LibraryPage })));
const AboutPage = lazy(() => import('@/pages/About').then((m) => ({ default: m.AboutPage })));
const Contact = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.Contact })));
const LoginPage = lazy(() => import('@/pages/Login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/Register').then((m) => ({ default: m.RegisterPage })));
const AdminPage = lazy(() => import('@/pages/Admin').then((m) => ({ default: m.AdminPage })));
const OrdersPage = lazy(() => import('@/pages/Orders').then((m) => ({ default: m.OrdersPage })));
const TicketsPage = lazy(() => import('@/pages/Tickets').then((m) => ({ default: m.TicketsPage })));
const DiscoverPage = lazy(() => import('@/pages/Discover').then((m) => ({ default: m.DiscoverPage })));
const CartPage = lazy(() => import('@/pages/Cart').then((m) => ({ default: m.CartPage })));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccess').then((m) => ({ default: m.OrderSuccessPage })));
const UnsubscribePage = lazy(() => import('@/pages/Unsubscribe').then((m) => ({ default: m.UnsubscribePage })));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-blue-800">
      <span className="sr-only">Loading</span>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="music" element={<MusicPage />} />
                <Route path="books" element={<BooksPage />} />
                <Route path="videos" element={<VideosPage />} />
                <Route path="scores" element={<ScoresPage />} />
                <Route path="concerts" element={<ConcertsPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="contact" element={<Contact />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="tickets" element={<TicketsPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="orders/success" element={<OrderSuccessPage />} />
                <Route path="unsubscribe" element={<UnsubscribePage />} />
                <Route path="admin-secure-portal" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </AudioPlayerProvider>
    </AuthProvider>
  );
}

export default App;
