import type {
  User,
  Employee,
  Asset,
  AssetPhoto,
  AuditLog,
  DashboardMetrics,
  UserRole
} from '../types/itam';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.message) errorMsg = data.message;
      else if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Authentication
  auth: {
    async getMe(): Promise<{ user: User; permissions: string[] }> {
      const res = await fetch(`${API_BASE}/auth/me`);
      return handleResponse(res);
    },

    async login(username: string, password: string): Promise<{ user: User; permissions: string[]; token: string }> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return handleResponse(res);
    },

    async logout(): Promise<void> {
      const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
      await handleResponse(res);
    },

    async switchRole(role: UserRole): Promise<{ user: User; permissions: string[]; token: string }> {
      const res = await fetch(`${API_BASE}/auth/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      return handleResponse(res);
    },

    async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password, new_password })
      });
      return handleResponse(res);
    }
  },

  // Assets
  assets: {
    async list(params: {
      q?: string;
      status?: string;
      device_type?: string;
      category?: string;
      location?: string;
      department?: string;
      assigned?: string;
      page?: number;
      limit?: number;
    } = {}): Promise<{
      assets: Asset[];
      total: number;
      page: number;
      total_pages: number;
      limit: number;
      facets: {
        locations: string[];
        departments: string[];
        device_types: string[];
        statuses: string[];
      };
    }> {
      const url = new URL(`${window.location.origin}${API_BASE}/assets`);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
      });
      const res = await fetch(url.toString());
      return handleResponse(res);
    },

    async get(id: string): Promise<{ asset: Asset; employee: Employee | null; history: AuditLog[] }> {
      const res = await fetch(`${API_BASE}/assets/${id}`);
      return handleResponse(res);
    },

    async create(data: Partial<Asset>): Promise<{ message: string; asset: Asset }> {
      const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async update(id: string, data: Partial<Asset>): Promise<{ message: string; asset: Asset }> {
      const res = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async assign(id: string, employee_id: string, assignment_date?: string, notes?: string): Promise<{ message: string; asset: Asset }> {
      const res = await fetch(`${API_BASE}/assets/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id, assignment_date, notes })
      });
      return handleResponse(res);
    },

    async returnAsset(id: string, return_date?: string, resulting_status?: string, notes?: string): Promise<{ message: string; asset: Asset }> {
      const res = await fetch(`${API_BASE}/assets/${id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_date, resulting_status, notes })
      });
      return handleResponse(res);
    },

    async changeStatus(id: string, status: string, notes?: string, disposal_date?: string): Promise<{ message: string; asset: Asset }> {
      const res = await fetch(`${API_BASE}/assets/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, disposal_date })
      });
      return handleResponse(res);
    },

    async delete(id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' });
      return handleResponse(res);
    },

    async uploadPhoto(id: string, file: File, photo_type: string): Promise<{ message: string; photo: AssetPhoto }> {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('photo_type', photo_type);

      const res = await fetch(`${API_BASE}/assets/${id}/photos`, {
        method: 'POST',
        body: formData
      });
      return handleResponse(res);
    },

    async deletePhoto(id: string, photoId: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/assets/${id}/photos/${photoId}`, { method: 'DELETE' });
      return handleResponse(res);
    }
  },

  // Employees
  employees: {
    async list(params: { q?: string; department?: string; is_active?: string; page?: number; limit?: number } = {}): Promise<{
      employees: Employee[];
      total: number;
      page: number;
      total_pages: number;
      departments: string[];
    }> {
      const url = new URL(`${window.location.origin}${API_BASE}/employees`);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
      });
      const res = await fetch(url.toString());
      return handleResponse(res);
    },

    async get(id: string): Promise<{ employee: Employee; assigned_assets: Asset[]; history: AuditLog[] }> {
      const res = await fetch(`${API_BASE}/employees/${id}`);
      return handleResponse(res);
    },

    async create(data: Partial<Employee>): Promise<{ message: string; employee: Employee }> {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async update(id: string, data: Partial<Employee>): Promise<{ message: string; employee: Employee }> {
      const res = await fetch(`${API_BASE}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async toggleStatus(id: string): Promise<{ message: string; employee: Employee; warning?: string }> {
      const res = await fetch(`${API_BASE}/employees/${id}/toggle-status`, { method: 'POST' });
      return handleResponse(res);
    }
  },

  // History & Audit
  audit: {
    async list(params: {
      q?: string;
      entity_type?: string;
      action?: string;
      username?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    } = {}): Promise<{
      logs: AuditLog[];
      total: number;
      page: number;
      total_pages: number;
      facets: {
        entity_types: string[];
        actions: string[];
        users: string[];
      };
    }> {
      const url = new URL(`${window.location.origin}${API_BASE}/history`);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
      });
      const res = await fetch(url.toString());
      return handleResponse(res);
    }
  },

  // Reports
  reports: {
    async getMetrics(): Promise<DashboardMetrics> {
      const res = await fetch(`${API_BASE}/reports/metrics`);
      return handleResponse(res);
    },

    getExportUrl(report_type: string, format: 'csv' | 'excel'): string {
      return `${API_BASE}/reports/export?report_type=${encodeURIComponent(report_type)}&format=${encodeURIComponent(format)}`;
    }
  },

  // Administration
  admin: {
    async listUsers(): Promise<{ users: User[] }> {
      const res = await fetch(`${API_BASE}/admin/users`);
      return handleResponse(res);
    },

    async createUser(data: any): Promise<{ message: string; user: User }> {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async updateUser(id: string, data: any): Promise<{ message: string; user: User }> {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async toggleUserStatus(id: string): Promise<{ message: string; user: User }> {
      const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-status`, { method: 'POST' });
      return handleResponse(res);
    },

    async resetPassword(id: string, new_password: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/admin/users/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password })
      });
      return handleResponse(res);
    }
  }
};
