import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Boxes,
  Users,
  History,
  FileSpreadsheet,
  ShieldCheck,
  Palette,
  Server,
  Search,
  CheckCircle2,
  Clock,
  Laptop,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Terminal,
  FileText
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const sections = [
    { id: 'overview', title: '1. Executive Overview & Purpose', icon: BookOpen },
    { id: 'rbac', title: '2. Roles & Permissions (RBAC)', icon: ShieldCheck },
    { id: 'dashboard', title: '3. Dashboard & Operations Health', icon: Laptop },
    { id: 'assets', title: '4. Asset Inventory & Lifecycle', icon: Boxes },
    { id: 'employees', title: '5. Employee Directory & LDAP Sync', icon: Users },
    { id: 'maintenance', title: '6. Maintenance, Warranties & AMC', icon: AlertTriangle },
    { id: 'audit', title: '7. Audit Trail & Compliance Log', icon: History },
    { id: 'reports', title: '8. Reports & Analytics Engine', icon: FileSpreadsheet },
    { id: 'settings', title: '9. Theme & Custom Branding', icon: Palette },
    { id: 'architecture', title: '10. Architecture & Docker Blueprint', icon: Server }
  ];

  const filteredSections = searchQuery.trim()
    ? sections.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sections;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Enterprise ITAM Platform Documentation & User Guide
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  v2.4.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">Comprehensive feature reference, user workflows, and operational use cases</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Directory */}
          <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-2 flex-1 overflow-y-auto space-y-0.5">
              {filteredSections.map(sec => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reading Content Pane */}
          <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-800 text-sm leading-relaxed">
            {/* 1. OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">1. Executive Overview & System Purpose</h1>
                  <p className="text-slate-600">
                    The Enterprise IT Asset Management (ITAM) platform is a centralized, audit-compliant system designed to govern the end-to-end lifecycle of corporate hardware and technology infrastructure. It eliminates ghost assets, resolves custodian ambiguity, tracks warranty risks, and enforces accountability through append-only event logs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <h3 className="font-semibold text-indigo-950 text-sm mb-1 flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-indigo-600" />
                      Hardware Asset Governance
                    </h3>
                    <p className="text-xs text-slate-600">
                      Granular tracking from acquisition and provisioning through live employee custody, depot repairs, and e-waste certified decommissioning.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <h3 className="font-semibold text-emerald-950 text-sm mb-1 flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-600" />
                      Strict Regulatory Compliance
                    </h3>
                    <p className="text-xs text-slate-600">
                      Append-only, tamper-evident audit ledger capturing every assignment, return, status transition, and administrative action with timestamps and user identifiers.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-2">Key Problem Statements Solved</h2>
                  <ul className="space-y-2 text-xs text-slate-700 list-disc pl-5">
                    <li><strong className="text-slate-900">Preventing Hardware Loss & Misplacement:</strong> Instant clarity on who holds every laptop, monitor, and server across branch offices.</li>
                    <li><strong className="text-slate-900">Preventing Financial Waste:</strong> Automatic tracking of manufacturer warranties and Annual Maintenance Contracts (AMC) prevents paying out-of-pocket for covered repairs.</li>
                    <li><strong className="text-slate-900">Seamless Onboarding & Offboarding:</strong> Fast asset assignment and verified custody return with automated employee synchronization via LDAP / Active Directory.</li>
                    <li><strong className="text-slate-900">Audit Readiness:</strong> Pre-built compliance reports exportable to CSV and print-ready formats for financial auditors and security certifications (ISO 27001, SOC 2).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. RBAC */}
            {activeSection === 'rbac' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">2. Role-Based Access Control (RBAC)</h1>
                  <p className="text-slate-600">
                    The platform implements a least-privilege security model with five distinct operational roles. Administrative capabilities are isolated to prevent unauthorized modifications.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-rose-900 text-sm">Super Admin</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-800">Unrestricted Tier</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Full system authority, system branding customization, LDAP directory configuration, database maintenance, user provisioning, and access to internal system architecture specifications.</p>
                    <div className="text-[11px] font-medium text-rose-800">Use Case: Senior IT Director or Infrastructure Head managing company-wide platform parameters and IT policies.</div>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-purple-900 text-sm">Admin</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-800">Administrative Tier</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Can create and modify hardware assets, provision employee records, initiate LDAP synchronizations, and generate all financial and inventory reports. Excludes logo/theme system alterations.</p>
                    <div className="text-[11px] font-medium text-purple-800">Use Case: IT Team Lead overseeing asset allocations and department operations.</div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-blue-900 text-sm">Asset Manager</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-800">Operational Tier</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Responsible for registering incoming stock, assigning devices to personnel, processing hardware returns, and adjusting maintenance status.</p>
                    <div className="text-[11px] font-medium text-blue-800">Use Case: Hardware Inventory Specialist managing the physical hardware staging depot.</div>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-900 text-sm">Operator</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800">Fulfillment Tier</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Can execute routine hardware checkouts, check-ins, and send faulty machines to &quot;Under Repair&quot;. Cannot delete assets or modify employee profiles.</p>
                    <div className="text-[11px] font-medium text-amber-800">Use Case: IT Helpdesk Technician handling daily employee equipment handovers.</div>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-900 text-sm">Viewer</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">Auditor Tier</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Read-only visibility into assets, employee custody records, audit logs, and reports. All state modification operations are disabled.</p>
                    <div className="text-[11px] font-medium text-emerald-800">Use Case: Financial Auditor, Compliance Inspector, or Executive assessing asset valuation.</div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DASHBOARD */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">3. Dashboard & Operations Health</h1>
                  <p className="text-slate-600">
                    The operational dashboard provides an executive overview of organizational inventory health, financial capital under management, and real-time alerts for impending warranty and maintenance expirations.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Key Performance Metrics (KPIs)</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Total Assets & Capital Valuation:</strong> Aggregated count and currency value of all tracked equipment.</li>
                      <li><strong>Active Custody Utilization:</strong> Percentage of inventory actively deployed to staff versus reserve stock.</li>
                      <li><strong>Depot Maintenance Count:</strong> Real-time tally of equipment currently in RMA repair or decommission queue.</li>
                      <li><strong>Active Employees:</strong> Count of personnel currently recognized as eligible asset custodians.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Impending Expiry Watchlist</h3>
                    <p className="mb-2">
                      Highlighting assets within a 30-day window of manufacturer warranty or AMC expiration. Allows IT teams to schedule renewals before hardware is exposed to unbudgeted repair costs.
                    </p>
                    <div className="text-[11px] text-indigo-700 font-medium">Use Case: Monthly IT budgeting meetings to approve OEM service contract renewals.</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Live Audit Stream</h3>
                    <p>
                      Displays the 10 most recent system events in real time, offering immediate visibility into recent hardware handovers, status changes, and staff registrations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ASSETS */}
            {activeSection === 'assets' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">4. Asset Inventory & Lifecycle Management</h1>
                  <p className="text-slate-600">
                    Hardware assets follow a strictly governed state machine ensuring complete chain-of-custody tracking from arrival to recycling.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-200">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Lifecycle State Progression</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">In Stock (Available)</span>
                    <span>→</span>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Deployed (In Use)</span>
                    <span>→</span>
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Under Repair</span>
                    <span>→</span>
                    <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Decommissioned / Disposed</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Key Operational Capabilities</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <h4 className="font-semibold text-slate-900 mb-1">Hardware Specification Matrix</h4>
                      <p className="text-slate-600">Records CPU architecture, RAM, storage drive type, GPU, screen resolution, operating system, and MAC address.</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <h4 className="font-semibold text-slate-900 mb-1">Barcode & QR Code Printing</h4>
                      <p className="text-slate-600">Generates instant print-ready asset tags for physical chassis labeling and rapid warehouse scanning.</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <h4 className="font-semibold text-slate-900 mb-1">Custody Checkout & Assignment</h4>
                      <p className="text-slate-600">Assigns hardware directly to an active employee, capturing deployment date and optional handover notes.</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <h4 className="font-semibold text-slate-900 mb-1">Check-in & Return Processing</h4>
                      <p className="text-slate-600">Processes custody relinquishment upon offboarding or upgrade, returning the machine to stock or repair status.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. EMPLOYEES & LDAP */}
            {activeSection === 'employees' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">5. Employee Directory & LDAP / Active Directory Sync</h1>
                  <p className="text-slate-600">
                    Maintains the custodian registry of authorized corporate staff and provides direct synchronization with enterprise LDAP or Microsoft Active Directory servers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs space-y-2">
                  <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-600" />
                    LDAP / Active Directory Synchronization Engine
                  </h3>
                  <p className="text-slate-700">
                    Connects directly to organizational directory infrastructure (such as OpenLDAP, Microsoft Active Directory, FreeIPA) to ingest staff records, update department hierarchies, and deactivate parted employees automatically.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>Protocol Support:</strong> Standard LDAP (port 389) and secure encrypted LDAPS (port 636) with TLS verification options.</li>
                    <li><strong>Service Account Bind:</strong> Authenticates via dedicated administrative bind DN and encrypted credentials.</li>
                    <li><strong>Granular Search Filters:</strong> Restricts synchronization to organizational units (OUs), active security groups (e.g. <code>(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))</code>).</li>
                    <li><strong>Attribute Mapping:</strong> Maps AD attributes (<code>employeeID</code>, <code>displayName</code>, <code>mail</code>, <code>department</code>, <code>title</code>, <code>telephoneNumber</code>, <code>physicalDeliveryOfficeName</code>) to ITAM fields.</li>
                    <li><strong>Diagnostic Tools:</strong> Built-in <em>Test Connection & Bind</em> checks server latency and reports sample matching records before triggering production ingestion.</li>
                  </ul>
                </div>

                <div className="text-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Employee Custody Inspection</h3>
                  <p className="text-slate-600">
                    Clicking on any employee reveals all currently assigned hardware assets (laptops, monitors, phones) alongside their full custody history, allowing instant audit verification during exit clearances.
                  </p>
                </div>
              </div>
            )}

            {/* 6. MAINTENANCE & AMC */}
            {activeSection === 'maintenance' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">6. Maintenance, Warranties & AMC</h1>
                  <p className="text-slate-600">
                    Governs vendor repair warranties, Annual Maintenance Contracts (AMC), and depot hardware service ticketing to prevent out-of-pocket costs and minimize operational downtime.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                    <h3 className="font-bold text-amber-950 text-sm mb-1">Warranty Governance</h3>
                    <p className="text-slate-600 mb-2">Tracks OEM factory warranty start and expiration dates for Dell, Lenovo, Apple, HP, and Cisco equipment.</p>
                    <div className="text-[11px] font-semibold text-amber-800">Use Case: Verifying if an accidental motherboard failure is covered under AppleCare or Dell ProSupport before calling service.</div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                    <h3 className="font-bold text-blue-950 text-sm mb-1">Annual Maintenance Contracts (AMC)</h3>
                    <p className="text-slate-600 mb-2">Monitors third-party facilities and infrastructure service agreements for network switches, UPS units, and server racks.</p>
                    <div className="text-[11px] font-semibold text-blue-800">Use Case: Planning contract renewals 30 days prior to expiration to maintain 24/7 SLA uptime.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Depot RMA & Repair Workflow</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                    <li>Operator identifies hardware malfunction and changes status to <strong>Under Repair</strong>.</li>
                    <li>System disassociates the custodian and records maintenance dispatch in the audit ledger.</li>
                    <li>Temporary loaner laptop is assigned to the employee from reserve stock.</li>
                    <li>Upon return from OEM service, machine is restored to <strong>In Stock</strong> or reassigned.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 7. AUDIT TRAIL */}
            {activeSection === 'audit' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">7. Audit Trail & Compliance Ledger</h1>
                  <p className="text-slate-600">
                    An immutable, append-only chronological log recording all critical events within the enterprise IT asset lifecycle.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Regulatory Compliance Ready (SOC 2, ISO 27001, Sarbanes-Oxley)
                  </h3>
                  <p>
                    Each log entry captures:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li>Exact UTC and local microsecond timestamp.</li>
                    <li>Actor ID, username, and authenticated operational role.</li>
                    <li>Action category: <code>CREATE</code>, <code>ASSIGN</code>, <code>RETURN</code>, <code>STATUS_CHANGE</code>, <code>DELETE</code>, <code>LDAP_SYNC</code>, <code>SETTINGS_UPDATE</code>.</li>
                    <li>Target asset tag or employee ID.</li>
                    <li>Granular metadata diff comparing before-and-after states.</li>
                  </ul>
                </div>

                <div className="text-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Forensic Investigation Use Case</h3>
                  <p className="text-slate-600">
                    In the event of a missing high-value laptop during quarterly inventory reconciliation, security investigators can query the asset tag to see exactly who created it, who was assigned custody, what dates it was checked in, and who authorized any status changes.
                  </p>
                </div>
              </div>
            )}

            {/* 8. REPORTS */}
            {activeSection === 'reports' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">8. Reports & Analytics Engine</h1>
                  <p className="text-slate-600">
                    The platform provides nine standardized operational and compliance reports, with instant data filtering, on-screen preview, CSV data export, and print-ready PDF formatting.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Comprehensive Report Catalog & Use Cases</h3>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">1. Complete Hardware Inventory</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">Operational</span>
                      </div>
                      <p className="text-slate-600 mb-1">Comprehensive export of all registered enterprise IT hardware assets across branches.</p>
                      <div className="text-[11px] text-indigo-700 font-medium">Use Case: Annual physical inventory reconciliation and fixed asset register verification with finance.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">2. Warranty Expiring Soon (≤ 30 Days)</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Preventive</span>
                      </div>
                      <p className="text-slate-600 mb-1">Hardware nearing OEM warranty expiration within the upcoming month.</p>
                      <div className="text-[11px] text-amber-800 font-medium">Use Case: Proactively scheduling manufacturer warranty extensions before expiration penalizes coverage.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">3. Warranty Expired Assets</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">Risk Assessment</span>
                      </div>
                      <p className="text-slate-600 mb-1">Active production hardware operating beyond warranty coverage dates.</p>
                      <div className="text-[11px] text-rose-800 font-medium">Use Case: Prioritizing capital expenditure for hardware refresh cycles and replacing aging workstations.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">4. AMC Expiring Soon (≤ 30 Days)</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Contracts</span>
                      </div>
                      <p className="text-slate-600 mb-1">Annual Maintenance Contracts nearing renewal cut-off for critical server and network gear.</p>
                      <div className="text-[11px] text-blue-800 font-medium">Use Case: Purchase order generation and vendor negotiation for ongoing maintenance coverage.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">5. Expired AMC Hardware</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">Critical Risk</span>
                      </div>
                      <p className="text-slate-600 mb-1">Mission-critical infrastructure devices currently operating without an active service contract.</p>
                      <div className="text-[11px] text-purple-800 font-medium">Use Case: Escalating high-risk operational single points of failure to the Chief Information Officer.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">6. Assigned Custody Assets</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Custody</span>
                      </div>
                      <p className="text-slate-600 mb-1">All computers, mobile devices, and peripherals currently deployed to active personnel.</p>
                      <div className="text-[11px] text-emerald-800 font-medium">Use Case: Human Resources audit to cross-reference employee rosters against issued technology.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">7. In Stock / Available Spares</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">Depot Stock</span>
                      </div>
                      <p className="text-slate-600 mb-1">Hardware residing in the storage warehouse available for immediate deployment.</p>
                      <div className="text-[11px] text-teal-800 font-medium">Use Case: Verifying buffer stock availability ahead of upcoming new-hire batch onboarding.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">8. Under Repair / Depot RMA</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">Maintenance</span>
                      </div>
                      <p className="text-slate-600 mb-1">Equipment experiencing hardware defects currently under authorized vendor diagnosis or service.</p>
                      <div className="text-[11px] text-orange-800 font-medium">Use Case: Tracking vendor turnaround times and ensuring SLA return deadlines are met.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-slate-900 text-sm">9. Disposed & E-Waste Retired</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">Decommissioning</span>
                      </div>
                      <p className="text-slate-600 mb-1">Decommissioned equipment officially certified for recycling or electronic scrap disposal.</p>
                      <div className="text-[11px] text-slate-700 font-medium">Use Case: Environmental, Social & Governance (ESG) reporting and environmental compliance certificates.</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-1">Export Capabilities</h4>
                  <p className="text-slate-600 mb-2">
                    Every report can be exported in two standard business formats:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>CSV Export:</strong> Raw structured comma-separated spreadsheet data compatible with Excel, Google Sheets, and Business Intelligence (BI) pipelines.</li>
                    <li><strong>Print / PDF Export:</strong> Cleanly typeset document layout optimized for physical paper printing or digital PDF archive generation with corporate header stamps.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 9. THEME & BRANDING */}
            {activeSection === 'settings' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">9. Theme Customization & System Branding</h1>
                  <p className="text-slate-600">
                    Exclusively accessible to Super Admins, this module allows tailoring the platform&apos;s visual presentation to match corporate brand guidelines or accessibility requirements.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Theme Palette Selection</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="p-3 rounded-lg border border-slate-300 bg-white">
                        <div className="font-semibold text-slate-900 mb-1">Slate & Indigo (Default)</div>
                        <p className="text-slate-500 text-[11px]">Modern corporate color palette with deep slate headers, vibrant indigo accents, and subtle status color highlights.</p>
                      </div>
                      <div className="p-3 rounded-lg border border-black bg-zinc-950 text-white">
                        <div className="font-semibold text-white mb-1">Black & White (High-Contrast Monochrome)</div>
                        <p className="text-zinc-400 text-[11px]">Ultra-clean monochrome presentation with stark borders, crisp black badges, and maximal optical readability for high-contrast viewing.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Custom Corporate Logo Upload</h3>
                    <p className="text-slate-600 mb-2">
                      Super Admins can upload any PNG, SVG, WebP, or JPEG image file (up to 2MB) or provide an HTTPS image URL. The logo is automatically scaled and rendered in the top navigation bar across all workstations.
                    </p>
                    <div className="text-[11px] text-indigo-700 font-medium">Use Case: Co-branding for multinational enterprises or client-specific managed service deployments.</div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. ARCHITECTURE */}
            {activeSection === 'architecture' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">10. System Architecture & Docker Blueprint</h1>
                  <p className="text-slate-600">
                    The platform is engineered as a lightweight, production-ready, full-stack application built for containerized deployment on Docker, Kubernetes, or Google Cloud Run.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    Production Stack Breakdown
                  </div>
                  <div className="text-slate-400 space-y-1">
                    <div>Frontend: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite</div>
                    <div>Backend: Node.js Express REST API server</div>
                    <div>Persistence: SQLite / PostgreSQL compatible SQL schema with WAL mode</div>
                    <div>Port Binding: Single-port ingress proxy on port 3000</div>
                    <div>LDAP Client: Node.js directory sync protocol adapter</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Deployment Blueprint (Dockerfile)</h3>
                  <p className="text-slate-600">
                    Multi-stage Docker builds ensure zero development bloat in production containers, achieving sub-100MB production image sizes with automated health checks on <code>/api/health</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enterprise ITAM Standard Operating Procedure (SOP) Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
