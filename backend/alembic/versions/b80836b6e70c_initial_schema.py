"""Initial schema — all base tables

Revision ID: b80836b6e70c
Revises:
Create Date: 2026-06-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b80836b6e70c'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE userrole AS ENUM ('user', 'admin')")
    op.execute("CREATE TYPE contenttype AS ENUM ('music', 'book', 'video', 'score', 'concert', 'gallery', 'library')")
    op.execute("CREATE TYPE orderstatus AS ENUM ('pending', 'completed', 'failed', 'refunded')")
    op.execute("CREATE TYPE ticketstatus AS ENUM ('available', 'sold', 'reserved')")

    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=True),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('role', sa.Enum('user', 'admin', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('stripe_customer_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Content Categories
    op.create_table(
        'content_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('sort_order', sa.Integer(), default=0),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )

    # Contents
    op.create_table(
        'contents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content_type', sa.Enum('music', 'book', 'video', 'score', 'concert', 'gallery', 'library', name='contenttype'), nullable=False),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('content_categories.id'), nullable=True),
        sa.Column('cover_image_url', sa.String(500), nullable=True),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('audio_url', sa.String(500), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('artist', sa.String(200), nullable=True),
        sa.Column('album', sa.String(200), nullable=True),
        sa.Column('genre', sa.String(100), nullable=True),
        sa.Column('video_url', sa.String(500), nullable=True),
        sa.Column('platform', sa.String(50), nullable=True),
        sa.Column('pdf_url', sa.String(500), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('pages', sa.Integer(), nullable=True),
        sa.Column('author', sa.String(200), nullable=True),
        sa.Column('publisher', sa.String(200), nullable=True),
        sa.Column('isbn', sa.String(50), nullable=True),
        sa.Column('language', sa.String(50), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=True),
        sa.Column('currency', sa.String(3), default='USD'),
        sa.Column('stock_quantity', sa.Integer(), default=0),
        sa.Column('is_downloadable', sa.Boolean(), default=False),
        sa.Column('download_count', sa.Integer(), default=0),
        sa.Column('venue', sa.String(300), nullable=True),
        sa.Column('venue_address', sa.String(500), nullable=True),
        sa.Column('event_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('event_end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ticket_price', sa.Numeric(10, 2), nullable=True),
        sa.Column('total_tickets', sa.Integer(), nullable=True),
        sa.Column('available_tickets', sa.Integer(), nullable=True),
        sa.Column('image_urls', sa.JSON(), default=list, nullable=True),
        sa.Column('tags', sa.JSON(), default=list, nullable=True),
        sa.Column('meta_data', sa.JSON(), default=dict, nullable=True),
        sa.Column('is_published', sa.Boolean(), default=True),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('view_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('ix_contents_id', 'contents', ['id'])

    # Orders
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('stripe_payment_intent_id', sa.String(255), nullable=True),
        sa.Column('stripe_checkout_session_id', sa.String(255), nullable=True),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='USD'),
        sa.Column('status', sa.Enum('pending', 'completed', 'failed', 'refunded', name='orderstatus'), default='pending'),
        sa.Column('customer_email', sa.String(255), nullable=False),
        sa.Column('customer_name', sa.String(255), nullable=True),
        sa.Column('billing_address', sa.JSON(), nullable=True),
        sa.Column('meta_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Order Items
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('content_id', sa.Integer(), sa.ForeignKey('contents.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), default=1),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('total_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('download_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Tickets
    op.create_table(
        'tickets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('concert_id', sa.Integer(), sa.ForeignKey('contents.id'), nullable=False),
        sa.Column('ticket_number', sa.String(100), nullable=False),
        sa.Column('seat_info', sa.String(100), nullable=True),
        sa.Column('price_paid', sa.Numeric(10, 2), nullable=False),
        sa.Column('status', sa.Enum('available', 'sold', 'reserved', name='ticketstatus'), default='available'),
        sa.Column('stripe_payment_intent_id', sa.String(255), nullable=True),
        sa.Column('qr_code_url', sa.String(500), nullable=True),
        sa.Column('checked_in', sa.Boolean(), default=False),
        sa.Column('checked_in_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('purchased_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_number')
    )

    # Cart Items
    op.create_table(
        'cart_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('content_id', sa.Integer(), sa.ForeignKey('contents.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), default=1),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Chat History
    op.create_table(
        'chat_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('session_id', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('context_sources', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_chat_history_session_id', 'chat_history', ['session_id'])

    # Analytics Events
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('content_id', sa.Integer(), sa.ForeignKey('contents.id'), nullable=True),
        sa.Column('meta_data', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Newsletter Subscribers
    op.create_table(
        'newsletter_subscribers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(200), nullable=True),
        sa.Column('language', sa.String(10), default='en'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('confirmed', sa.Boolean(), default=True),
        sa.Column('subscribed_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('unsubscribed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_newsletter_subscribers_email', 'newsletter_subscribers', ['email'])

    # Processed Stripe Events (webhook idempotency)
    op.create_table(
        'processed_stripe_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.String(255), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id')
    )
    op.create_index('ix_processed_stripe_events_event_id', 'processed_stripe_events', ['event_id'])

    # Pending Orders (server-side cart storage for Stripe checkout)
    op.create_table(
        'pending_orders',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('cart_data', sa.Text(), nullable=False),
        sa.Column('stripe_session_id', sa.String(255), nullable=True),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('pending_orders')
    op.drop_index('ix_processed_stripe_events_event_id', table_name='processed_stripe_events')
    op.drop_table('processed_stripe_events')
    op.drop_index('ix_newsletter_subscribers_email', table_name='newsletter_subscribers')
    op.drop_table('newsletter_subscribers')
    op.drop_table('analytics_events')
    op.drop_index('ix_chat_history_session_id', table_name='chat_history')
    op.drop_table('chat_history')
    op.drop_table('cart_items')
    op.drop_table('tickets')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_index('ix_contents_id', table_name='contents')
    op.drop_table('contents')
    op.drop_table('content_categories')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')

    op.execute('DROP TYPE IF EXISTS ticketstatus')
    op.execute('DROP TYPE IF EXISTS orderstatus')
    op.execute('DROP TYPE IF EXISTS contenttype')
    op.execute('DROP TYPE IF EXISTS userrole')
