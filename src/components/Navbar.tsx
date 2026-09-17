import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Server,
  Activity,
  LogOut,
  ChevronDown,
  Layers,
  FileCode2,
  Lock
} from 'lucide-react';
import type { User, UserRole } from '../types/itam';

interface NavbarProps {
  currentUser: User | null;
  permissions: string[];
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onOpenSystemInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  permissions,
  onSwitchRole,
  onLogout,
  onOpenSystemInfo
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full system privileges & user management', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { role: 'admin', label: 'Admin', desc: 'System management, assets & employees', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { role: 'asset_manager', label: 'Asset Manager', desc: 'Operational asset & employee manager', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { role: 'operator', label: 'Operator', desc: 'Asset assignments, returns & status updates', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { role: 'viewer', label: 'Viewer', desc: 'Read-only compliance & audit view', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  ];

  const currentRoleInfo = roles.find(r => r.role === currentUser?.role) || roles[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">ITAM Enterprise</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                v1.0 Production
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">IT Asset & Lifecycle Management System</p>
          </div>
        </div>

        {/* Live Health Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Core API & DB Online</span>
        </div>
      </div>

      {/* Right Controls: Role Switcher Demo, Architecture Info, User Profile */}
      <div className="flex items-center gap-3">
        {/* Architecture & Docker specs button */}
        <button
          onClick={onOpenSystemInfo}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="System Architecture, Docker & Azure specifications"
        >
          <FileCode2 className="w-4 h-4 text-indigo-600" />
          <span>System Architecture</span>
        </button>

        {/* RBAC Role Switcher (Crucial for testing all 5 roles requested in prompt) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${currentRoleInfo.color} hover:shadow-xs`}
            title="Switch active role to test RBAC enforcement"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Role:</span>
            <span>{currentRoleInfo.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Role-Based Access Control</span>
                    <span className="text-[10px] text-slate-500 font-normal">5 Roles</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a role to test server-side authorization and permissions.
                  </p>
                </div>
                <div className="p-1 space-y-0.5">
                  {roles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onSwitchRole(r.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                        currentUser?.role === r.role ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{r.label}</div>
                        <div className="text-[11px] text-slate-500">{r.desc}</div>
                      </div>
                      {currentUser?.role === r.role && (
                        <span className="text-indigo-600 text-xs font-bold mt-0.5">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
              {currentUser?.full_name || 'Administrator'}
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
              {currentUser?.department || 'IT Infrastructure'}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
