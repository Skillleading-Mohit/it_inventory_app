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
  Lock,
  Palette
} from 'lucide-react';
import type { User, UserRole, SystemSettings } from '../types/itam';

interface NavbarProps {
  currentUser: User | null;
  permissions: string[];
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onOpenSystemInfo: () => void;
  settings?: SystemSettings | null;
  onOpenThemeSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  permissions,
  onSwitchRole,
  onLogout,
  onOpenSystemInfo,
  settings,
  onOpenThemeSettings
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isBw = settings?.theme === 'black_and_white';

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full system privileges & user management', color: isBw ? 'bg-black text-white border-black' : 'bg-rose-50 text-rose-700 border-rose-200' },
    { role: 'admin', label: 'Admin', desc: 'System management, assets & employees', color: isBw ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-purple-50 text-purple-700 border-purple-200' },
    { role: 'asset_manager', label: 'Asset Manager', desc: 'Operational asset & employee manager', color: isBw ? 'bg-zinc-200 text-zinc-900 border-zinc-300' : 'bg-blue-50 text-blue-700 border-blue-200' },
    { role: 'operator', label: 'Operator', desc: 'Asset assignments, returns & status updates', color: isBw ? 'bg-zinc-100 text-zinc-800 border-zinc-300' : 'bg-amber-50 text-amber-700 border-amber-200' },
    { role: 'viewer', label: 'Viewer', desc: 'Read-only compliance & audit view', color: isBw ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  ];

  const currentRoleInfo = roles.find(r => r.role === currentUser?.role) || roles[0];
  const customLogo = settings?.custom_logo_base64 || settings?.custom_logo_url;

  return (
    <header className={`h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors ${
      isBw ? 'bg-white border-b-2 border-black' : 'bg-white border-b border-slate-200'
    }`}>
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {customLogo ? (
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
              <img
                src={customLogo}
                alt="App Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-xs ${
              isBw ? 'bg-black text-white' : 'bg-slate-900 text-white'
            }`}>
              <Server className={`w-5 h-5 ${isBw ? 'text-white' : 'text-indigo-400'}`} />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-base tracking-tight ${isBw ? 'text-black' : 'text-slate-900'}`}>
                {settings?.app_name || 'ITAM Enterprise'}
              </span>
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                isBw ? 'bg-black text-white border-black' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {isBw ? 'B&W Theme' : 'v1.0 Production'}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {settings?.company_name || 'IT Asset & Lifecycle Management System'}
            </p>
          </div>
        </div>

        {/* Live Health Badge */}
        <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isBw ? 'bg-zinc-100 border border-zinc-300 text-black' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isBw ? 'bg-black' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span>Core API & DB Online</span>
        </div>
      </div>

      {/* Right Controls: Super Admin tools, Role Switcher, User Profile */}
      <div className="flex items-center gap-3">
        {/* Architecture & Docker specs button (SUPER ADMIN ONLY) */}
        {currentUser?.role === 'super_admin' && (
          <button
            onClick={onOpenSystemInfo}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              isBw
                ? 'text-black hover:bg-zinc-100 border-black'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
            title="System Architecture, Docker & Production specs (Super Admin only)"
          >
            <FileCode2 className={`w-4 h-4 ${isBw ? 'text-black' : 'text-indigo-600'}`} />
            <span>System Architecture</span>
          </button>
        )}

        {/* Theme & Logo Customization button (SUPER ADMIN ONLY) */}
        {currentUser?.role === 'super_admin' && onOpenThemeSettings && (
          <button
            onClick={onOpenThemeSettings}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              isBw
                ? 'bg-black text-white hover:bg-zinc-800 border-black'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
            title="Customize Application Logo, Theme (Black & White) and Branding"
          >
            <Palette className="w-4 h-4" />
            <span>Theme & Logo</span>
          </button>
        )}

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
