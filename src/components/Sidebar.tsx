import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Users,
  History,
  FileSpreadsheet,
  UserCog,
  ChevronRight,
  ShieldAlert,
  Server
} from 'lucide-react';
import type { User } from '../types/itam';

export type TabType = 'dashboard' | 'assets' | 'employees' | 'history' | 'reports' | 'admin';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  permissions: string[];
  currentUser: User | null;
  counts?: {
    assets: number;
    employees: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  permissions,
  currentUser,
  counts
}) => {
  const canManageUsers = permissions.includes('manage_users');

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Metrics & health overview'
    },
    {
      id: 'assets' as TabType,
      label: 'Asset Inventory',
      icon: Boxes,
      badge: counts?.assets !== undefined ? String(counts.assets) : undefined,
      desc: 'Hardware, lifecycle & specs'
    },
    {
      id: 'employees' as TabType,
      label: 'Employee Directory',
      icon: Users,
      badge: counts?.employees !== undefined ? String(counts.employees) : undefined,
      desc: 'Staff & hardware custody'
    },
    {
      id: 'history' as TabType,
      label: 'Audit History',
      icon: History,
      desc: 'Append-only event log'
    },
    {
      id: 'reports' as TabType,
      label: 'Reports & Export',
      icon: FileSpreadsheet,
      desc: 'CSV, Excel & PDF reports'
    },
    {
      id: 'admin' as TabType,
      label: 'User Management',
      icon: UserCog,
      restricted: true,
      desc: 'RBAC user accounts'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-[calc(100vh-4rem)]">
      {/* Navigation section */}
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isRestricted = item.restricted && !canManageUsers;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isRestricted) {
                  onSelectTab(item.id);
                }
              }}
              disabled={isRestricted}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : isRestricted
                  ? 'opacity-40 cursor-not-allowed text-slate-500 hover:bg-transparent'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isRestricted ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isRestricted && (
                  <span className="text-[10px] text-amber-500/80 font-mono">RBAC</span>
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Database & Infrastructure Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs bg-slate-950/40">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">Persistence Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          ACID transactions, persistent volume & audit trails enabled.
        </p>
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>Active Role:</span>
          <span className="font-mono text-indigo-400 font-semibold">{currentUser?.role}</span>
        </div>
      </div>
    </aside>
  );
};
