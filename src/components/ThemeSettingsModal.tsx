import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Building
} from 'lucide-react';
import type { SystemSettings } from '../types/itam';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: SystemSettings | null;
  onSaveSettings: (updated: Partial<SystemSettings>) => Promise<void>;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings
}) => {
  const [theme, setTheme] = useState<'default' | 'black_and_white'>('default');
  const [appName, setAppName] = useState('ITAM Enterprise');
  const [companyName, setCompanyName] = useState('Enterprise IT Global');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentSettings) {
      setTheme(currentSettings.theme || 'default');
      setAppName(currentSettings.app_name || 'ITAM Enterprise');
      setCompanyName(currentSettings.company_name || 'Enterprise IT Global');
      setLogoUrl(currentSettings.custom_logo_url || '');
      setLogoBase64(currentSettings.custom_logo_base64 || null);
      setLogoPreview(currentSettings.custom_logo_base64 || currentSettings.custom_logo_url || null);
    }
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, WebP, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size exceeds 2MB limit.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoBase64(base64);
      setLogoPreview(base64);
      setLogoUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setLogoBase64(null);
    setLogoUrl('');
    setLogoPreview(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await onSaveSettings({
        theme,
        app_name: appName.trim() || 'ITAM Enterprise',
        company_name: companyName.trim() || 'Enterprise IT Global',
        custom_logo_url: logoUrl.trim() || null,
        custom_logo_base64: logoBase64
      });
      setSuccess('Branding and theme applied successfully.');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to save system settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Theme & Brand Customization</h3>
              <p className="text-xs text-slate-500">Super Administrator controls for tool logo and theme palette</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* 1. Theme Selection (Black and White vs Default) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tool Theme Palette
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Default Theme */}
              <div
                onClick={() => setTheme('default')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  theme === 'default'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Slate & Indigo (Default)</span>
                  {theme === 'default' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Classic enterprise palette with indigo primary accents, slate neutrals, and color-coded status badges.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 border border-indigo-700 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-950 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-rose-500 inline-block"></span>
                </div>
              </div>

              {/* Black and White Theme */}
              <div
                onClick={() => setTheme('black_and_white')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  theme === 'black_and_white'
                    ? 'border-black bg-zinc-100 ring-2 ring-black'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-950">Black & White (Monochrome)</span>
                  {theme === 'black_and_white' && <CheckCircle2 className="w-4 h-4 text-black" />}
                </div>
                <p className="text-[11px] text-slate-600 mb-2.5">
                  High-contrast minimalist monochrome design. Solid black controls, crisp borders, and dark gray accents.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-black border border-zinc-800 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-zinc-700 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-zinc-400 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-zinc-200 border border-zinc-300 inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-white border border-black inline-block"></span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Custom Logo Configuration */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tool Logo
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              {/* Current Preview */}
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-xs overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Building className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 w-full">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Default</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Supports PNG, SVG, WebP, or JPEG (Max 2MB). Ideal resolution: 120x120px to 400x120px.</p>
              </div>
            </div>

            {/* Optional URL input */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-600">Or provide public image URL:</span>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={e => {
                  setLogoUrl(e.target.value);
                  if (e.target.value) {
                    setLogoPreview(e.target.value);
                    setLogoBase64(null);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-900 bg-white"
              />
            </div>
          </div>

          {/* 3. Organization & Application Name */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              System Titles
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Application Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  placeholder="e.g. ITAM Enterprise"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Organization / Department</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Enterprise Global IT"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Applying...' : 'Apply Theme & Logo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
