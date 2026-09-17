import { Router, Request, Response } from 'express';
import { db, hashPassword, ROLE_PERMISSIONS } from '../db';
import {
  getCurrentUser,
  createSession,
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
  requireAuth
} from '../auth';
import { logAuditEvent, getClientIp } from '../audit';
import type { UserRole } from '../../src/types/itam';

export const authRouter = Router();

// GET /api/auth/me - Return current user & permissions
authRouter.get('/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const permissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
  return res.json({
    user,
    permissions
  });
});

// POST /api/auth/login - Standard authentication with rate limiting & audit
authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const clientIp = getClientIp(req);
  const rateLimitKey = `${clientIp}:${username || 'unknown'}`;

  // Check brute force throttling
  const rateCheck = checkLoginRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    logAuditEvent(req, null, 'Auth', username || 'unknown', 'LOGIN_FAILURE', {
      newValue: `Rate limit blocked login attempt for user ${username}. Lockout active for ${rateCheck.waitSeconds}s`
    });
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Too many failed login attempts. Please try again in ${rateCheck.waitSeconds} seconds.`
    });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const userWithHash = db.getUserByUsername(username);
  if (!userWithHash) {
    recordLoginFailure(rateLimitKey);
    logAuditEvent(req, null, 'Auth', username, 'LOGIN_FAILURE', {
      newValue: `Failed login attempt for non-existent user '${username}'`
    });
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  if (!userWithHash.is_active) {
    return res.status(403).json({ error: 'Account is deactivated. Please contact an administrator.' });
  }

  // Verify password hash
  const computedHash = hashPassword(password);
  if (computedHash !== userWithHash.password_hash) {
    recordLoginFailure(rateLimitKey);
    logAuditEvent(req, null, 'Auth', userWithHash.id, 'LOGIN_FAILURE', {
      newValue: `Failed password attempt for user '${username}'`
    });
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Reset rate limits on success
  recordLoginSuccess(rateLimitKey);

  // Update last login
  const now = new Date().toISOString();
  db.updateUser(userWithHash.id, { last_login: now });

  const { password_hash, ...safeUser } = userWithHash;
  const token = createSession(userWithHash.id);

  // Set secure HTTP-only cookie
  res.cookie('itam_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });

  logAuditEvent(req, safeUser, 'Auth', safeUser.id, 'LOGIN_SUCCESS', {
    newValue: `User '${username}' logged in successfully`
  });

  const permissions = ROLE_PERMISSIONS[safeUser.role as UserRole] || [];
  return res.json({
    message: 'Login successful',
    token,
    user: safeUser,
    permissions
  });
});

// POST /api/auth/logout
authRouter.post('/logout', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.clearCookie('itam_session');
  if (user) {
    logAuditEvent(req, user, 'Auth', user.id, 'LOGOUT', {
      newValue: `User '${user.username}' logged out`
    });
  }
  return res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/switch-role - For rapid evaluator testing of all 5 RBAC roles
authRouter.post('/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const validRoles: UserRole[] = ['super_admin', 'admin', 'asset_manager', 'operator', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const users = db.getUsers();
  const targetUser = users.find(u => u.role === role);
  if (!targetUser) {
    return res.status(404).json({ error: `No active user found with role ${role}` });
  }

  const token = createSession(targetUser.id);
  res.cookie('itam_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });

  const permissions = ROLE_PERMISSIONS[targetUser.role as UserRole] || [];
  return res.json({
    message: `Switched active role to ${role}`,
    token,
    user: targetUser,
    permissions
  });
});

// POST /api/auth/change-password
authRouter.post('/change-password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const userWithHash = db.getUserById(user.id);
  if (!userWithHash) return res.status(404).json({ error: 'User not found' });

  if (hashPassword(current_password) !== userWithHash.password_hash) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  db.updateUser(user.id, {
    password_hash: hashPassword(new_password)
  });

  logAuditEvent(req, user, 'Auth', user.id, 'PASSWORD_CHANGED', {
    newValue: 'User password was changed securely'
  });

  return res.json({ message: 'Password changed successfully.' });
});
