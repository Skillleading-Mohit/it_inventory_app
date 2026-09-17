-- ITAM Enterprise Core Relational Schema (PostgreSQL 15+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE asset_status AS ENUM (
    'In Stock', 'Assigned', 'Active', 'Inactive', 'Under Repair', 'Maintenance', 'Disposed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin', 'admin', 'asset_manager', 'operator', 'viewer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(64) PRIMARY KEY,
  employee_code VARCHAR(32) NOT NULL UNIQUE,
  full_name VARCHAR(128) NOT NULL,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(128) NOT NULL UNIQUE,
  department VARCHAR(64) NOT NULL,
  designation VARCHAR(64),
  contact_number VARCHAR(32),
  location VARCHAR(128),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(64) PRIMARY KEY,
  asset_tag VARCHAR(64) NOT NULL UNIQUE,
  hostname VARCHAR(128),
  ip_address VARCHAR(45),
  mac_address VARCHAR(20),
  device_type VARCHAR(32) NOT NULL,
  category VARCHAR(32) NOT NULL,
  manufacturer VARCHAR(64),
  model VARCHAR(128),
  serial_number VARCHAR(128) UNIQUE,
  status asset_status NOT NULL DEFAULT 'In Stock',
  location VARCHAR(128),
  rack VARCHAR(64),
  room VARCHAR(64),
  department VARCHAR(64),
  cost_centre VARCHAR(64),
  purchase_date DATE,
  manufacturing_date DATE,
  installation_date DATE,
  invoice_number VARCHAR(64),
  vendor VARCHAR(128),
  purchase_cost NUMERIC(12, 2) DEFAULT 0.00,
  warranty_start DATE,
  warranty_expiry DATE,
  amc_start DATE,
  amc_expiry DATE,
  expected_replacement_date DATE,
  disposal_date DATE,
  cpu VARCHAR(128),
  ram VARCHAR(64),
  storage VARCHAR(128),
  operating_system VARCHAR(64),
  os_version VARCHAR(64),
  bios_version VARCHAR(64),
  gpu VARCHAR(128),
  monitor_details VARCHAR(128),
  configuration_notes TEXT,
  other_specifications TEXT,
  notes TEXT,
  employee_id VARCHAR(64) REFERENCES employees(id) ON DELETE SET NULL,
  employee_name VARCHAR(128),
  employee_code VARCHAR(32),
  employee_department VARCHAR(64),
  assignment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_tag ON assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_employee ON assets(employee_id);
CREATE INDEX IF NOT EXISTS idx_assets_warranty ON assets(warranty_expiry);
CREATE INDEX IF NOT EXISTS idx_assets_amc ON assets(amc_expiry);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  username VARCHAR(64) NOT NULL,
  entity_type VARCHAR(32) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  action VARCHAR(32) NOT NULL,
  field_name VARCHAR(64),
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
