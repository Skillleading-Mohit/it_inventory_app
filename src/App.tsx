import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import type {
  User,
  Employee,
  Asset,
  AuditLog,
  DashboardMetrics,
  UserRole,
  SystemSettings
} from './types/itam';

import { Navbar } from './components/Navbar';
import { Sidebar, type TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AssetsView } from './components/AssetsView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { AssetFormModal } from './components/AssetFormModal';
import {
  AssignModal,
  ReturnModal,
  StatusChangeModal,
  DeleteConfirmModal
} from './components/AssetActionModals';
import { EmployeesView } from './components/EmployeesView';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { AuditView } from './components/AuditView';
import { ReportsView } from './components/ReportsView';
import { UsersAdminView } from './components/UsersAdminView';
import { SystemInfoModal } from './components/SystemInfoModal';
import { LoginModal } from './components/LoginModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';

export default function App() {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 1b. System Settings State (Theme & Logo)
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // 2. Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);

  // 3. Metrics State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // 4. Asset Inventory State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsTotal, setAssetsTotal] = useState<number>(0);
  const [assetsPage, setAssetsPage] = useState<number>(1);
  const [assetsTotalPages, setAssetsTotalPages] = useState<number>(1);
  const [assetsFacets, setAssetsFacets] = useState<{
    locations: string[];
    departments: string[];
    device_types: string[];
    statuses: string[];
  }>({
    locations: [],
    departments: [],
    device_types: [],
    statuses: []
  });
  const [assetFilters, setAssetFilters] = useState({
    q: '',
    status: 'all',
    device_type: 'all',
    category: 'all',
    location: 'all',
    department: 'all',
    assigned: 'all'
  });

  // 5. Employees State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesTotal, setEmployeesTotal] = useState<number>(0);
  const [employeesPage, setEmployeesPage] = useState<number>(1);
  const [employeesTotalPages, setEmployeesTotalPages] = useState<number>(1);
  const [employeeDepartments, setEmployeeDepartments] = useState<string[]>([]);
  const [employeeFilters, setEmployeeFilters] = useState({
    q: '',
    department: 'all',
    is_active: 'all'
  });

  // 6. Audit Trail State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState<number>(0);
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditTotalPages, setAuditTotalPages] = useState<number>(1);
  const [auditFacets, setAuditFacets] = useState<{
    entity_types: string[];
    actions: string[];
    users: string[];
  }>({
    entity_types: [],
    actions: [],
    users: []
  });
  const [auditFilters, setAuditFilters] = useState({
    q: '',
    entity_type: 'all',
    action: 'all',
    username: 'all',
    start_date: '',
    end_date: ''
  });

  // 7. Users Administration State
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  // 8. Modals State
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<{
    asset: Asset;
    employee: Employee | null;
    history: AuditLog[];
  } | null>(null);

  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<{
    employee: Employee;
    assignedAssets: Asset[];
    history: AuditLog[];
  } | null>(null);

  const [assetFormAsset, setAssetFormAsset] = useState<Asset | null>(null);
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);

  const [assignAsset, setAssignAsset] = useState<Asset | null>(null);
  const [returnAsset, setReturnAsset] = useState<Asset | null>(null);
  const [statusChangeAsset, setStatusChangeAsset] = useState<Asset | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<Asset | null>(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth fetch
  const fetchAuthUser = useCallback(async () => {
    try {
      const data = await api.auth.getMe();
      setCurrentUser(data.user);
      setPermissions(data.permissions);
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
      setIsLoginModalOpen(true);
    }
  }, []);

  // Metrics fetch
  const fetchMetrics = useCallback(async () => {
    try {
      const data = await api.reports.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  }, []);

  // Assets fetch
  const fetchAssets = useCallback(async () => {
    try {
      const data = await api.assets.list({
        ...assetFilters,
        page: assetsPage,
        limit: 15
      });
      setAssets(data.assets);
      setAssetsTotal(data.total);
      setAssetsTotalPages(data.total_pages);
      setAssetsFacets(data.facets);
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  }, [assetFilters, assetsPage]);

  // Employees fetch
  const fetchEmployees = useCallback(async () => {
    try {
      const data = await api.employees.list({
        ...employeeFilters,
        page: employeesPage,
        limit: 15
      });
      setEmployees(data.employees);
      setEmployeesTotal(data.total);
      setEmployeesTotalPages(data.total_pages);
      setEmployeeDepartments(data.departments);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  }, [employeeFilters, employeesPage]);

  // Audit Logs fetch
  const fetchAuditLogs = useCallback(async () => {
    try {
      const data = await api.audit.list({
        ...auditFilters,
        page: auditPage,
        limit: 20
      });
      setAuditLogs(data.logs);
      setAuditTotal(data.total);
      setAuditTotalPages(data.total_pages);
      setAuditFacets(data.facets);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  }, [auditFilters, auditPage]);

  // Admin Users fetch
  const fetchAdminUsers = useCallback(async () => {
    if (!permissions.includes('manage_users')) return;
    try {
      const data = await api.admin.listUsers();
      setAdminUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [permissions]);

  // System Settings fetch (Theme & Logo)
  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.settings.get();
      setSystemSettings(data.settings);
    } catch (err) {
      console.error('Error fetching system settings:', err);
    }
  }, []);

  const handleSaveSettings = async (updates: Partial<SystemSettings>) => {
    const res = await api.settings.update(updates);
    setSystemSettings(res.settings);
  };

  // Initial Load
  useEffect(() => {
    fetchAuthUser();
    fetchMetrics();
    fetchSettings();
  }, [fetchAuthUser, fetchMetrics, fetchSettings]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAssets();
    }
  }, [isLoggedIn, fetchAssets]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmployees();
    }
  }, [isLoggedIn, fetchEmployees]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAuditLogs();
    }
  }, [isLoggedIn, fetchAuditLogs]);

  useEffect(() => {
    if (isLoggedIn && permissions.includes('manage_users')) {
      fetchAdminUsers();
    }
  }, [isLoggedIn, permissions, fetchAdminUsers]);

  // Reload everything when data updates
  const refreshAll = async () => {
    await Promise.all([
      fetchMetrics(),
      fetchAssets(),
      fetchEmployees(),
      fetchAuditLogs(),
      fetchAdminUsers()
    ]);
  };

  // Handlers for Role Switcher
  const handleSwitchRole = async (role: UserRole) => {
    try {
      const res = await api.auth.switchRole(role);
      setCurrentUser(res.user);
      setPermissions(res.permissions);
      showToast(`Switched active role to ${res.user.role.toUpperCase()}`);
      if (res.user.role !== 'super_admin' && res.user.role !== 'admin' && currentTab === 'admin') {
        setCurrentTab('dashboard');
      }
      refreshAll();
    } catch (err: any) {
      alert(err.message || 'Failed to switch role');
    }
  };

  // Handlers for Login
  const handleLogin = async (u: string, p: string) => {
    const res = await api.auth.login(u, p);
    setCurrentUser(res.user);
    setPermissions(res.permissions);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    showToast(`Signed in as @${res.user.username} (${res.user.role})`);
    refreshAll();
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setIsLoggedIn(false);
    setIsLoginModalOpen(true);
  };

  // Handlers for Asset Detail Inspection
  const handleSelectAsset = async (asset: Asset) => {
    try {
      const res = await api.assets.get(asset.id);
      setSelectedAssetDetail({
        asset: res.asset,
        employee: res.employee,
        history: res.history
      });
    } catch (err: any) {
      alert(err.message || 'Failed to fetch asset details');
    }
  };

  // Handlers for Asset Form
  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    if (assetFormAsset) {
      await api.assets.update(assetFormAsset.id, assetData);
      showToast(`Asset '${assetData.asset_tag}' updated successfully.`);
    } else {
      await api.assets.create(assetData);
      showToast(`Asset '${assetData.asset_tag}' registered successfully.`);
    }
    setIsAssetFormOpen(false);
    setAssetFormAsset(null);
    if (selectedAssetDetail) {
      const refreshed = await api.assets.get(selectedAssetDetail.asset.id);
      setSelectedAssetDetail(refreshed);
    }
    refreshAll();
  };

  // Handlers for Operations (Assign, Return, Status, Delete)
  const handleConfirmAssign = async (employeeId: string, date: string, notes: string) => {
    if (!assignAsset) return;
    await api.assets.assign(assignAsset.id, employeeId, date, notes);
    showToast(`Asset '${assignAsset.asset_tag}' assigned successfully.`);
    setAssignAsset(null);
    if (selectedAssetDetail && selectedAssetDetail.asset.id === assignAsset.id) {
      const refreshed = await api.assets.get(assignAsset.id);
      setSelectedAssetDetail(refreshed);
    }
    refreshAll();
  };

  const handleConfirmReturn = async (date: string, resultingStatus: string, notes: string) => {
    if (!returnAsset) return;
    await api.assets.returnAsset(returnAsset.id, date, resultingStatus, notes);
    showToast(`Asset '${returnAsset.asset_tag}' returned to inventory.`);
    setReturnAsset(null);
    if (selectedAssetDetail && selectedAssetDetail.asset.id === returnAsset.id) {
      const refreshed = await api.assets.get(returnAsset.id);
      setSelectedAssetDetail(refreshed);
    }
    if (selectedEmployeeDetail) {
      const refreshedEmp = await api.employees.get(selectedEmployeeDetail.employee.id);
      setSelectedEmployeeDetail({
        employee: refreshedEmp.employee,
        assignedAssets: refreshedEmp.assigned_assets,
        history: refreshedEmp.history
      });
    }
    refreshAll();
  };

  const handleConfirmStatusChange = async (status: any, notes: string, disposalDate?: string) => {
    if (!statusChangeAsset) return;
    await api.assets.changeStatus(statusChangeAsset.id, status, notes, disposalDate);
    showToast(`Asset '${statusChangeAsset.asset_tag}' status changed to '${status}'.`);
    setStatusChangeAsset(null);
    if (selectedAssetDetail && selectedAssetDetail.asset.id === statusChangeAsset.id) {
      const refreshed = await api.assets.get(statusChangeAsset.id);
      setSelectedAssetDetail(refreshed);
    }
    refreshAll();
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmAsset) return;
    await api.assets.delete(deleteConfirmAsset.id);
    showToast(`Asset '${deleteConfirmAsset.asset_tag}' deleted.`);
    setDeleteConfirmAsset(null);
    if (selectedAssetDetail && selectedAssetDetail.asset.id === deleteConfirmAsset.id) {
      setSelectedAssetDetail(null);
    }
    refreshAll();
  };

  // Handlers for Photographs
  const handleUploadPhoto = async (file: File, photoType: string) => {
    if (!selectedAssetDetail) return;
    await api.assets.uploadPhoto(selectedAssetDetail.asset.id, file, photoType);
    showToast('Photo uploaded successfully.');
    const refreshed = await api.assets.get(selectedAssetDetail.asset.id);
    setSelectedAssetDetail(refreshed);
    refreshAll();
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!selectedAssetDetail) return;
    await api.assets.deletePhoto(selectedAssetDetail.asset.id, photoId);
    showToast('Photo deleted.');
    const refreshed = await api.assets.get(selectedAssetDetail.asset.id);
    setSelectedAssetDetail(refreshed);
    refreshAll();
  };

  // Handlers for Employees
  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    if (employeeData.id) {
      await api.employees.update(employeeData.id, employeeData);
      showToast(`Employee '${employeeData.full_name}' updated.`);
    } else {
      await api.employees.create(employeeData);
      showToast(`Employee '${employeeData.full_name}' registered.`);
    }
    refreshAll();
  };

  const handleToggleEmployeeStatus = async (id: string) => {
    const res = await api.employees.toggleStatus(id);
    showToast(res.message);
    if (res.warning) {
      alert(res.warning);
    }
    refreshAll();
  };

  const handleSelectEmployeeAssets = async (emp: Employee) => {
    try {
      const res = await api.employees.get(emp.id);
      setSelectedEmployeeDetail({
        employee: res.employee,
        assignedAssets: res.assigned_assets,
        history: res.history
      });
    } catch (err: any) {
      alert(err.message || 'Failed to fetch employee custody history');
    }
  };

  // Handlers for Admin Users
  const handleSaveUser = async (userData: any) => {
    if (userData.id) {
      await api.admin.updateUser(userData.id, userData);
      showToast(`User @${userData.username} updated.`);
    } else {
      await api.admin.createUser(userData);
      showToast(`User @${userData.username} created.`);
    }
    refreshAll();
  };

  const handleToggleUserStatus = async (userId: string) => {
    await api.admin.toggleUserStatus(userId);
    showToast('User status updated.');
    refreshAll();
  };

  const handleResetPassword = async (userId: string, newPass: string) => {
    await api.admin.resetPassword(userId, newPass);
    showToast('Password reset successfully.');
  };

  const isBw = systemSettings?.theme === 'black_and_white';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isBw ? 'bg-zinc-100 text-zinc-950 selection:bg-black selection:text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Toast Banner */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-70 text-xs px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
          isBw ? 'bg-black text-white border-zinc-700' : 'bg-slate-900 text-white border-slate-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isBw ? 'bg-white' : 'bg-emerald-400'}`}></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        permissions={permissions}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onOpenSystemInfo={() => setIsSystemInfoOpen(true)}
        settings={systemSettings}
        onOpenThemeSettings={() => setIsThemeModalOpen(true)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          permissions={permissions}
          currentUser={currentUser}
          counts={{
            assets: metrics?.total_assets || 0,
            employees: metrics?.active_employees || 0
          }}
        />

        {/* View Port Area */}
        <main className={`flex-1 overflow-y-auto pb-12 ${isBw ? 'bg-zinc-100' : 'bg-slate-100/60'}`}>
          {currentTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              recentLogs={auditLogs}
              onNavigateTab={setCurrentTab}
              onOpenAddAsset={() => {
                setAssetFormAsset(null);
                setIsAssetFormOpen(true);
              }}
              onOpenAddEmployee={() => {
                setCurrentTab('employees');
              }}
              permissions={permissions}
            />
          )}

          {currentTab === 'assets' && (
            <AssetsView
              assets={assets}
              total={assetsTotal}
              page={assetsPage}
              totalPages={assetsTotalPages}
              onPageChange={setAssetsPage}
              filters={assetFilters}
              onFilterChange={setAssetFilters}
              onSelectAsset={handleSelectAsset}
              onOpenAddAsset={() => {
                setAssetFormAsset(null);
                setIsAssetFormOpen(true);
              }}
              onOpenAssign={a => setAssignAsset(a)}
              onOpenReturn={a => setReturnAsset(a)}
              onOpenStatusChange={a => setStatusChangeAsset(a)}
              onOpenEdit={a => {
                setAssetFormAsset(a);
                setIsAssetFormOpen(true);
              }}
              onOpenDelete={a => setDeleteConfirmAsset(a)}
              permissions={permissions}
              facets={assetsFacets}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesView
              employees={employees}
              total={employeesTotal}
              page={employeesPage}
              totalPages={employeesTotalPages}
              onPageChange={setEmployeesPage}
              filters={employeeFilters}
              onFilterChange={setEmployeeFilters}
              onSaveEmployee={handleSaveEmployee}
              onToggleStatus={handleToggleEmployeeStatus}
              onSelectEmployeeAssets={handleSelectEmployeeAssets}
              permissions={permissions}
              departments={employeeDepartments}
              onRefreshEmployees={fetchEmployees}
            />
          )}

          {currentTab === 'history' && (
            <AuditView
              logs={auditLogs}
              total={auditTotal}
              page={auditPage}
              totalPages={auditTotalPages}
              onPageChange={setAuditPage}
              filters={auditFilters}
              onFilterChange={setAuditFilters}
              facets={auditFacets}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'admin' && (
            <UsersAdminView
              users={adminUsers}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onToggleUserStatus={handleToggleUserStatus}
              onResetPassword={handleResetPassword}
            />
          )}
        </main>
      </div>

      {/* Detail Modals */}
      {selectedAssetDetail && (
        <AssetDetailModal
          asset={selectedAssetDetail.asset}
          employee={selectedAssetDetail.employee}
          history={selectedAssetDetail.history}
          onClose={() => setSelectedAssetDetail(null)}
          onOpenAssign={() => setAssignAsset(selectedAssetDetail.asset)}
          onOpenReturn={() => setReturnAsset(selectedAssetDetail.asset)}
          onOpenStatusChange={() => setStatusChangeAsset(selectedAssetDetail.asset)}
          onOpenEdit={() => {
            setAssetFormAsset(selectedAssetDetail.asset);
            setIsAssetFormOpen(true);
          }}
          onOpenDelete={() => setDeleteConfirmAsset(selectedAssetDetail.asset)}
          onUploadPhoto={handleUploadPhoto}
          onDeletePhoto={handleDeletePhoto}
          permissions={permissions}
        />
      )}

      {selectedEmployeeDetail && (
        <EmployeeDetailModal
          employee={selectedEmployeeDetail.employee}
          assignedAssets={selectedEmployeeDetail.assignedAssets}
          history={selectedEmployeeDetail.history}
          onClose={() => setSelectedEmployeeDetail(null)}
          onSelectAsset={handleSelectAsset}
          onReturnAsset={a => setReturnAsset(a)}
          canAssignAssets={permissions.includes('assign_assets')}
        />
      )}

      {/* Asset Form Modal (Add / Edit) */}
      {isAssetFormOpen && (
        <AssetFormModal
          initialAsset={assetFormAsset}
          onClose={() => {
            setIsAssetFormOpen(false);
            setAssetFormAsset(null);
          }}
          onSave={handleSaveAsset}
          facets={assetsFacets}
        />
      )}

      {/* Action Modals */}
      {assignAsset && (
        <AssignModal
          asset={assignAsset}
          employees={employees}
          onClose={() => setAssignAsset(null)}
          onConfirm={handleConfirmAssign}
        />
      )}

      {returnAsset && (
        <ReturnModal
          asset={returnAsset}
          onClose={() => setReturnAsset(null)}
          onConfirm={handleConfirmReturn}
        />
      )}

      {statusChangeAsset && (
        <StatusChangeModal
          asset={statusChangeAsset}
          onClose={() => setStatusChangeAsset(null)}
          onConfirm={handleConfirmStatusChange}
        />
      )}

      {deleteConfirmAsset && (
        <DeleteConfirmModal
          asset={deleteConfirmAsset}
          onClose={() => setDeleteConfirmAsset(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Architecture & Docker Blueprint Modal */}
      {isSystemInfoOpen && (
        <SystemInfoModal onClose={() => setIsSystemInfoOpen(false)} />
      )}

      {/* Theme & Logo Customization Modal (Super Admin) */}
      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentSettings={systemSettings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onLogin={handleLogin}
          onQuickDemoLogin={async role => {
            await handleSwitchRole(role);
            setIsLoggedIn(true);
            setIsLoginModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
