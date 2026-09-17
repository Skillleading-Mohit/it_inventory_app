import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db, UPLOAD_DIR } from '../db';
import { requireAuth, requirePermission } from '../auth';
import { logAuditEvent, logObjectChanges } from '../audit';
import type { Asset, AssetStatus, DeviceType, AssetCategory, PhotoType } from '../../src/types/itam';

export const assetRouter = Router();

// Configure secure Multer upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate secure random filename to avoid path traversal and collision
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = 'photo_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex') + ext;
    cb(null, safeName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are permitted for asset photographs.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  }
});

// Validation Helper
function validateAssetInput(body: any, isEdit = false, currentId = ''): string | null {
  if (!body.asset_tag || !body.asset_tag.trim()) {
    return 'Asset Tag is required.';
  }

  // Check unique Asset Tag
  const existing = db.getAssetByTag(body.asset_tag.trim());
  if (existing && (!isEdit || existing.id !== currentId)) {
    return `Asset Tag '${body.asset_tag}' is already registered to another asset.`;
  }

  if (!body.device_type) {
    return 'Device Type is required.';
  }

  // Validate IP address format if provided
  if (body.ip_address && body.ip_address.trim()) {
    const ip = body.ip_address.trim();
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipv4Regex.test(ip)) {
      return `Invalid IPv4 address format: '${ip}'. Example: 192.168.1.100`;
    }
  }

  // Validate MAC address format if provided
  if (body.mac_address && body.mac_address.trim()) {
    const mac = body.mac_address.trim();
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac)) {
      return `Invalid MAC address format: '${mac}'. Example: 3C:06:30:4A:8B:11`;
    }
  }

  // Validate purchase cost
  if (body.purchase_cost !== undefined && body.purchase_cost !== null && body.purchase_cost !== '') {
    const cost = Number(body.purchase_cost);
    if (isNaN(cost) || cost < 0) {
      return 'Purchase cost must be a non-negative number.';
    }
  }

  // Validate warranty dates
  if (body.warranty_start && body.warranty_expiry) {
    if (new Date(body.warranty_expiry) < new Date(body.warranty_start)) {
      return 'Warranty Expiry date cannot be earlier than Warranty Start date.';
    }
  }

  // Validate AMC dates
  if (body.amc_start && body.amc_expiry) {
    if (new Date(body.amc_expiry) < new Date(body.amc_start)) {
      return 'AMC Expiry date cannot be earlier than AMC Start date.';
    }
  }

  return null;
}

// GET /api/assets - List with keyword search, multi-filters & pagination
assetRouter.get('/', requireAuth, (req: Request, res: Response) => {
  const {
    q,
    status,
    device_type,
    category,
    location,
    department,
    assigned,
    page = '1',
    limit = '15',
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  let assets = [...db.getAssets()];

  // Keyword search across tag, hostname, serial, model, vendor, IP, MAC, employee
  if (q && typeof q === 'string') {
    const search = q.toLowerCase().trim();
    assets = assets.filter(a =>
      a.asset_tag.toLowerCase().includes(search) ||
      a.hostname.toLowerCase().includes(search) ||
      a.serial_number.toLowerCase().includes(search) ||
      a.model.toLowerCase().includes(search) ||
      a.manufacturer.toLowerCase().includes(search) ||
      (a.ip_address && a.ip_address.toLowerCase().includes(search)) ||
      (a.mac_address && a.mac_address.toLowerCase().includes(search)) ||
      (a.employee_name && a.employee_name.toLowerCase().includes(search)) ||
      (a.department && a.department.toLowerCase().includes(search))
    );
  }

  // Filters
  if (status && status !== 'all') {
    assets = assets.filter(a => a.status === status);
  }
  if (device_type && device_type !== 'all') {
    assets = assets.filter(a => a.device_type === device_type);
  }
  if (category && category !== 'all') {
    assets = assets.filter(a => a.category === category);
  }
  if (location && location !== 'all') {
    assets = assets.filter(a => a.location === location);
  }
  if (department && department !== 'all') {
    assets = assets.filter(a => a.department === department);
  }
  if (assigned && assigned !== 'all') {
    if (assigned === 'assigned') {
      assets = assets.filter(a => a.employee_id !== null && a.employee_id !== '');
    } else if (assigned === 'unassigned') {
      assets = assets.filter(a => !a.employee_id);
    }
  }

  // Sorting
  assets.sort((a: any, b: any) => {
    const fieldA = a[sort_by as string] || '';
    const fieldB = b[sort_by as string] || '';
    if (sort_order === 'asc') {
      return fieldA > fieldB ? 1 : -1;
    }
    return fieldA < fieldB ? 1 : -1;
  });

  const total = assets.length;
  const pageNum = parseInt(page as string, 10) || 1;
  const pageLimit = parseInt(limit as string, 10) || 15;
  const startIndex = (pageNum - 1) * pageLimit;
  const paginated = assets.slice(startIndex, startIndex + pageLimit);

  // Extract filter facets for quick dropdown selection
  const allAssets = db.getAssets();
  const facets = {
    locations: Array.from(new Set(allAssets.map(a => a.location).filter(Boolean))),
    departments: Array.from(new Set(allAssets.map(a => a.department).filter(Boolean))),
    device_types: Array.from(new Set(allAssets.map(a => a.device_type).filter(Boolean))),
    statuses: ['In Stock', 'Assigned', 'Active', 'Inactive', 'Under Repair', 'Maintenance', 'Disposed']
  };

  return res.json({
    assets: paginated,
    total,
    page: pageNum,
    total_pages: Math.ceil(total / pageLimit),
    limit: pageLimit,
    facets
  });
});

// GET /api/assets/:id - Asset detail with photos, assignment info & recent audit trail
assetRouter.get('/:id', requireAuth, (req: Request, res: Response) => {
  const asset = db.getAssetById(req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found.' });
  }

  // Find audit history specifically for this asset
  const history = db.getAuditLogs()
    .filter(log => log.entity_type === 'Asset' && log.entity_id === asset.id)
    .slice(0, 30);

  // If assigned to employee, fetch fresh employee info
  let employee = null;
  if (asset.employee_id) {
    employee = db.getEmployeeById(asset.employee_id) || null;
  }

  return res.json({
    asset,
    employee,
    history
  });
});

// POST /api/assets - Create Asset
assetRouter.post('/', requireAuth, requirePermission('manage_assets'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const validationError = validateAssetInput(req.body, false);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const now = new Date().toISOString();
  const newAsset: Asset = {
    id: 'ast-' + Date.now(),
    asset_tag: req.body.asset_tag.trim(),
    hostname: req.body.hostname?.trim() || '',
    ip_address: req.body.ip_address?.trim() || '',
    device_type: req.body.device_type as DeviceType,
    category: (req.body.category || 'Hardware') as AssetCategory,
    manufacturer: req.body.manufacturer?.trim() || '',
    model: req.body.model?.trim() || '',
    serial_number: req.body.serial_number?.trim() || '',
    status: (req.body.status || 'In Stock') as AssetStatus,
    location: req.body.location?.trim() || '',
    rack: req.body.rack?.trim() || '',
    room: req.body.room?.trim() || '',
    department: req.body.department?.trim() || '',
    cost_centre: req.body.cost_centre?.trim() || '',
    purchase_date: req.body.purchase_date || '',
    manufacturing_date: req.body.manufacturing_date || '',
    invoice_number: req.body.invoice_number?.trim() || '',
    vendor: req.body.vendor?.trim() || '',
    purchase_cost: Number(req.body.purchase_cost) || 0,
    installation_date: req.body.installation_date || '',
    warranty_start: req.body.warranty_start || '',
    warranty_expiry: req.body.warranty_expiry || '',
    amc_start: req.body.amc_start || '',
    amc_expiry: req.body.amc_expiry || '',
    expected_replacement_date: req.body.expected_replacement_date || '',
    disposal_date: req.body.disposal_date || '',
    cpu: req.body.cpu?.trim() || '',
    ram: req.body.ram?.trim() || '',
    storage: req.body.storage?.trim() || '',
    operating_system: req.body.operating_system?.trim() || '',
    os_version: req.body.os_version?.trim() || '',
    bios_version: req.body.bios_version?.trim() || '',
    mac_address: req.body.mac_address?.trim() || '',
    gpu: req.body.gpu?.trim() || '',
    monitor_details: req.body.monitor_details?.trim() || '',
    configuration_notes: req.body.configuration_notes?.trim() || '',
    other_specifications: req.body.other_specifications?.trim() || '',
    employee_id: null,
    assignment_date: null,
    return_date: null,
    notes: req.body.notes?.trim() || '',
    created_at: now,
    updated_at: now
  };

  db.addAsset(newAsset);

  logAuditEvent(req, user, 'Asset', newAsset.id, 'CREATED', {
    newValue: `Created asset ${newAsset.asset_tag} (${newAsset.manufacturer} ${newAsset.model}) with status '${newAsset.status}'`
  });

  return res.status(201).json({
    message: 'Asset created successfully',
    asset: newAsset
  });
});

// PUT /api/assets/:id - Full or Partial Edit with surgical audit logging
assetRouter.put('/:id', requireAuth, requirePermission('manage_assets'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const assetId = req.params.id;
  const oldAsset = db.getAssetById(assetId);
  if (!oldAsset) {
    return res.status(404).json({ error: 'Asset not found.' });
  }

  const validationError = validateAssetInput(req.body, true, assetId);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Update object
  const updates: Partial<Asset> = {
    asset_tag: req.body.asset_tag?.trim(),
    hostname: req.body.hostname?.trim(),
    ip_address: req.body.ip_address?.trim(),
    device_type: req.body.device_type,
    category: req.body.category,
    manufacturer: req.body.manufacturer?.trim(),
    model: req.body.model?.trim(),
    serial_number: req.body.serial_number?.trim(),
    status: req.body.status,
    location: req.body.location?.trim(),
    rack: req.body.rack?.trim(),
    room: req.body.room?.trim(),
    department: req.body.department?.trim(),
    cost_centre: req.body.cost_centre?.trim(),
    purchase_date: req.body.purchase_date,
    manufacturing_date: req.body.manufacturing_date,
    invoice_number: req.body.invoice_number?.trim(),
    vendor: req.body.vendor?.trim(),
    purchase_cost: Number(req.body.purchase_cost) || 0,
    installation_date: req.body.installation_date,
    warranty_start: req.body.warranty_start,
    warranty_expiry: req.body.warranty_expiry,
    amc_start: req.body.amc_start,
    amc_expiry: req.body.amc_expiry,
    expected_replacement_date: req.body.expected_replacement_date,
    disposal_date: req.body.disposal_date,
    cpu: req.body.cpu?.trim(),
    ram: req.body.ram?.trim(),
    storage: req.body.storage?.trim(),
    operating_system: req.body.operating_system?.trim(),
    os_version: req.body.os_version?.trim(),
    bios_version: req.body.bios_version?.trim(),
    mac_address: req.body.mac_address?.trim(),
    gpu: req.body.gpu?.trim(),
    monitor_details: req.body.monitor_details?.trim(),
    configuration_notes: req.body.configuration_notes?.trim(),
    other_specifications: req.body.other_specifications?.trim(),
    notes: req.body.notes?.trim()
  };

  // Perform field-level comparison and log individual changed attributes
  logObjectChanges(req, user, 'Asset', assetId, oldAsset, updates);

  const updated = db.updateAsset(assetId, updates);

  return res.json({
    message: 'Asset updated successfully',
    asset: updated
  });
});

// POST /api/assets/:id/assign - Assignment Workflow
assetRouter.post('/:id/assign', requireAuth, requirePermission('assign_assets'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const asset = db.getAssetById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found.' });

  // Disposed check
  if (asset.status === 'Disposed') {
    return res.status(400).json({ error: 'Cannot assign a Disposed asset. The asset has reached end-of-life.' });
  }

  const { employee_id, assignment_date, notes } = req.body;
  if (!employee_id) {
    return res.status(400).json({ error: 'Please select an employee to assign this asset to.' });
  }

  const employee = db.getEmployeeById(employee_id);
  if (!employee) {
    return res.status(404).json({ error: 'Target employee not found.' });
  }

  // Business rule: Check if employee is active
  if (!employee.is_active) {
    return res.status(400).json({
      error: `Cannot assign asset to inactive employee (${employee.full_name} - ${employee.employee_code}). Employee must be active.`
    });
  }

  const assignDate = assignment_date || new Date().toISOString().split('T')[0];
  const oldEmployeeName = asset.employee_name || 'Unassigned';

  const updated = db.updateAsset(asset.id, {
    employee_id: employee.id,
    employee_name: employee.full_name,
    employee_code: employee.employee_code,
    employee_department: employee.department,
    assignment_date: assignDate,
    return_date: null,
    status: 'Assigned',
    notes: notes ? `${asset.notes ? asset.notes + '\n' : ''}[Assigned on ${assignDate} to ${employee.full_name}]: ${notes}` : asset.notes
  });

  logAuditEvent(req, user, 'Asset', asset.id, 'ASSIGNED', {
    fieldName: 'employee_id',
    oldValue: oldEmployeeName,
    newValue: `Assigned to ${employee.full_name} (${employee.employee_code}, ${employee.department}) on ${assignDate}`
  });

  return res.json({
    message: `Asset successfully assigned to ${employee.full_name}`,
    asset: updated
  });
});

// POST /api/assets/:id/return - Return Workflow
assetRouter.post('/:id/return', requireAuth, requirePermission('assign_assets'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const asset = db.getAssetById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found.' });

  if (!asset.employee_id) {
    return res.status(400).json({ error: 'This asset is not currently assigned to any employee.' });
  }

  const { return_date, resulting_status = 'In Stock', notes } = req.body;
  const retDate = return_date || new Date().toISOString().split('T')[0];
  const previousEmployeeName = asset.employee_name || 'Unknown Employee';

  const updated = db.updateAsset(asset.id, {
    employee_id: null,
    employee_name: undefined,
    employee_code: undefined,
    employee_department: undefined,
    return_date: retDate,
    status: resulting_status as AssetStatus,
    notes: notes ? `${asset.notes ? asset.notes + '\n' : ''}[Returned on ${retDate} from ${previousEmployeeName}]: ${notes}` : asset.notes
  });

  logAuditEvent(req, user, 'Asset', asset.id, 'RETURNED', {
    fieldName: 'employee_id',
    oldValue: previousEmployeeName,
    newValue: `Returned on ${retDate}. Status changed to '${resulting_status}'`
  });

  return res.json({
    message: `Asset successfully returned from ${previousEmployeeName}. Status set to ${resulting_status}.`,
    asset: updated
  });
});

// POST /api/assets/:id/status - Quick Status Change
assetRouter.post('/:id/status', requireAuth, requirePermission('manage_assets'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const asset = db.getAssetById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found.' });

  const { status, notes, disposal_date } = req.body;
  const validStatuses: AssetStatus[] = [
    'In Stock', 'Assigned', 'Active', 'Inactive', 'Under Repair', 'Maintenance', 'Disposed'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const updates: Partial<Asset> = { status };
  if (status === 'Disposed') {
    updates.disposal_date = disposal_date || new Date().toISOString().split('T')[0];
    // If disposing, clear employee assignment
    if (asset.employee_id) {
      updates.employee_id = null;
      updates.employee_name = undefined;
    }
  }

  if (notes) {
    updates.notes = `${asset.notes ? asset.notes + '\n' : ''}[Status -> ${status}]: ${notes}`;
  }

  const updated = db.updateAsset(asset.id, updates);

  logAuditEvent(req, user, 'Asset', asset.id, 'STATUS_CHANGED', {
    fieldName: 'status',
    oldValue: asset.status,
    newValue: status
  });

  return res.json({
    message: `Status updated to ${status}`,
    asset: updated
  });
});

// POST /api/assets/:id/photos - Secure photo upload
assetRouter.post('/:id/photos', requireAuth, requirePermission('manage_photos'), upload.single('photo'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const asset = db.getAssetById(req.params.id);
  if (!asset) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(404).json({ error: 'Asset not found.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded or invalid file format.' });
  }

  const photoType: PhotoType = (req.body.photo_type as PhotoType) || 'Front';

  const newPhoto = {
    id: 'pht-' + Date.now(),
    asset_id: asset.id,
    photo_type: photoType,
    original_filename: req.file.originalname,
    stored_filename: req.file.filename,
    mime_type: req.file.mimetype,
    file_size: req.file.size,
    uploaded_by: user.id,
    uploaded_by_name: user.full_name,
    uploaded_at: new Date().toISOString(),
    url: `/uploads/assets/${req.file.filename}`
  };

  db.addPhoto(newPhoto);

  logAuditEvent(req, user, 'Photo', newPhoto.id, 'PHOTO_UPLOADED', {
    newValue: `Uploaded ${photoType} photograph for asset ${asset.asset_tag} (${req.file.originalname})`
  });

  return res.status(201).json({
    message: 'Photograph uploaded successfully',
    photo: newPhoto
  });
});

// DELETE /api/assets/:id/photos/:photoId - Delete photo
assetRouter.delete('/:id/photos/:photoId', requireAuth, requirePermission('manage_photos'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id, photoId } = req.params;

  const deletedPhoto = db.deletePhoto(photoId);
  if (!deletedPhoto) {
    return res.status(404).json({ error: 'Photograph not found.' });
  }

  // Delete actual file from storage disk safely
  const filePath = path.join(UPLOAD_DIR, deletedPhoto.stored_filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error removing photo file from storage:', err);
    }
  }

  logAuditEvent(req, user, 'Photo', photoId, 'PHOTO_DELETED', {
    oldValue: deletedPhoto.original_filename,
    newValue: `Deleted photograph (${deletedPhoto.photo_type}) from asset ${id}`
  });

  return res.json({ message: 'Photograph deleted successfully.' });
});

// DELETE /api/assets/:id - Soft Delete / Retire
assetRouter.delete('/:id', requireAuth, requirePermission('delete_assets'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const asset = db.getAssetById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found.' });

  if (asset.employee_id) {
    return res.status(400).json({
      error: `Cannot delete asset '${asset.asset_tag}' because it is actively assigned to ${asset.employee_name}. Please return the asset first.`
    });
  }

  db.deleteAsset(asset.id);

  logAuditEvent(req, user, 'Asset', asset.id, 'DELETED', {
    oldValue: `${asset.asset_tag} (${asset.manufacturer} ${asset.model})`,
    newValue: 'Asset record permanently removed by authorized user'
  });

  return res.json({ message: `Asset '${asset.asset_tag}' deleted successfully.` });
});
