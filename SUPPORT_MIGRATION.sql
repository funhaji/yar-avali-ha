-- =====================================================
-- SUPPORT CHAT SYSTEM MIGRATION
-- Run this in Neon SQL Console
-- =====================================================

-- Create support tickets table
CREATE TABLE IF NOT EXISTS yar_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
  subject VARCHAR(500),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yar_support_tickets_user ON yar_support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_yar_support_tickets_status ON yar_support_tickets(status);

-- Create support messages table
CREATE TABLE IF NOT EXISTS yar_support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES yar_support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yar_support_messages_ticket ON yar_support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_yar_support_messages_sender ON yar_support_messages(sender_id);

-- Record migration
INSERT INTO yar_migrations (version, name) VALUES 
  (4, 'support_chat_system')
ON CONFLICT (version) DO NOTHING;
