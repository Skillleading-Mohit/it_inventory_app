# Enterprise IT Asset Management (ITAM) Platform
## Complete Feature Guide, Operational Manual, & First-Time Configuration Runbook

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Role-Based Access Control (RBAC) & Security Model](#2-role-based-access-control-rbac--security-model)
3. [Comprehensive Feature Reference](#3-comprehensive-feature-reference)
   - [3.1 Operational Dashboard & Fleet Health](#31-operational-dashboard--fleet-health)
   - [3.2 Hardware Asset Inventory & Lifecycle Management](#32-hardware-asset-inventory--lifecycle-management)
   - [3.3 Employee Directory & Custody Inspection](#33-employee-directory--custody-inspection)
   - [3.4 LDAP / Active Directory Synchronization Engine](#34-ldap--active-directory-synchronization-engine)
   - [3.5 Maintenance, Warranties & AMC Governance](#35-maintenance-warranties--amc-governance)
   - [3.6 Immutable Audit Trail & Regulatory Compliance Ledger](#36-immutable-audit-trail--regulatory-compliance-ledger)
   - [3.7 Reports & Analytics Engine (All 9 Reports & Use Cases)](#37-reports--analytics-engine-all-9-reports--use-cases)
   - [3.8 Theme Customization & Corporate Branding](#38-theme-customization--corporate-branding)
   - [3.9 User Account Management & RBAC Administration](#39-user-account-management--rbac-administration)
   - [3.10 System Architecture & Blueprint Modal](#310-system-architecture--blueprint-modal)
4. [Step-by-Step First-Time Configuration Guide](#4-step-by-step-first-time-configuration-guide)
   - [Step 1: Environment & System Prerequisites](#step-1-environment--system-prerequisites)
   - [Step 2: Installation & Launch (Docker or Native Node.js)](#step-2-installation--launch-docker-or-native-nodejs)
   - [Step 3: Initial Super Admin Login & Security Hardening](#step-3-initial-super-admin-login--security-hardening)
   - [Step 4: Configure Corporate Branding & Visual Theme](#step-4-configure-corporate-branding--visual-theme)
   - [Step 5: Setup Employee Directory & LDAP / Active Directory Sync](#step-5-setup-employee-directory--ldap--active-directory-sync)
   - [Step 6: Hardware Asset Ingestion & Tag Printing](#step-6-hardware-asset-ingestion--tag-printing)
   - [Step 7: Provision Team Accounts & Assign Operational Roles](#step-7-provision-team-accounts--assign-operational-roles)
   - [Step 8: Set Up Scheduled Backups & Monitoring](#step-8-set-up-scheduled-backups--monitoring)
5. [Default Credentials & Access Reference](#5-default-credentials--access-reference)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Production Troubleshooting & Diagnostics](#7-production-troubleshooting--diagnostics)
8. [Backup, Disaster Recovery & Maintenance](#8-backup-disaster-recovery--maintenance)

---

## 1. System Overview & Architecture

The **Enterprise IT Asset Management (ITAM) System** is a full-stack, audit-compliant platform engineered to govern the entire operational and physical lifecycle of corporate technology assets — including workstations, laptops, servers, network switches, monitors, and peripherals.

### Architecture Stack:
- **Frontend**: Single-Page Application (SPA) built with React 18, TypeScript, Tailwind CSS v4, Lucide Icons, and Motion transitions.
- **Backend**: Express REST API server running on Node.js, bundled via `esbuild` into a self-contained CommonJS runtime (`dist/server.cjs`).
- **Data Persistence**:
  - Resilient JSON-backed atomic storage engine with transactional file writing (`data/*.json`).
  - Native schema compatibility with PostgreSQL 15+ (`init-scripts/01-init.sql`).
- **Networking & Containerization**: Alpine Linux multi-stage Docker container configured with a single ingress port on port `3000`.
- **Directory Service**: Native LDAP / LDAPS client supporting standard Active Directory, OpenLDAP, and FreeIPA endpoints.

---

## 2. Role-Based Access Control (RBAC) & Security Model

The system enforces a strict least-privilege security model across 5 operational roles. Administrative functions (such as logo customization, user creation, LDAP configuration, and system architecture inspection) are restricted server-side:

| Role | Access Tier | Permitted Operations | Primary Target Persona |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Unrestricted | Full platform authority, corporate branding & logo upload, theme switching (Black & White vs. Slate), user account provisioning, password resets, LDAP sync configuration, and access to internal system architecture. | Chief Information Officer (CIO), Head of IT Infrastructure |
| **Admin** | Administrative | Register and edit assets, provision employee records, initiate LDAP directory syncs, generate all financial/inventory reports, and view audit history. Cannot modify system-wide logos or themes. | IT Operations Manager, Service Desk Lead |
| **Asset Manager** | Operational | Register stock, update hardware specs, assign hardware to staff, process check-in/returns, and update repair status. | Hardware Depot Specialist, Staging Manager |
| **Operator** | Fulfillment | Execute routine asset checkouts, check-ins, record physical return conditions, and flag machines as "Under Repair". Cannot delete assets or manage users. | IT Helpdesk Technician, Onsite Support Engineer |
| **Viewer** | Auditor | Read-only visibility into assets, employee custody records, audit logs, and reports. All state modification operations are disabled. | Financial Auditor, SOC 2 / ISO Compliance Inspector |

---

## 3. Comprehensive Feature Reference

### 3.1 Operational Dashboard & Fleet Health
The operational dashboard provides real-time situational awareness across the hardware fleet:
- **KPI Metric Cards**: Real-time counts of Total Hardware Units, Total Capital Valuation under management, Active Custody Deployment Rate (%), Depot Maintenance Queue, and Total Active Custodians.
- **Impending Expiry Watchlist**: Surfaces devices whose OEM manufacturer warranty or Annual Maintenance Contract (AMC) expires in **$\le$ 30 days**, as well as devices already operating without warranty coverage.
- **Live Audit Activity Stream**: Displays the 10 most recent system events in real-time with actor identifiers, action types, target asset tags, and microsecond timestamps.
- **Direct Action Shortcuts**: Quick buttons for "Add New Asset" and "Go to Employees" tailored to the user's role permissions.

### 3.2 Hardware Asset Inventory & Lifecycle Management
Governs assets throughout their complete lifecycle state progression:
$$\text{In Stock (Available)} \longrightarrow \text{Deployed (In Use)} \longleftrightarrow \text{Under Repair (Depot RMA)} \longrightarrow \text{Decommissioned / Disposed}$$

- **Hardware Categorization**: Laptops, Desktops, Servers, Monitors, Mobile Devices, Network Switches, Storage Arrays, and Peripherals.
- **Deep Technical Specs**: CPU architecture, RAM, primary storage (SSD/NVMe/HDD), GPU, display resolution, OS platform, and MAC address.
- **Financial & Vendor Records**: Vendor/supplier name, purchase date, purchase price, invoice reference, factory warranty start/end, and AMC contract dates.
- **Photo Attachments**: Upload up to 5 hardware photos per asset (JPEG, PNG, WebP up to 5MB) for physical condition verification.
- **Barcode & QR Tag Printing**: Generates instant, print-ready asset labels containing asset tags, serial numbers, and QR codes for physical warehouse scanning.
- **Custody Handover Actions**:
  - *Assign Asset*: Select custodian from employee registry, record deployment date, and save handover notes.
  - *Return Asset*: Relinquish employee custody, record return condition (*Good*, *Fair*, *Damaged*), and designate next state (*In Stock* or *Under Repair*).
  - *Status Transition*: Explicitly move machines between operational states.
  - *Authorized Deletion*: Super Admin only deletion with mandatory audit logging.

### 3.3 Employee Directory & Custody Inspection
Maintains the internal custodian registry of authorized corporate personnel:
- **Employee Master Roster**: Lists employee ID, full name, corporate email, department, job title, office location, phone, and employment status (*Active* / *Inactive*).
- **Interactive Custody Drawer**: Clicking on any employee record opens a detailed view showing all hardware devices currently held by that person, complete with asset tags, serial numbers, assignment dates, and historical return logs.
- **Exit Clearance Safety Check**: System automatically warns administrators if an inactive employee still holds unreturned hardware assets.

### 3.4 LDAP / Active Directory Synchronization Engine
Located in the Employee Directory under **"Sync via LDAP"**, this module synchronizes staff records from enterprise directory services:
- **Protocol & Encryption Support**: Standard LDAP (`ldap://`, port 389) and secure encrypted LDAPS (`ldaps://`, port 636) with configurable TLS verification.
- **Administrative Service Account Bind**: Authenticates with dedicated service account credentials (e.g. `CN=svc-itam,OU=ServiceAccounts,DC=corp,DC=internal`).
- **Flexible Base DN & Search Filters**: Restrict queries to specific organizational units (OUs) or active security groups (e.g. `(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))`).
- **Granular Attribute Mapping**: Maps directory attributes (`employeeID`, `displayName`, `sAMAccountName`, `mail`, `department`, `title`, `telephoneNumber`, `physicalDeliveryOfficeName`) directly to ITAM employee profiles.
- **Connection Diagnostics**: Built-in **"Test Connection & Bind"** button verifies server reachability, bind handshake, latency, and previews matching user records before triggering ingestion.
- **Automated / Manual Ingestion**: On-demand sync with real-time feedback (Total Processed, Created, Updated, In Sync) and detailed audit logs.

### 3.5 Maintenance, Warranties & AMC Governance
Prevents unexpected capital expenses and operational downtime:
- **Dual Contract Governance**: Distinguishes manufacturer OEM warranty (AppleCare, Dell ProSupport, Lenovo Premier) from third-party vendor AMC service contracts (server chassis, network switches, UPS).
- **Automatic 30-Day Alerts**: Warns IT operations 30 days before expiration, providing sufficient lead time for procurement to negotiate renewals.
- **Depot RMA Workflow**: Seamlessly tracks equipment sent to authorized repair centers, clears active custodian custody, and tracks turnaround times.

### 3.6 Immutable Audit Trail & Regulatory Compliance Ledger
An append-only historical record designed to satisfy SOC 2, ISO 27001, and Sarbanes-Oxley audit mandates:
- **Tamper-Evident Design**: Logs cannot be modified, deleted, or reordered by any user.
- **Tracked Action Types**: `CREATE`, `ASSIGN`, `RETURN`, `STATUS_CHANGE`, `DELETE`, `LDAP_SYNC`, `SETTINGS_UPDATE`.
- **Granular Event Metadata**: Captures microsecond timestamps, actor user ID, username, authenticated role, target entity, and field-level before-and-after diffs.
- **Audit Filtering**: Filter by action category, actor, asset tag, date range, or free-text search query.

### 3.7 Reports & Analytics Engine (All 9 Reports & Use Cases)
The platform features nine pre-configured compliance and operational reports accessible under the **Reports & Export** tab. All reports offer live on-screen filtering, data preview, **CSV Spreadsheet Export**, and **Print-Ready / PDF Export**.

| # | Report Name | Category | Included Data Columns | Primary Business Use Case |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Complete Hardware Inventory** | Operational | Asset Tag, Name, Category, Serial #, Status, Custodian, Department, Location, Purchase Date, Price, Warranty Expiry. | Annual physical inventory count, balance sheet asset register reconciliation with Finance, cyber insurance audit declarations. |
| **2** | **Warranty Expiring Soon (≤ 30 Days)** | Preventive | Asset Tag, Name, Category, Serial #, Vendor, Warranty End Date, Days Remaining, Assigned Custodian. | Proactively renewing OEM manufacturer coverage before warranty expiration penalties apply; scheduling vendor support extensions. |
| **3** | **Warranty Expired Assets** | Risk Assessment | Asset Tag, Name, Category, Serial #, Warranty End Date, Status, Assigned Custodian, Department. | Prioritizing capital expenditure (CapEx) hardware refresh budgets; replacing high-risk out-of-warranty machines prone to failure. |
| **4** | **AMC Expiring Soon (≤ 30 Days)** | Contracts | Asset Tag, Name, Category, Location, AMC Vendor, AMC End Date, Days Remaining. | Generating vendor purchase orders and negotiating Annual Maintenance Contract renewals for server and network infrastructure. |
| **5** | **Expired AMC Hardware** | Critical Risk | Asset Tag, Name, Category, Location, AMC Vendor, AMC End Date. | Escalating operational single-points-of-failure to leadership; resolving uncontracted infrastructure running in production. |
| **6** | **Assigned Custody Assets** | Custody & HR | Asset Tag, Name, Category, Serial #, Custodian Name, Employee ID, Department, Deployed Date. | Cross-referencing active human resource rosters against deployed IT property during internal audits and department reorganizations. |
| **7** | **In Stock / Available Spares** | Depot Stock | Asset Tag, Name, Category, Serial #, Location, Condition, Specs (CPU, RAM, Storage). | Verifying buffer stock levels ahead of incoming hiring batches to ensure zero downtime on day one of employment. |
| **8** | **Under Repair / Depot RMA** | Maintenance | Asset Tag, Name, Category, Serial #, Repair Facility / Vendor, RMA Reference, Dispatch Date. | Tracking third-party vendor repair turnaround times, monitoring replacement loaner laptops, and enforcing vendor SLA commitments. |
| **9** | **Disposed & E-Waste Retired** | Decommissioning | Asset Tag, Name, Category, Serial #, Decommission Date, Disposal Method, Certificate #, Authorized By. | Environmental, Social & Governance (ESG) sustainability filings, electronic scrap recycling audits, and DoD data sanitization compliance. |

### 3.8 Theme Customization & Corporate Branding
Accessible exclusively to **Super Admins** via the **"Theme & Logo"** button in the navigation header:
- **Visual Theme Selection**:
  - *Slate & Indigo (Default)*: Modern corporate palette featuring deep slate navigation, high-contrast white content cards, and vibrant indigo accent buttons.
  - *Black & White (High-Contrast Monochrome)*: Minimalist monochrome theme with stark high-contrast borders, crisp black badge styling, and maximum legibility for high-contrast viewing environments.
- **Corporate Logo Customization**:
  - Upload local image files (PNG, SVG, WebP, JPEG up to 2MB) with automatic base64 database persistence and live navbar preview.
  - Set remote image URLs.
  - One-click "Reset Default" to restore the standard corporate insignia.
- **Application Titles**: Customize application title (e.g. *"Acme Corp ITAM"*) and organizational department banner.

### 3.9 User Account Management & RBAC Administration
Accessible to Super Admins and Admins via the **User Management** navigation tab:
- Create new administrative accounts with assigned roles (*Super Admin, Admin, Asset Manager, Operator, Viewer*).
- Perform administrative password resets with temporary credential generation.
- Suspend or activate user accounts.
- View user login audit history and last active timestamps.

### 3.10 System Architecture & Blueprint Modal
Accessible exclusively to **Super Admins** via the **"System Architecture"** button in the top navigation bar:
- Displays container specifications, Docker Compose blueprints, and PostgreSQL database migration scripts (`init-scripts/01-init.sql`).
- Shows complete REST API route tables and real-time environment telemetry.

---

## 4. Step-by-Step First-Time Configuration Guide

Follow this sequential runbook to set up and configure the ITAM platform for the first time in a new environment.

### Step 1: Environment & System Prerequisites
Ensure your host machine or deployment server meets the minimum requirements:
- **Operating System**: Ubuntu 22.04 LTS, Debian 12, RHEL 9, macOS, or Windows Server with WSL2.
- **Container Runtime**: Docker Engine 24.0+ and Docker Compose v2.20+ (recommended for production).
- **Alternative (Native Node)**: Node.js v20.x LTS or higher and npm 10+.
- **Network Ingress**: Ensure port `3000` is open and available on the host network.

Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Review or adjust the `.env` settings:
```env
PORT=3000
NODE_ENV=production
SESSION_SECRET=create_a_random_32_character_hex_secret_here
STORAGE_BACKEND=local
UPLOAD_DIR=./uploads
```

---

### Step 2: Installation & Launch (Docker or Native Node.js)

#### Option A: Production Launch with Docker Compose (Recommended)
```bash
# 1. Build the production Docker image
docker compose build --no-cache

# 2. Launch the services in detached background mode
docker compose up -d

# 3. Verify that the container is healthy
docker compose ps
docker compose logs -f itam-core-app
```

#### Option B: Native Node.js Setup
```bash
# 1. Install project dependencies
npm install

# 2. Build frontend and compile backend server
npm run build

# 3. Start the production server
npm start
```
The application is now accessible at `http://localhost:3000` (or `http://<server-ip>:3000`).

---

### Step 3: Initial Super Admin Login & Security Hardening

1. Open `http://<server-ip>:3000` in your web browser.
2. Click the **"Log In"** button in the top navigation bar.
3. Sign in using the default Super Admin credentials:
   - **Username**: `superadmin`
   - **Password**: `SuperAdmin@2026!`
4. Navigate to **User Management** in the sidebar.
5. Locate the `superadmin` account and click **"Reset Password"**.
6. Set a strong, unique corporate master password and store it in your corporate password manager.

---

### Step 4: Configure Corporate Branding & Visual Theme

1. In the top navigation bar, click the **"Theme & Logo"** button (visible only to Super Admins).
2. **Set System Titles**:
   - Enter your company name in **Application Title** (e.g., *"Contoso Global ITAM"*).
   - Enter your department in **Organization / Subtitle** (e.g., *"Enterprise Infrastructure & Fleet"*).
3. **Upload Corporate Logo**:
   - Click **"Browse / Upload Image"** to select your company's SVG, PNG, or WebP logo file (max 2MB), or paste a public HTTPS logo URL.
   - Verify the logo preview rendered in the dialog.
4. **Choose Visual Theme**:
   - Select **Slate & Indigo** (standard corporate color scheme) or **Black & White** (high-contrast monochrome).
5. Click **"Save Branding & Settings"**. The top bar, navigation headers, and reports will update immediately across all workstations.

---

### Step 5: Setup Employee Directory & LDAP / Active Directory Sync

To populate your employee custodian registry from Active Directory or LDAP:

1. In the sidebar, click **Employee Directory**.
2. Click the **"Sync via LDAP"** button in the toolbar.
3. Switch to the **"Connection & Server"** tab:
   - **LDAP Host URL**: Enter your directory server address (e.g. `ldaps://dc01.corp.contoso.com:636` or `ldap://10.0.1.50:389`).
   - **Bind DN**: Enter the service account distinguished name (e.g. `CN=svc-itam,OU=ServiceAccounts,DC=corp,DC=contoso,DC=com`).
   - **Bind Password**: Enter the service account password.
   - **Base Search DN**: Enter the root OU for employees (e.g. `OU=Users,OU=Corporate,DC=corp,DC=contoso,DC=com`).
   - **Search Filter**: Define user filter query (e.g. `(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))`).
4. Switch to the **"Attribute Mapping"** tab and verify mappings:
   - Employee ID $\rightarrow$ `employeeID`
   - Full Name $\rightarrow$ `displayName`
   - Email Address $\rightarrow$ `mail`
   - Department $\rightarrow$ `department`
   - Job Title $\rightarrow$ `title`
   - Phone $\rightarrow$ `telephoneNumber`
   - Office Location $\rightarrow$ `physicalDeliveryOfficeName`
5. Return to the **"Connection & Server"** tab and click **"Test Connection & Bind"**.
   - Verify that the connection test succeeds, returns low latency (<50ms), and displays sample user records.
6. Click **"Save Settings"**.
7. Switch to the **"Synchronize Now"** tab and click **"Start Directory Sync"**.
   - Watch the sync progress bars; verify that employees are created or updated.
   - Close the modal and confirm your staff members appear in the Employee Directory.

*(Note: If your organization does not utilize LDAP, you can manually register staff anytime by clicking **"Add New Employee"** in the Employee Directory).*

---

### Step 6: Hardware Asset Ingestion & Tag Printing

1. Navigate to **Asset Inventory** in the sidebar.
2. Click **"Add New Asset"**:
   - **Core Identification**: Enter Asset Tag (e.g. `ASSET-2026-001`), Device Name, Category, Serial Number, and Manufacturer/Model.
   - **Technical Specs**: Fill in CPU, RAM (GB), Primary Storage, Operating System, and MAC Address.
   - **Procurement & Maintenance**: Enter Vendor Name, Purchase Date, Purchase Cost, Warranty Expiration Date, and AMC Expiration Date.
   - **Initial Status**: Set to `In Stock (Available)`.
3. Click **"Save Asset Record"**.
4. Click the newly created asset to open its detail drawer.
5. Click **"Print Barcode Tag"** to generate an official barcode label for physical attachment to the device chassis.
6. To deploy the device to an employee, click **"Assign Asset"**, select the staff member from the dropdown, specify the assignment date, and confirm.

---

### Step 7: Provision Team Accounts & Assign Operational Roles

Do not share the Super Admin account among IT staff. Provision named accounts according to their responsibilities:

1. Navigate to **User Management** in the sidebar.
2. Click **"Add New User"**:
   - Enter their corporate email, full name, and chosen username.
   - Set an initial password.
   - Select the appropriate operational role:
     - **Admin**: For IT Managers needing asset management, employee editing, and reporting rights.
     - **Asset Manager**: For warehouse/depot inventory staff receiving shipments.
     - **Operator**: For Tier 1/2 helpdesk staff handing out laptops.
     - **Viewer**: For internal auditors or executive leadership.
3. Click **"Create User Account"**.
4. Distribute temporary credentials securely and instruct staff to update their passwords upon first login.

---

### Step 8: Set Up Scheduled Backups & Monitoring

1. **Configure Automated JSON Backups**:
   Add a daily cron job on the host server to snapshot the `/app/data` and `/app/uploads` directories:
   ```bash
   # Add to crontab (crontab -e) to run every night at 2:00 AM
   0 2 * * * docker compose cp itam-core-app:/app/data /opt/itam-backups/data_$(date +\%F) && docker compose cp itam-core-app:/app/uploads /opt/itam-backups/uploads_$(date +\%F)
   ```
2. **Configure Health Monitoring**:
   Set your infrastructure monitoring tool (e.g., UptimeRobot, Datadog, Prometheus, or Nagios) to ping the health check endpoint every 60 seconds:
   ```bash
   curl -f http://<server-ip>:3000/api/health
   ```
3. **Test Report Generation**:
   Navigate to **Reports & Export**, select **"Complete Hardware Inventory"**, and click **"Export to CSV"** to confirm that spreadsheet exports operate smoothly.

---

## 5. Default Credentials & Access Reference

The system includes pre-seeded accounts for evaluation and initial setup:

| Role | Username | Default Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `SuperAdmin@2026!` | Complete administrative control, branding, user creation, LDAP setup, system architecture. |
| **Admin** | `admin` | `Admin@2026!` | Asset management, employee provisioning, reports, LDAP sync execution. |
| **Asset Manager** | `mgr_marcus` | `Manager@2026!` | Hardware registration, status updates, check-in/out, repair routing. |
| **Operator** | `op_sarah` | `Operator@2026!` | Hardware checkout, check-in, return condition assessment, repair flags. |
| **Viewer** | `auditor_james` | `Auditor@2026!` | Read-only inspection of assets, employees, audit trails, and reports. |

> **SECURITY MANDATE**: Change all default passwords immediately after initial deployment.

---

## 6. API Endpoints Reference

All API routes require authenticated session cookies unless noted otherwise.

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with username and password. Returns user object and sets HTTP-only session cookie.
- `POST /api/auth/logout`: Invalidates the session and destroys cookies.
- `GET /api/auth/me`: Validates session and returns current user identity with permissions.
- `POST /api/auth/switch-role`: Instant demonstration role switcher (Super Admin, Admin, Manager, Operator, Viewer).

### Asset Inventory (`/api/assets`)
- `GET /api/assets`: Paginated asset list with faceted search filters (`q`, `status`, `category`, `department`, `location`, `assigned`).
- `GET /api/assets/:id`: Detailed record including full specs, active custodian, and individual audit history.
- `POST /api/assets`: Register a new hardware asset.
- `PUT /api/assets/:id`: Update technical specs, purchase details, or lifecycle dates.
- `POST /api/assets/:id/assign`: Assign hardware to an employee with custody notes and timestamp.
- `POST /api/assets/:id/return`: Check-in hardware, record return notes, and set inventory status.
- `POST /api/assets/:id/status`: Change operational status (`In Stock`, `Deployed`, `Under Repair`, `Decommissioned`).
- `DELETE /api/assets/:id`: Permanently delete hardware (Super Admin only).
- `POST /api/assets/:id/photos`: Upload JPEG/PNG/WebP photos (up to 5MB).
- `DELETE /api/assets/:id/photos/:photoId`: Remove photo from storage.

### Employee Directory & Custody (`/api/employees`)
- `GET /api/employees`: Paginated employee roster with assigned hardware counts.
- `GET /api/employees/:id`: Employee profile, active asset list, and custody history.
- `POST /api/employees`: Register a new employee manually.
- `PUT /api/employees/:id`: Update employee details.
- `POST /api/employees/:id/toggle-status`: Activate or deactivate an employee profile.

### LDAP / Active Directory Integration (`/api/employees/ldap`)
- `GET /api/employees/ldap/config`: Retrieve persisted LDAP configuration with masked credentials.
- `POST /api/employees/ldap/config`: Update and persist LDAP server host, bind credentials, search DN, and attribute mappings.
- `POST /api/employees/ldap/test`: Execute live connection diagnostics, check server latency, and preview sample user records.
- `POST /api/employees/ldap/sync`: Execute employee directory synchronization, ingest records, and record audit log entries.

### System Settings & Custom Branding (`/api/settings`)
- `GET /api/settings`: Fetch active theme, corporate logo, and system branding.
- `POST /api/settings`: Update branding, corporate logo, and visual theme (Super Admin only).

### Audit Trail (`/api/audit` / `/api/history`)
- `GET /api/audit`: Query append-only event logs with filtering by date range, action type, user, or entity.

### Reports & Metrics (`/api/reports`)
- `GET /api/reports/metrics`: Retrieve KPI summaries and 30-day warranty/AMC expiration tallies.
- `GET /api/reports/export`: Generate sanitized CSV or formatted spreadsheet exports.

### Health Check (`/api/health`)
- `GET /api/health`: Container health check returning system uptime, status, and server timestamp.

---

## 7. Production Troubleshooting & Diagnostics

### Problem 1: "Container exits immediately after launch"
- **Root Cause**: Node.js cannot locate `dist/server.cjs` or the build step failed.
- **Diagnostic Command**:
  ```bash
  docker compose logs itam-core-app
  ```
- **Resolution**:
  Rebuild the container image without cache:
  ```bash
  docker compose down
  docker compose build --no-cache itam-core-app
  docker compose up -d
  ```

### Problem 2: "Port 3000 is already in use on host"
- **Root Cause**: Another service (or previous container instance) is bound to port 3000.
- **Diagnostic Command**:
  ```bash
  sudo lsof -i :3000
  # or
  sudo ss -tulpn | grep 3000
  ```
- **Resolution**: Remap the host port in `docker-compose.yml`:
  ```yaml
  ports:
    - "8080:3000"  # Host port 8080 maps to container port 3000
  ```

### Problem 3: "Account locked out due to failed login attempts"
- **Root Cause**: The security brute-force rate limiter triggered after 5 failed login attempts in 15 minutes.
- **Diagnostic Command**:
  ```bash
  docker compose logs itam-core-app | grep -i "failed login"
  ```
- **Resolution**: Wait 15 minutes for the window to reset, or restart the container to clear in-memory rate counters:
  ```bash
  docker compose restart itam-core-app
  ```

### Problem 4: "LDAP Connection Test Fails (Connection Timeout or Bind Refused)"
- **Root Cause**: Firewall blocking port 389/636, invalid service account bind DN, or TLS certificate rejection.
- **Diagnostics & Resolution**:
  1. Test network connectivity from inside the container:
     ```bash
     docker compose exec itam-core-app ping -c 3 <ldap-host>
     docker compose exec itam-core-app nc -zv <ldap-host> 636
     ```
  2. If using self-signed internal CA certificates, check **"Allow Self-Signed TLS"** in the LDAP Connection modal.
  3. Verify the bind DN format matches Active Directory standard: `CN=svc-itam,OU=ServiceAccounts,DC=corp,DC=domain,DC=com`.

### Problem 5: "Uploaded asset photos disappear after restarting container"
- **Root Cause**: The upload directory is not mounted to a persistent volume.
- **Resolution**: Confirm `docker-compose.yml` includes the volume declaration:
  ```yaml
  volumes:
    - itam_uploads:/app/uploads
  ```

---

## 8. Backup, Disaster Recovery & Maintenance

### 8.1 Snapshotting Local Data
Execute these commands to take a full backup of records, settings, and uploaded photos:
```bash
# 1. Create a timestamped backup directory
mkdir -p /backups/itam_$(date +%F)

# 2. Copy database and asset photos from container
docker compose cp itam-core-app:/app/data /backups/itam_$(date +%F)/data
docker compose cp itam-core-app:/app/uploads /backups/itam_$(date +%F)/uploads

# 3. Create a compressed archive
tar -czvf /backups/itam_backup_$(date +%F).tar.gz -C /backups/itam_$(date +%F) .
```

### 8.2 Restoring from Backup
To restore data into a clean or replacement server:
```bash
# 1. Extract backup files
tar -xzvf /backups/itam_backup_YYYY-MM-DD.tar.gz -C /tmp/itam_restore/

# 2. Copy data into the running container
docker compose cp /tmp/itam_restore/data/. itam-core-app:/app/data/
docker compose cp /tmp/itam_restore/uploads/. itam-core-app:/app/uploads/

# 3. Restart container to apply restored state
docker compose restart itam-core-app
```

---
*Enterprise ITAM Platform — Engineered for Audit Readiness, Security, and Seamless Hardware Lifecycle Operations.*
