const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getToken(): string | null {
  return localStorage.getItem('nusantara_token');
}

function setToken(token: string) {
  localStorage.setItem('nusantara_token', token);
}

function removeToken() {
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

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    window.location.reload();
    throw new Error('Sesi telah berakhir, silakan login kembali');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan');
  }

  return data;
}

// Auth
export async function login(username: string, password: string) {
  const data = await request<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' });
  removeToken();
}

export async function getMe() {
  return request<{ user: any }>('/auth/me');
}

// Users
export async function getUsers() {
  return request<any[]>('/users');
}

export async function createUser(user: any) {
  return request<any>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function updateUser(id: string, user: any) {
  return request<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

// Products
export async function getProducts() {
  return request<any[]>('/products');
}

export async function createProduct(product: any) {
  return request<any>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id: string, product: any) {
  return request<any>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id: string) {
  return request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });
}

// Transactions
export async function getTransactions() {
  return request<any[]>('/transactions');
}

export async function createTransaction(transaction: any) {
  return request<any>('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
}

export async function updateTransactionStatus(id: string, status: string, retur_alasan?: string) {
  return request<any>(`/transactions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, retur_alasan }),
  });
}

// Stock Movements
export async function getStockMovements() {
  return request<any[]>('/stock-movements');
}

export async function createStockMovement(movement: any) {
  return request<any>('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(movement),
  });
}

// Attendance
export async function getAttendance() {
  return request<any[]>('/attendance');
}

export async function createAttendance(attendance: any) {
  return request<any>('/attendance', {
    method: 'POST',
    body: JSON.stringify(attendance),
  });
}

export async function updateAttendance(id: string, attendance: any) {
  return request<any>(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(attendance),
  });
}

// Daily Logs
export async function getDailyLogs() {
  return request<any[]>('/daily-logs');
}

export async function createDailyLog(log: any) {
  return request<any>('/daily-logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });
}

export async function deleteDailyLog(id: string) {
  return request<{ message: string }>(`/daily-logs/${id}`, {
    method: 'DELETE',
  });
}

// Store Profile
export async function getStoreProfile() {
  return request<any>('/store-profile');
}

export async function updateStoreProfile(profile: any) {
  return request<any>('/store-profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

// Upload
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal upload file');
  }

  return data.url;
}
