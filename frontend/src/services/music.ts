import { api } from "./api";
import type { Music, PaginatedResponse } from "@/types";

export const musicApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    genre?: string;
    search?: string;
    is_free?: boolean;
    sort_by?: string;
  }): Promise<PaginatedResponse<Music>> => {
    const { data } = await api.get("/music/", { params });
    return data;
  },

  get: async (id: string): Promise<Music> => {
    const { data } = await api.get(`/music/${id}`);
    return data;
  },

  featured: async (): Promise<Music[]> => {
    const { data } = await api.get("/music/featured/list");
    return data;
  },

  stream: async (id: string): Promise<{ stream_url: string }> => {
    const { data } = await api.get(`/music/${id}/stream`);
    return data;
  },

  like: async (id: string): Promise<{ liked: boolean; count: number }> => {
    const { data } = await api.post(`/music/${id}/like`);
    return data;
  },
};
