import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { MusicPage } from '@/pages/Music';
import { BooksPage } from '@/pages/Books';
import { VideosPage } from '@/pages/Videos';
import { ScoresPage } from '@/pages/Scores';
import { ConcertsPage } from '@/pages/Concerts';
import { GalleryPage } from '@/pages/Gallery';
import { LibraryPage } from '@/pages/Library';
import { AboutPage } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { LoginPage } from '@/pages/Login';
import { AdminPage } from '@/pages/Admin';
import { OrdersPage } from '@/pages/Orders';
import { TicketsPage } from '@/pages/Tickets';

function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="music" element={<MusicPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="scores" element={<ScoresPage />} />
            <Route path="concerts" element={<ConcertsPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="admin-secure-portal" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </AudioPlayerProvider>
    </AuthProvider>
  );
}

export default App;
