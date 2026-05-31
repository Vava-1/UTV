-- UTV Platform Seed Data

-- Categories
INSERT INTO categories (id, name, slug, description, content_type, created_at)
VALUES
    (gen_random_uuid(), 'Classical Music', 'classical-music', 'Traditional classical compositions', 'music', NOW()),
    (gen_random_uuid(), 'Gospel', 'gospel', 'Gospel and spiritual music', 'music', NOW()),
    (gen_random_uuid(), 'Sacred Music', 'sacred-music', 'Sacred and liturgical works', 'music', NOW()),
    (gen_random_uuid(), 'Choral', 'choral', 'Choral arrangements and performances', 'music', NOW()),
    (gen_random_uuid(), 'Philosophy', 'philosophy', 'Philosophical literature and texts', 'book', NOW()),
    (gen_random_uuid(), 'Sheet Music', 'sheet-music', 'Musical scores and sheet music', 'score', NOW()),
    (gen_random_uuid(), 'Live Performances', 'live-performances', 'Recorded live events', 'video', NOW())
ON CONFLICT DO NOTHING;

-- Admin user (password: Admin@123456 - bcrypt hashed)
INSERT INTO users (id, email, username, hashed_password, first_name, last_name, role, is_active, is_verified, preferred_language, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@utv.com',
    'utvadmin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I7e',
    'UTV',
    'Administrator',
    'superadmin',
    true,
    true,
    'en',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Sample music tracks
INSERT INTO music (id, title, composer, performer, genre, duration_seconds, audio_url, cover_url, description, price, is_free, play_count, likes_count, is_published, is_featured, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'Ave Maria', 'Franz Schubert', 'Maria Callas', 'classical', 280, 'https://sample-videos.com/audio/mp3/crowd-cheering.mp3', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400', 'Schuberts masterpiece performed by the legendary Maria Callas', 2.99, false, 1523, 234, true, true, NOW(), NOW()),
    (gen_random_uuid(), 'Amazing Grace', 'John Newton', 'Andrea Bocelli', 'gospel', 245, 'https://sample-videos.com/audio/mp3/crowd-cheering.mp3', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400', 'A soul-stirring gospel classic performed by Andrea Bocelli', 1.99, false, 2105, 456, true, true, NOW(), NOW()),
    (gen_random_uuid(), 'Canon in D', 'Johann Pachelbel', 'London Symphony Orchestra', 'classical', 306, 'https://sample-videos.com/audio/mp3/crowd-cheering.mp3', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400', 'The timeless Canon in D major, performed by the LSO', 0.00, true, 3421, 678, true, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sample books
INSERT INTO books (id, title, author, description, cover_url, pdf_url, price, isbn, language, pages, genre, is_digital, is_published, is_featured, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'The Republic', 'Plato', 'A Socratic dialogue concerning justice and the order and character of the just city-state and the just man.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 'https://example.com/sample.pdf', 4.99, '978-0140449143', 'en', 416, 'philosophy', true, true, true, NOW(), NOW()),
    (gen_random_uuid(), 'Meditations', 'Marcus Aurelius', 'A series of personal writings by Marcus Aurelius, Roman Emperor, recording his private notes to himself and ideas on Stoic philosophy.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'https://example.com/sample.pdf', 3.99, '978-0140449334', 'en', 256, 'philosophy', true, true, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sample event
INSERT INTO events (id, title, description, venue, address, city, country, start_datetime, end_datetime, cover_url, price, capacity, tickets_sold, is_active, is_featured, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'UTV Classical & Gospel Gala 2024',
    'An evening of transcendent classical and gospel performances featuring world-renowned artists. Join us for a night of inspiration and musical excellence.',
    'Carnegie Hall',
    '881 7th Ave',
    'New York',
    'USA',
    '2024-12-15 19:00:00+00',
    '2024-12-15 22:00:00+00',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    75.00,
    500,
    0,
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;
