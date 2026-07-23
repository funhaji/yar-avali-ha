import { query } from './db';

export interface Subscription {
  id: string;
  user_id: string;
  start_date: Date;
  end_date: Date;
}

export interface SubscriptionLink {
  id: string;
  code: string;
  expires_at: Date;
  max_redemptions: number;
  current_redemptions: number;
  created_by?: string;
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subs = await query<Subscription>(
    `SELECT * FROM yar_subscriptions 
     WHERE user_id = $1 AND end_date > NOW() 
     ORDER BY end_date DESC 
     LIMIT 1`,
    [userId]
  );
  
  return subs.length > 0;
}

// Get user's active subscription
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const subs = await query<Subscription>(
    `SELECT * FROM yar_subscriptions 
     WHERE user_id = $1 AND end_date > NOW() 
     ORDER BY end_date DESC 
     LIMIT 1`,
    [userId]
  );
  
  return subs.length > 0 ? subs[0] : null;
}

// Generate subscription link code
export function generateLinkCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create subscription link (admin only)
export async function createSubscriptionLink(
  expiresAt: Date,
  maxRedemptions: number,
  createdBy: string
): Promise<SubscriptionLink> {
  const code = generateLinkCode();
  
  const result = await query<SubscriptionLink>(
    `INSERT INTO yar_subscription_links (code, expires_at, max_redemptions, created_by) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [code, expiresAt, maxRedemptions, createdBy]
  );
  
  return result[0];
}

// Redeem subscription link
export async function redeemSubscriptionLink(
  code: string,
  userId: string
): Promise<{ success: boolean; message: string; subscription?: Subscription }> {
  // Check if link exists and is valid
  const links = await query<SubscriptionLink>(
    `SELECT * FROM yar_subscription_links WHERE code = $1`,
    [code]
  );
  
  if (links.length === 0) {
    return { success: false, message: 'کد اشتراک معتبر نیست' };
  }
  
  const link = links[0];
  
  // Check if expired
  if (new Date(link.expires_at) < new Date()) {
    return { success: false, message: 'کد اشتراک منقضی شده است' };
  }
  
  // Check if max redemptions reached
  if (link.current_redemptions >= link.max_redemptions) {
    return { success: false, message: 'این کد به حداکثر تعداد استفاده رسیده است' };
  }
  
  // Check if user already redeemed this link
  const existing = await query(
    `SELECT * FROM yar_subscriptions WHERE user_id = $1 AND subscription_link_id = $2`,
    [userId, link.id]
  );
  
  if (existing.length > 0) {
    return { success: false, message: 'شما قبلاً از این کد استفاده کرده‌اید' };
  }
  
  // Create subscription (6 months from now)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 6);
  
  const subscription = await query<Subscription>(
    `INSERT INTO yar_subscriptions (user_id, subscription_link_id, start_date, end_date) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [userId, link.id, startDate, endDate]
  );
  
  // Increment redemption count
  await query(
    `UPDATE yar_subscription_links SET current_redemptions = current_redemptions + 1 WHERE id = $1`,
    [link.id]
  );
  
  return { 
    success: true, 
    message: 'اشتراک شما با موفقیت فعال شد', 
    subscription: subscription[0] 
  };
}

// Get subscription link details (admin only)
export async function getSubscriptionLinkDetails(linkId: string) {
  const link = await query<SubscriptionLink>(
    `SELECT * FROM yar_subscription_links WHERE id = $1`,
    [linkId]
  );
  
  if (link.length === 0) return null;
  
  // Get redemptions
  const redemptions = await query(
    `SELECT s.*, u.email, u.name FROM yar_subscriptions s
     JOIN yar_users u ON s.user_id = u.id
     WHERE s.subscription_link_id = $1
     ORDER BY s.created_at DESC`,
    [linkId]
  );
  
  return {
    link: link[0],
    redemptions
  };
}

// Get all subscription links (admin only)
export async function getAllSubscriptionLinks() {
  return await query<SubscriptionLink>(
    `SELECT * FROM yar_subscription_links ORDER BY created_at DESC`
  );
}
