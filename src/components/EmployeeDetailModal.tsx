import React from 'react';
import {
  X,
  Users,
  Mail,
  Phone,
  Building,
  MapPin,
  Laptop,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import type { Employee, Asset, AuditLog } from '../types/itam';

interface EmployeeDetailModalProps {
  employee: Employee;
  assignedAssets: Asset[];
  history: AuditLog[];
  onClose: () => void;
  onSelectAsset: (asset: Asset) => void;
  onReturnAsset: (asset: Asset) => void;
  canAssignAssets: boolean;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  assignedAssets,
  history,
  onClose,
  onSelectAsset,
  onReturnAsset,
  canAssignAssets
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{employee.full_name}</h2>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {employee.employee_code}
                </span>
                {employee.is_active ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {employee.designation || 'Staff'} • {employee.department}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* Contact & Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Username</span>
              <span className="font-mono font-medium text-slate-900">@{employee.username}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Email</span>
              <span className="font-medium text-slate-900 truncate block">{employee.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Phone</span>
              <span className="font-mono text-slate-800">{employee.contact_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Office Location</span>
              <span className="font-medium text-slate-800">{employee.location || 'HQ'}</span>
            </div>
          </div>

          {/* Currently Assigned Assets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Assigned Hardware Custody ({assignedAssets.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Currently deployed units</span>
            </div>

            {assignedAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-slate-200 rounded-xl bg-slate-50/50">
                <Laptop className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="font-medium text-xs text-slate-500">No hardware currently assigned to this employee.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {assignedAssets.map(asset => (
                  <div key={asset.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {asset.device_type.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onClose();
                              onSelectAsset(asset);
                            }}
                            className="font-bold text-indigo-600 font-mono hover:underline text-xs"
                          >
                            {asset.asset_tag}
                          </button>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {asset.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {asset.manufacturer} {asset.model} • S/N: <span className="font-mono">{asset.serial_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right text-[10px] text-slate-400 font-mono mr-2">
                        <div>Assigned: {asset.assignment_date || 'N/A'}</div>
                      </div>

                      {canAssignAssets && (
                        <button
                          onClick={() => onReturnAsset(asset)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                          title="Process Return"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onClose();
                          onSelectAsset(asset);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                        title="View Asset Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custody History Logs */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Employee Custody & Status History
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No activity history recorded for this employee.
                </div>
              ) : (
                history.map(log => (
                  <div key={log.id} className="p-2.5 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 mr-2">
                        {log.action}
                      </span>
                      <span className="text-slate-700 text-[11px]">{log.new_value || log.field_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
