from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# ============== USER SCHEMAS ==============

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = None


class UserRead(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


# ============== CONTENT CATEGORY SCHEMAS ==============

class ContentCategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0


class ContentCategoryCreate(ContentCategoryBase):
    pass


class ContentCategoryRead(ContentCategoryBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============== CONTENT SCHEMAS ==============

class ContentBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    content_type: str
    category_id: Optional[int] = None
    cover_image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: bool = True
    is_featured: bool = False


class MusicFields(BaseModel):
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    genre: Optional[str] = None


class VideoFields(BaseModel):
    video_url: Optional[str] = None  # Direct URL or YouTube/Vimeo URL
    platform: Optional[str] = None  # youtube, vimeo, direct
    youtube_id: Optional[str] = None  # YouTube video ID (auto-extracted if not set)
    duration_seconds: Optional[int] = None


class BookFields(BaseModel):
    pdf_url: Optional[str] = None
    file_size: Optional[int] = None
    pages: Optional[int] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    isbn: Optional[str] = None
    language: Optional[str] = None
    price: Optional[Decimal] = None
    stock_quantity: int = 0
    is_downloadable: bool = False


class ConcertFields(BaseModel):
    venue: Optional[str] = None
    venue_address: Optional[str] = None
    event_date: Optional[datetime] = None
    event_end_date: Optional[datetime] = None
    ticket_price: Optional[Decimal] = None
    total_tickets: Optional[int] = None
    available_tickets: Optional[int] = None


class GalleryFields(BaseModel):
    image_urls: Optional[List[str]] = None


class ContentCreate(ContentBase):
    music_fields: Optional[MusicFields] = None
    video_fields: Optional[VideoFields] = None
    book_fields: Optional[BookFields] = None
    concert_fields: Optional[ConcertFields] = None
    gallery_fields: Optional[GalleryFields] = None
    # Allow flat video fields (for convenience — admin frontend sends these at top level)
    video_url: Optional[str] = None
    platform: Optional[str] = None
    youtube_id: Optional[str] = None
    duration_seconds: Optional[int] = None
    # Allow flat audio fields (for convenience)
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    genre: Optional[str] = None
    # Allow flat book fields (for convenience)
    pdf_url: Optional[str] = None
    author: Optional[str] = None
    price: Optional[Decimal] = None
    is_downloadable: Optional[bool] = None
    # Allow flat concert fields (for convenience)
    venue: Optional[str] = None
    event_date: Optional[datetime] = None
    ticket_price: Optional[Decimal] = None
    total_tickets: Optional[int] = None
    available_tickets: Optional[int] = None


class ContentRead(ContentBase):
    id: int
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    genre: Optional[str] = None
    video_url: Optional[str] = None
    platform: Optional[str] = None
    youtube_id: Optional[str] = None
    duration_seconds: Optional[int] = None
    pdf_url: Optional[str] = None
    file_size: Optional[int] = None
    pages: Optional[int] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    isbn: Optional[str] = None
    language: Optional[str] = None
    price: Optional[Decimal] = None
    currency: str = "USD"
    stock_quantity: int = 0
    is_downloadable: bool = False
    download_count: int = 0
    venue: Optional[str] = None
    venue_address: Optional[str] = None
    event_date: Optional[datetime] = None
    event_end_date: Optional[datetime] = None
    ticket_price: Optional[Decimal] = None
    total_tickets: Optional[int] = None
    available_tickets: Optional[int] = None
    image_urls: Optional[List[str]] = None
    view_count: int = 0
    meta_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[ContentCategoryRead] = None

    class Config:
        from_attributes = True


class ContentUpdate(BaseModel):
    """Full content update schema — supports all type-specific fields"""
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    cover_image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None

    # Music fields
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    genre: Optional[str] = None

    # Video fields
    video_url: Optional[str] = None
    platform: Optional[str] = None
    youtube_id: Optional[str] = None
    duration_seconds: Optional[int] = None

    # Book / Score fields
    pdf_url: Optional[str] = None
    file_size: Optional[int] = None
    pages: Optional[int] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    isbn: Optional[str] = None
    language: Optional[str] = None
    price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    is_downloadable: Optional[bool] = None

    # Concert fields
    venue: Optional[str] = None
    venue_address: Optional[str] = None
    event_date: Optional[datetime] = None
    event_end_date: Optional[datetime] = None
    ticket_price: Optional[Decimal] = None
    total_tickets: Optional[int] = None
    available_tickets: Optional[int] = None

    # Gallery fields
    image_urls: Optional[List[str]] = None


class ContentListResponse(BaseModel):
    items: List[ContentRead]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============== ORDER SCHEMAS ==============

class OrderItemCreate(BaseModel):
    content_id: int
    quantity: int = Field(default=1, gt=0, description="Quantity must be greater than 0")


class OrderItemRead(BaseModel):
    id: int
    content_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    download_url: Optional[str] = None
    content: Optional[ContentRead] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None


class OrderRead(BaseModel):
    id: int
    user_id: int
    total_amount: Decimal
    currency: str
    status: str
    customer_email: str
    customer_name: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    items: List[OrderItemRead]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


# ============== TICKET SCHEMAS ==============

class TicketCreate(BaseModel):
    concert_id: int
    quantity: int = Field(default=1, gt=0, description="Quantity must be greater than 0")
    seat_info: Optional[str] = None


class TicketRead(BaseModel):
    id: int
    ticket_number: str
    concert_id: int
    seat_info: Optional[str] = None
    price_paid: Decimal
    status: str
    checked_in: bool
    checked_in_at: Optional[datetime] = None
    purchased_at: datetime

    class Config:
        from_attributes = True


# ============== CART SCHEMAS ==============

class CartItemCreate(BaseModel):
    content_id: int
    quantity: int = Field(default=1, gt=0, description="Quantity must be greater than 0")


class CartItemRead(BaseModel):
    id: int
    content_id: int
    content: Optional[ContentRead] = None
    quantity: int
    added_at: datetime

    class Config:
        from_attributes = True


# ============== NEWSLETTER SCHEMAS ==============

class NewsletterSubscriberCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    language: str = "en"


class NewsletterSubscriberRead(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    language: str
    is_active: bool
    confirmed: bool
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NewsletterSendRequest(BaseModel):
    subject: str
    body_html: str
    body_text: Optional[str] = None


# ============== CHAT SCHEMAS ==============

class ChatMessage(BaseModel):
    role: str  # user, assistant
    message: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: Optional[List[str]] = None


# ============== ANALYTICS SCHEMAS ==============

class AnalyticsSummary(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: Decimal
    total_tickets_sold: int
    total_downloads: int
    recent_orders: List[OrderRead]
    popular_content: List[ContentRead]


# ============== GENERIC ==============

class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
