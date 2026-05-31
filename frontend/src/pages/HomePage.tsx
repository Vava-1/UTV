import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Play, BookOpen, Calendar, Globe, Users, Headphones, ChevronRight } from "lucide-react";
import { MusicCard } from "@/components/music/MusicCard";
import { musicApi } from "@/services/music";
import { eventsApi } from "@/services/orders";
import { booksApi } from "@/services/books";
import type { Music, Event, Book } from "@/types";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const timer = setInterval(() => {
        setCount((prev) => {
          if (prev >= target) {
            clearInterval(timer);
            return target;
          }
          return prev + Math.ceil(target / 50);
        });
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function HomePage() {
  const { t } = useTranslation();
  const [featuredMusic, setFeaturedMusic] = useState<Music[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [music, events, books] = await Promise.all([
          musicApi.featured().catch(() => []),
          eventsApi.list({ size: 3 }).catch(() => ({ items: [] })),
          booksApi.list({ is_featured: true, size: 4 }).catch(() => ({ items: [] })),
        ]);
        setFeaturedMusic(music.slice(0, 6));
        setUpcomingEvents(events.items);
        setFeaturedBooks(books.items);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-utv-bg via-utv-bg to-utv-bg-light" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1920')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-utv-bg via-transparent to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-utv-cream mb-6 tracking-tight">
              {t("hero.tagline")}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg sm:text-xl text-utv-body mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/music"
              className="inline-flex items-center justify-center gap-2 bg-utv-gold text-utv-bg px-8 py-4 rounded-lg font-semibold hover:bg-utv-gold/90 transition-colors"
            >
              <Play className="w-5 h-5" />
              {t("hero.ctaMusic")}
            </Link>
            <Link
              to="/books"
              className="inline-flex items-center justify-center gap-2 border border-utv-border-light text-utv-cream px-8 py-4 rounded-lg font-semibold hover:bg-utv-border transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              {t("hero.ctaBooks")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 border-y border-utv-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Headphones, value: 500, suffix: "+", label: "Tracks" },
              { icon: BookOpen, value: 200, suffix: "+", label: "Books" },
              { icon: Globe, value: 8, suffix: "", label: "Languages" },
              { icon: Users, value: 50, suffix: "+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-6 h-6 text-utv-gold mx-auto mb-2" />
                <div className="text-3xl font-display font-bold text-utv-cream">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-utv-body mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Music */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl text-utv-cream">Featured Music</h2>
            <Link to="/music" className="text-utv-gold hover:underline text-sm flex items-center gap-1">
              {t("common.viewAll")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredMusic.map((m, i) => (
              <MusicCard key={m.id} music={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-utv-bg-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl text-utv-cream">Upcoming Events</h2>
            <Link to="/events" className="text-utv-gold hover:underline text-sm flex items-center gap-1">
              {t("common.viewAll")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group bg-utv-bg border border-utv-border rounded-xl overflow-hidden hover:border-utv-gold/50 transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.cover_url || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-utv-gold font-medium">
                    {new Date(event.start_datetime).toLocaleDateString()}
                  </p>
                  <h3 className="font-display text-utv-cream font-semibold mt-1 group-hover:text-utv-gold transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-utv-body mt-1">{event.venue}, {event.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl text-utv-cream">Featured Books</h2>
            <Link to="/books" className="text-utv-gold hover:underline text-sm flex items-center gap-1">
              {t("common.viewAll")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="group bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden hover:border-utv-gold/50 transition-all"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-utv-cream font-semibold group-hover:text-utv-gold transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-utv-body mt-0.5">{book.author}</p>
                  <p className="text-sm font-medium text-utv-gold mt-2">
                    ${book.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About/Mission */}
      <section className="py-20 bg-utv-bg-light">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl text-utv-cream mb-4">Our Mission</h2>
          <p className="text-utv-body leading-relaxed text-lg">
            Una Tantum Voce bridges the gap between classical heritage and modern digital culture.
            We believe in the transformative power of music and ideas to unite people across cultures
            and generations. Our platform makes high-quality classical and gospel content accessible
            to audiences worldwide in 8 languages.
          </p>
        </div>
      </section>
    </div>
  );
}
