-- Migration: Add homepage slider and social media settings
-- Run this in your Neon database console

-- Create homepage slider table
CREATE TABLE IF NOT EXISTS yar_homepage_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url VARCHAR(1000) NOT NULL,
  title VARCHAR(500),
  link_url VARCHAR(1000),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_yar_homepage_slides_active ON yar_homepage_slides(is_active, display_order);

-- Add social media columns to settings table (or create if doesn't exist)
CREATE TABLE IF NOT EXISTS yar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert social media settings (if not exists)
INSERT INTO yar_settings (setting_key, setting_value) 
VALUES 
  ('social_instagram', NULL),
  ('social_telegram', NULL),
  ('social_whatsapp', NULL)
ON CONFLICT (setting_key) DO NOTHING;

COMMENT ON TABLE yar_homepage_slides IS 'Homepage slider images managed by admin';
COMMENT ON TABLE yar_settings IS 'Global settings including social media links';
