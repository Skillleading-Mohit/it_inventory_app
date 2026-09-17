import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  RotateCcw,
  Camera,
  Trash2,
  Edit3,
  Eye,
  SlidersHorizontal,
  X,
  Clock,
  ShieldAlert
} from 'lucide-react';
import type { Asset, User } from '../types/itam';

interface AssetsViewProps {
  assets: Asset[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  filters: {
    q: string;
    status: string;
    device_type: string;
    category: string;
    location: string;
    department: string;
    assigned: string;
  };
  onFilterChange: (newFilters: any) => void;
  onSelectAsset: (asset: Asset) => void;
  onOpenAddAsset: () => void;
  onOpenAssign: (asset: Asset) => void;
  onOpenReturn: (asset: Asset) => void;
  onOpenStatusChange: (asset: Asset) => void;
  onOpenEdit: (asset: Asset) => void;
  onOpenDelete: (asset: Asset) => void;
  permissions: string[];
  facets: {
    locations: string[];
    departments: string[];
    device_types: string[];
    statuses: string[];
  };
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  total,
  page,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
  onSelectAsset,
  onOpenAddAsset,
  onOpenAssign,
  onOpenReturn,
  onOpenStatusChange,
  onOpenEdit,
  onOpenDelete,
  permissions,
  facets
}) => {
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const canManageAssets = permissions.includes('manage_assets');
  const canAssignAssets = permissions.includes('assign_assets');
  const canDeleteAssets = permissions.includes('delete_assets');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleResetFilters = () => {
    onFilterChange({
      q: '',
      status: 'all',
      device_type: 'all',
      category: 'all',
      location: 'all',
      department: 'all',
      assigned: 'all'
    });
  };

  const hasActiveFilters =
    filters.q !== '' ||
    filters.status !== 'all' ||
    filters.device_type !== 'all' ||
    filters.category !== 'all' ||
    filters.location !== 'all' ||
    filters.department !== 'all' ||
    filters.assigned !== 'all';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Active':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Under Repair':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Maintenance':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Disposed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getWarrantyIndicator = (expiryStr: string) => {
    if (!expiryStr) return null;
    const now = new Date();
    const exp = new Date(expiryStr);
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    if (exp < now) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600" title="Warranty Expired">
          <AlertTriangle className="w-3 h-3" />
          <span>Expired</span>
        </span>
      );
    } else if (exp <= in30Days) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600" title="Warranty Expiring soon (<30 days)">
          <Clock className="w-3 h-3" />
          <span>Expiring soon</span>
        </span>
      );
    }
    return <span className="text-[11px] text-slate-500 font-mono">{expiryStr}</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">IT Asset Inventory</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {total} Assets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hardware tracking, specifications, warranty timelines & employee custody.
          </p>
        </div>

        {canManageAssets && (
          <button
            onClick={onOpenAddAsset}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Asset</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by asset tag, hostname, serial number, model, IP, MAC, employee..."
              value={filters.q}
              onChange={e => onFilterChange({ ...filters, q: e.target.value })}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Select */}
            <select
              value={filters.status}
              onChange={e => onFilterChange({ ...filters, status: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Assigned">Assigned</option>
              <option value="Active">Active</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Disposed">Disposed</option>
            </select>

            {/* Device Type Select */}
            <select
              value={filters.device_type}
              onChange={e => onFilterChange({ ...filters, device_type: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Device Types</option>
              {facets.device_types.map(dt => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>

            {/* Assignment filter */}
            <select
              value={filters.assigned}
              onChange={e => onFilterChange({ ...filters, assigned: e.target.value })}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Custody</option>
              <option value="assigned">Assigned to Staff</option>
              <option value="unassigned">Unassigned / In Stock</option>
            </select>

            {/* Clear filters button if active */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Asset Tag / Hostname</th>
                <th className="py-3 px-4">Make & Model</th>
                <th className="py-3 px-4">Type / Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Location / Dept</th>
                <th className="py-3 px-4">Warranty</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Laptop className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No assets matching current criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or adjusting search keyword.</p>
                  </td>
                </tr>
              ) : (
                assets.map(asset => (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectAsset(asset)}
                  >
                    {/* Tag & Hostname */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-indigo-600 font-mono group-hover:underline">
                        {asset.asset_tag}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {asset.hostname || 'No hostname'}
                      </div>
                    </td>

                    {/* Make & Model */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                        {asset.manufacturer} {asset.model}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        S/N: {asset.serial_number || 'N/A'}
                      </div>
                    </td>

                    {/* Device Type & Category */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{asset.device_type}</div>
                      <div className="text-[11px] text-slate-500">{asset.category}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>

                    {/* Custody / Assignee */}
                    <td className="py-3 px-4">
                      {asset.employee_id ? (
                        <div>
                          <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                            {asset.employee_name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {asset.employee_code} • {asset.employee_department}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Location & Dept */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 truncate max-w-[140px]">{asset.location || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{asset.department || 'General'}</div>
                    </td>

                    {/* Warranty */}
                    <td className="py-3 px-4">
                      {getWarrantyIndicator(asset.warranty_expiry)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectAsset(asset)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Assign / Return quick action */}
                        {canAssignAssets && asset.status !== 'Disposed' && (
                          asset.employee_id ? (
                            <button
                              onClick={() => onOpenReturn(asset)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Process Asset Return"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenAssign(asset)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Assign to Employee"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )
                        )}

                        {/* Status Change */}
                        {canManageAssets && (
                          <button
                            onClick={() => onOpenStatusChange(asset)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Update Status"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        {canManageAssets && (
                          <button
                            onClick={() => onOpenEdit(asset)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Asset"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {canDeleteAssets && (
                          <button
                            onClick={() => onOpenDelete(asset)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete / Retire"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{assets.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> total assets
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-mono text-slate-700">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
