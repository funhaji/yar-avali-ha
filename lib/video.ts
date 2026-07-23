import { randomBytes, createHmac } from 'crypto';
import axios from 'axios';

// Generate signed token for video access
export function generateVideoToken(contentId: string, userId: string): string {
  const secret = process.env.SESSION_SECRET || 'default-secret-key';
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
  
  const payload = `${contentId}:${userId}:${expiresAt}`;
  const signature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return token;
}

// Verify video token
export function verifyVideoToken(token: string): { 
  valid: boolean; 
  contentId?: string; 
  userId?: string;
  error?: string;
} {
  try {
    const secret = process.env.SESSION_SECRET || 'default-secret-key';
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [contentId, userId, expiresAt, signature] = decoded.split(':');
    
    // Check expiration
    if (parseInt(expiresAt) < Date.now()) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Verify signature
    const payload = `${contentId}:${userId}:${expiresAt}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { valid: true, contentId, userId };
  } catch (error) {
    return { valid: false, error: 'Invalid token format' };
  }
}

// Upload video to Pixeldrain
export async function uploadToPixeldrain(
  fileBuffer: Buffer,
  filename: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const apiKey = process.env.PIXELDRAIN_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Pixeldrain API key not configured' };
    }
    
    const response = await axios.put(
      `https://pixeldrain.com/api/file/${filename}`,
      fileBuffer,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Basic ${Buffer.from(`:${apiKey}`).toString('base64')}`
        }
      }
    );
    
    return { success: true, id: response.data.id };
  } catch (error: any) {
    console.error('Pixeldrain upload error:', error.message);
    return { success: false, error: error.message };
  }
}

// Get Pixeldrain URL from ID
export function getPixeldrainUrl(pixeldrainId: string): string {
  return `https://pixeldrain.com/api/file/${pixeldrainId}`;
}

// Add watermark text to video URL (for client-side overlay)
export function getWatermarkText(userName: string, userPhone?: string): string {
  if (userPhone) {
    return `${userName} - ${userPhone}`;
  }
  return userName;
}
