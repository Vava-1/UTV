import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Plus, Pencil, Trash2, Video } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  duration_seconds: number;
  is_free: boolean;
  price: string;
  view_count: number;
  is_published: boolean;
  thumbnail_url: string | null;
}

export function AdminVideosPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    api.get("/videos/?size=50").then((r) => setVideos(r.data.items || [])).catch(() => {});
  }, [isAdmin, navigate]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-utv-cream">Videos</h1>
        <button className="flex items-center gap-2 bg-utv-gold text-utv-bg px-4 py-2 rounded-lg text-sm font-medium hover:bg-utv-gold/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>
      <div className="bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-utv-border text-left text-utv-body bg-utv-bg">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Duration</th>
              <th className="p-4 font-medium">Views</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-b border-utv-border/50 hover:bg-utv-border/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-utv-border flex items-center justify-center">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover rounded" />
                      ) : (
                        <Video className="w-5 h-5 text-utv-body" />
                      )}
                    </div>
                    <span className="text-utv-cream">{video.title}</span>
                  </div>
                </td>
                <td className="p-4 text-utv-body">{Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, "0")}</td>
                <td className="p-4 text-utv-body">{video.view_count}</td>
                <td className="p-4 text-utv-gold">{video.is_free ? "Free" : `$${video.price}`}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-utv-gold hover:bg-utv-gold/10 rounded transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
