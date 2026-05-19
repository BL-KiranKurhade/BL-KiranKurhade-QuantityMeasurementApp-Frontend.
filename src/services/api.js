import axios from 'axios';

// All traffic goes through the API Gateway at port 8080
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Public paths that must NEVER receive a JWT header ─────────────────────────
const PUBLIC_PATHS = ['/api/auth/register', '/api/auth/login'];
const isPublicPath = (url) => PUBLIC_PATHS.some((p) => url?.includes(p));

// ── Attach JWT Bearer token to protected outgoing requests only ────────────────
api.interceptors.request.use((config) => {
  if (!isPublicPath(config.url)) {
    const token = localStorage.getItem('qma_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Handle expired / invalid tokens globally ──────────────────────────────────
// Skip the redirect for auth endpoints — they handle errors themselves.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !isPublicPath(err.config?.url)) {
      // Token is missing, expired, or invalid — clear local storage and redirect
      localStorage.removeItem('qma_token');
      localStorage.removeItem('qma_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth Service  (routed through Gateway → auth-service:8083) ────────────────
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (data) => api.post('/api/auth/login',    data),
  me:       ()     => api.get('/api/auth/me'),
};

// ── Conversion Service  (routed through Gateway → conversion-service:8082) ────
export const conversionApi = {
  convert:      (value, from, to, category) =>
    api.get('/api/convert', { params: { value, from, to, category } }),
  getHistory:   () => api.get('/api/convert/history'),
  getAllHistory: () => api.get('/api/convert/history/all'),
  clearHistory: () => api.delete('/api/convert/history'),
};

export default api;
