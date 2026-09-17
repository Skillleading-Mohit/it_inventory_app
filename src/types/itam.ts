/**
 * Core Type Definitions for Enterprise IT Asset Management (ITAM) System
 */

export type UserRole = 'super_admin' | 'admin' | 'asset_manager' | 'operator' | 'viewer';

export interface UserPermission {
  view_assets: boolean;
  manage_assets: boolean;
  assign_assets: boolean;
  delete_assets: boolean;
  view_employees: boolean;
  manage_employees: boolean;
  view_history: boolean;
  view_reports: boolean;
  manage_users: boolean;
  manage_photos: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  employee_code?: string;
  department: string;
  designation: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  username: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
  extension: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_assets_count?: number;
}

export type AssetStatus = 
  | 'In Stock'
  | 'Assigned'
  | 'Active'
  | 'Inactive'
  | 'Under Repair'
  | 'Maintenance'
  | 'Disposed';

export type DeviceType = 
  | 'Laptop'
  | 'Desktop'
  | 'Workstation'
  | 'Server'
  | 'Firewall'
  | 'Switch'
  | 'Router'
  | 'Access Point'
  | 'Monitor'
  | 'Storage'
  | 'UPS'
  | 'Printer'
  | 'Mobile'
  | 'Other';

export type AssetCategory = 
  | 'Hardware'
  | 'Network'
  | 'Peripheral'
  | 'Infrastructure'
  | 'Mobile Device'
  | 'Other';

export type PhotoType = 
  | 'Front'
  | 'Back'
  | 'Serial Number'
  | 'Damage/Condition'
  | 'Installation'
  | 'Other';

export interface AssetPhoto {
  id: string;
  asset_id: string;
  photo_type: PhotoType;
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  url: string;
}

export interface Asset {
  id: string;
  // Identification
  asset_tag: string;
  hostname: string;
  ip_address: string;
  device_type: DeviceType;
  category: AssetCategory;
  manufacturer: string;
  model: string;
  serial_number: string;

  // Status
  status: AssetStatus;

  // Location
  location: string;
  rack: string;
  room: string;
  department: string;
  cost_centre: string;

  // Procurement & Lifecycle
  purchase_date: string;
  manufacturing_date: string;
  invoice_number: string;
  vendor: string;
  purchase_cost: number;
  installation_date: string;
  warranty_start: string;
  warranty_expiry: string;
  amc_start: string;
  amc_expiry: string;
  expected_replacement_date: string;
  disposal_date: string;

  // Configuration
  cpu: string;
  ram: string;
  storage: string;
  operating_system: string;
  os_version: string;
  bios_version: string;
  mac_address: string;
  gpu: string;
  monitor_details: string;
  configuration_notes: string;
  other_specifications: string;

  // Assignment
  employee_id: string | null;
  employee_name?: string;
  employee_code?: string;
  employee_department?: string;
  assignment_date: string | null;
  return_date: string | null;

  // General
  notes: string;
  created_at: string;
  updated_at: string;

  // Related data (populated in details view)
  photos?: AssetPhoto[];
}

export interface AuditLog {
  id: string;
  entity_type: 'Asset' | 'Employee' | 'User' | 'Photo' | 'Auth' | 'Report';
  entity_id: string;
  action: 
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'ASSIGNED'
    | 'RETURNED'
    | 'STATUS_CHANGED'
    | 'PHOTO_UPLOADED'
    | 'PHOTO_DELETED'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'ROLE_CHANGED'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'LOGOUT'
    | 'PASSWORD_CHANGED'
    | 'REPORT_GENERATED';
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  username: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface DashboardMetrics {
  total_assets: number;
  active_assets: number;
  assigned_assets: number;
  in_stock_assets: number;
  under_repair_assets: number;
  disposed_assets: number;
  active_employees: number;
  active_users: number;
  warranty_expiring_soon: number; // <= 30 days
  warranty_expired: number;
  amc_expiring_soon: number;      // <= 30 days
  amc_expired: number;
  total_inventory_value: number;
  status_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  department_distribution: Record<string, number>;
}
