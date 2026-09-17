import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, requirePermission } from '../auth';

export const auditRouter = Router();

// GET /api/history - Paginated audit logs with rich filters
auditRouter.get('/', requireAuth, requirePermission('view_history'), (req: Request, res: Response) => {
  const {
    q,
    entity_type,
    action,
    username,
    start_date,
    end_date,
    page = '1',
    limit = '25'
  } = req.query;

  let logs = [...db.getAuditLogs()];

  if (q && typeof q === 'string') {
    const search = q.toLowerCase().trim();
    logs = logs.filter(l =>
      l.entity_id.toLowerCase().includes(search) ||
      (l.field_name && l.field_name.toLowerCase().includes(search)) ||
      (l.old_value && l.old_value.toLowerCase().includes(search)) ||
      (l.new_value && l.new_value.toLowerCase().includes(search)) ||
      l.username.toLowerCase().includes(search) ||
      l.ip_address.toLowerCase().includes(search)
    );
  }

  if (entity_type && entity_type !== 'all') {
    logs = logs.filter(l => l.entity_type === entity_type);
  }

  if (action && action !== 'all') {
    logs = logs.filter(l => l.action === action);
  }

  if (username && username !== 'all') {
    logs = logs.filter(l => l.username.toLowerCase() === (username as string).toLowerCase());
  }

  if (start_date) {
    logs = logs.filter(l => new Date(l.timestamp) >= new Date(start_date as string));
  }

  if (end_date) {
    const endDateTime = new Date(end_date as string);
    endDateTime.setHours(23, 59, 59, 999);
    logs = logs.filter(l => new Date(l.timestamp) <= endDateTime);
  }

  const total = logs.length;
  const pageNum = parseInt(page as string, 10) || 1;
  const pageLimit = parseInt(limit as string, 10) || 25;
  const startIndex = (pageNum - 1) * pageLimit;
  const paginated = logs.slice(startIndex, startIndex + pageLimit);

  // Facet options for filters
  const allLogs = db.getAuditLogs();
  const facets = {
    entity_types: ['Asset', 'Employee', 'User', 'Photo', 'Auth', 'Report'],
    actions: Array.from(new Set(allLogs.map(l => l.action))),
    users: Array.from(new Set(allLogs.map(l => l.username)))
  };

  return res.json({
    logs: paginated,
    total,
    page: pageNum,
    total_pages: Math.ceil(total / pageLimit),
    limit: pageLimit,
    facets
  });
});
