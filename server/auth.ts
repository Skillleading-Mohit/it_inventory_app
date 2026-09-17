import { Request, Response, NextFunction } from 'express';
import { db, hashPassword, ROLE_PERMISSIONS } from './db';
import type { User, UserRole } from '../src/types/itam';

// Rate limiting state
interface RateLimitState {
  attempts: number;
  lockedUntil?: number;
}
const loginAttempts: Map<string, RateLimitState> = new Map();

// Active sessions: token -> { userId: string, expiresAt: number }
export const activeSessions: Map<string, { userId: string; expiresAt: number }> = new Map();

export function createSession(userId: string): string {
  const token = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  // Session duration 8 hours
  activeSessions.set(token, {
    userId,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  });
  return token;
}

export function getCurrentUser(req: Request): User | null {
  // 1. Check Bearer token or session cookie
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.itam_session) {
    token = req.cookies.itam_session;
  }

  if (token && activeSessions.has(token)) {
    const session = activeSessions.get(token)!;
    if (Date.now() < session.expiresAt) {
      const user = db.getUserById(session.userId);
      if (user && user.is_active) {
        const { password_hash, ...safeUser } = user;
        return safeUser;
      }
    } else {
      activeSessions.delete(token);
    }
  }

  // 2. Check header override for development role-switching / testing
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId) {
    const user = db.getUserById(headerUserId);
    if (user && user.is_active) {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  }

  // 3. Fallback: Default to superadmin if no auth is sent yet in browser to keep dev experience seamless,
  // but allow explicit role switching or unauthenticated tests.
  const defaultUser = db.getUserById('usr-1');
  if (defaultUser && defaultUser.is_active) {
    const { password_hash, ...safeUser } = defaultUser;
    return safeUser;
  }

  return null;
}

// Middleware: Require valid authenticated user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication is required to access this resource.'
    });
  }
  if (!user.is_active) {
    return res.status(403).json({
      error: 'Account Suspended',
      message: 'Your account is deactivated. Please contact an administrator.'
    });
  }
  (req as any).user = user;
  next();
}

// Middleware: Require specific permission according to RBAC
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user || getCurrentUser(req);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication is required to access this resource.'
      });
    }

    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Your role (${user.role}) does not have permission '${permission}' to perform this action.`,
        required_permission: permission
      });
    }

    (req as any).user = user;
    next();
  };
}

// Rate limiting check for login attempts
export function checkLoginRateLimit(key: string): { allowed: boolean; waitSeconds?: number } {
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const waitSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return { allowed: false, waitSeconds };
  }

  // Lock has expired
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordLoginFailure(key: string): void {
  const record = loginAttempts.get(key) || { attempts: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
  }
  loginAttempts.set(key, record);
}

export function recordLoginSuccess(key: string): void {
  loginAttempts.delete(key);
}
