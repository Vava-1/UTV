import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MusicCard } from "@/components/music/MusicCard";
import { musicApi } from "@/services/music";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Music } from "@/types";

const genres = ["all", "classical", "gospel", "sacred", "choral", "liturgical", "contemporary"];

export function MusicLibraryPage() {
  const { t } = useTranslation();
  const [music, setMusic] = useState<Music[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFree, setIsFree] = useState<boolean | undefined>();
  const [sortBy, setSortBy] = useState("created_at");
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { page, size: 12, sort_by: sortBy };
        if (selectedGenre !== "all") params.genre = selectedGenre;
        if (debouncedSearch) params.search = debouncedSearch;
        if (isFree !== undefined) params.is_free = isFree;

        const data = await musicApi.list(params);
        setMusic(page === 1 ? data.items : [...music, ...data.items]);
        setTotalPages(data.pages);
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedGenre, debouncedSearch, isFree, sortBy]);

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-4xl text-utv-cream mb-8">{t("music.title")}</h1>

        {/* Filters */}
        <div className="sticky top-16 z-30 bg-utv-bg/95 backdrop-blur-md py-4 mb-6 border-b border-utv-border">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-utv-body" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder={t("common.search")}
                className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-4 py-2 text-sm text-utv-cream placeholder:text-utv-body/50 focus:outline-none focus:border-utv-gold"
              />
            </div>

            {/* Genre Chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => { setSelectedGenre(g); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedGenre === g
                      ? "bg-utv-gold text-utv-bg"
                      : "bg-utv-border text-utv-body hover:text-utv-cream"
                  }`}
                >
                  {g === "all" ? "All" : t(`music.genres.${g}`)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-utv-bg-light border border-utv-border rounded-lg px-3 py-2 text-sm text-utv-cream focus:outline-none focus:border-utv-gold"
            >
              <option value="created_at">Newest</option>
              <option value="play_count">Most Played</option>
              <option value="likes_count">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {isLoading && music.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-utv-bg-light rounded-xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {music.map((m, i) => (
                <MusicCard key={m.id} music={m} index={i % 12} />
              ))}
            </div>

            {page < totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={isLoading}
                  className="bg-utv-border text-utv-cream px-6 py-3 rounded-lg hover:bg-utv-border-light transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
