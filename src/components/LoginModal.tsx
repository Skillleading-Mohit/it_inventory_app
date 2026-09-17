import React, { useState } from 'react';
import { Server, Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../types/itam';

interface LoginModalProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onQuickDemoLogin: (role: UserRole) => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onQuickDemoLogin }) => {
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('SuperAdmin@2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      await onQuickDemoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Branding Banner */}
        <div className="p-6 bg-slate-900 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Server className="w-6 h-6 text-indigo-100" />
          </div>
          <h2 className="text-lg font-bold">ITAM Enterprise Login</h2>
          <p className="text-xs text-slate-400 mt-1">
            IT Asset Management & Hardware Lifecycle System
          </p>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Role Logins */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Instant Role Evaluation (Demo)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            {[
              { role: 'super_admin' as UserRole, label: 'Super Admin' },
              { role: 'admin' as UserRole, label: 'Admin' },
              { role: 'asset_manager' as UserRole, label: 'Asset Mgr' },
              { role: 'operator' as UserRole, label: 'Operator' },
              { role: 'viewer' as UserRole, label: 'Viewer' }
            ].map(r => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleQuickRole(r.role)}
                className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium rounded-md border border-slate-200 transition-colors shadow-2xs text-center truncate"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
