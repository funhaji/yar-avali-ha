import { randomBytes, createHmac } from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

// Get R2 client
function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });
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
    
    const response = await fetch(
      `https://pixeldrain.com/api/file/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Basic ${Buffer.from(`:${apiKey}`).toString('base64')}`
        },
        body: new Uint8Array(fileBuffer)
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('Pixeldrain upload error:', error.message);
    return { success: false, error: error.message };
  }
}

// Upload video to Cloudflare R2
export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string = 'video/mp4'
): Promise<{ success: boolean; key?: string; error?: string }> {
  try {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      return { success: false, error: 'R2 bucket not configured' };
    }
    
    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });
    
    await client.send(command);
    return { success: true, key };
  } catch (error: any) {
    console.error('R2 upload error:', error.message);
    return { success: false, error: error.message };
  }
}

// Get presigned URL for R2 object
export async function getR2SignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      return null;
    }
    
    const client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error: any) {
    console.error('R2 signed URL error:', error.message);
    return null;
  }
}

// Get Pixeldrain URL from ID
export function getPixeldrainUrl(pixeldrainId: string): string {
  return `https://pixeldrain.com/api/file/${pixeldrainId}`;
}

// Get Google Drive streaming URL
export function getGoogleDriveUrl(driveId: string): string {
  // Use the preview URL which supports streaming
  return `https://drive.google.com/uc?export=download&id=${driveId}`;
}

// Add watermark text to video URL (for client-side overlay)
export function getWatermarkText(userName: string, userPhone?: string): string {
  if (userPhone) {
    return `${userName} - ${userPhone}`;
  }
  return userName;
}

export function getEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('aparat.com/video/video/embed')) return url;
  const match = url.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/i);
  if (match) return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
  return url;
}
