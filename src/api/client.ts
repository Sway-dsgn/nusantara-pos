const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export function getToken(): string | null {
  return localStorage.getItem('nusantara_token');
}

export function setToken(token: string) {
  localStorage.setItem('nusantara_token', token);
}

export function removeToken() {
  localStorage.removeItem('nusantara_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (res.status === 401) {
    removeToken();
    throw new Error('Sesi telah berakhir, silakan login kembali');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan');
  }

  return data;
}

export const authApi = {
  login: async (username: string, password: string) => {
    const data = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    return data;
  },
  logout: async () => {
    await request('/auth/logout', { method: 'POST' });
    removeToken();
  },
  me: async () => {
    return request<{ user: any }>('/auth/me');
  },
};

export const usersApi = {
  list: () => request<any[]>('/users'),
  create: (user: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(user) }),
  update: (id: string, user: any) => request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
};

export const productsApi = {
  list: () => request<any[]>('/products'),
  create: (product: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(product) }),
  update: (id: string, product: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  remove: (id: string) => request<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
};

export const transactionsApi = {
  list: () => request<any[]>('/transactions'),
  create: (tx: any) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(tx) }),
  updateStatus: (id: string, status: string, retur_alasan?: string) =>
    request<any>(`/transactions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, retur_alasan }) }),
};

export const stockMovementsApi = {
  list: () => request<any[]>('/stock-movements'),
  create: (movement: any) => request<any>('/stock-movements', { method: 'POST', body: JSON.stringify(movement) }),
};

export const attendanceApi = {
  list: () => request<any[]>('/attendance'),
  create: (abs: any) => request<any>('/attendance', { method: 'POST', body: JSON.stringify(abs) }),
  update: (id: string, abs: any) => request<any>(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(abs) }),
};

export const dailyLogsApi = {
  list: () => request<any[]>('/daily-logs'),
  create: (log: any) => request<any>('/daily-logs', { method: 'POST', body: JSON.stringify(log) }),
  remove: (id: string) => request<{ message: string }>(`/daily-logs/${id}`, { method: 'DELETE' }),
};

export const storeProfileApi = {
  get: () => request<any>('/store-profile'),
  update: (profile: any) => request<any>('/store-profile', { method: 'PUT', body: JSON.stringify(profile) }),
};

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal upload file');
  }

  return data.url;
}
