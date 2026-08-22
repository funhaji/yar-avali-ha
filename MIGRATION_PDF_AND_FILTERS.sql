-- Migration: Add PDF storage and prepare for content filtering
-- Run this in your Neon database console

-- Add columns for PDF storage directly in database
ALTER TABLE yar_content_items 
ADD COLUMN IF NOT EXISTS pdf_data BYTEA,
ADD COLUMN IF NOT EXISTS pdf_filename VARCHAR(500),
ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50) DEFAULT 'pixeldrain',
ADD COLUMN IF NOT EXISTS r2_key VARCHAR(1000),
ADD COLUMN IF NOT EXISTS gdrive_id VARCHAR(255);

-- Create index for faster filtering by tier
CREATE INDEX IF NOT EXISTS idx_yar_content_tier_published ON yar_content_items(tier_requirement, published);

-- Update existing content_type values if needed (optional)
-- This ensures consistency between 'lesson' and 'worksheet' types
UPDATE yar_content_items SET content_type = 'worksheet' WHERE content_type = 'کاربرگ';
UPDATE yar_content_items SET content_type = 'lesson' WHERE content_type = 'درس';

COMMENT ON COLUMN yar_content_items.pdf_data IS 'Binary PDF data stored directly in database';
COMMENT ON COLUMN yar_content_items.pdf_filename IS 'Original filename of uploaded PDF';
COMMENT ON COLUMN yar_content_items.storage_provider IS 'Video storage: pixeldrain, youtube, gdrive, mega, r2, direct';
