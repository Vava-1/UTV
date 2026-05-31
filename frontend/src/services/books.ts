import { api } from "./api";
import type { Book, Score, PaginatedResponse } from "@/types";

export const booksApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    genre?: string;
    language?: string;
    is_featured?: boolean;
  }): Promise<PaginatedResponse<Book>> => {
    const { data } = await api.get("/books/", { params });
    return data;
  },

  get: async (id: string): Promise<Book> => {
    const { data } = await api.get(`/books/${id}`);
    return data;
  },

  download: async (id: string): Promise<{ download_url: string }> => {
    const { data } = await api.get(`/books/${id}/download`);
    return data;
  },
};

export const scoresApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    difficulty?: string;
    instrument?: string;
  }): Promise<PaginatedResponse<Score>> => {
    const { data } = await api.get("/scores/", { params });
    return data;
  },

  get: async (id: string): Promise<Score> => {
    const { data } = await api.get(`/scores/${id}`);
    return data;
  },

  download: async (id: string): Promise<{ download_url: string }> => {
    const { data } = await api.get(`/scores/${id}/download`);
    return data;
  },
};
