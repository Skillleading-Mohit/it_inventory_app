import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Laptop } from 'lucide-react';
import type { Asset, DeviceType, AssetCategory, AssetStatus } from '../types/itam';

interface AssetFormModalProps {
  initialAsset?: Asset | null;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => Promise<void>;
  facets: {
    locations: string[];
    departments: string[];
    device_types: string[];
    statuses: string[];
  };
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  initialAsset,
  onClose,
  onSave,
  facets
}) => {
  const isEdit = !!initialAsset;

  const [formData, setFormData] = useState<Partial<Asset>>({
    asset_tag: '',
    hostname: '',
    ip_address: '',
    device_type: 'Laptop',
    category: 'Hardware',
    manufacturer: '',
    model: '',
    serial_number: '',
    status: 'In Stock',
    location: '',
    rack: '',
    room: '',
    department: '',
    cost_centre: '',
    purchase_date: '',
    manufacturing_date: '',
    installation_date: '',
    invoice_number: '',
    vendor: '',
    purchase_cost: 0,
    warranty_start: '',
    warranty_expiry: '',
    amc_start: '',
    amc_expiry: '',
    expected_replacement_date: '',
    disposal_date: '',
    cpu: '',
    ram: '',
    storage: '',
    operating_system: '',
    os_version: '',
    bios_version: '',
    mac_address: '',
    gpu: '',
    monitor_details: '',
    configuration_notes: '',
    other_specifications: '',
    notes: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAsset) {
      setFormData({ ...initialAsset });
    }
  }, [initialAsset]);

  const handleChange = (field: keyof Asset, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side quick validations
    if (!formData.asset_tag || !formData.asset_tag.trim()) {
      setError('Asset Tag is required.');
      return;
    }

    if (formData.ip_address && formData.ip_address.trim()) {
      const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipv4Regex.test(formData.ip_address.trim())) {
        setError('Invalid IPv4 address format. Example: 192.168.1.100');
        return;
      }
    }

    if (formData.mac_address && formData.mac_address.trim()) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(formData.mac_address.trim())) {
        setError('Invalid MAC address format. Example: 3C:06:30:4A:8B:11');
        return;
      }
    }

    if (formData.warranty_start && formData.warranty_expiry) {
      if (new Date(formData.warranty_expiry) < new Date(formData.warranty_start)) {
        setError('Warranty Expiry cannot be before Warranty Start.');
        return;
      }
    }

    if (formData.amc_start && formData.amc_expiry) {
      if (new Date(formData.amc_expiry) < new Date(formData.amc_start)) {
        setError('AMC Expiry cannot be before AMC Start.');
        return;
      }
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save asset.');
    } finally {
      setLoading(false);
    }
  };

  const deviceTypes: DeviceType[] = [
    'Laptop', 'Desktop', 'Workstation', 'Server', 'Firewall', 'Switch',
    'Router', 'Access Point', 'Monitor', 'Storage', 'UPS', 'Printer', 'Mobile', 'Other'
  ];

  const categories: AssetCategory[] = [
    'Hardware', 'Network', 'Peripheral', 'Infrastructure', 'Mobile Device', 'Other'
  ];

  const statuses: AssetStatus[] = [
    'In Stock', 'Assigned', 'Active', 'Inactive', 'Under Repair', 'Maintenance', 'Disposed'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isEdit ? `Edit Asset (${initialAsset.asset_tag})` : 'Register New IT Asset'}
              </h2>
              <p className="text-xs text-slate-500">
                Provide comprehensive hardware, network, procurement, and specification details.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1.5 text-indigo-700">
              1. Basic Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Asset Tag <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITAM-NB-2026-042"
                  value={formData.asset_tag}
                  onChange={e => handleChange('asset_tag', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hostname</label>
                <input
                  type="text"
                  placeholder="e.g. SF-DEV-MBP16-01"
                  value={formData.hostname}
                  onChange={e => handleChange('hostname', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Device Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.device_type}
                  onChange={e => handleChange('device_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {deviceTypes.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Manufacturer / Make</label>
                <input
                  type="text"
                  placeholder="e.g. Apple, Dell, Lenovo, Cisco"
                  value={formData.manufacturer}
                  onChange={e => handleChange('manufacturer', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Model Name / Number</label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro 16 / PowerEdge R750"
                  value={formData.model}
                  onChange={e => handleChange('model', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. C02G90XXMD6R"
                  value={formData.serial_number}
                  onChange={e => handleChange('serial_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">IP Address (IPv4/IPv6)</label>
                <input
                  type="text"
                  placeholder="e.g. 10.10.45.101"
                  value={formData.ip_address}
                  onChange={e => handleChange('ip_address', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">MAC Address</label>
                <input
                  type="text"
                  placeholder="e.g. 3C:06:30:4A:8B:11"
                  value={formData.mac_address}
                  onChange={e => handleChange('mac_address', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Department */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1.5 text-indigo-700">
              2. Location & Placement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Branch / Campus Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco HQ - Building A"
                  value={formData.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rack / Station</label>
                <input
                  type="text"
                  placeholder="e.g. Rack 04 - Unit 18 / Desk 12"
                  value={formData.rack}
                  onChange={e => handleChange('rack', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Room / Floor</label>
                <input
                  type="text"
                  placeholder="e.g. Server Room 101 / 3rd Floor"
                  value={formData.room}
                  onChange={e => handleChange('room', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, IT, Finance"
                  value={formData.department}
                  onChange={e => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cost Centre</label>
                <input
                  type="text"
                  placeholder="e.g. CC-ENG-4001"
                  value={formData.cost_centre}
                  onChange={e => handleChange('cost_centre', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Procurement, Warranty & Lifecycle */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1.5 text-indigo-700">
              3. Procurement, Warranty & Lifecycle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Dell Enterprise Direct"
                  value={formData.vendor}
                  onChange={e => handleChange('vendor', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Invoice Number</label>
                <input
                  type="text"
                  placeholder="e.g. INV-DELL-99231"
                  value={formData.invoice_number}
                  onChange={e => handleChange('invoice_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purchase Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.purchase_cost}
                  onChange={e => handleChange('purchase_cost', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={e => handleChange('purchase_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Warranty Start</label>
                <input
                  type="date"
                  value={formData.warranty_start}
                  onChange={e => handleChange('warranty_start', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Warranty Expiry</label>
                <input
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={e => handleChange('warranty_expiry', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">AMC Start Date</label>
                <input
                  type="date"
                  value={formData.amc_start}
                  onChange={e => handleChange('amc_start', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">AMC Expiry Date</label>
                <input
                  type="date"
                  value={formData.amc_expiry}
                  onChange={e => handleChange('amc_expiry', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expected Replacement Date</label>
                <input
                  type="date"
                  value={formData.expected_replacement_date}
                  onChange={e => handleChange('expected_replacement_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Hardware & Software Specifications */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1.5 text-indigo-700">
              4. Hardware & Configuration Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">CPU Model</label>
                <input
                  type="text"
                  placeholder="e.g. Intel Core i7-1365U / M3 Max"
                  value={formData.cpu}
                  onChange={e => handleChange('cpu', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">RAM</label>
                <input
                  type="text"
                  placeholder="e.g. 32 GB DDR5"
                  value={formData.ram}
                  onChange={e => handleChange('ram', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Storage</label>
                <input
                  type="text"
                  placeholder="e.g. 1 TB NVMe SSD"
                  value={formData.storage}
                  onChange={e => handleChange('storage', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operating System</label>
                <input
                  type="text"
                  placeholder="e.g. Windows 11 Enterprise / Ubuntu LTS"
                  value={formData.operating_system}
                  onChange={e => handleChange('operating_system', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">OS Build / Version</label>
                <input
                  type="text"
                  placeholder="e.g. 23H2 / 22.04"
                  value={formData.os_version}
                  onChange={e => handleChange('os_version', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">BIOS / UEFI Version</label>
                <input
                  type="text"
                  placeholder="e.g. v1.8.2"
                  value={formData.bios_version}
                  onChange={e => handleChange('bios_version', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-700 font-semibold mb-1">Configuration Notes / MDM Security</label>
              <textarea
                rows={2}
                placeholder="e.g. BitLocker TPM 2.0 active. Intune registered. MDM Jamf profile."
                value={formData.configuration_notes}
                onChange={e => handleChange('configuration_notes', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">General Operational Notes</label>
              <textarea
                rows={2}
                placeholder="Maintenance notes, condition remarks, etc."
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Asset' : 'Register Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
