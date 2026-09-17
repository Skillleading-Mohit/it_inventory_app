import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Building,
  MapPin,
  Laptop,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  AlertCircle,
  Phone,
  Briefcase,
  Server
} from 'lucide-react';
import type { Employee, Asset } from '../types/itam';
import { LdapSyncModal } from './LdapSyncModal';

interface EmployeesViewProps {
  employees: Employee[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  filters: {
    q: string;
    department: string;
    is_active: string;
  };
  onFilterChange: (newFilters: any) => void;
  onSaveEmployee: (employeeData: Partial<Employee>) => Promise<void>;
  onToggleStatus: (employeeId: string) => Promise<void>;
  onSelectEmployeeAssets: (employee: Employee) => void;
  permissions: string[];
  departments: string[];
  onRefreshEmployees?: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  total,
  page,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
  onSaveEmployee,
  onToggleStatus,
  onSelectEmployeeAssets,
  permissions,
  departments,
  onRefreshEmployees
}) => {
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLdapModalOpen, setIsLdapModalOpen] = useState(false);
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<Employee | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const canManageEmployees = permissions.includes('manage_employees');

  const handleOpenAdd = () => {
    setEditingEmployee({
      employee_code: '',
      full_name: '',
      username: '',
      email: '',
      department: '',
      designation: '',
      contact_number: '',
      location: '',
      is_active: true
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    if (!editingEmployee.employee_code || !editingEmployee.employee_code.trim()) {
      setModalError('Employee Code is required.');
      return;
    }
    if (!editingEmployee.full_name || !editingEmployee.full_name.trim()) {
      setModalError('Full Name is required.');
      return;
    }
    if (!editingEmployee.email || !editingEmployee.email.trim()) {
      setModalError('Email address is required.');
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);
      await onSaveEmployee(editingEmployee);
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to save employee.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Employee Directory</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {total} Employees
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Staff directory, organizational units, and hardware custody allocation.
          </p>
        </div>

        {canManageEmployees && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLdapModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 shadow-2xs transition-colors"
              title="Synchronize employee directory with LDAP / Active Directory"
            >
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Sync via LDAP</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees by name, employee code, email, designation..."
            value={filters.q}
            onChange={e => onFilterChange({ ...filters, q: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filters.department}
            onChange={e => onFilterChange({ ...filters, department: e.target.value })}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filters.is_active}
            onChange={e => onFilterChange({ ...filters, is_active: e.target.value })}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="true">Active Staff</option>
            <option value="false">Inactive / Separated</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Code & Full Name</th>
                <th className="py-3 px-4">Username & Email</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Hardware</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No employees found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Code & Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.employee_code}</div>
                    </td>

                    {/* Username & Email */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800">@{emp.username}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{emp.department}</div>
                      <div className="text-[11px] text-slate-500">{emp.designation || 'Staff'}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <span className="text-slate-700">{emp.location || 'HQ'}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {emp.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Assigned Assets */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectEmployeeAssets(emp)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono font-bold text-xs border border-indigo-200 transition-colors inline-flex items-center gap-1.5"
                        title="View assigned hardware"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>{emp.assigned_asset_count || 0} assets</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectEmployeeAssets(emp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Employee Profile & Custody"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManageEmployees && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit Employee"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onToggleStatus(emp.id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                emp.is_active
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-slate-400 hover:bg-slate-100'
                              }`}
                              title={emp.is_active ? 'Deactivate Employee' : 'Activate Employee'}
                            >
                              {emp.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{employees.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> total employees
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-mono text-slate-700">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingEmployee.id ? 'Edit Employee Details' : 'Register New Employee'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Employee Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-105"
                    value={editingEmployee.employee_code}
                    onChange={e => setEditingEmployee({ ...editingEmployee, employee_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jsmith"
                    value={editingEmployee.username}
                    onChange={e => setEditingEmployee({ ...editingEmployee, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={editingEmployee.full_name}
                  onChange={e => setEditingEmployee({ ...editingEmployee, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jsmith@enterprise.internal"
                    value={editingEmployee.email}
                    onChange={e => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={editingEmployee.contact_number || ''}
                    onChange={e => setEditingEmployee({ ...editingEmployee, contact_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={editingEmployee.department}
                    onChange={e => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={editingEmployee.designation || ''}
                    onChange={e => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location / Office</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco HQ - Floor 4"
                  value={editingEmployee.location || ''}
                  onChange={e => setEditingEmployee({ ...editingEmployee, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{modalLoading ? 'Saving...' : 'Save Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LDAP Active Directory Synchronization Modal */}
      <LdapSyncModal
        isOpen={isLdapModalOpen}
        onClose={() => setIsLdapModalOpen(false)}
        onSyncComplete={() => {
          onRefreshEmployees?.();
        }}
      />
    </div>
  );
};
