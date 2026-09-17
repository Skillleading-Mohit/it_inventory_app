import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, requirePermission } from '../auth';
import { logAuditEvent, logObjectChanges } from '../audit';
import type { Employee } from '../../src/types/itam';

export const employeeRouter = Router();

// GET /api/employees - List with search, filtering & assigned asset count
employeeRouter.get('/', requireAuth, (req: Request, res: Response) => {
  const { q, department, is_active, page = '1', limit = '20' } = req.query;

  let employees = db.getEmployees();

  if (q && typeof q === 'string') {
    const search = q.toLowerCase().trim();
    employees = employees.filter(e =>
      e.full_name.toLowerCase().includes(search) ||
      e.employee_code.toLowerCase().includes(search) ||
      e.email.toLowerCase().includes(search) ||
      e.designation.toLowerCase().includes(search) ||
      e.department.toLowerCase().includes(search) ||
      e.location.toLowerCase().includes(search)
    );
  }

  if (department && department !== 'all') {
    employees = employees.filter(e => e.department === department);
  }

  if (is_active !== undefined && is_active !== 'all') {
    const activeBool = is_active === 'true';
    employees = employees.filter(e => e.is_active === activeBool);
  }

  const total = employees.length;
  const pageNum = parseInt(page as string, 10) || 1;
  const pageLimit = parseInt(limit as string, 10) || 20;
  const startIndex = (pageNum - 1) * pageLimit;
  const paginated = employees.slice(startIndex, startIndex + pageLimit);

  const departments = Array.from(new Set(db.getEmployees().map(e => e.department).filter(Boolean)));

  return res.json({
    employees: paginated,
    total,
    page: pageNum,
    total_pages: Math.ceil(total / pageLimit),
    departments
  });
});

// GET /api/employees/:id - Detail with currently assigned assets & assignment history
employeeRouter.get('/:id', requireAuth, (req: Request, res: Response) => {
  const employee = db.getEmployeeById(req.params.id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  // Currently assigned assets
  const assignedAssets = db.getAssets().filter(a => a.employee_id === employee.id);

  // Assignment history from audit logs
  const history = db.getAuditLogs().filter(log =>
    (log.entity_type === 'Asset' && log.new_value && log.new_value.includes(employee.employee_code)) ||
    (log.entity_type === 'Employee' && log.entity_id === employee.id)
  ).slice(0, 30);

  return res.json({
    employee,
    assigned_assets: assignedAssets,
    history
  });
});

// POST /api/employees - Add employee
employeeRouter.post('/', requireAuth, requirePermission('manage_employees'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const { employee_code, full_name, username, email, department, designation, phone, extension, location } = req.body;

  if (!employee_code || !employee_code.trim()) {
    return res.status(400).json({ error: 'Employee Code is required.' });
  }
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: 'Full Name is required.' });
  }
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid corporate email address is required.' });
  }

  const existing = db.getEmployeeByCode(employee_code.trim());
  if (existing) {
    return res.status(400).json({ error: `Employee Code '${employee_code}' is already registered.` });
  }

  const now = new Date().toISOString();
  const newEmployee: Employee = {
    id: 'emp-' + Date.now(),
    employee_code: employee_code.trim(),
    full_name: full_name.trim(),
    username: username?.trim() || employee_code.toLowerCase().replace(/[^a-z0-9]/g, ''),
    email: email.trim(),
    department: department?.trim() || 'General IT',
    designation: designation?.trim() || 'Staff',
    phone: phone?.trim() || '',
    extension: extension?.trim() || '',
    location: location?.trim() || 'Headquarters',
    is_active: true,
    created_at: now,
    updated_at: now
  };

  db.addEmployee(newEmployee);

  logAuditEvent(req, user, 'Employee', newEmployee.id, 'CREATED', {
    newValue: `Added employee ${newEmployee.full_name} (${newEmployee.employee_code}) in ${newEmployee.department}`
  });

  return res.status(201).json({
    message: 'Employee registered successfully.',
    employee: newEmployee
  });
});

// PUT /api/employees/:id - Update employee
employeeRouter.put('/:id', requireAuth, requirePermission('manage_employees'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const employeeId = req.params.id;
  const oldEmployee = db.getEmployeeById(employeeId);
  if (!oldEmployee) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const { full_name, email, department, designation, phone, extension, location } = req.body;

  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: 'Full Name is required.' });
  }

  const updates: Partial<Employee> = {
    full_name: full_name.trim(),
    email: email?.trim(),
    department: department?.trim(),
    designation: designation?.trim(),
    phone: phone?.trim(),
    extension: extension?.trim(),
    location: location?.trim()
  };

  logObjectChanges(req, user, 'Employee', employeeId, oldEmployee, updates);

  const updated = db.updateEmployee(employeeId, updates);

  return res.json({
    message: 'Employee details updated.',
    employee: updated
  });
});

// POST /api/employees/:id/toggle-status - Deactivate / Reactivate
employeeRouter.post('/:id/toggle-status', requireAuth, requirePermission('manage_employees'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const employee = db.getEmployeeById(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const nextStatus = !employee.is_active;

  // Safeguard check: If deactivating an employee with active assets, return a notification
  const assignedAssets = db.getAssets().filter(a => a.employee_id === employee.id);
  let warningMessage = '';
  if (!nextStatus && assignedAssets.length > 0) {
    warningMessage = `Note: Employee has ${assignedAssets.length} currently assigned asset(s). Assignments remain preserved in records until returned.`;
  }

  const updated = db.updateEmployee(employee.id, { is_active: nextStatus });

  logAuditEvent(req, user, 'Employee', employee.id, 'UPDATED', {
    fieldName: 'is_active',
    oldValue: String(employee.is_active),
    newValue: String(nextStatus)
  });

  return res.json({
    message: `Employee ${employee.full_name} is now ${nextStatus ? 'Active' : 'Deactivated'}.${warningMessage ? ' ' + warningMessage : ''}`,
    employee: updated,
    warning: warningMessage || undefined
  });
});
