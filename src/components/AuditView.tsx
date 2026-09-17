import React from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  X,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import type { AuditLog } from '../types/itam';

interface AuditViewProps {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  filters: {
    q: string;
    entity_type: string;
    action: string;
    username: string;
    start_date: string;
    end_date: string;
  };
  onFilterChange: (newFilters: any) => void;
  facets: {
    entity_types: string[];
    actions: string[];
    users: string[];
  };
}

export const AuditView: React.FC<AuditViewProps> = ({
  logs,
  total,
  page,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
  facets
}) => {
  const handleReset = () => {
    onFilterChange({
      q: '',
      entity_type: 'all',
      action: 'all',
      username: 'all',
      start_date: '',
      end_date: ''
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UPDATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELETED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RETURNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'STATUS_CHANGED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PHOTO_UPLOADED':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'PHOTO_DELETED':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'LOGIN_SUCCESS':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Append-Only Audit Trail</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {total} Log Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable tracking of every creation, modification, assignment, status change, and user action.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Cryptographic Integrity Active</span>
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs, values, entities..."
              value={filters.q}
              onChange={e => onFilterChange({ ...filters, q: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <select
              value={filters.entity_type}
              onChange={e => onFilterChange({ ...filters, entity_type: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Entity Types</option>
              {facets.entity_types.map(et => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.action}
              onChange={e => onFilterChange({ ...filters, action: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Actions</option>
              {facets.actions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.username}
              onChange={e => onFilterChange({ ...filters, username: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Users</option>
              {facets.users.map(u => (
                <option key={u} value={u}>@{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Date Range:</span>
            <input
              type="date"
              value={filters.start_date}
              onChange={e => onFilterChange({ ...filters, start_date: e.target.value })}
              className="px-2 py-1 rounded border border-slate-200 text-xs font-mono"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.end_date}
              onChange={e => onFilterChange({ ...filters, end_date: e.target.value })}
              className="px-2 py-1 rounded border border-slate-200 text-xs font-mono"
            />
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Field</th>
                <th className="py-3 px-4">Change Delta (Old → New)</th>
                <th className="py-3 px-4 text-right">User & IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No audit events match current criteria.</p>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.entity_type}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.entity_id}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.field_name ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                          {log.field_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      {log.old_value || log.new_value ? (
                        <div className="text-[11px] font-mono break-all space-y-0.5">
                          {log.old_value && (
                            <div className="text-rose-600 line-through opacity-80">
                              {log.old_value}
                            </div>
                          )}
                          {log.new_value && (
                            <div className="text-emerald-700 font-medium">
                              {log.new_value}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No value recorded</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900">@{log.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.ip_address}</div>
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
            Showing <span className="font-semibold text-slate-700">{logs.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> events
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
    </div>
  );
};
