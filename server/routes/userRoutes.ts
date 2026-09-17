import { Router, Request, Response } from 'express';
import { db, hashPassword } from '../db';
import { requireAuth, requirePermission } from '../auth';
import { logAuditEvent, logObjectChanges } from '../audit';
import type { User, UserRole } from '../../src/types/itam';

export const userRouter = Router();

// GET /api/admin/users - List users
userRouter.get('/', requireAuth, requirePermission('manage_users'), (req: Request, res: Response) => {
  const users = db.getUsers();
  return res.json({ users });
});

// POST /api/admin/users - Create new user
userRouter.post('/', requireAuth, requirePermission('manage_users'), (req: Request, res: Response) => {
  const performer = (req as any).user;
  const { username, email, full_name, role, password, department, designation, employee_code } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required.' });
  }
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const validRoles: UserRole[] = ['super_admin', 'admin', 'asset_manager', 'operator', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  // Privilege escalation protection: only super_admin can create another super_admin
  if (role === 'super_admin' && performer.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only a Super Administrator can create another Super Administrator account.' });
  }

  const existing = db.getUserByUsername(username.trim());
  if (existing) {
    return res.status(400).json({ error: `Username '${username}' is already taken.` });
  }

  const now = new Date().toISOString();
  const newUser = {
    id: 'usr-' + Date.now(),
    username: username.trim(),
    email: email.trim(),
    full_name: full_name?.trim() || username.trim(),
    employee_code: employee_code?.trim() || undefined,
    department: department?.trim() || 'IT Administration',
    designation: designation?.trim() || 'IT Specialist',
    role: role as UserRole,
    is_active: true,
    last_login: null,
    created_at: now,
    updated_at: now,
    password_hash: hashPassword(password)
  };

  db.addUser(newUser);

  const { password_hash, ...safeUser } = newUser;

  logAuditEvent(req, performer, 'User', safeUser.id, 'USER_CREATED', {
    newValue: `Created user ${safeUser.username} (${safeUser.full_name}) with role '${safeUser.role}'`
  });

  return res.status(201).json({
    message: 'User created successfully.',
    user: safeUser
  });
});

// PUT /api/admin/users/:id - Update user
userRouter.put('/:id', requireAuth, requirePermission('manage_users'), (req: Request, res: Response) => {
  const performer = (req as any).user;
  const targetId = req.params.id;
  const oldUser = db.getUserById(targetId);
  if (!oldUser) return res.status(404).json({ error: 'User not found.' });

  const { email, full_name, role, department, designation, employee_code } = req.body;

  // Privilege escalation check
  if (role && role === 'super_admin' && performer.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only a Super Administrator can assign the Super Admin role.' });
  }

  const updates: Partial<User> = {
    email: email?.trim(),
    full_name: full_name?.trim(),
    role: role as UserRole,
    department: department?.trim(),
    designation: designation?.trim(),
    employee_code: employee_code?.trim()
  };

  logObjectChanges(req, performer, 'User', targetId, oldUser, updates, ['password_hash', 'updated_at']);

  const updated = db.updateUser(targetId, updates);

  return res.json({
    message: 'User updated successfully.',
    user: updated
  });
});

// POST /api/admin/users/:id/toggle-status - Deactivate / Reactivate
userRouter.post('/:id/toggle-status', requireAuth, requirePermission('manage_users'), (req: Request, res: Response) => {
  const performer = (req as any).user;
  const targetId = req.params.id;
  const targetUser = db.getUserById(targetId);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  // Prevent self-deactivation
  if (targetId === performer.id) {
    return res.status(400).json({ error: 'You cannot deactivate your own administrative account.' });
  }

  const nextStatus = !targetUser.is_active;
  const updated = db.updateUser(targetId, { is_active: nextStatus });

  logAuditEvent(req, performer, 'User', targetId, 'USER_UPDATED', {
    fieldName: 'is_active',
    oldValue: String(targetUser.is_active),
    newValue: String(nextStatus)
  });

  return res.json({
    message: `User '${targetUser.username}' has been ${nextStatus ? 'Activated' : 'Deactivated'}.`,
    user: updated
  });
});

// POST /api/admin/users/:id/reset-password
userRouter.post('/:id/reset-password', requireAuth, requirePermission('manage_users'), (req: Request, res: Response) => {
  const performer = (req as any).user;
  const targetId = req.params.id;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const targetUser = db.getUserById(targetId);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  db.updateUser(targetId, {
    password_hash: hashPassword(new_password)
  });

  logAuditEvent(req, performer, 'User', targetId, 'PASSWORD_CHANGED', {
    newValue: `Administrative password reset performed for user '${targetUser.username}'`
  });

  return res.json({ message: `Password reset successfully for user '${targetUser.username}'.` });
});
