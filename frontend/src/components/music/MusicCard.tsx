import { memo } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import type { Music } from "@/types";
import { usePlayer } from "@/hooks/usePlayer";
import { useCart } from "@/hooks/useCart";

interface Props {
  music: Music;
  index?: number;
}

export const MusicCard = memo(function MusicCard({ music, index = 0 }: Props) {
  const { play, currentTrack, isPlaying } = usePlayer();
  const { addItem } = useCart();

  const isCurrent = currentTrack?.id === music.id;
  const formattedDuration = music.duration_seconds
    ? `${Math.floor(music.duration_seconds / 60)}:${String(music.duration_seconds % 60).padStart(2, "0")}`
    : "0:00";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden hover:border-utv-gold/50 transition-all duration-300"
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={music.cover_url || "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400"}
          alt={music.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-utv-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Button */}
        <button
          onClick={() => play(music)}
          className="absolute bottom-3 right-3 w-10 h-10 bg-utv-gold rounded-full flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          <Play className="w-5 h-5 text-utv-bg fill-utv-bg" />
        </button>

        {/* Playing indicator */}
        {isCurrent && isPlaying && (
          <div className="absolute top-3 left-3 flex items-center gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className="w-1 bg-utv-gold rounded-full animate-waveform"
                style={{
                  height: "16px",
                  animationDelay: `${bar * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <Link to={`/music/${music.id}`}>
          <h3 className="font-display text-utv-cream font-semibold text-sm truncate hover:text-utv-gold transition-colors">
            {music.title}
          </h3>
        </Link>
        <p className="text-xs text-utv-body mt-0.5 truncate">{music.composer}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-xs text-utv-body">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDuration}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-utv-gold">
              {music.is_free ? "Free" : `$${music.price}`}
            </span>
            {!music.is_free && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addItem({
                    item_type: "music",
                    item_id: music.id,
                    quantity: 1,
                    title: music.title,
                    price: parseFloat(music.price) || 0,
                    image: music.cover_url,
                  });
                }}
                className="p-1.5 rounded-full bg-utv-border hover:bg-utv-gold hover:text-utv-bg text-utv-body transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            )}
            <button className="p-1.5 rounded-full bg-utv-border hover:bg-utv-gold hover:text-utv-bg text-utv-body transition-colors">
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
