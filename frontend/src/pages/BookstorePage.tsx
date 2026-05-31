import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { booksApi } from "@/services/books";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Search } from "lucide-react";
import type { Book } from "@/types";

export function BookstorePage() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { size: 24 };
        if (search) params.search = search;
        if (genre) params.genre = genre;
        const data = await booksApi.list(params);
        setBooks(data.items);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [search, genre]);

  const genres = ["", "philosophy", "theology", "music theory", "biography", "general"];

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-4xl text-utv-cream mb-8">{t("books.title")}</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-utv-body" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search")}
              className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-4 py-2 text-sm text-utv-cream placeholder:text-utv-body/50 focus:outline-none focus:border-utv-gold"
            />
          </div>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="bg-utv-bg-light border border-utv-border rounded-lg px-4 py-2 text-sm text-utv-cream"
          >
            <option value="">All Genres</option>
            {genres.slice(1).map((g) => (
              <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-utv-bg-light rounded-xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden hover:border-utv-gold/50 transition-all"
              >
                <Link to={`/books/${book.id}`}>
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/books/${book.id}`}>
                    <h3 className="font-display text-utv-cream font-semibold group-hover:text-utv-gold transition-colors truncate">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-utv-body mt-0.5">{book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-utv-border rounded text-utv-body">{book.language}</span>
                    <span className="text-xs px-2 py-0.5 bg-utv-border rounded text-utv-body">{book.pages}p</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-medium text-utv-gold">${book.price}</span>
                    <button
                      onClick={() =>
                        addItem({
                          item_type: "book",
                          item_id: book.id,
                          quantity: 1,
                          title: book.title,
                          price: parseFloat(book.price) || 0,
                          image: book.cover_url,
                        })
                      }
                      className="p-2 rounded-full bg-utv-border hover:bg-utv-gold hover:text-utv-bg text-utv-body transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
