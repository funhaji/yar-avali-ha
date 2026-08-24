import { neon } from '@neondatabase/serverless';

let connectionString: string | undefined;

export function getConnectionString(): string {
  if (!connectionString) {
    connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
  }
  return connectionString;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const sql = neon(getConnectionString());
  const result = await sql(text, params || []);
  return result as T[];
}

// Database schema creation
export const DB_SCHEMA = `
-- Users table
CREATE TABLE IF NOT EXISTS yar_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_yar_users_email ON yar_users(email);
CREATE INDEX IF NOT EXISTS idx_yar_users_role ON yar_users(role);

-- Sessions table
CREATE TABLE IF NOT EXISTS yar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_yar_sessions_token ON yar_sessions(token);
CREATE INDEX IF NOT EXISTS idx_yar_sessions_user_id ON yar_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_yar_sessions_expires_at ON yar_sessions(expires_at);

-- Subscription links table
CREATE TABLE IF NOT EXISTS yar_subscription_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  max_redemptions INT NOT NULL,
  current_redemptions INT DEFAULT 0,
  subscription_days INT NOT NULL DEFAULT 180,
  created_by UUID REFERENCES yar_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE yar_subscription_links ADD COLUMN IF NOT EXISTS subscription_days INT NOT NULL DEFAULT 180;

CREATE INDEX IF NOT EXISTS idx_yar_subscription_links_code ON yar_subscription_links(code);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS yar_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
  subscription_link_id UUID REFERENCES yar_subscription_links(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_yar_subscriptions_user_id ON yar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_yar_subscriptions_end_date ON yar_subscriptions(end_date);

-- Content items table (curriculum + entertainment)
CREATE TABLE IF NOT EXISTS yar_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  description TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  tier_requirement VARCHAR(50) NOT NULL,
  age_tag VARCHAR(50),
  grade_level VARCHAR(50),
  category VARCHAR(100),
  genre VARCHAR(100),
  series_title VARCHAR(500),
  episode_number INT,
  duration_seconds INT,
  video_url VARCHAR(1000),
  pixeldrain_id VARCHAR(255),
  storage_provider VARCHAR(50) DEFAULT 'pixeldrain',
  r2_key VARCHAR(500),
  gdrive_id VARCHAR(255),
  thumbnail_url VARCHAR(1000),
  file_size_bytes BIGINT,
  view_count INT DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE yar_content_items ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50) DEFAULT 'pixeldrain';
ALTER TABLE yar_content_items ADD COLUMN IF NOT EXISTS r2_key VARCHAR(500);
ALTER TABLE yar_content_items ADD COLUMN IF NOT EXISTS gdrive_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_yar_content_type ON yar_content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_yar_content_tier ON yar_content_items(tier_requirement);
CREATE INDEX IF NOT EXISTS idx_yar_content_grade ON yar_content_items(grade_level);
CREATE INDEX IF NOT EXISTS idx_yar_content_category ON yar_content_items(category);
CREATE INDEX IF NOT EXISTS idx_yar_content_genre ON yar_content_items(genre);
CREATE INDEX IF NOT EXISTS idx_yar_content_series ON yar_content_items(series_title);
CREATE INDEX IF NOT EXISTS idx_yar_content_published ON yar_content_items(published);

-- PDF store items table
CREATE TABLE IF NOT EXISTS yar_pdf_store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  file_url VARCHAR(1000) NOT NULL,
  thumbnail_url VARCHAR(1000),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PDF purchases table
CREATE TABLE IF NOT EXISTS yar_pdf_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
  pdf_item_id UUID NOT NULL REFERENCES yar_pdf_store_items(id),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, pdf_item_id)
);

-- Store items table (stationery, digital goods)
CREATE TABLE IF NOT EXISTS yar_store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  stock_quantity INT,
  is_digital BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  thumbnail_url VARCHAR(1000),
  category VARCHAR(100),
  content_type VARCHAR(50),
  storage_provider VARCHAR(50),
  pixeldrain_id VARCHAR(255),
  gdrive_id VARCHAR(255),
  r2_key VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS content_type VARCHAR(50);
ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50);
ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS pixeldrain_id VARCHAR(255);
ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS gdrive_id VARCHAR(255);
ALTER TABLE yar_store_items ADD COLUMN IF NOT EXISTS r2_key VARCHAR(500);

-- Orders table
CREATE TABLE IF NOT EXISTS yar_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES yar_users(id),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  shipping_address TEXT,
  total_cents INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_gateway_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

ALTER TABLE yar_orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE yar_orders ADD COLUMN IF NOT EXISTS postal_code VARCHAR(50);
ALTER TABLE yar_orders ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(1000);

-- Order items table
CREATE TABLE IF NOT EXISTS yar_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES yar_orders(id) ON DELETE CASCADE,
  store_item_id UUID NOT NULL REFERENCES yar_store_items(id),
  quantity INT NOT NULL,
  price_cents INT NOT NULL
);

-- Teachers table
CREATE TABLE IF NOT EXISTS yar_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  bio TEXT,
  photo_url VARCHAR(1000),
  sample_work_url VARCHAR(1000),
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS specialty VARCHAR(255);
ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE yar_teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Teacher collaboration requests table
CREATE TABLE IF NOT EXISTS yar_teacher_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS yar_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES yar_users(id),
  thumbnail_url VARCHAR(1000),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_yar_blog_slug ON yar_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_yar_blog_published ON yar_blog_posts(published);

ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000);
ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS video_provider VARCHAR(50);
ALTER TABLE yar_blog_posts ADD COLUMN IF NOT EXISTS redirect_url VARCHAR(1000);

-- Workshops table
CREATE TABLE IF NOT EXISTS yar_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP,
  location VARCHAR(500),
  thumbnail_url VARCHAR(1000),
  review_text TEXT,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Viewing history / progress tracking
CREATE TABLE IF NOT EXISTS yar_viewing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES yar_content_items(id) ON DELETE CASCADE,
  progress_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_yar_viewing_history_user ON yar_viewing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_yar_viewing_history_content ON yar_viewing_history(content_id);

-- Site settings table (logo, branding, texts)
CREATE TABLE IF NOT EXISTS yar_site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_yar_site_settings_key ON yar_site_settings(setting_key);

-- Homepage sections table (featured content, banners)
CREATE TABLE IF NOT EXISTS yar_homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type VARCHAR(100) NOT NULL,
  title VARCHAR(500),
  subtitle TEXT,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  content_ids TEXT[],
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_yar_homepage_sections_type ON yar_homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_yar_homepage_sections_order ON yar_homepage_sections(display_order);

-- Gallery table
CREATE TABLE IF NOT EXISTS yar_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500),
  image_url VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
