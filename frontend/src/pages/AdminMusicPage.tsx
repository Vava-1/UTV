import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { musicApi } from "@/services/music";
import { Plus, Pencil, Trash2, Music as MusicIcon } from "lucide-react";
import type { Music } from "@/types";

export function AdminMusicPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Music[]>([]);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    musicApi.list({ size: 50 }).then((r) => setTracks(r.items)).catch(() => {});
  }, [isAdmin, navigate]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-utv-cream">Music</h1>
        <button className="flex items-center gap-2 bg-utv-gold text-utv-bg px-4 py-2 rounded-lg text-sm font-medium hover:bg-utv-gold/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Track
        </button>
      </div>

      <div className="bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-utv-border text-left text-utv-body bg-utv-bg">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Composer</th>
              <th className="p-4 font-medium">Genre</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Plays</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id} className="border-b border-utv-border/50 hover:bg-utv-border/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-utv-border flex items-center justify-center overflow-hidden">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MusicIcon className="w-5 h-5 text-utv-body" />
                      )}
                    </div>
                    <span className="text-utv-cream">{track.title}</span>
                  </div>
                </td>
                <td className="p-4 text-utv-body">{track.composer}</td>
                <td className="p-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-utv-border text-utv-body capitalize">
                    {track.genre}
                  </span>
                </td>
                <td className="p-4 text-utv-gold">{track.is_free ? "Free" : `$${track.price}`}</td>
                <td className="p-4 text-utv-body">{track.play_count}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-utv-gold hover:bg-utv-gold/10 rounded transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
