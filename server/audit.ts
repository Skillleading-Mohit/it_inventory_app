import { Request } from 'express';
import { db } from './db';
import type { User, AuditLog } from '../src/types/itam';

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function getUserAgent(req: Request): string {
  return (req.headers['user-agent'] as string) || 'Unknown Client';
}

export function logAuditEvent(
  req: Request,
  user: User | null,
  entityType: AuditLog['entity_type'],
  entityId: string,
  action: AuditLog['action'],
  details: {
    fieldName?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
  } = {}
): AuditLog {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  return db.addAuditLog({
    entity_type: entityType,
    entity_id: entityId,
    action: action,
    field_name: details.fieldName || null,
    old_value: details.oldValue || null,
    new_value: details.newValue || null,
    performed_by: user ? user.id : 'system',
    username: user ? user.username : 'system',
    ip_address: ip,
    user_agent: ua
  });
}

// Compare old object vs new object and generate field-by-field audit entries
export function logObjectChanges(
  req: Request,
  user: User | null,
  entityType: AuditLog['entity_type'],
  entityId: string,
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
  ignoredKeys: string[] = ['updated_at', 'created_at', 'photos']
): void {
  for (const key of Object.keys(newObj)) {
    if (ignoredKeys.includes(key)) continue;
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Check if changed
    if (oldVal !== undefined && newVal !== undefined && String(oldVal) !== String(newVal)) {
      logAuditEvent(req, user, entityType, entityId, 'UPDATED', {
        fieldName: key,
        oldValue: oldVal === null ? 'null' : String(oldVal),
        newValue: newVal === null ? 'null' : String(newVal)
      });
    }
  }
}
