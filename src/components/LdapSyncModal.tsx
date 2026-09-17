import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Settings2,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Users,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import type { LdapConfig, LdapSyncResult } from '../types/itam';

interface LdapSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const LdapSyncModal: React.FC<LdapSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'config' | 'mapping'>('sync');
  const [config, setConfig] = useState<LdapConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [syncResult, setSyncResult] = useState<LdapSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for config
  const [serverUrl, setServerUrl] = useState('ldap://ad.corp.internal:389');
  const [bindDn, setBindDn] = useState('cn=svc_itam_sync,ou=ServiceAccounts,dc=corp,dc=internal');
  const [bindPassword, setBindPassword] = useState('');
  const [baseDn, setBaseDn] = useState('ou=Users,ou=Enterprise,dc=corp,dc=internal');
  const [searchFilter, setSearchFilter] = useState('(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))');
  const [syncSchedule, setSyncSchedule] = useState('daily');
  const [attrMapping, setAttrMapping] = useState({
    employee_code: 'employeeID',
    full_name: 'displayName',
    username: 'sAMAccountName',
    email: 'mail',
    department: 'department',
    designation: 'title',
    phone: 'telephoneNumber',
    location: 'physicalDeliveryOfficeName'
  });

  // Fetch LDAP config when opened
  useEffect(() => {
    if (!isOpen) return;
    setLoadingConfig(true);
    setError(null);
    setSuccess(null);
    setTestResult(null);

    api.employees.getLdapConfig()
      .then(res => {
        setConfig(res.config);
        setServerUrl(res.config.server_url || 'ldap://ad.corp.internal:389');
        setBindDn(res.config.bind_dn || '');
        setBaseDn(res.config.base_dn || 'ou=Users,ou=Enterprise,dc=corp,dc=internal');
        setSearchFilter(res.config.user_search_filter || '(&(objectCategory=person)(objectClass=user))');
        setSyncSchedule(res.config.sync_schedule || 'daily');
        if (res.config.attribute_mapping) {
          setAttrMapping(res.config.attribute_mapping);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to load LDAP configuration.');
      })
      .finally(() => setLoadingConfig(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setError(null);
    setSuccess(null);
    setTestResult(null);

    try {
      const res = await api.employees.testLdap({
        server_url: serverUrl,
        bind_dn: bindDn,
        base_dn: baseDn,
        user_search_filter: searchFilter
      });
      setTestResult(res.diagnostics);
      setSuccess('LDAP Connection & Bind verified successfully.');
    } catch (err: any) {
      setError(err.message || 'LDAP connection test failed.');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.employees.saveLdapConfig({
        enabled: true,
        server_url: serverUrl,
        bind_dn: bindDn,
        bind_password: bindPassword || undefined,
        base_dn: baseDn,
        user_search_filter: searchFilter,
        sync_schedule: syncSchedule,
        attribute_mapping: attrMapping
      });
      setConfig(res.config);
      setSuccess('LDAP directory configuration saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save LDAP settings.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleRunSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);
    setSyncResult(null);

    try {
      const res = await api.employees.syncLdap();
      setSyncResult(res);
      setSuccess(`LDAP Sync completed: ${res.created_count} created, ${res.updated_count} updated.`);
      onSyncComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to run LDAP employee synchronization.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">LDAP / Active Directory Synchronization</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Service Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">Automate corporate user onboarding, custody mapping & attribute sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Synchronize Now</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Connection & Server</span>
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'mapping'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Attribute Mapping</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: RUN SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              {/* Status Overview Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block mb-0.5">Target Directory</span>
                    <span className="font-mono font-bold text-slate-900 truncate block" title={serverUrl}>
                      {serverUrl}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block mb-0.5">Last Sync Status</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-emerald-700 uppercase text-[11px]">
                        {config?.last_sync_status || 'Success'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block mb-0.5">Last Executed</span>
                    <span className="text-slate-700">
                      {config?.last_sync_at ? new Date(config.last_sync_at).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sync Action Area */}
              <div className="p-5 border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Synchronize Enterprise Directory</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Queries the Active Directory base DN, maps fields, registers new employees, and updates existing records.
                  </p>
                </div>
                <button
                  onClick={handleRunSync}
                  disabled={syncing}
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Synchronizing...' : 'Sync Employees from LDAP Now'}</span>
                </button>
              </div>

              {/* Sync Results Display */}
              {syncResult && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sync Execution Breakdown</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-lg font-bold text-slate-900">{syncResult.total_processed}</span>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Total Processed</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-lg font-bold text-emerald-700">{syncResult.created_count}</span>
                      <p className="text-[10px] text-emerald-600 font-semibold uppercase mt-0.5">Created</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-lg font-bold text-blue-700">{syncResult.updated_count}</span>
                      <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">Updated</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-lg font-bold text-slate-700">{syncResult.unchanged_count}</span>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Up to Date</p>
                    </div>
                  </div>

                  {/* Details table */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Full Name</th>
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3">Action Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {syncResult.details.slice(0, 10).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-mono font-medium text-slate-900">{item.employee_code}</td>
                            <td className="py-2 px-3 text-slate-800">{item.full_name}</td>
                            <td className="py-2 px-3 text-slate-600">{item.department}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  item.action === 'created'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.action === 'updated'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.action.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONNECTION & CONFIG */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    LDAP / Active Directory Server URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={e => setServerUrl(e.target.value)}
                    placeholder="ldap://ad.corp.internal:389 or ldaps://..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Standard LDAP port: 389, Secure LDAPS port: 636.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Bind DN (Service Account)
                  </label>
                  <input
                    type="text"
                    value={bindDn}
                    onChange={e => setBindDn(e.target.value)}
                    placeholder="cn=svc_itam,ou=service_accounts,dc=corp,dc=internal"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Bind Password
                  </label>
                  <input
                    type="password"
                    value={bindPassword}
                    onChange={e => setBindPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Base DN (Search Root) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={baseDn}
                    onChange={e => setBaseDn(e.target.value)}
                    placeholder="ou=Users,ou=Enterprise,dc=corp,dc=internal"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    User Search Filter (LDAP Filter Syntax)
                  </label>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="(&(objectCategory=person)(objectClass=user))"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Synchronization Schedule
                  </label>
                  <select
                    value={syncSchedule}
                    onChange={e => setSyncSchedule(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="manual">Manual Trigger Only</option>
                    <option value="hourly">Hourly Automated Sweep</option>
                    <option value="daily">Daily at 02:00 UTC</option>
                    <option value="weekly">Weekly Maintenance Cycle</option>
                  </select>
                </div>
              </div>

              {/* Test Connection Results Card */}
              {testResult && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Bind Test Verification Successful
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700">{testResult.latency_ms} ms</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 grid grid-cols-2 gap-2">
                    <div><strong>Authentication:</strong> {testResult.bind_status}</div>
                    <div><strong>Matched Records:</strong> {testResult.entries_matched} accounts</div>
                    <div><strong>Protocol:</strong> {testResult.protocol_version}</div>
                    <div><strong>TLS Active:</strong> {testResult.tls_enabled ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{testing ? 'Verifying...' : 'Test Connection & Bind'}</span>
                </button>

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>{savingConfig ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ATTRIBUTE MAPPING */}
          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Configure how Active Directory / LDAP user object attributes map to ITAM Employee profile fields.
              </p>

              <div className="space-y-2.5">
                {[
                  { field: 'employee_code', label: 'Employee ID / Code', def: 'employeeID' },
                  { field: 'full_name', label: 'Full Name', def: 'displayName' },
                  { field: 'username', label: 'System Username', def: 'sAMAccountName' },
                  { field: 'email', label: 'Corporate Email', def: 'mail' },
                  { field: 'department', label: 'Department Name', def: 'department' },
                  { field: 'designation', label: 'Job Title / Role', def: 'title' },
                  { field: 'phone', label: 'Phone Number', def: 'telephoneNumber' },
                  { field: 'location', label: 'Office Location', def: 'physicalDeliveryOfficeName' }
                ].map(({ field, label, def }) => (
                  <div key={field} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-slate-800">{label}</span>
                    <input
                      type="text"
                      value={(attrMapping as any)[field] || def}
                      onChange={e => setAttrMapping({ ...attrMapping, [field]: e.target.value })}
                      className="px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white font-mono focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {savingConfig ? 'Saving...' : 'Save Attribute Mappings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
