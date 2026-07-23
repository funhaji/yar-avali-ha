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
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Subscription links table
CREATE TABLE IF NOT EXISTS subscription_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  max_redemptions INT NOT NULL,
  current_redemptions INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_links_code ON subscription_links(code);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_link_id UUID REFERENCES subscription_links(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Content items table (curriculum + entertainment)
CREATE TABLE IF NOT EXISTS content_items (
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
  thumbnail_url VARCHAR(1000),
  file_size_bytes BIGINT,
  view_count INT DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_tier ON content_items(tier_requirement);
CREATE INDEX IF NOT EXISTS idx_content_grade ON content_items(grade_level);
CREATE INDEX IF NOT EXISTS idx_content_category ON content_items(category);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content_items(genre);
CREATE INDEX IF NOT EXISTS idx_content_series ON content_items(series_title);
CREATE INDEX IF NOT EXISTS idx_content_published ON content_items(published);

-- PDF store items table
CREATE TABLE IF NOT EXISTS pdf_store_items (
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
CREATE TABLE IF NOT EXISTS pdf_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pdf_item_id UUID NOT NULL REFERENCES pdf_store_items(id),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, pdf_item_id)
);

-- Store items table (stationery, digital goods)
CREATE TABLE IF NOT EXISTS store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  stock_quantity INT,
  is_digital BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  thumbnail_url VARCHAR(1000),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  shipping_address TEXT,
  total_cents INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_gateway_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_item_id UUID NOT NULL REFERENCES store_items(id),
  quantity INT NOT NULL,
  price_cents INT NOT NULL
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  photo_url VARCHAR(1000),
  sample_work_url VARCHAR(1000),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher collaboration requests table
CREATE TABLE IF NOT EXISTS teacher_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  thumbnail_url VARCHAR(1000),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published);

-- Workshops table
CREATE TABLE IF NOT EXISTS workshops (
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
CREATE TABLE IF NOT EXISTS viewing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  progress_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_content ON viewing_history(content_id);
`;
