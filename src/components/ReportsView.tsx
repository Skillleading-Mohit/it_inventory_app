import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  AlertTriangle,
  Clock,
  Laptop,
  CheckCircle2,
  Boxes,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import type { Asset } from '../types/itam';

export const ReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [reportAssets, setReportAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const reportDefinitions = [
    {
      id: 'inventory',
      title: 'Complete Hardware Inventory',
      desc: 'Comprehensive export of all registered enterprise IT hardware assets across branches.',
      icon: Boxes,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      id: 'warranty_expiring_soon',
      title: 'Warranty Expiring Soon (≤ 30 Days)',
      desc: 'Hardware nearing manufacturer warranty expiration requiring OEM renewal decisions.',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      id: 'warranty_expired',
      title: 'Warranty Expired Assets',
      desc: 'Active production hardware operating beyond warranty expiration date.',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    },
    {
      id: 'amc_expiring_soon',
      title: 'AMC Expiring Soon (≤ 30 Days)',
      desc: 'Annual Maintenance Contracts nearing renewal cut-off for enterprise equipment.',
      icon: ShieldAlert,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'amc_expired',
      title: 'Expired AMC Hardware',
      desc: 'Hardware with lapsed annual maintenance agreements.',
      icon: AlertTriangle,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      id: 'assigned',
      title: 'Assigned Custody Assets',
      desc: 'All computers, peripherals, and network devices currently deployed to employees.',
      icon: Laptop,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'unassigned',
      title: 'In Stock / Available Spares',
      desc: 'Hardware sitting in inventory depot ready for immediate staff deployment.',
      icon: CheckCircle2,
      color: 'text-teal-600 bg-teal-50 border-teal-200'
    },
    {
      id: 'under_repair',
      title: 'Under Repair / Depot RMA',
      desc: 'Equipment experiencing hardware failures undergoing active repair service.',
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      id: 'disposed',
      title: 'Disposed & E-Waste Retired',
      desc: 'Decommissioned hardware officially recycled or disposed with certificate tracking.',
      icon: Boxes,
      color: 'text-slate-600 bg-slate-100 border-slate-200'
    }
  ];

  const fetchReportPreview = async (reportId: string) => {
    try {
      setLoading(true);
      let query: any = { limit: 100 };
      if (reportId === 'assigned') query.assigned = 'assigned';
      if (reportId === 'unassigned') query.assigned = 'unassigned';
      if (reportId === 'under_repair') query.status = 'Under Repair';
      if (reportId === 'disposed') query.status = 'Disposed';

      const data = await api.assets.list(query);
      let list = data.assets;

      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(now.getDate() + 30);

      if (reportId === 'warranty_expiring_soon') {
        list = list.filter(a => {
          if (!a.warranty_expiry) return false;
          const exp = new Date(a.warranty_expiry);
          return exp >= now && exp <= in30Days;
        });
      } else if (reportId === 'warranty_expired') {
        list = list.filter(a => {
          if (!a.warranty_expiry) return false;
          return new Date(a.warranty_expiry) < now;
        });
      } else if (reportId === 'amc_expiring_soon') {
        list = list.filter(a => {
          if (!a.amc_expiry) return false;
          const exp = new Date(a.amc_expiry);
          return exp >= now && exp <= in30Days;
        });
      } else if (reportId === 'amc_expired') {
        list = list.filter(a => {
          if (!a.amc_expiry) return false;
          return new Date(a.amc_expiry) < now;
        });
      }

      setReportAssets(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportPreview(selectedReport);
  }, [selectedReport]);

  const activeDef = reportDefinitions.find(r => r.id === selectedReport) || reportDefinitions[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ITAM Enterprise Reports & Data Export</h1>
          <p className="text-xs text-slate-500 mt-1">
            Export compliant audit inventories, warranty expiry forecasts, and custody records in CSV or Excel format.
          </p>
        </div>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reportDefinitions.map(rep => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`p-1.5 rounded-lg border ${rep.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-xs">{rep.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{rep.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Report Workspace & Export Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{activeDef.title}</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {reportAssets.length} matching assets
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{activeDef.desc}</p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={api.reports.getExportUrl(selectedReport, 'csv')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </a>

            <a
              href={api.reports.getExportUrl(selectedReport, 'excel')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </a>

            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Preview Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Asset Tag</th>
                  <th className="py-2.5 px-3">Hostname</th>
                  <th className="py-2.5 px-3">Device / Category</th>
                  <th className="py-2.5 px-3">Manufacturer & Model</th>
                  <th className="py-2.5 px-3">Serial No</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assigned To</th>
                  <th className="py-2.5 px-3">Warranty Expiry</th>
                  <th className="py-2.5 px-3">AMC Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Loading report preview data...
                    </td>
                  </tr>
                ) : reportAssets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No assets found for the selected report filters.
                    </td>
                  </tr>
                ) : (
                  reportAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{asset.asset_tag}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{asset.hostname || '—'}</td>
                      <td className="py-2.5 px-3">{asset.device_type} ({asset.category})</td>
                      <td className="py-2.5 px-3">{asset.manufacturer} {asset.model}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{asset.serial_number || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {asset.employee_name ? (
                          <span className="font-medium text-slate-900">{asset.employee_name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{asset.warranty_expiry || '—'}</td>
                      <td className="py-2.5 px-3 font-mono">{asset.amc_expiry || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
