import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Content } from "@/types";
import api from "@/utils/api";
import {
  Play,
  BookOpen,
  Music,
  Video,
  FileText,
  Calendar,
  Headphones,
  ChevronRight,
} from "lucide-react";

export function Home() {
  const { t } = useTranslation();
  const { setQueue } = useAudioPlayer();
  const [featured, setFeatured] = useState<Content[]>([]);
  const [recentMusic, setRecentMusic] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, mRes] = await Promise.all([
          api.get("/contents/featured"),
          api.get("/contents?content_type=music&page_size=6"),
        ]);
        setFeatured(fRes.data);
        setRecentMusic(mRes.data.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const playAll = () => {
    if (!recentMusic.length) return;
    setQueue(
      recentMusic.map((m) => ({
        id: m.id,
        title: m.title,
        artist: m.artist || "Unknown",
        album: m.album,
        audio_url: m.audio_url,
        cover_image_url: m.cover_image_url,
        duration: m.duration || 0,
      })),
      0,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-sm"
        style={{ minHeight: 480 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-[#09090b]/80" />
        <div className="absolute inset-0 border border-[#2a2515]" />

        <div className="relative px-10 py-20 md:py-28 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amber-500/30 bg-amber-500/8 mb-8">
              <Headphones size={13} className="text-amber-500" />
              <span className="text-[11px] text-amber-400 tracking-[0.2em] uppercase">
                Classical & Gospel Music Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.05] font-serif">
              {t("home.hero")}
            </h1>
            <p className="text-base text-[#6a6055] mb-10 leading-relaxed max-w-lg mx-auto">
              {t("home.subtitle")}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link
                to="/music"
                className="flex items-center gap-2 px-7 py-3 bg-amber-500 text-[#09090b] text-[13px] font-bold tracking-wider hover:bg-amber-400 transition-colors rounded-sm"
              >
                <Play size={15} />
                {t("home.discover")}
              </Link>
              <Link
                to="/library"
                className="flex items-center gap-2 px-7 py-3 border border-[#2a2515] text-[#9a9080] text-[13px] tracking-wider hover:text-white hover:border-[#4a3a1a] transition-colors rounded-sm"
              >
                {t("home.explore")}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-[#1e1a12] grid grid-cols-3 divide-x divide-[#1e1a12]">
          {[
            { num: "12K+", label: "Tracks" },
            { num: "480+", label: "Artists" },
            { num: "200+", label: "Concerts" },
          ].map((s) => (
            <div key={s.label} className="py-5 text-center">
              <div className="text-xl font-bold text-amber-500 font-serif">
                {s.num}
              </div>
              <div className="text-[10px] text-[#4a3a1a] tracking-[0.2em] uppercase mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white tracking-wide font-serif">
              Featured
            </h2>
            <Link
              to="/music"
              className="flex items-center gap-1 text-[12px] text-[#6a6055] hover:text-amber-500 transition-colors"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <ContentCard content={item} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recent music */}
      {recentMusic.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Music size={18} className="text-amber-500" />
              <h2 className="text-lg font-bold text-white tracking-wide font-serif">
                {t("music.title")}
              </h2>
            </div>
            <button
              onClick={playAll}
              className="flex items-center gap-1.5 text-[12px] text-amber-500 hover:text-amber-400 transition-colors border border-amber-500/30 px-3 py-1.5 rounded-sm hover:border-amber-500/60"
            >
              <Play size={13} /> Play All
            </button>
          </div>
          <div className="border border-[#1e1a12] overflow-hidden rounded-sm">
            {recentMusic.map((track, i) => (
              <MusicRow
                key={track.id}
                track={track}
                index={i}
                allTracks={recentMusic}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick nav */}
      <section>
        <h2 className="text-lg font-bold text-white tracking-wide font-serif mb-5">
          Browse
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: BookOpen,
              label: "Books",
              path: "/books",
              color: "text-emerald-400",
              border: "border-emerald-500/20 hover:border-emerald-500/50",
            },
            {
              icon: Video,
              label: "Videos",
              path: "/videos",
              color: "text-blue-400",
              border: "border-blue-500/20 hover:border-blue-500/50",
            },
            {
              icon: FileText,
              label: "Scores",
              path: "/scores",
              color: "text-purple-400",
              border: "border-purple-500/20 hover:border-purple-500/50",
            },
            {
              icon: Calendar,
              label: "Concerts",
              path: "/concerts",
              color: "text-rose-400",
              border: "border-rose-500/20 hover:border-rose-500/50",
            },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-3 p-6 bg-[#0f0e0c] border ${item.border} rounded-sm transition-colors group`}
            >
              <item.icon
                size={22}
                className={`${item.color} group-hover:scale-110 transition-transform`}
              />
              <span className="text-[12px] tracking-wider uppercase text-[#6a6055] group-hover:text-[#c8c0b0] transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContentCard({ content }: { content: Content }) {
  return (
    <Link
      to={`/${content.content_type}s/${content.id}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#111109] border border-[#1e1a12] mb-2.5 rounded-sm">
        <img
          src={content.cover_image_url || "/default-cover.jpg"}
          alt={content.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-[#09090b]/0 group-hover:bg-[#09090b]/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-10 h-10 bg-amber-500 flex items-center justify-center rounded-sm">
            <Play size={16} className="text-[#09090b] ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="text-[13px] font-medium text-[#c8c0b0] truncate group-hover:text-white transition-colors">
        {content.title}
      </h3>
      <p className="text-[11px] text-[#4a3a1a] truncate mt-0.5">
        {content.artist || content.author || content.description}
      </p>
    </Link>
  );
}

function MusicRow({
  track,
  index,
  allTracks,
}: {
  track: Content;
  index: number;
  allTracks: Content[];
}) {
  const { currentTrack, isPlaying, setQueue } = useAudioPlayer();
  const isCurrent = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isCurrent) return;
    setQueue(
      allTracks.map((m) => ({
        id: m.id,
        title: m.title,
        artist: m.artist || "Unknown",
        album: m.album,
        audio_url: m.audio_url,
        cover_image_url: m.cover_image_url,
        duration: m.duration || 0,
      })),
      index,
    );
  };

  return (
    <div
      onClick={handlePlay}
      className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors border-b border-[#1e1a12] last:border-b-0 ${
        isCurrent ? "bg-amber-500/8" : "hover:bg-[#111109]"
      }`}
    >
      <span
        className={`text-[12px] w-5 text-center tabular-nums ${isCurrent ? "text-amber-500" : "text-[#4a3a1a]"}`}
      >
        {isCurrent && isPlaying ? "▸" : index + 1}
      </span>
      <img
        src={track.cover_image_url || "/default-cover.jpg"}
        alt={track.title}
        className="w-9 h-9 object-cover rounded-sm border border-[#1e1a12]"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] font-medium truncate ${isCurrent ? "text-amber-500" : "text-[#c8c0b0]"}`}
        >
          {track.title}
        </p>
        <p className="text-[11px] text-[#4a3a1a] truncate">{track.artist}</p>
      </div>
      <span className="text-[11px] text-[#4a3a1a] tabular-nums">
        {track.duration
          ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}`
          : "--:--"}
      </span>
    </div>
  );
}
