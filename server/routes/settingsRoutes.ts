import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth } from '../auth';
import { logAuditEvent } from '../audit';
import type { SystemSettings } from '../../src/types/itam';

export const settingsRouter = Router();

// GET /api/settings - Fetch current branding & theme settings (public/authenticated)
settingsRouter.get('/', (req: Request, res: Response) => {
  const settings = db.getSettings();
  return res.json({ settings });
});

// POST /api/settings - Update logo, theme, and branding (Super Admin only)
settingsRouter.post('/', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;

  // Strict enforcement: only Super Admin can alter system branding & theme
  if (user.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only Super Administrators are authorized to update system theme and branding.'
    });
  }

  const { theme, custom_logo_url, custom_logo_base64, app_name, company_name } = req.body;

  if (theme && theme !== 'default' && theme !== 'black_and_white') {
    return res.status(400).json({
      error: 'Invalid Theme',
      message: "Theme must be either 'default' or 'black_and_white'."
    });
  }

  const current = db.getSettings();
  const updates: Partial<SystemSettings> = {};

  if (theme !== undefined) updates.theme = theme;
  if (app_name !== undefined) updates.app_name = app_name.trim() || 'ITAM Enterprise';
  if (company_name !== undefined) updates.company_name = company_name.trim() || 'Enterprise IT Global';
  if (custom_logo_url !== undefined) updates.custom_logo_url = custom_logo_url?.trim() || null;
  if (custom_logo_base64 !== undefined) {
    // Validate Base64 image payload size (under ~2.5MB)
    if (custom_logo_base64 && custom_logo_base64.length > 3500000) {
      return res.status(400).json({
        error: 'Payload Too Large',
        message: 'Custom logo image exceeds the 2MB size limit.'
      });
    }
    updates.custom_logo_base64 = custom_logo_base64 || null;
  }

  const updatedSettings = db.updateSettings(updates, user.username);

  logAuditEvent(req, user, 'User', user.id, 'UPDATED', {
    fieldName: 'system_branding_theme',
    oldValue: JSON.stringify({ theme: current.theme, logo: !!current.custom_logo_base64 || !!current.custom_logo_url }),
    newValue: JSON.stringify({ theme: updatedSettings.theme, logo: !!updatedSettings.custom_logo_base64 || !!updatedSettings.custom_logo_url })
  });

  return res.json({
    message: 'System settings, logo, and theme updated successfully.',
    settings: updatedSettings
  });
});
