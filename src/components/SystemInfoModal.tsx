import React, { useState } from 'react';
import {
  X,
  Server,
  Database,
  Cloud,
  ShieldCheck,
  FileCode,
  Terminal,
  CheckCircle2,
  Copy,
  Layers
} from 'lucide-react';

interface SystemInfoModalProps {
  onClose: () => void;
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'docker' | 'postgres' | 'azure' | 'security'>('docker');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dockerComposeYaml = `version: '3.8'

services:
  itam-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: itam-core-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_CONNECTION_STRING=postgresql://itam_admin:\${DB_PASSWORD}@postgres-db:5432/itam_production
      - SESSION_SECRET=\${SESSION_SECRET}
      - STORAGE_BACKEND=local
      - UPLOAD_DIR=/app/uploads
    volumes:
      - itam_data:/app/data
      - itam_uploads:/app/uploads
    depends_on:
      postgres-db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  postgres-db:
    image: postgres:16-alpine
    container_name: itam-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=itam_admin
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
      - POSTGRES_DB=itam_production
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U itam_admin -d itam_production"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  itam_data:
  itam_uploads:
  pgdata:`;

  const postgresSqlSchema = `-- ITAM Enterprise Core Relational Schema (PostgreSQL 15+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE asset_status AS ENUM (
  'In Stock', 'Assigned', 'Active', 'Inactive', 'Under Repair', 'Maintenance', 'Disposed'
);

CREATE TYPE user_role AS ENUM (
  'super_admin', 'admin', 'asset_manager', 'operator', 'viewer'
);

CREATE TABLE employees (
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

CREATE TABLE assets (
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

CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_tag ON assets(asset_tag);
CREATE INDEX idx_assets_employee ON assets(employee_id);
CREATE INDEX idx_assets_warranty ON assets(warranty_expiry);
CREATE INDEX idx_assets_amc ON assets(amc_expiry);

CREATE TABLE audit_logs (
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

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);`;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">ITAM Architecture & Production Deployment</h2>
              <p className="text-xs text-slate-400">
                Docker containerization, PostgreSQL relational mapping, Azure migration roadmap, and security posture.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex gap-4 text-xs font-medium">
          {[
            { id: 'docker', label: 'Docker Compose & Container', icon: Terminal },
            { id: 'postgres', label: 'PostgreSQL Relational DDL', icon: Database },
            { id: 'azure', label: 'Azure Migration Roadmap', icon: Cloud },
            { id: 'security', label: 'Security & Integrity Posture', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {activeTab === 'docker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Production docker-compose.yml</h3>
                  <p className="text-[11px] text-slate-500">
                    Self-healing multi-container stack with Express/Vite core service and PostgreSQL database.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(dockerComposeYaml)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy YAML'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {dockerComposeYaml}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">Volume Persistence</span>
                  <p className="text-slate-600 text-[11px]">
                    Named Docker volumes persist SQLite/JSON state, PostgreSQL disk, and uploaded asset photos.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">Port 3000 Ingress</span>
                  <p className="text-slate-600 text-[11px]">
                    Single port exposure with static reverse proxy routing and Express API middleware.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">Healthchecks</span>
                  <p className="text-slate-600 text-[11px]">
                    Native Docker healthcheck hooks on <code className="text-indigo-600 font-mono">/health</code> with auto-recovery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'postgres' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Production PostgreSQL Schema (DDL)</h3>
                  <p className="text-[11px] text-slate-500">
                    Strong types, ENUM constraints, foreign key cascades, and high-performance indexes.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(postgresSqlSchema)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-96">
                {postgresSqlSchema}
              </pre>
            </div>
          )}

          {activeTab === 'azure' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Microsoft Azure Enterprise Migration Path</h3>
                <p className="text-[11px] text-slate-500">
                  Step-by-step guidance to transition from container runtime to native Azure PaaS / IaaS.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Option 1: Azure App Service (Linux Web App Containers)</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Deploy this multi-container application directly to Azure App Service for Containers. Connect via Azure Virtual Network (VNet) to Azure Database for PostgreSQL Flexible Server.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Option 2: Azure Kubernetes Service (AKS)</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Containerize with standard Helm charts into AKS with Azure Container Registry (ACR), Azure Key Vault for secrets injection, and Azure Files Persistent Volume Claims (PVC) for asset photos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Option 3: Azure Blob Storage for Hardware Photographs</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Replace local disk uploads with Azure Blob Storage SDK (<code className="font-mono">@azure/storage-blob</code>) with Shared Access Signature (SAS) tokens and geo-redundant storage (GRS).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Enterprise Security & Compliance Controls</h3>
                <p className="text-[11px] text-slate-500">
                  Built-in defensive controls meeting corporate IT audit benchmarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/75">
                  <span className="font-bold text-slate-900 block mb-1">Authentication & Lockouts</span>
                  <p className="text-slate-600 leading-relaxed">
                    Salted SHA-256 password hashes, 5-attempt brute-force rate limit with automatic 15-minute lockouts, and secure HTTP session cookies.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/75">
                  <span className="font-bold text-slate-900 block mb-1">Role-Based Access Control (RBAC)</span>
                  <p className="text-slate-600 leading-relaxed">
                    Strict separation of privileges across 5 roles: Super Admin, Admin, Asset Manager, Operator, and Viewer.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/75">
                  <span className="font-bold text-slate-900 block mb-1">Formula Injection Sanitization</span>
                  <p className="text-slate-600 leading-relaxed">
                    All exported CSV and Excel cells starting with <code className="font-mono">=, +, -, @</code> are safely prepended with single quotes to neutralize DDE injection attacks in spreadsheet viewers.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/75">
                  <span className="font-bold text-slate-900 block mb-1">Strict File Upload Validation</span>
                  <p className="text-slate-600 leading-relaxed">
                    Uploads restricted to JPEG/PNG/WebP with 5MB file cap, server-generated unique UUID names, and prevention of executable file uploads.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
