import React from 'react';
import {
  Boxes,
  ShieldAlert,
  Clock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  PlusCircle,
  FileSpreadsheet,
  Users,
  Activity,
  Calendar
} from 'lucide-react';
import type { DashboardMetrics, AuditLog } from '../types/itam';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  recentLogs: AuditLog[];
  onNavigateTab: (tab: any) => void;
  onOpenAddAsset: () => void;
  onOpenAddEmployee: () => void;
  permissions: string[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentLogs,
  onNavigateTab,
  onOpenAddAsset,
  onOpenAddEmployee,
  permissions
}) => {
  if (!metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading system dashboard metrics...</span>
        </div>
      </div>
    );
  }

  const canManageAssets = permissions.includes('manage_assets');
  const canManageEmployees = permissions.includes('manage_employees');

  const statCards = [
    {
      title: 'Total Assets',
      value: metrics.total_assets,
      sub: `Valued at $${metrics.total_inventory_value.toLocaleString()}`,
      icon: Boxes,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      action: () => onNavigateTab('assets')
    },
    {
      title: 'Assigned Assets',
      value: metrics.assigned_assets,
      sub: `${Math.round((metrics.assigned_assets / (metrics.total_assets || 1)) * 100)}% deployed to staff`,
      icon: Laptop,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      action: () => onNavigateTab('assets')
    },
    {
      title: 'In Stock / Available',
      value: metrics.in_stock_assets,
      sub: 'Ready for deployment',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      action: () => onNavigateTab('assets')
    },
    {
      title: 'Under Repair',
      value: metrics.under_repair_assets,
      sub: 'Depot / RMA maintenance',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      action: () => onNavigateTab('assets')
    },
    {
      title: 'Active Employees',
      value: metrics.active_employees,
      sub: 'Hardware custody holders',
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100',
      action: () => onNavigateTab('employees')
    },
    {
      title: 'Disposed / Decommissioned',
      value: metrics.disposed_assets,
      sub: 'Certified e-waste retired',
      icon: Activity,
      color: 'text-slate-600',
      bg: 'bg-slate-50 border-slate-200',
      action: () => onNavigateTab('assets')
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">IT Asset Management Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise hardware lifecycle, warranty tracking, and custody governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManageAssets && (
            <button
              onClick={onOpenAddAsset}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Asset</span>
            </button>
          )}

          {canManageEmployees && (
            <button
              onClick={onOpenAddEmployee}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Register Employee</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>

      {/* Critical Expiry Alerts (Warranty & AMC) */}
      {(metrics.warranty_expiring_soon > 0 || metrics.amc_expiring_soon > 0 || metrics.warranty_expired > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Warranty Expiring Soon</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-200 text-amber-900 font-mono">
                  {metrics.warranty_expiring_soon}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Assets have manufacturer warranties expiring within the next 30 days.
              </p>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-[11px] font-semibold text-amber-900 hover:underline mt-2 inline-flex items-center gap-1"
              >
                <span>View Warranty Report</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">AMC Expiring Soon</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-200 text-blue-900 font-mono">
                  {metrics.amc_expiring_soon}
                </span>
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Annual Maintenance Contracts (AMC) expiring within 30 days.
              </p>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-[11px] font-semibold text-blue-900 hover:underline mt-2 inline-flex items-center gap-1"
              >
                <span>View AMC Schedule</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">Warranty Expired</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-200 text-rose-900 font-mono">
                  {metrics.warranty_expired}
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mt-1">
                Active enterprise hardware operating without OEM warranty coverage.
              </p>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-[11px] font-semibold text-rose-900 hover:underline mt-2 inline-flex items-center gap-1"
              >
                <span>Audit Uncovered Assets</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              onClick={c.action}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{c.title}</span>
                <div className={`w-7 h-7 rounded-lg ${c.bg} border flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono group-hover:text-indigo-600 transition-colors">
                  {c.value}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Asset Status Breakdown</h2>
            <span className="text-[11px] font-mono text-slate-500">{metrics.total_assets} units</span>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(metrics.status_distribution).map(([status, count]) => {
              const num = Number(count);
              const pct = Math.round((num / (metrics.total_assets || 1)) * 100);
              let barColor = 'bg-slate-500';
              if (status === 'Assigned') barColor = 'bg-blue-600';
              if (status === 'Active') barColor = 'bg-indigo-600';
              if (status === 'In Stock') barColor = 'bg-emerald-500';
              if (status === 'Under Repair') barColor = 'bg-amber-500';
              if (status === 'Disposed') barColor = 'bg-rose-500';

              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{status}</span>
                    <span className="font-mono text-slate-500">{num} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Device Categories</h2>
            <span className="text-[11px] font-mono text-slate-500">Hardware classification</span>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(metrics.category_distribution).map(([cat, count]) => {
              const num = Number(count);
              const pct = Math.round((num / (metrics.total_assets || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="font-mono text-slate-500">{num} units ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Allocation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Department Allocation</h2>
            <span className="text-[11px] font-mono text-slate-500">Cost centre distribution</span>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(metrics.department_distribution).map(([dept, count]) => {
              const num = Number(count);
              const pct = Math.round((num / (metrics.total_assets || 1)) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{dept}</span>
                    <span className="font-mono text-slate-500">{num} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Audit Activity Feed Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Audit Event Log</h2>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {recentLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  log.action === 'CREATED' ? 'bg-emerald-100 text-emerald-800' :
                  log.action === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                  log.action === 'RETURNED' ? 'bg-purple-100 text-purple-800' :
                  log.action === 'STATUS_CHANGED' ? 'bg-amber-100 text-amber-800' :
                  log.action === 'PHOTO_UPLOADED' ? 'bg-cyan-100 text-cyan-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {log.action}
                </span>
                <span className="font-medium text-slate-800">{log.entity_type} {log.entity_id}</span>
                <span className="text-slate-500 text-[11px] truncate max-w-[300px]">
                  {log.new_value || log.old_value || 'Modified attribute'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span className="font-medium text-slate-700">@{log.username}</span>
                <span className="font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
