# Enterprise IT Asset Management (ITAM) System
## Technical Implementation, Deployment, & Troubleshooting Guide

---

## 1. System Overview & Architecture

The **Enterprise IT Asset Management (ITAM) System** is a production-grade, full-stack application designed to track the complete physical and operational lifecycle of enterprise computing, networking, and peripheral hardware assets.

### High-Level Architecture
- **Frontend**: Single-Page Application (SPA) built with React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and Motion transitions.
- **Backend**: Node.js & Express API server bundled via `esbuild` into CommonJS (`dist/server.cjs`) for native execution.
- **Data Persistence**:
  - Embedded resilient JSON storage engine with atomic transactional file writes (`data/*.json`).
  - Native migration compatibility with PostgreSQL 15+ (`init-scripts/01-init.sql`).
- **Containerization**: Multi-stage Alpine Linux Docker architecture exposing port `3000`.

---

## 2. Default Access & Credentials

The system includes pre-seeded administrator accounts protected by SHA-256 hashed passwords and brute-force throttling (5 attempts per 15-minute window):

| Role | Username | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `SuperAdmin@2026!` | Full system control, user admin, hard delete, audit logs |
| **Admin** | `admin` | `Admin@2026!` | Asset management, employee custody, status updates |
| **Asset Manager** | `mgr_marcus` | `Manager@2026!` | Asset registration, updates, and maintenance assignments |
| **Operator** | `op_sarah` | `Operator@2026!` | Checkout/assignment, check-in/return, status toggles |
| **Viewer** | `auditor_james` | `Auditor@2026!` | Read-only access to inventories and reports |

---

## 3. Directory & File Structure

```text
├── Dockerfile                   # Multi-stage production container definition
├── docker-compose.yml           # Multi-service stack (Node.js App + PostgreSQL)
├── .dockerignore                # Build artifact exclusion rules
├── init-scripts/
│   └── 01-init.sql              # Automated PostgreSQL schema & index initialization
├── server/
│   ├── db.ts                    # Core persistence engine, password hashing, seeds
│   └── routes/                  # Express REST routes
│       ├── authRoutes.ts        # Login, logout, session verification, role switching
│       ├── assetRoutes.ts       # CRUD, assign, return, status change, photo upload
│       ├── employeeRoutes.ts    # Employee custody directory & asset relationships
│       ├── auditRoutes.ts       # Immutable audit log queries & filtering
│       ├── reportRoutes.ts      # CSV / Excel export generation & metrics
│       └── userRoutes.ts        # RBAC user management & password resets
├── server.ts                    # Main Express entry point with Vite middleware & static serving
├── src/
│   ├── api/client.ts            # Client HTTP API client
│   ├── types/itam.ts            # TypeScript interfaces, enums, and types
│   ├── components/              # Modular UI views and action modals
│   │   ├── Navbar.tsx           # Global header with instant role switcher & system info
│   │   ├── Sidebar.tsx          # Navigation sidebar with real-time asset counters
│   │   ├── DashboardView.tsx    # KPI metric cards, expiration warnings, visual charts
│   │   ├── AssetsView.tsx       # Hardware inventory with faceted search & filtering
│   │   ├── AssetDetailModal.tsx # Complete asset specs, assigned custodian, photo gallery
│   │   ├── AssetFormModal.tsx   # Asset creation and update form
│   │   ├── AssetActionModals.tsx# Assignment, Return, Status Change, Delete modals
│   │   ├── EmployeesView.tsx    # Employee directory with custody tracking
│   │   ├── EmployeeDetailModal.tsx # Inspection of assets held by a specific employee
│   │   ├── AuditView.tsx        # Append-only audit history table with change deltas
│   │   ├── ReportsView.tsx      # Pre-configured compliance reports & Excel/CSV export
│   │   ├── UsersAdminView.tsx   # User administration & role management
│   │   ├── LoginModal.tsx       # Authentication dialog with demo role quick-switches
│   │   └── SystemInfoModal.tsx  # Interactive architecture, Docker, and schema viewer
│   ├── App.tsx                  # Master application controller
│   └── main.tsx                 # React DOM bootstrapping
└── package.json                 # Project dependencies and build scripts
```

---

## 4. Production Deployment Guide (Ubuntu / Debian Linux)

### 4.1 Prerequisites
Ensure Docker Engine and Docker Compose v2 are installed:
```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 4.2 Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=production
DB_PASSWORD=YourStrongDatabasePassword2026!
SESSION_SECRET=your_32_character_cryptographically_secure_session_secret
STORAGE_BACKEND=local
UPLOAD_DIR=/app/uploads
```

### 4.3 Build and Launch with Docker Compose
```bash
# 1. Build images without cache
docker compose build --no-cache

# 2. Start containers in background mode
docker compose up -d

# 3. Verify container health status
docker compose ps
```

The application will be accessible at: `http://localhost:3000` (or `http://<your-server-ip>:3000`).

---

## 5. API Reference & Endpoints

All API endpoints require active session authentication cookies unless noted otherwise.

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with username and password. Sets HTTP-only session cookie.
- `POST /api/auth/logout`: Invalidates session and clears cookies.
- `GET /api/auth/me`: Returns current user identity and RBAC permissions.
- `POST /api/auth/switch-role`: Instant demonstration role switching (Super Admin, Admin, Manager, Operator, Viewer).

### Asset Lifecycle (`/api/assets`)
- `GET /api/assets`: Paginated asset list with faceted search filters (`q`, `status`, `device_type`, `department`, `location`, `assigned`).
- `GET /api/assets/:id`: Detailed record including specs, active custodian, and individual audit history.
- `POST /api/assets`: Register a new hardware asset.
- `PUT /api/assets/:id`: Update technical specs, purchase info, or lifecycle dates.
- `POST /api/assets/:id/assign`: Assign hardware to an employee with custody notes and timestamp.
- `POST /api/assets/:id/return`: Check-in hardware, record return notes, and set inventory status.
- `POST /api/assets/:id/status`: Change operational status (e.g., Active, In Stock, Under Repair, Disposed).
- `DELETE /api/assets/:id`: Permanently delete hardware (Super Admin only).
- `POST /api/assets/:id/photos`: Upload JPEG/PNG/WebP hardware photos (capped at 5MB).
- `DELETE /api/assets/:id/photos/:photoId`: Remove photo from storage.

### Employees & Custody (`/api/employees`)
- `GET /api/employees`: Paginated employee directory with assigned hardware count.
- `GET /api/employees/:id`: Employee record, assigned asset list, and custody history.
- `POST /api/employees`: Register new employee.
- `PUT /api/employees/:id`: Update employee details.
- `POST /api/employees/:id/toggle-status`: Activate/deactivate employee (warns if active assets are held).

### Audit Trail (`/api/history`)
- `GET /api/history`: Append-only event logs with filtering by date range, action, entity, and user.

### Reports & Metrics (`/api/reports`)
- `GET /api/reports/metrics`: Real-time KPI summary (total assets, warranties expiring $\le$ 30 days, status breakdown).
- `GET /api/reports/export`: Generates downloadable CSV or native Excel (`.xlsx`) files with formula-injection sanitization.

### System & Health (`/health`)
- `GET /health`: Docker healthcheck endpoint returning JSON uptime, status, and timestamp.

---

## 6. Troubleshooting & Diagnostics

### Problem 1: "Container exits immediately on startup"
- **Cause**: Node.js cannot find `dist/server.cjs` or build step failed.
- **Diagnostic Command**:
  ```bash
  docker compose logs itam-backend
  ```
- **Resolution**:
  Ensure `npm run build` executed during the Docker build stage. Rebuild with:
  ```bash
  docker compose down
  docker compose build --no-cache itam-backend
  docker compose up -d
  ```

### Problem 2: "Port 3000 is already in use"
- **Cause**: Another local service (or prior container) is bound to port 3000.
- **Diagnostic Command**:
  ```bash
  sudo lsof -i :3000
  # or
  sudo ss -tulpn | grep 3000
  ```
- **Resolution**: Stop the conflicting process, or remap the host port in `docker-compose.yml`:
  ```yaml
  ports:
    - "8080:3000"  # maps host port 8080 to container port 3000
  ```

### Problem 3: "Invalid username or password" / Account Lockout
- **Cause**: Repeated invalid attempts triggered the 5-attempt brute-force rate limiter.
- **Diagnostic Command**:
  ```bash
  docker compose logs itam-backend | grep -i "failed login"
  ```
- **Resolution**:
  Wait 15 minutes for the lockout window to expire, or restart the container to reset the in-memory rate-limiter:
  ```bash
  docker compose restart itam-backend
  ```
  Default credentials: `superadmin` / `SuperAdmin@2026!`

### Problem 4: "File upload fails or photos disappear after container restart"
- **Cause**: Upload directory is not properly mounted to a persistent volume.
- **Resolution**:
  Confirm `docker-compose.yml` mounts the persistent volume:
  ```yaml
  volumes:
    - itam_uploads:/app/uploads
  ```
  Verify write permissions inside the container:
  ```bash
  docker compose exec itam-backend ls -ld /app/uploads
  ```

### Problem 5: "Formula injection warnings when opening CSV in Microsoft Excel"
- **Behavior**: System automatically prepends `'` to cells beginning with `=`, `+`, `-`, or `@`.
- **Reason**: This is an intentional security control preventing Dynamic Data Exchange (DDE) formula execution when opening exports in spreadsheet applications.

---

## 7. Backup, Maintenance, & Disaster Recovery

### 7.1 Backing up Embedded Storage
To snapshot all asset records, employee records, and audit logs:
```bash
docker compose cp itam-core-app:/app/data ./backup_itam_data_$(date +%F)
docker compose cp itam-core-app:/app/uploads ./backup_itam_uploads_$(date +%F)
```

### 7.2 Backing up PostgreSQL
If using the PostgreSQL database service:
```bash
docker compose exec postgres-db pg_dump -U itam_admin -d itam_production > itam_backup_$(date +%F).sql
```

### 7.3 Restoring from Backup
To restore data into a fresh stack:
```bash
docker compose cp ./backup_itam_data_YYYY-MM-DD/. itam-core-app:/app/data/
docker compose cp ./backup_itam_uploads_YYYY-MM-DD/. itam-core-app:/app/uploads/
docker compose restart itam-backend
```
