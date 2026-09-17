import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  Shield,
  KeyRound,
  Edit3,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  X,
  Save,
  AlertCircle,
  Lock
} from 'lucide-react';
import type { User, UserRole } from '../types/itam';

interface UsersAdminViewProps {
  users: User[];
  currentUser: User | null;
  onSaveUser: (userData: any) => Promise<void>;
  onToggleUserStatus: (userId: string) => Promise<void>;
  onResetPassword: (userId: string, newPass: string) => Promise<void>;
}

export const UsersAdminView: React.FC<UsersAdminViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onToggleUserStatus,
  onResetPassword
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleOpenAdd = () => {
    setEditingUser({
      username: '',
      full_name: '',
      email: '',
      department: 'IT Infrastructure',
      role: 'operator' as UserRole,
      password: '',
      is_active: true
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser({
      id: u.id,
      username: u.username,
      full_name: u.full_name,
      email: u.email,
      department: u.department,
      role: u.role,
      is_active: u.is_active
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editingUser.id && (!editingUser.password || editingUser.password.length < 8)) {
      setModalError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);
      await onSaveUser(editingUser);
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to save user.');
    } finally {
      setModalLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      await onResetPassword(passwordModalUser.id, newPassword);
      setPasswordModalUser(null);
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to reset password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const roles: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Admin (System Owner)' },
    { role: 'admin', label: 'Admin (System Manager)' },
    { role: 'asset_manager', label: 'Asset Manager' },
    { role: 'operator', label: 'Operator (Assignments & Returns)' },
    { role: 'viewer', label: 'Viewer (Read-Only)' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">User Administration & RBAC</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {users.length} Users
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage system logins, role assignments, and granular operational permissions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Username & Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">RBAC Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.full_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-700">{u.email}</td>

                  <td className="py-3 px-4 text-slate-700">{u.department}</td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                      u.role === 'super_admin' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      u.role === 'asset_manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      u.role === 'operator' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {u.is_active ? (
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

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never logged in'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPasswordModalUser(u)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Reset User Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(u)}
                        disabled={u.role === 'super_admin' && !isSuperAdmin}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Edit User Profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        disabled={u.id === currentUser?.id || (u.role === 'super_admin' && !isSuperAdmin)}
                        className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                          u.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={u.is_active ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserCog className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingUser.id ? 'Edit User Profile' : 'Register New User'}
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

            <form onSubmit={handleUserFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser.id}
                  placeholder="e.g. blee"
                  value={editingUser.username}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brenda Lee"
                  value={editingUser.full_name}
                  onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. blee@enterprise.internal"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. IT Operations"
                  value={editingUser.department}
                  onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Role Assignment <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  disabled={editingUser.role === 'super_admin' && !isSuperAdmin}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  {roles.map(r => (
                    <option
                      key={r.role}
                      value={r.role}
                      disabled={r.role === 'super_admin' && !isSuperAdmin}
                    >
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser.id && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={editingUser.password}
                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>
              )}

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
                  <span>{modalLoading ? 'Saving...' : 'Save User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Reset User Password</h3>
              </div>
              <button onClick={() => setPasswordModalUser(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Set a new password for <span className="font-semibold text-slate-900">@{passwordModalUser.username}</span> ({passwordModalUser.full_name}).
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
