import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class ContentType(str, enum.Enum):
    MUSIC = "music"
    BOOK = "book"
    VIDEO = "video"
    SCORE = "score"
    CONCERT = "concert"
    GALLERY = "gallery"
    LIBRARY = "library"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class TicketStatus(str, enum.Enum):
    AVAILABLE = "available"
    SOLD = "sold"
    RESERVED = "reserved"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    stripe_customer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")


class ContentCategory(Base):
    __tablename__ = "content_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    contents = relationship("Content", back_populates="category")


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)
    category_id = Column(Integer, ForeignKey("content_categories.id"), nullable=True)
    
    # Media
    cover_image_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    
    # For music
    audio_url = Column(String(500), nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    artist = Column(String(200), nullable=True)
    album = Column(String(200), nullable=True)
    genre = Column(String(100), nullable=True)
    
    # For videos
    video_url = Column(String(500), nullable=True)  # YouTube embed URL
    platform = Column(String(50), nullable=True)  # youtube, vimeo, etc.
    
    # For books & scores
    pdf_url = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes
    pages = Column(Integer, nullable=True)
    author = Column(String(200), nullable=True)
    publisher = Column(String(200), nullable=True)
    isbn = Column(String(50), nullable=True)
    language = Column(String(50), nullable=True)
    
    # For e-commerce (books/scores)
    price = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), default="USD")
    stock_quantity = Column(Integer, default=0)
    is_downloadable = Column(Boolean, default=False)
    download_count = Column(Integer, default=0)
    
    # For concerts
    venue = Column(String(300), nullable=True)
    venue_address = Column(String(500), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=True)
    event_end_date = Column(DateTime(timezone=True), nullable=True)
    ticket_price = Column(Numeric(10, 2), nullable=True)
    total_tickets = Column(Integer, nullable=True)
    available_tickets = Column(Integer, nullable=True)
    
    # For gallery
    image_urls = Column(JSON, default=list, nullable=True)
    
    # Common fields
    tags = Column(JSON, default=list, nullable=True)
    metadata = Column(JSON, default=dict, nullable=True)
    is_published = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category = relationship("ContentCategory", back_populates="contents")
    order_items = relationship("OrderItem", back_populates="content")
    cart_items = relationship("CartItem", back_populates="content")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    stripe_checkout_session_id = Column(String(255), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=True)
    billing_address = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    download_url = Column(String(500), nullable=True)  # watermarked URL
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="items")
    content = relationship("Content", back_populates="order_items")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concert_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    ticket_number = Column(String(100), unique=True, nullable=False)
    seat_info = Column(String(100), nullable=True)
    price_paid = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.AVAILABLE)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    qr_code_url = Column(String(500), nullable=True)
    checked_in = Column(Boolean, default=False)
    checked_in_at = Column(DateTime(timezone=True), nullable=True)
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="tickets")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    quantity = Column(Integer, default=1)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="cart_items")
    content = relationship("Content", back_populates="cart_items")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for anonymous users
    session_id = Column(String(255), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    message = Column(Text, nullable=False)
    context_sources = Column(JSON, nullable=True)  # RAG retrieved sources
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="chat_history")


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)  # page_view, purchase, download, etc.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=True)
    metadata = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
