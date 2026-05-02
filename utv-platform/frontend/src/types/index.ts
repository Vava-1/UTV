export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ContentCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Content {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  content_type: string;
  category_id: number | null;
  cover_image_url: string | null;
  thumbnail_url: string | null;
  audio_url: string | null;
  duration: number | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  video_url: string | null;
  platform: string | null;
  pdf_url: string | null;
  file_size: number | null;
  pages: number | null;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  language: string | null;
  price: number | null;
  currency: string;
  stock_quantity: number;
  is_downloadable: boolean;
  download_count: number;
  venue: string | null;
  venue_address: string | null;
  event_date: string | null;
  event_end_date: string | null;
  ticket_price: number | null;
  total_tickets: number | null;
  available_tickets: number | null;
  image_urls: string[] | null;
  tags: string[] | null;
  metadata: Record<string, any> | null;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string | null;
  category?: ContentCategory;
}

export interface ContentListResponse {
  items: Content[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CartItem {
  id: number;
  content_id: number;
  content?: Content;
  quantity: number;
  added_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  currency: string;
  status: string;
  customer_email: string;
  customer_name: string | null;
  stripe_payment_intent_id: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string | null;
}

export interface OrderItem {
  id: number;
  content_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  download_url: string | null;
  content?: Content;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  concert_id: number;
  seat_info: string | null;
  price_paid: number;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  purchased_at: string;
}

export interface ChatMessage {
  role: string;
  message: string;
  created_at?: string;
  sources?: string[];
}

export interface ChatResponse {
  response: string;
  session_id: string;
  sources: string[] | null;
}

export interface AnalyticsSummary {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_tickets_sold: number;
  total_downloads: number;
  recent_orders: Order[];
  popular_content: Content[];
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  audio_url: string | null;
  cover_image_url: string | null;
  duration: number;
}
