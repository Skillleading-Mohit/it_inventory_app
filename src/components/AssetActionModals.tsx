import React, { useState } from 'react';
import { X, UserCheck, RotateCcw, CheckCircle2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Asset, Employee, AssetStatus } from '../types/itam';

// 1. Assignment Modal
export const AssignModal: React.FC<{
  asset: Asset;
  employees: Employee[];
  onClose: () => void;
  onConfirm: (employeeId: string, assignmentDate: string, notes: string) => Promise<void>;
}> = ({ asset, employees, onClose, onConfirm }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeEmployees = employees.filter(e => e.is_active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an active employee.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(selectedEmployeeId, assignmentDate, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Assign Asset to Staff</h3>
              <p className="text-[11px] text-slate-500 font-mono">{asset.asset_tag} ({asset.manufacturer} {asset.model})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Employee <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Choose active employee --</option>
              {activeEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_code}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assignment Date</label>
            <input
              type="date"
              required
              value={assignmentDate}
              onChange={e => setAssignmentDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Custody Notes / Purpose</label>
            <textarea
              rows={2}
              placeholder="e.g. Assigned for primary engineering workstation duties..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Return Modal
export const ReturnModal: React.FC<{
  asset: Asset;
  onClose: () => void;
  onConfirm: (returnDate: string, resultingStatus: string, notes: string) => Promise<void>;
}> = ({ asset, onClose, onConfirm }) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [resultingStatus, setResultingStatus] = useState<AssetStatus>('In Stock');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onConfirm(returnDate, resultingStatus, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process asset return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Process Asset Return</h3>
              <p className="text-[11px] text-slate-500">Currently held by: <span className="font-semibold text-slate-800">{asset.employee_name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Return Date</label>
            <input
              type="date"
              required
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Resulting Inventory Status</label>
            <select
              value={resultingStatus}
              onChange={e => setResultingStatus(e.target.value as AssetStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
            >
              <option value="In Stock">In Stock (Normal Spare)</option>
              <option value="Under Repair">Under Repair (Requires Maintenance / Depot RMA)</option>
              <option value="Maintenance">Maintenance (Under Periodic Inspection)</option>
              <option value="Disposed">Disposed (Flagged for Decommissioning / E-Waste)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Return Condition / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Device returned in clean physical condition with OEM power adapter..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Quick Status Change Modal
export const StatusChangeModal: React.FC<{
  asset: Asset;
  onClose: () => void;
  onConfirm: (status: AssetStatus, notes: string, disposalDate?: string) => Promise<void>;
}> = ({ asset, onClose, onConfirm }) => {
  const [status, setStatus] = useState<AssetStatus>(asset.status);
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statuses: AssetStatus[] = [
    'In Stock', 'Assigned', 'Active', 'Inactive', 'Under Repair', 'Maintenance', 'Disposed'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onConfirm(status, notes, status === 'Disposed' ? disposalDate : undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Update Asset Status</h3>
              <p className="text-[11px] text-slate-500 font-mono">{asset.asset_tag}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">New Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as AssetStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {status === 'Disposed' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Disposal Date</label>
              <input
                type="date"
                required
                value={disposalDate}
                onChange={e => setDisposalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
              <p className="text-[10px] text-amber-600 mt-1">
                Disposing this asset will release any active assignments and record formal retirement.
              </p>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Status Reason / Justification</label>
            <textarea
              rows={2}
              placeholder="e.g. Moved to Under Repair due to intermittent display flickering..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Delete Confirm Modal
export const DeleteConfirmModal: React.FC<{
  asset: Asset;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}> = ({ asset, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAssigned = !!asset.employee_id;

  const handleDelete = async () => {
    if (isAssigned) {
      setError(`Cannot delete active asset '${asset.asset_tag}' while assigned to ${asset.employee_name}. Please process asset return first.`);
      return;
    }
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-900">Delete Asset Record</h3>
            <p className="text-xs text-slate-600 mt-1">
              Are you sure you want to permanently delete asset <span className="font-mono font-bold text-slate-900">{asset.asset_tag}</span>?
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isAssigned && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <strong>Safeguard Active:</strong> This hardware is currently in the custody of {asset.employee_name}. Assets must be returned to stock before permanent deletion.
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || isAssigned}
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
