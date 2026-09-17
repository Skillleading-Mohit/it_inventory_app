import { Router, Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { db } from '../db';
import { requireAuth, requirePermission } from '../auth';
import { logAuditEvent } from '../audit';
import type { Asset, DashboardMetrics } from '../../src/types/itam';

export const reportRouter = Router();

// Protect CSV / Spreadsheet against formula injection (CSV injection attack)
function sanitizeCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  // If starts with =, +, -, @, prefix with a single quote
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

// GET /api/reports/metrics - Dashboard summary counters & charts
reportRouter.get('/metrics', requireAuth, (req: Request, res: Response) => {
  const assets = db.getAssets();
  const employees = db.getEmployees();
  const users = db.getUsers();

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  let total_cost = 0;
  let warranty_expiring_soon = 0;
  let warranty_expired = 0;
  let amc_expiring_soon = 0;
  let amc_expired = 0;

  const status_dist: Record<string, number> = {};
  const category_dist: Record<string, number> = {};
  const department_dist: Record<string, number> = {};

  for (const a of assets) {
    total_cost += a.purchase_cost || 0;

    // Status distribution
    status_dist[a.status] = (status_dist[a.status] || 0) + 1;

    // Category distribution
    category_dist[a.category] = (category_dist[a.category] || 0) + 1;

    // Department distribution
    if (a.department) {
      department_dist[a.department] = (department_dist[a.department] || 0) + 1;
    }

    // Warranty calculation
    if (a.warranty_expiry) {
      const exp = new Date(a.warranty_expiry);
      if (exp < now) {
        warranty_expired++;
      } else if (exp <= in30Days) {
        warranty_expiring_soon++;
      }
    }

    // AMC calculation
    if (a.amc_expiry) {
      const exp = new Date(a.amc_expiry);
      if (exp < now) {
        amc_expired++;
      } else if (exp <= in30Days) {
        amc_expiring_soon++;
      }
    }
  }

  const metrics: DashboardMetrics = {
    total_assets: assets.length,
    active_assets: assets.filter(a => a.status === 'Active').length,
    assigned_assets: assets.filter(a => a.status === 'Assigned').length,
    in_stock_assets: assets.filter(a => a.status === 'In Stock').length,
    under_repair_assets: assets.filter(a => a.status === 'Under Repair').length,
    disposed_assets: assets.filter(a => a.status === 'Disposed').length,
    active_employees: employees.filter(e => e.is_active).length,
    active_users: users.filter(u => u.is_active).length,
    warranty_expiring_soon,
    warranty_expired,
    amc_expiring_soon,
    amc_expired,
    total_inventory_value: Math.round(total_cost * 100) / 100,
    status_distribution: status_dist,
    category_distribution: category_dist,
    department_distribution: department_dist
  };

  return res.json(metrics);
});

// GET /api/reports/export - Generates CSV or Excel with formula injection sanitization
reportRouter.get('/export', requireAuth, requirePermission('view_reports'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const { report_type = 'inventory', format = 'csv' } = req.query;

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  let rawAssets = [...db.getAssets()];

  // Filter based on report type
  switch (report_type) {
    case 'warranty_expiring':
      rawAssets = rawAssets.filter(a => {
        if (!a.warranty_expiry) return false;
        const exp = new Date(a.warranty_expiry);
        return exp >= now && exp <= in30Days;
      });
      break;
    case 'warranty_expired':
      rawAssets = rawAssets.filter(a => {
        if (!a.warranty_expiry) return false;
        return new Date(a.warranty_expiry) < now;
      });
      break;
    case 'amc_expiring':
      rawAssets = rawAssets.filter(a => {
        if (!a.amc_expiry) return false;
        const exp = new Date(a.amc_expiry);
        return exp >= now && exp <= in30Days;
      });
      break;
    case 'amc_expired':
      rawAssets = rawAssets.filter(a => {
        if (!a.amc_expiry) return false;
        return new Date(a.amc_expiry) < now;
      });
      break;
    case 'assigned':
      rawAssets = rawAssets.filter(a => !!a.employee_id);
      break;
    case 'unassigned':
      rawAssets = rawAssets.filter(a => !a.employee_id && a.status !== 'Disposed');
      break;
    case 'under_repair':
      rawAssets = rawAssets.filter(a => a.status === 'Under Repair' || a.status === 'Maintenance');
      break;
    case 'disposed':
      rawAssets = rawAssets.filter(a => a.status === 'Disposed');
      break;
    default:
      // full inventory
      break;
  }

  // Format records with formula injection sanitization
  const rows = rawAssets.map(a => ({
    'Asset Tag': sanitizeCell(a.asset_tag),
    'Device Type': sanitizeCell(a.device_type),
    'Manufacturer': sanitizeCell(a.manufacturer),
    'Model': sanitizeCell(a.model),
    'Serial Number': sanitizeCell(a.serial_number),
    'Status': sanitizeCell(a.status),
    'Department': sanitizeCell(a.department),
    'Location': sanitizeCell(a.location),
    'Assigned Employee': sanitizeCell(a.employee_name || 'Unassigned'),
    'Employee Code': sanitizeCell(a.employee_code || ''),
    'IP Address': sanitizeCell(a.ip_address || ''),
    'MAC Address': sanitizeCell(a.mac_address || ''),
    'Purchase Cost ($)': a.purchase_cost,
    'Purchase Date': sanitizeCell(a.purchase_date || ''),
    'Warranty Expiry': sanitizeCell(a.warranty_expiry || ''),
    'AMC Expiry': sanitizeCell(a.amc_expiry || '')
  }));

  // Audit event
  logAuditEvent(req, user, 'Report', String(report_type), 'REPORT_GENERATED', {
    newValue: `Generated ${report_type} report (${String(format).toUpperCase()}) containing ${rows.length} asset records`
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `itam_${report_type}_report_${timestamp}`;

  if (format === 'excel' || format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asset Data');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    return res.send(buf);
  }

  // Default CSV format
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  return res.send(csv);
});
