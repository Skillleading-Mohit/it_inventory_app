import React, { useState } from 'react';
import {
  X,
  Laptop,
  Calendar,
  DollarSign,
  MapPin,
  Cpu,
  HardDrive,
  Shield,
  ShieldAlert,
  Clock,
  Camera,
  RotateCcw,
  UserCheck,
  Edit3,
  Trash2,
  Printer,
  History,
  FileText,
  AlertTriangle,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import type { Asset, Employee, AuditLog, AssetPhoto } from '../types/itam';

interface AssetDetailModalProps {
  asset: Asset;
  employee: Employee | null;
  history: AuditLog[];
  onClose: () => void;
  onOpenAssign: () => void;
  onOpenReturn: () => void;
  onOpenStatusChange: () => void;
  onOpenEdit: () => void;
  onOpenDelete: () => void;
  onUploadPhoto: (file: File, photoType: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  permissions: string[];
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  employee,
  history,
  onClose,
  onOpenAssign,
  onOpenReturn,
  onOpenStatusChange,
  onOpenEdit,
  onOpenDelete,
  onUploadPhoto,
  onDeletePhoto,
  permissions
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'procurement' | 'photos' | 'audit'>('overview');
  const [uploading, setUploading] = useState(false);
  const [photoType, setPhotoType] = useState('Front');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const canAssignAssets = permissions.includes('assign_assets');
  const canManageAssets = permissions.includes('manage_assets');
  const canManagePhotos = permissions.includes('manage_photos');
  const canDeleteAssets = permissions.includes('delete_assets');

  const handlePhotoUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setUploading(true);
      await onUploadPhoto(file, photoType);
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">{asset.asset_tag}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-blue-50 text-blue-700 border-blue-200">
                  {asset.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">({asset.device_type})</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {asset.manufacturer} {asset.model} • Hostname: {asset.hostname || 'None'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Print Asset Specification Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Assign or Return button */}
            {canAssignAssets && asset.status !== 'Disposed' && (
              asset.employee_id ? (
                <button
                  onClick={onOpenReturn}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return Asset</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAssign}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign to Employee</span>
                </button>
              )
            )}

            {/* Change Status */}
            {canManageAssets && (
              <button
                onClick={onOpenStatusChange}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Change Status</span>
              </button>
            )}

            {/* Edit Asset */}
            {canManageAssets && (
              <button
                onClick={onOpenEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Specs</span>
              </button>
            )}
          </div>

          {canDeleteAssets && (
            <button
              onClick={onOpenDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Retire / Delete</span>
            </button>
          )}
        </div>

        {/* Section Tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-6 text-xs font-medium shrink-0 bg-slate-50/50">
          {[
            { id: 'overview', label: 'Overview & Custody' },
            { id: 'specs', label: 'Hardware & OS Specs' },
            { id: 'procurement', label: 'Procurement & Warranty' },
            { id: 'photos', label: `Photographs (${asset.photos?.length || 0})` },
            { id: 'audit', label: `Audit Trail (${history.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Custody Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/75 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Hardware Custody / Assignee</span>
                  {asset.employee_id ? (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                      Active Custody
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700 font-mono text-[10px]">
                      In Depot / Available
                    </span>
                  )}
                </div>

                {asset.employee_id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <div className="text-[11px] text-slate-500">Employee Name</div>
                      <div className="font-semibold text-slate-900 text-sm mt-0.5">{asset.employee_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{asset.employee_code}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Department</div>
                      <div className="font-medium text-slate-800 mt-0.5">{asset.employee_department || employee?.department}</div>
                      <div className="text-[11px] text-slate-500">{employee?.designation}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Assignment Date</div>
                      <div className="font-medium text-slate-800 font-mono mt-0.5">{asset.assignment_date || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{employee?.location}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    This asset is currently not assigned to any employee. It is securely located in inventory stock.
                  </p>
                )}
              </div>

              {/* Physical Location */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Location & Placement</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Campus / Location</span>
                    <span className="font-medium text-slate-800">{asset.location || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Rack / Bay</span>
                    <span className="font-medium text-slate-800">{asset.rack || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Room / Floor</span>
                    <span className="font-medium text-slate-800">{asset.room || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Cost Centre</span>
                    <span className="font-mono font-medium text-slate-800">{asset.cost_centre || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Network Identification */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Network & Identity</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">IP Address</span>
                    <span className="font-mono font-medium text-slate-800">{asset.ip_address || 'Unassigned (DHCP)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">MAC Address</span>
                    <span className="font-mono font-medium text-slate-800">{asset.mac_address || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Serial Number</span>
                    <span className="font-mono font-medium text-slate-800">{asset.serial_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                    <span className="font-medium text-slate-800">{asset.category}</span>
                  </div>
                </div>
              </div>

              {/* Operational Notes */}
              {asset.notes && (
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">Operational Notes</h3>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-700 whitespace-pre-line leading-relaxed">
                    {asset.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-2">Processor & Memory</h4>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">CPU Model</span>
                    <span className="font-medium text-slate-800">{asset.cpu || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">System RAM</span>
                    <span className="font-medium text-slate-800">{asset.ram || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Storage Capacity</span>
                    <span className="font-medium text-slate-800">{asset.storage || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Graphics / GPU</span>
                    <span className="font-medium text-slate-800">{asset.gpu || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b pb-2">Operating System & Firmware</h4>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Operating System</span>
                    <span className="font-medium text-slate-800">{asset.operating_system || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">OS Build / Version</span>
                    <span className="font-mono text-slate-800">{asset.os_version || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">BIOS / UEFI Firmware</span>
                    <span className="font-mono text-slate-800">{asset.bios_version || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Display / Monitor Specs</span>
                    <span className="font-medium text-slate-800">{asset.monitor_details || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {asset.configuration_notes && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-slate-900 uppercase text-[11px] block mb-1">Configuration & Security Posture</span>
                  <p className="text-slate-700 leading-relaxed font-mono">{asset.configuration_notes}</p>
                </div>
              )}

              {asset.other_specifications && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-slate-900 uppercase text-[11px] block mb-1">Additional Specifications</span>
                  <p className="text-slate-700 leading-relaxed">{asset.other_specifications}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Vendor / Supplier</span>
                  <span className="font-medium text-slate-800">{asset.vendor || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Invoice Number</span>
                  <span className="font-mono font-medium text-slate-800">{asset.invoice_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Purchase Cost</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    ${asset.purchase_cost?.toLocaleString() || '0.00'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Purchase Date</span>
                  <span className="font-mono text-slate-800">{asset.purchase_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Manufacturing Date</span>
                  <span className="font-mono text-slate-800">{asset.manufacturing_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Expected Replacement</span>
                  <span className="font-mono text-slate-800">{asset.expected_replacement_date || 'N/A'}</span>
                </div>
              </div>

              {/* Warranty Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900 uppercase text-[11px]">OEM Warranty Coverage</span>
                  </div>
                  <span className="font-mono text-slate-600">
                    {asset.warranty_start || 'N/A'} → {asset.warranty_expiry || 'N/A'}
                  </span>
                </div>
              </div>

              {/* AMC Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 uppercase text-[11px]">Annual Maintenance Contract (AMC)</span>
                  </div>
                  <span className="font-mono text-slate-600">
                    {asset.amc_start || 'N/A'} → {asset.amc_expiry || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-5">
              {/* Photo Upload Form */}
              {canManagePhotos && (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Upload Asset Photograph</span>
                    <span className="text-slate-500 text-[11px]">
                      Supported: JPEG, PNG, WebP (Max 5MB). File is securely stored in object storage.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={photoType}
                      onChange={e => setPhotoType(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                    >
                      <option value="Front">Front</option>
                      <option value="Back">Back</option>
                      <option value="Serial Number">Serial Number</option>
                      <option value="Damage/Condition">Damage/Condition</option>
                      <option value="Installation">Installation</option>
                      <option value="Other">Other</option>
                    </select>

                    <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhotoUploadChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Photos Grid */}
              {asset.photos && asset.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {asset.photos.map(p => (
                    <div key={p.id} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-xs">
                      <img
                        src={p.url}
                        alt={p.original_filename}
                        className="w-full h-44 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                        onClick={() => setSelectedImage(p.url)}
                      />
                      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.photo_type}
                          </span>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px] mt-1 font-mono">
                            {p.original_filename}
                          </div>
                        </div>

                        {canManagePhotos && (
                          <button
                            onClick={() => onDeletePhoto(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Photograph"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 border border-slate-200 rounded-xl bg-slate-50/50">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-xs text-slate-500">No photographs uploaded for this asset yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Upload photos of front, back, serial label or damage inspection.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Audit History Log</span>
                <span className="text-[11px] text-slate-500 font-mono">Immutable audit records</span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No specific audit trail records found for this asset.
                  </div>
                ) : (
                  history.map(log => (
                    <div key={log.id} className="p-3 hover:bg-slate-50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {log.action}
                          </span>
                          {log.field_name && (
                            <span className="font-mono text-slate-600 text-[11px]">
                              field: <span className="font-semibold text-slate-900">{log.field_name}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-slate-700 mt-1 font-mono text-[11px]">
                          {log.old_value && (
                            <span className="line-through text-rose-500 mr-2">{log.old_value}</span>
                          )}
                          <span className="text-emerald-700 font-medium">{log.new_value}</span>
                        </div>
                      </div>

                      <div className="text-right text-[10px] text-slate-400 shrink-0 font-mono">
                        <div>by <span className="font-semibold text-slate-700">@{log.username}</span> ({log.ip_address})</div>
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img src={selectedImage} alt="Asset Fullscreen" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
