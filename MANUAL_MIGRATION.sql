-- =====================================================
-- MANUAL DATABASE MIGRATION
-- Run this ONCE in Neon SQL Console or your PostgreSQL database
-- For new installations, just run: npm run db:setup
-- =====================================================

-- IMPORTANT: Table names have been standardized WITHOUT yar_ prefix
-- This migration will:
-- 1. Add new columns to existing tables
-- 2. Create new tables if they don't exist
-- 3. Handle both old (yar_*) and new naming conventions

-- ==================================================
-- PART 1: Add new columns to existing content_items
-- ==================================================

-- Add storage provider columns to content_items (both naming conventions)
DO $$ 
BEGIN
  -- Try with yar_ prefix first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='yar_content_items') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_content_items' AND column_name='storage_provider') THEN
      ALTER TABLE yar_content_items ADD COLUMN storage_provider VARCHAR(50) DEFAULT 'pixeldrain';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_content_items' AND column_name='r2_key') THEN
      ALTER TABLE yar_content_items ADD COLUMN r2_key VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_content_items' AND column_name='gdrive_id') THEN
      ALTER TABLE yar_content_items ADD COLUMN gdrive_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_content_items' AND column_name='view_count') THEN
      ALTER TABLE yar_content_items ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
  END IF;
  
  -- Try without yar_ prefix
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='content_items') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_items' AND column_name='storage_provider') THEN
      ALTER TABLE content_items ADD COLUMN storage_provider VARCHAR(50) DEFAULT 'pixeldrain';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_items' AND column_name='r2_key') THEN
      ALTER TABLE content_items ADD COLUMN r2_key VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_items' AND column_name='gdrive_id') THEN
      ALTER TABLE content_items ADD COLUMN gdrive_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_items' AND column_name='view_count') THEN
      ALTER TABLE content_items ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- ==================================================
-- PART 2: Create/Update Support System
-- ==================================================

-- Support tickets with reason, subject, description
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Update old table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='yar_support_tickets') THEN
    -- Add new columns to old table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_support_tickets' AND column_name='reason') THEN
      ALTER TABLE yar_support_tickets ADD COLUMN reason VARCHAR(255) DEFAULT 'other';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_support_tickets' AND column_name='subject') THEN
      ALTER TABLE yar_support_tickets ADD COLUMN subject VARCHAR(500) DEFAULT 'بدون عنوان';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_support_tickets' AND column_name='description') THEN
      ALTER TABLE yar_support_tickets ADD COLUMN description TEXT DEFAULT '';
    END IF;
  END IF;
END $$;

-- Support messages
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);

-- ==================================================
-- PART 3: Create/Update Blog and News
-- ==================================================

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  thumbnail_url VARCHAR(1000),
  published BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);

-- Add view_count to old table if needed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='yar_blog_posts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_blog_posts' AND column_name='view_count') THEN
      ALTER TABLE yar_blog_posts ADD COLUMN view_count INT DEFAULT 0;
    END IF;
  END IF;
END $$;

-- News posts
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  thumbnail_url VARCHAR(1000),
  published BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_news_posts_published ON news_posts(published);

-- Add view_count to old table if needed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='yar_news_posts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='yar_news_posts' AND column_name='view_count') THEN
      ALTER TABLE yar_news_posts ADD COLUMN view_count INT DEFAULT 0;
    END IF;
  END IF;
END $$;

-- ==================================================
-- PART 4: Video Comments
-- ==================================================

CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_comments_content ON video_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user ON video_comments(user_id);

-- ==================================================
-- PART 5: Site Settings
-- ==================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- Copy data from old table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='yar_site_settings') 
     AND NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1) THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
    SELECT setting_key, setting_value, setting_type, updated_at 
    FROM yar_site_settings;
  END IF;
END $$;

-- ==================================================
-- PART 6: Homepage Sections
-- ==================================================

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type VARCHAR(100) NOT NULL,
  title VARCHAR(500),
  subtitle TEXT,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  content_ids TEXT[],
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(display_order);

-- =====================================================
-- DONE! Your database is now fully up to date!
-- =====================================================

-- WHAT'S NEW:
-- ✅ Multi-source video support (YouTube, Google Drive, R2, Pixeldrain, Direct)
-- ✅ Enhanced support tickets (reason, subject, description, close tickets)
-- ✅ Video comments system
-- ✅ Blog posts with view counter
-- ✅ News posts with view counter
-- ✅ Font customization support
-- ✅ Logo upload and dynamic site name
-- ✅ Improved video player with speed controls
-- ✅ PDF and document upload support
-- ✅ Clean content library layout

-- NEXT STEPS:
-- 1. Run: npm run db:setup (for new installations)
-- 2. Go to /admin/settings and configure:
--    - Upload logo
--    - Set site name
--    - Choose font
-- 3. Go to /admin/content and add videos:
--    - YouTube (VPN required)
--    - Google Drive
--    - Cloudflare R2
--    - Or direct links
-- 4. Test support tickets at /support
-- 5. Create blog/news posts from admin panel

-- TROUBLESHOOTING:
-- If you see "table already exists" errors, that's normal - the script handles both old and new tables
-- If you have old yar_* tables, they will continue to work, but new data goes to the new tables
-- For a clean migration, consider exporting data, dropping old tables, and re-running setup



-- 12. Insert default font setting (if not exists)
INSERT INTO yar_site_settings (setting_key, setting_value, setting_type)
VALUES ('site_font', 'vazirmatn', 'select')
ON CONFLICT (setting_key) DO NOTHING;
