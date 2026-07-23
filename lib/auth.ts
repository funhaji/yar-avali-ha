import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { query } from './db';

const scryptAsync = promisify(scrypt);

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  role: string;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
}

// Hash password using scrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedKey] = hash.split(':');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedKeyBuffer = Buffer.from(storedKey, 'hex');
  
  // Use timing-safe comparison
  return timingSafeEqual(derivedKey, storedKeyBuffer);
}

// Generate secure session token
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

// Create session for user (24 hours)
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
  
  return token;
}

// Validate session token and return user
export async function validateSession(token: string): Promise<User | null> {
  if (!token) return null;
  
  const sessions = await query<Session & User>(
    `SELECT s.*, u.id, u.email, u.name, u.phone, u.role 
     FROM sessions s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  
  if (sessions.length === 0) return null;
  
  const session = sessions[0];
  return {
    id: session.id,
    email: session.email,
    password_hash: '',
    name: session.name,
    phone: session.phone,
    role: session.role,
    created_at: session.created_at
  };
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [token]);
}

// Clean up expired sessions (run periodically)
export async function cleanExpiredSessions(): Promise<void> {
  await query('DELETE FROM sessions WHERE expires_at < NOW()');
}

// Password validation
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'رمز عبور باید حداقل ۸ کاراکتر باشد' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'رمز عبور باید حداقل یک حرف داشته باشد' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'رمز عبور باید حداقل یک عدد داشته باشد' };
  }
  return { valid: true };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
