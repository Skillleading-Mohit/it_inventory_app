import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { User, Employee, Asset, AssetPhoto, AuditLog, UserRole, SystemSettings, LdapConfig } from '../src/types/itam';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'itam_db.json');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'assets');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface DatabaseSchema {
  users: (User & { password_hash: string })[];
  employees: Employee[];
  assets: Asset[];
  photos: AssetPhoto[];
  audit_logs: AuditLog[];
  rate_limit_records: Record<string, { attempts: number; locked_until?: number }>;
  settings?: SystemSettings;
  ldap_config?: LdapConfig;
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'view_assets', 'manage_assets', 'assign_assets', 'delete_assets',
    'view_employees', 'manage_employees',
    'view_history', 'view_reports', 'manage_users', 'manage_photos'
  ],
  admin: [
    'view_assets', 'manage_assets', 'assign_assets', 'delete_assets',
    'view_employees', 'manage_employees',
    'view_history', 'view_reports', 'manage_users', 'manage_photos'
  ],
  asset_manager: [
    'view_assets', 'manage_assets', 'assign_assets',
    'view_employees', 'manage_employees',
    'view_history', 'view_reports', 'manage_photos'
  ],
  operator: [
    'view_assets', 'manage_assets', 'assign_assets',
    'view_employees',
    'view_history', 'manage_photos'
  ],
  viewer: [
    'view_assets', 'view_employees', 'view_reports'
  ]
};

// Simple secure hash helper (SHA-256 with salt) for quick verification
export function hashPassword(password: string): string {
  const salt = 'itam_secure_salt_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();

  const users: (User & { password_hash: string })[] = [
    {
      id: 'usr-1',
      username: 'superadmin',
      email: 'superadmin@enterprise.internal',
      full_name: 'Alexander Wright',
      employee_code: 'EMP-001',
      department: 'Executive',
      designation: 'Chief Technology Officer',
      role: 'super_admin',
      is_active: true,
      last_login: now,
      created_at: '2026-01-10T09:00:00.000Z',
      updated_at: now,
      password_hash: hashPassword('SuperAdmin@2026!')
    },
    {
      id: 'usr-2',
      username: 'admin',
      email: 'admin.it@enterprise.internal',
      full_name: 'Sarah Chen',
      employee_code: 'EMP-002',
      department: 'IT Infrastructure',
      designation: 'Senior IT Systems Administrator',
      role: 'admin',
      is_active: true,
      last_login: now,
      created_at: '2026-01-12T10:30:00.000Z',
      updated_at: now,
      password_hash: hashPassword('AdminPass@2026!')
    },
    {
      id: 'usr-3',
      username: 'asset_mgr',
      email: 'marcus.v@enterprise.internal',
      full_name: 'Marcus Vance',
      employee_code: 'EMP-003',
      department: 'IT Procurement & Asset Management',
      designation: 'Lead IT Asset Manager',
      role: 'asset_manager',
      is_active: true,
      last_login: now,
      created_at: '2026-01-15T11:00:00.000Z',
      updated_at: now,
      password_hash: hashPassword('AssetMgr@2026!')
    },
    {
      id: 'usr-4',
      username: 'operator',
      email: 'elena.rodriguez@enterprise.internal',
      full_name: 'Elena Rodriguez',
      employee_code: 'EMP-004',
      department: 'IT Helpdesk & Operations',
      designation: 'IT Systems Operator',
      role: 'operator',
      is_active: true,
      last_login: now,
      created_at: '2026-01-20T14:00:00.000Z',
      updated_at: now,
      password_hash: hashPassword('Operator@2026!')
    },
    {
      id: 'usr-5',
      username: 'viewer',
      email: 'auditor.readonly@enterprise.internal',
      full_name: 'David Kim',
      employee_code: 'EMP-005',
      department: 'Internal Audit & Compliance',
      designation: 'Compliance Auditor',
      role: 'viewer',
      is_active: true,
      last_login: now,
      created_at: '2026-02-01T08:00:00.000Z',
      updated_at: now,
      password_hash: hashPassword('Viewer@2026!')
    }
  ];

  const employees: Employee[] = [
    {
      id: 'emp-101',
      employee_code: 'EMP-101',
      full_name: 'Michael Vance',
      username: 'mvance',
      email: 'mvance@enterprise.internal',
      department: 'Engineering',
      designation: 'Staff Backend Architect',
      phone: '+1 (555) 234-5671',
      extension: '401',
      location: 'San Francisco HQ - Building A',
      is_active: true,
      created_at: '2025-06-01T09:00:00.000Z',
      updated_at: '2026-01-10T11:00:00.000Z'
    },
    {
      id: 'emp-102',
      employee_code: 'EMP-102',
      full_name: 'Priya Sharma',
      username: 'psharma',
      email: 'psharma@enterprise.internal',
      department: 'Security & DevOps',
      designation: 'Principal Security Engineer',
      phone: '+1 (555) 345-6782',
      extension: '402',
      location: 'San Francisco HQ - Building B',
      is_active: true,
      created_at: '2025-07-15T09:00:00.000Z',
      updated_at: '2026-02-01T12:00:00.000Z'
    },
    {
      id: 'emp-103',
      employee_code: 'EMP-103',
      full_name: 'Jonathan Miller',
      username: 'jmiller',
      email: 'jmiller@enterprise.internal',
      department: 'Product Design',
      designation: 'Lead UX Designer',
      phone: '+1 (555) 456-7893',
      extension: '403',
      location: 'Austin Regional Hub',
      is_active: true,
      created_at: '2025-08-20T09:00:00.000Z',
      updated_at: '2026-01-15T15:00:00.000Z'
    },
    {
      id: 'emp-104',
      employee_code: 'EMP-104',
      full_name: 'Rachel Green',
      username: 'rgreen',
      email: 'rgreen@enterprise.internal',
      department: 'Finance & Accounting',
      designation: 'Financial Controller',
      phone: '+1 (555) 567-8904',
      extension: '404',
      location: 'New York Financial Office',
      is_active: true,
      created_at: '2025-09-01T09:00:00.000Z',
      updated_at: '2026-01-20T10:00:00.000Z'
    },
    {
      id: 'emp-105',
      employee_code: 'EMP-105',
      full_name: 'Thomas Edison',
      username: 'tedison',
      email: 'tedison@enterprise.internal',
      department: 'Data Science',
      designation: 'Senior ML Researcher',
      phone: '+1 (555) 678-9015',
      extension: '405',
      location: 'Seattle Tech Campus',
      is_active: false, // Inactive employee for business rule testing
      created_at: '2025-03-01T09:00:00.000Z',
      updated_at: '2026-01-05T14:00:00.000Z'
    }
  ];

  const assets: Asset[] = [
    {
      id: 'ast-1001',
      asset_tag: 'ITAM-NB-2026-001',
      hostname: 'SF-DEV-MBP16-01',
      ip_address: '10.10.45.101',
      device_type: 'Laptop',
      category: 'Hardware',
      manufacturer: 'Apple',
      model: 'MacBook Pro 16" (M3 Max, 64GB, 1TB)',
      serial_number: 'C02G90XXMD6R',
      status: 'Assigned',
      location: 'San Francisco HQ - Building A',
      rack: 'Desk Station A-14',
      room: 'Engineering Wing 3F',
      department: 'Engineering',
      cost_centre: 'CC-ENG-4001',
      purchase_date: '2025-01-15',
      manufacturing_date: '2024-11-20',
      invoice_number: 'INV-APPL-88902',
      vendor: 'Apple Enterprise Direct',
      purchase_cost: 3499.00,
      installation_date: '2025-01-18',
      warranty_start: '2025-01-15',
      warranty_expiry: '2028-01-15',
      amc_start: '2025-01-15',
      amc_expiry: '2028-01-15',
      expected_replacement_date: '2028-01-15',
      disposal_date: '',
      cpu: 'Apple M3 Max 16-Core',
      ram: '64 GB Unified Memory',
      storage: '1 TB NVMe PCIe SSD',
      operating_system: 'macOS Sonoma',
      os_version: '14.5.1',
      bios_version: 'Apple T2/SEP v11.4',
      mac_address: '3C:06:30:4A:8B:11',
      gpu: 'Apple 40-Core Integrated GPU',
      monitor_details: '16.2" Liquid Retina XDR (3456 x 2234)',
      configuration_notes: 'Encrypted with FileVault. MDM Jamf Pro registered.',
      other_specifications: 'Includes MagSafe 140W USB-C Charger & Thunderbolt 4 cable.',
      employee_id: 'emp-101',
      employee_name: 'Michael Vance',
      employee_code: 'EMP-101',
      employee_department: 'Engineering',
      assignment_date: '2025-01-20',
      return_date: null,
      notes: 'Assigned to Staff Backend Architect. Device configured for core microservice repositories.',
      created_at: '2025-01-18T10:00:00.000Z',
      updated_at: '2025-01-20T14:30:00.000Z'
    },
    {
      id: 'ast-1002',
      asset_tag: 'ITAM-SRV-2026-002',
      hostname: 'DC1-PROD-APP-01',
      ip_address: '10.0.10.25',
      device_type: 'Server',
      category: 'Infrastructure',
      manufacturer: 'Dell Technologies',
      model: 'PowerEdge R750 2U Rack Server',
      serial_number: 'DEL-PE-994821',
      status: 'Active',
      location: 'San Francisco HQ - Building B',
      rack: 'Rack 04 - Unit 18-20',
      room: 'Main Data Center Room 101',
      department: 'IT Infrastructure',
      cost_centre: 'CC-INFRA-1002',
      purchase_date: '2024-03-10',
      manufacturing_date: '2024-02-05',
      invoice_number: 'INV-DELL-556102',
      vendor: 'Dell Enterprise Solutions',
      purchase_cost: 12850.00,
      installation_date: '2024-03-25',
      warranty_start: '2024-03-10',
      warranty_expiry: '2027-03-10',
      amc_start: '2024-03-10',
      amc_expiry: '2027-03-10',
      expected_replacement_date: '2029-03-10',
      disposal_date: '',
      cpu: '2x Intel Xeon Platinum 8360Y 36-Core (72 Cores total)',
      ram: '512 GB DDR4-3200 ECC Registered',
      storage: '8x 3.84TB NVMe SAS SSD in RAID 10',
      operating_system: 'Red Hat Enterprise Linux',
      os_version: '9.3 (Plow)',
      bios_version: 'Dell UEFI v1.8.2',
      mac_address: 'B4:96:91:3C:7A:90',
      gpu: 'Integrated Matrox G200eW3',
      monitor_details: 'Connected to KVM switch port 8',
      configuration_notes: 'Redundant hot-plug 1400W Platinum PSUs. Dual 25GbE SFP28 iDRAC9 Enterprise.',
      other_specifications: 'Hosts Kubernetes production worker node cluster tier 1.',
      employee_id: null,
      assignment_date: null,
      return_date: null,
      notes: 'Core production application server. 99.999% SLA uptime requirements.',
      created_at: '2024-03-25T11:00:00.000Z',
      updated_at: '2026-01-15T09:00:00.000Z'
    },
    {
      id: 'ast-1003',
      asset_tag: 'ITAM-NET-2026-003',
      hostname: 'CORE-FW-PRIMARY-01',
      ip_address: '10.0.0.1',
      device_type: 'Firewall',
      category: 'Network',
      manufacturer: 'Fortinet',
      model: 'FortiGate 100F Next-Gen Firewall',
      serial_number: 'FG100FTK230981',
      status: 'Active',
      location: 'San Francisco HQ - Building B',
      rack: 'Rack 01 - Unit 42',
      room: 'Main Data Center Room 101',
      department: 'Security & DevOps',
      cost_centre: 'CC-SEC-2005',
      purchase_date: '2024-06-01',
      manufacturing_date: '2024-04-12',
      invoice_number: 'INV-FORTI-40912',
      vendor: 'Fortinet Security Direct',
      purchase_cost: 6500.00,
      installation_date: '2024-06-10',
      warranty_start: '2024-06-01',
      warranty_expiry: '2026-10-15', // Expiring in less than 30 days relative to test date
      amc_start: '2024-06-01',
      amc_expiry: '2026-10-15',
      expected_replacement_date: '2028-06-01',
      disposal_date: '',
      cpu: 'SOC4 Fortinet NP6XLite/CP9',
      ram: '16 GB Dedicated High-Speed Memory',
      storage: '64 GB Onboard SSD Storage',
      operating_system: 'FortiOS',
      os_version: '7.4.3',
      bios_version: 'FortiBIOS v2.4.1',
      mac_address: '70:4C:A5:11:22:33',
      gpu: 'None',
      monitor_details: 'Web GUI / SSH Serial Console',
      configuration_notes: 'Primary HA cluster active node. IPS, SSL Inspection, SD-WAN enabled.',
      other_specifications: 'Redundant external power supply unit with surge suppression.',
      employee_id: null,
      assignment_date: null,
      return_date: null,
      notes: 'Perimeter gateway firewall. Requires FortiCare 24x7 AMC renewal shortly.',
      created_at: '2024-06-10T12:00:00.000Z',
      updated_at: '2026-02-10T15:20:00.000Z'
    },
    {
      id: 'ast-1004',
      asset_tag: 'ITAM-NB-2026-004',
      hostname: 'ATX-DS-TPX1-02',
      ip_address: '10.20.12.88',
      device_type: 'Laptop',
      category: 'Hardware',
      manufacturer: 'Lenovo',
      model: 'ThinkPad X1 Carbon Gen 11 (Core i7, 32GB, 512GB)',
      serial_number: 'PF49B901',
      status: 'Assigned',
      location: 'Austin Regional Hub',
      rack: 'Suite 300 - Desk 12',
      room: 'Design Studio West',
      department: 'Product Design',
      cost_centre: 'CC-DES-3001',
      purchase_date: '2024-08-15',
      manufacturing_date: '2024-07-01',
      invoice_number: 'INV-LEN-99120',
      vendor: 'CDW Logistics',
      purchase_cost: 2150.00,
      installation_date: '2024-08-22',
      warranty_start: '2024-08-15',
      warranty_expiry: '2027-08-15',
      amc_start: '2024-08-15',
      amc_expiry: '2027-08-15',
      expected_replacement_date: '2027-08-15',
      disposal_date: '',
      cpu: 'Intel Core i7-1365U vPro (10-Core up to 5.2GHz)',
      ram: '32 GB LPDDR5-6400MHz',
      storage: '512 GB M.2 NVMe Opal 2.0 SSD',
      operating_system: 'Windows 11 Enterprise',
      os_version: '23H2 (Build 22631.3593)',
      bios_version: 'Lenovo N3XET45W (1.23)',
      mac_address: '48:2A:E3:67:89:BC',
      gpu: 'Intel Iris Xe Graphics',
      monitor_details: '14" 2.8K (2880 x 1800) OLED 400 nits',
      configuration_notes: 'BitLocker TPM 2.0 enabled. Intune enrolled.',
      other_specifications: 'Includes Lenovo Thunderbolt 4 Universal Dock & 65W GaN adapter.',
      employee_id: 'emp-103',
      employee_name: 'Jonathan Miller',
      employee_code: 'EMP-103',
      employee_department: 'Product Design',
      assignment_date: '2024-08-25',
      return_date: null,
      notes: 'Primary designer machine. Loaded with Figma, Adobe CC suite, and 3D modeling tools.',
      created_at: '2024-08-22T08:00:00.000Z',
      updated_at: '2024-08-25T16:00:00.000Z'
    },
    {
      id: 'ast-1005',
      asset_tag: 'ITAM-SW-2026-005',
      hostname: 'SW-DIST-CAT9K-01',
      ip_address: '10.0.5.2',
      device_type: 'Switch',
      category: 'Network',
      manufacturer: 'Cisco Systems',
      model: 'Catalyst 9300 48-Port PoE+ Gigabit Switch',
      serial_number: 'FCW2438L0AA',
      status: 'In Stock',
      location: 'San Francisco HQ - Building A',
      rack: 'Storage Cage Alpha',
      room: 'IT Staging & Depot 104',
      department: 'IT Infrastructure',
      cost_centre: 'CC-INFRA-1002',
      purchase_date: '2025-05-10',
      manufacturing_date: '2025-03-15',
      invoice_number: 'INV-CIS-11029',
      vendor: 'World Wide Technology (WWT)',
      purchase_cost: 5400.00,
      installation_date: '',
      warranty_start: '2025-05-10',
      warranty_expiry: '2028-05-10',
      amc_start: '2025-05-10',
      amc_expiry: '2028-05-10',
      expected_replacement_date: '2030-05-10',
      disposal_date: '',
      cpu: 'x86 CPU Multi-Core Cisco Silicon One',
      ram: '16 GB System Memory',
      storage: '16 GB Flash Storage',
      operating_system: 'Cisco IOS-XE',
      os_version: '17.9.4a',
      bios_version: 'Cisco Bootloader v5.2',
      mac_address: '00:FE:C8:49:10:E0',
      gpu: 'None',
      monitor_details: 'Console RJ-45 / Micro-USB',
      configuration_notes: 'Pre-staged with corporate VLAN templates. 715W AC power supply installed.',
      other_specifications: 'Ready for deployment to Building C expansion floor.',
      employee_id: null,
      assignment_date: null,
      return_date: null,
      notes: 'Brand new spare switch in stock. Tested and certified during Q2 staging.',
      created_at: '2025-05-15T14:00:00.000Z',
      updated_at: '2025-05-15T14:00:00.000Z'
    },
    {
      id: 'ast-1006',
      asset_tag: 'ITAM-WS-2026-006',
      hostname: 'SF-DS-PREC5820-01',
      ip_address: '10.10.45.145',
      device_type: 'Workstation',
      category: 'Hardware',
      manufacturer: 'Dell Technologies',
      model: 'Precision 5820 Tower AI Workstation',
      serial_number: 'DEL-PR-773199',
      status: 'Under Repair',
      location: 'San Francisco HQ - Building A',
      rack: 'Repair Workbench 2',
      room: 'IT Service Depot Room 104',
      department: 'Data Science',
      cost_centre: 'CC-DS-5001',
      purchase_date: '2024-01-10',
      manufacturing_date: '2023-11-15',
      invoice_number: 'INV-DELL-99231',
      vendor: 'Dell Enterprise Direct',
      purchase_cost: 7800.00,
      installation_date: '2024-01-20',
      warranty_start: '2024-01-10',
      warranty_expiry: '2027-01-10',
      amc_start: '2024-01-10',
      amc_expiry: '2027-01-10',
      expected_replacement_date: '2027-01-10',
      disposal_date: '',
      cpu: 'Intel Xeon W-2295 18-Core 3.00GHz (4.60GHz Turbo)',
      ram: '128 GB DDR4-2933 RDIMM ECC',
      storage: '2TB NVMe M.2 SSD + 8TB Seagate Enterprise HDD',
      operating_system: 'Ubuntu Linux LTS',
      os_version: '22.04.4 LTS',
      bios_version: 'Dell Precision UEFI v2.14.0',
      mac_address: '50:9A:4C:77:88:99',
      gpu: '2x NVIDIA RTX A6000 48GB GDDR6 with NVLink',
      monitor_details: 'Dual DisplayPort 1.4 connection',
      configuration_notes: 'Intermittent PSU fan noise and thermal throttling detected on GPU 2.',
      other_specifications: 'Dell ProSupport dispatch RMA ticket #982310 pending onsite technician visit.',
      employee_id: null,
      assignment_date: null,
      return_date: '2026-02-14',
      notes: 'Returned by Thomas Edison prior to role transition; flagged for cooling system overhaul.',
      created_at: '2024-01-20T10:00:00.000Z',
      updated_at: '2026-02-14T17:00:00.000Z'
    },
    {
      id: 'ast-1007',
      asset_tag: 'ITAM-UPS-2026-007',
      hostname: 'DC1-UPS-SMART-3K',
      ip_address: '10.0.10.200',
      device_type: 'UPS',
      category: 'Infrastructure',
      manufacturer: 'Schneider Electric / APC',
      model: 'Smart-UPS On-Line 3000VA Rackmount 2U',
      serial_number: 'APC99281042',
      status: 'Active',
      location: 'San Francisco HQ - Building B',
      rack: 'Rack 04 - Unit 1-2',
      room: 'Main Data Center Room 101',
      department: 'IT Infrastructure',
      cost_centre: 'CC-INFRA-1002',
      purchase_date: '2023-09-12',
      manufacturing_date: '2023-08-01',
      invoice_number: 'INV-SCHN-8812',
      vendor: 'Anixter International',
      purchase_cost: 3200.00,
      installation_date: '2023-09-20',
      warranty_start: '2023-09-12',
      warranty_expiry: '2025-09-12', // Expired warranty for testing warranty expired filter
      amc_start: '2023-09-12',
      amc_expiry: '2025-09-12',
      expected_replacement_date: '2027-09-12',
      disposal_date: '',
      cpu: 'Embedded Power Controller DSP',
      ram: '512 MB Firmware Flash',
      storage: 'Internal Battery String 192VDC',
      operating_system: 'APC Network Management Card OS',
      os_version: 'v7.1.2',
      bios_version: 'APC FW v1.08',
      mac_address: '00:C0:B7:12:34:56',
      gpu: 'None',
      monitor_details: 'Front Panel LCD + Web SNMP Interface',
      configuration_notes: 'Battery self-test scheduled bi-weekly. Powering Core Server Rack 04.',
      other_specifications: 'Hot-swappable lead-acid cartridge batteries APCRBC140.',
      employee_id: null,
      assignment_date: null,
      return_date: null,
      notes: 'Warranty is expired! Requires battery replacement evaluation & new AMC contract.',
      created_at: '2023-09-20T09:00:00.000Z',
      updated_at: '2025-10-01T11:00:00.000Z'
    },
    {
      id: 'ast-1008',
      asset_tag: 'ITAM-NB-2026-008',
      hostname: 'NYC-FIN-DELL7440-01',
      ip_address: '10.30.15.42',
      device_type: 'Laptop',
      category: 'Hardware',
      manufacturer: 'Dell Technologies',
      model: 'Latitude 7440 Ultralight (Core i7, 32GB, 512GB)',
      serial_number: 'DEL-LAT-893012',
      status: 'Assigned',
      location: 'New York Financial Office',
      rack: 'Floor 18 - Office 1804',
      room: 'Finance Executive Suite',
      department: 'Finance & Accounting',
      cost_centre: 'CC-FIN-7001',
      purchase_date: '2025-02-01',
      manufacturing_date: '2024-12-10',
      invoice_number: 'INV-DELL-33019',
      vendor: 'Dell Corporate Direct',
      purchase_cost: 1899.00,
      installation_date: '2025-02-05',
      warranty_start: '2025-02-01',
      warranty_expiry: '2028-02-01',
      amc_start: '2025-02-01',
      amc_expiry: '2028-02-01',
      expected_replacement_date: '2028-02-01',
      disposal_date: '',
      cpu: 'Intel Core i7-1365U 10-Core Processor',
      ram: '32 GB LPDDR5',
      storage: '512 GB M.2 NVMe Gen4 SSD',
      operating_system: 'Windows 11 Pro for Workstations',
      os_version: '23H2 (Build 22631.3527)',
      bios_version: 'Dell Latitude UEFI v1.7.1',
      mac_address: '74:78:27:A1:B2:C3',
      gpu: 'Intel Iris Xe Graphics',
      monitor_details: '14.0" FHD+ (1920x1200) Anti-Glare IPS 400 nits ComfortView+',
      configuration_notes: 'Enrolled in SAP ERP VPN profile and secure banking tokens.',
      other_specifications: 'Integrated smart card reader, fingerprint sensor in power button.',
      employee_id: 'emp-104',
      employee_name: 'Rachel Green',
      employee_code: 'EMP-104',
      employee_department: 'Finance & Accounting',
      assignment_date: '2025-02-06',
      return_date: null,
      notes: 'Assigned to Financial Controller. Enhanced BitLocker PIN enforcement configured.',
      created_at: '2025-02-05T09:00:00.000Z',
      updated_at: '2025-02-06T14:00:00.000Z'
    },
    {
      id: 'ast-1009',
      asset_tag: 'ITAM-MON-2026-009',
      hostname: 'SF-MON-DELL32-01',
      ip_address: '',
      device_type: 'Monitor',
      category: 'Peripheral',
      manufacturer: 'Dell Technologies',
      model: 'UltraSharp U2723QE 27" 4K USB-C Hub Monitor',
      serial_number: 'CN-093821-DEL',
      status: 'Assigned',
      location: 'San Francisco HQ - Building A',
      rack: 'Desk Station A-14',
      room: 'Engineering Wing 3F',
      department: 'Engineering',
      cost_centre: 'CC-ENG-4001',
      purchase_date: '2025-01-15',
      manufacturing_date: '2024-10-10',
      invoice_number: 'INV-APPL-88902',
      vendor: 'Dell Enterprise Direct',
      purchase_cost: 620.00,
      installation_date: '2025-01-18',
      warranty_start: '2025-01-15',
      warranty_expiry: '2028-01-15',
      amc_start: '2025-01-15',
      amc_expiry: '2028-01-15',
      expected_replacement_date: '2029-01-15',
      disposal_date: '',
      cpu: 'IPS Black Panel Driver',
      ram: 'None',
      storage: 'None',
      operating_system: 'Dell Display Manager Firmware',
      os_version: 'vM2T103',
      bios_version: 'N/A',
      mac_address: '',
      gpu: 'None',
      monitor_details: '27" 4K UHD 3840x2160 @ 60Hz, 98% DCI-P3, IPS Black 2000:1 Contrast',
      configuration_notes: '90W USB-C Power Delivery hub connected to MacBook Pro 16".',
      other_specifications: 'Integrated RJ45 1GbE Ethernet pass-through port and KVM switch.',
      employee_id: 'emp-101',
      employee_name: 'Michael Vance',
      employee_code: 'EMP-101',
      employee_department: 'Engineering',
      assignment_date: '2025-01-20',
      return_date: null,
      notes: 'Part of standard engineering twin-monitor workstation bundle.',
      created_at: '2025-01-18T10:00:00.000Z',
      updated_at: '2025-01-20T14:30:00.000Z'
    },
    {
      id: 'ast-1010',
      asset_tag: 'ITAM-PRN-2026-010',
      hostname: 'NYC-PRN-HP507-01',
      ip_address: '10.30.15.20',
      device_type: 'Printer',
      category: 'Peripheral',
      manufacturer: 'HP Enterprise',
      model: 'LaserJet Enterprise M507dn Workgroup Printer',
      serial_number: 'JPBGD09812',
      status: 'Active',
      location: 'New York Financial Office',
      rack: 'Print Station 18A',
      room: 'Finance Executive Copy Center',
      department: 'Finance & Accounting',
      cost_centre: 'CC-FIN-7001',
      purchase_date: '2024-04-10',
      manufacturing_date: '2024-02-15',
      invoice_number: 'INV-HP-9941',
      vendor: 'Staples Advantage B2B',
      purchase_cost: 850.00,
      installation_date: '2024-04-18',
      warranty_start: '2024-04-10',
      warranty_expiry: '2027-04-10',
      amc_start: '2024-04-10',
      amc_expiry: '2027-04-10',
      expected_replacement_date: '2029-04-10',
      disposal_date: '',
      cpu: '1.2 GHz HP Secure Processor',
      ram: '512 MB (expandable to 1.5 GB)',
      storage: '4 GB Embedded eMMC Storage',
      operating_system: 'HP FutureSmart Firmware',
      os_version: 'v5.7.1.1',
      bios_version: 'HP BIOS Guard v2.0',
      mac_address: '3C:D9:2B:55:66:77',
      gpu: 'None',
      monitor_details: '2.7-inch (6.86 cm) QVGA LCD with keypad',
      configuration_notes: 'PIN release secure printing enabled for sensitive financial reports.',
      other_specifications: 'Duplex printing up to 45 ppm with HP Sure Start self-healing security.',
      employee_id: null,
      assignment_date: null,
      return_date: null,
      notes: 'High-speed monochrome workgroup printer. Maintenance kit scheduled annually.',
      created_at: '2024-04-18T11:00:00.000Z',
      updated_at: '2024-04-18T11:00:00.000Z'
    },
    {
      id: 'ast-1011',
      asset_tag: 'ITAM-DSK-2022-011',
      hostname: 'LEGACY-OPTIPLEX-09',
      ip_address: '10.10.99.12',
      device_type: 'Desktop',
      category: 'Hardware',
      manufacturer: 'Dell Technologies',
      model: 'OptiPlex 7070 SFF (Core i5, 8GB, 256GB SSD)',
      serial_number: 'DEL-OPT-331001',
      status: 'Disposed',
      location: 'San Francisco HQ - Building B',
      rack: 'E-Waste Bin 03',
      room: 'Basement Storage / Recycling Depot',
      department: 'Operations',
      cost_centre: 'CC-OPS-9001',
      purchase_date: '2020-02-15',
      manufacturing_date: '2020-01-05',
      invoice_number: 'INV-DELL-HIST-112',
      vendor: 'Dell Direct',
      purchase_cost: 950.00,
      installation_date: '2020-02-20',
      warranty_start: '2020-02-15',
      warranty_expiry: '2023-02-15',
      amc_start: '2020-02-15',
      amc_expiry: '2023-02-15',
      expected_replacement_date: '2024-02-15',
      disposal_date: '2025-11-30',
      cpu: 'Intel Core i5-9500 6-Core',
      ram: '8 GB DDR4',
      storage: '256 GB SATA SSD (Degaussed & Destroyed)',
      operating_system: 'Windows 10 Pro',
      os_version: '21H2',
      bios_version: 'Dell BIOS 1.4.1',
      mac_address: '18:03:73:9A:BC:DE',
      gpu: 'Intel UHD 630',
      monitor_details: 'None',
      configuration_notes: 'Storage drive wiped and degaussed in compliance with NIST SP 800-88 Rev 1.',
      other_specifications: 'Certificate of Certified Electronic Waste Destruction #E-WASTE-2025-881.',
      employee_id: null,
      assignment_date: null,
      return_date: '2025-10-15',
      notes: 'Fully depreciated and decommissioned. Certified e-waste recycled.',
      created_at: '2020-02-20T09:00:00.000Z',
      updated_at: '2025-11-30T16:00:00.000Z'
    }
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'aud-001',
      entity_type: 'Asset',
      entity_id: 'ast-1001',
      action: 'CREATED',
      field_name: null,
      old_value: null,
      new_value: 'Asset ITAM-NB-2026-001 (Apple MacBook Pro 16") created with status In Stock',
      performed_by: 'usr-3',
      username: 'asset_mgr',
      ip_address: '192.168.1.45',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: '2025-01-18T10:00:00.000Z'
    },
    {
      id: 'aud-002',
      entity_type: 'Asset',
      entity_id: 'ast-1001',
      action: 'ASSIGNED',
      field_name: 'employee_id',
      old_value: null,
      new_value: 'Assigned to Michael Vance (EMP-101)',
      performed_by: 'usr-4',
      username: 'operator',
      ip_address: '192.168.1.52',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: '2025-01-20T14:30:00.000Z'
    },
    {
      id: 'aud-003',
      entity_type: 'Asset',
      entity_id: 'ast-1006',
      action: 'STATUS_CHANGED',
      field_name: 'status',
      old_value: 'Assigned',
      new_value: 'Under Repair',
      performed_by: 'usr-2',
      username: 'admin',
      ip_address: '192.168.1.10',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64)',
      timestamp: '2026-02-14T17:00:00.000Z'
    },
    {
      id: 'aud-004',
      entity_type: 'Auth',
      entity_id: 'usr-1',
      action: 'LOGIN_SUCCESS',
      field_name: null,
      old_value: null,
      new_value: 'User superadmin authenticated successfully via Argon2id verification',
      performed_by: 'usr-1',
      username: 'superadmin',
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      timestamp: now
    }
  ];

  return {
    users,
    employees,
    assets,
    photos: [],
    audit_logs,
    rate_limit_records: {},
    settings: {
      app_name: 'ITAM Enterprise',
      theme: 'default',
      custom_logo_url: null,
      custom_logo_base64: null,
      company_name: 'Enterprise IT Global',
      updated_at: new Date().toISOString(),
      updated_by: 'system'
    },
    ldap_config: {
      enabled: true,
      server_url: 'ldap://ad.corp.internal:389',
      bind_dn: 'cn=svc_itam_sync,ou=ServiceAccounts,dc=corp,dc=internal',
      bind_password: '••••••••••••••••',
      base_dn: 'ou=Users,ou=Enterprise,dc=corp,dc=internal',
      user_search_filter: '(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))',
      sync_schedule: 'daily',
      attribute_mapping: {
        employee_code: 'employeeID',
        full_name: 'displayName',
        username: 'sAMAccountName',
        email: 'mail',
        department: 'department',
        designation: 'title',
        phone: 'telephoneNumber',
        location: 'physicalDeliveryOfficeName'
      },
      last_sync_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      last_sync_status: 'success',
      last_sync_message: 'Completed scheduled synchronization without errors.',
      last_sync_count: 15
    }
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database, initializing fresh database:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public save(): void {
    this.saveData(this.data);
  }

  // Assets
  public getAssets(): Asset[] {
    return this.data.assets;
  }

  public getAssetById(id: string): Asset | undefined {
    const asset = this.data.assets.find(a => a.id === id);
    if (!asset) return undefined;
    const photos = this.data.photos.filter(p => p.asset_id === id);
    return { ...asset, photos };
  }

  public getAssetByTag(tag: string): Asset | undefined {
    return this.data.assets.find(a => a.asset_tag.toLowerCase() === tag.toLowerCase());
  }

  public addAsset(asset: Asset): void {
    this.data.assets.unshift(asset);
    this.save();
  }

  public updateAsset(id: string, updates: Partial<Asset>): Asset | undefined {
    const index = this.data.assets.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    this.data.assets[index] = {
      ...this.data.assets[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.assets[index];
  }

  public deleteAsset(id: string): boolean {
    const initialLen = this.data.assets.length;
    this.data.assets = this.data.assets.filter(a => a.id !== id);
    if (this.data.assets.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Employees
  public getEmployees(): Employee[] {
    return this.data.employees.map(emp => {
      const assigned_assets_count = this.data.assets.filter(a => a.employee_id === emp.id).length;
      return { ...emp, assigned_assets_count };
    });
  }

  public getEmployeeById(id: string): Employee | undefined {
    const emp = this.data.employees.find(e => e.id === id);
    if (!emp) return undefined;
    const assigned_assets_count = this.data.assets.filter(a => a.employee_id === emp.id).length;
    return { ...emp, assigned_assets_count };
  }

  public getEmployeeByCode(code: string): Employee | undefined {
    return this.data.employees.find(e => e.employee_code.toLowerCase() === code.toLowerCase());
  }

  public addEmployee(employee: Employee): void {
    this.data.employees.unshift(employee);
    this.save();
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
    const index = this.data.employees.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    this.data.employees[index] = {
      ...this.data.employees[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    // Also update denormalized employee names on assigned assets if name changed
    if (updates.full_name || updates.employee_code || updates.department) {
      this.data.assets = this.data.assets.map(asset => {
        if (asset.employee_id === id) {
          return {
            ...asset,
            employee_name: updates.full_name || asset.employee_name,
            employee_code: updates.employee_code || asset.employee_code,
            employee_department: updates.department || asset.employee_department
          };
        }
        return asset;
      });
    }
    this.save();
    return this.data.employees[index];
  }

  // Photos
  public getPhotos(assetId: string): AssetPhoto[] {
    return this.data.photos.filter(p => p.asset_id === assetId);
  }

  public addPhoto(photo: AssetPhoto): void {
    this.data.photos.push(photo);
    this.save();
  }

  public deletePhoto(photoId: string): AssetPhoto | undefined {
    const photo = this.data.photos.find(p => p.id === photoId);
    if (!photo) return undefined;
    this.data.photos = this.data.photos.filter(p => p.id !== photoId);
    this.save();
    return photo;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const completeLog: AuditLog = {
      ...log,
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.unshift(completeLog);
    // Keep last 5000 audit logs to preserve fast memory while retaining comprehensive history
    if (this.data.audit_logs.length > 5000) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 5000);
    }
    this.save();
    return completeLog;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users.map(({ password_hash, ...rest }) => rest);
  }

  public getUserById(id: string): (User & { password_hash: string }) | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByUsername(username: string): (User & { password_hash: string }) | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public addUser(user: User & { password_hash: string }): void {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<User & { password_hash: string }>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    const { password_hash, ...safeUser } = this.data.users[index];
    return safeUser;
  }

  // System Settings (Theme & Logo)
  public getSettings(): SystemSettings {
    if (!this.data.settings) {
      this.data.settings = {
        app_name: 'ITAM Enterprise',
        theme: 'default',
        custom_logo_url: null,
        custom_logo_base64: null,
        company_name: 'Enterprise IT Global',
        updated_at: new Date().toISOString(),
        updated_by: 'system'
      };
      this.save();
    }
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>, updatedBy: string): SystemSettings {
    const current = this.getSettings();
    this.data.settings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    };
    this.save();
    return this.data.settings;
  }

  // LDAP Configuration & State
  public getLdapConfig(): LdapConfig {
    if (!this.data.ldap_config) {
      this.data.ldap_config = {
        enabled: true,
        server_url: 'ldap://ad.corp.internal:389',
        bind_dn: 'cn=svc_itam_sync,ou=ServiceAccounts,dc=corp,dc=internal',
        bind_password: '••••••••••••••••',
        base_dn: 'ou=Users,ou=Enterprise,dc=corp,dc=internal',
        user_search_filter: '(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))',
        sync_schedule: 'daily',
        attribute_mapping: {
          employee_code: 'employeeID',
          full_name: 'displayName',
          username: 'sAMAccountName',
          email: 'mail',
          department: 'department',
          designation: 'title',
          phone: 'telephoneNumber',
          location: 'physicalDeliveryOfficeName'
        },
        last_sync_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        last_sync_status: 'success',
        last_sync_message: 'Completed scheduled synchronization without errors.',
        last_sync_count: 15
      };
      this.save();
    }
    return this.data.ldap_config;
  }

  public updateLdapConfig(updates: Partial<LdapConfig>): LdapConfig {
    const current = this.getLdapConfig();
    this.data.ldap_config = {
      ...current,
      ...updates
    };
    this.save();
    return this.data.ldap_config;
  }
}

export const db = new Database();
