/** UTV Platform TypeScript type definitions */

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: "user" | "admin" | "superadmin";
  is_active: boolean;
  is_verified: boolean;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Music {
  id: string;
  title: string;
  composer: string;
  performer: string | null;
  genre: string;
  duration_seconds: number;
  audio_url: string;
  cover_url: string | null;
  description: string | null;
  price: string;
  is_free: boolean;
  play_count: number;
  likes_count: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string;
  pdf_url: string | null;
  price: string;
  isbn: string | null;
  language: string;
  pages: number;
  genre: string;
  is_digital: boolean;
  is_physical: boolean;
  stock_quantity: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  title: string;
  composer: string;
  description: string | null;
  pdf_url: string;
  cover_url: string | null;
  price: string;
  difficulty: string;
  instrument: string;
  number_of_pages: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  is_free: boolean;
  price: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  address: string;
  city: string;
  country: string;
  start_datetime: string;
  end_datetime: string;
  cover_url: string | null;
  price: string;
  capacity: number;
  tickets_sold: number;
  tickets_available: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  ticket_code: string;
  qr_code_url: string | null;
  status: string;
  seat_info: string | null;
  used_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: string;
  currency: string;
  stripe_session_id: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  item_type: string;
  item_id: string;
  quantity: number;
  unit_price: string;
  watermarked_url: string | null;
  download_count: number;
  created_at: string;
}

export interface CartItem {
  item_type: "music" | "book" | "score" | "video" | "ticket";
  item_id: string;
  quantity: number;
  title: string;
  price: number;
  image: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type MusicGenre =
  | "classical"
  | "gospel"
  | "sacred"
  | "choral"
  | "liturgical"
  | "contemporary";

export type ScoreDifficulty = "beginner" | "intermediate" | "advanced" | "professional";
