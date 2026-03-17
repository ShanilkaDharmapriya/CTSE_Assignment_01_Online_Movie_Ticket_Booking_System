import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Configure interceptor for authorization.
// Hardcoded basic auth for assignment simplicity.
const encodedCredentials = btoa('admin:admin123');

api.interceptors.request.use((config) => {
  // Only add auth header to mutative requests. GET requests are public.
  if (config.method !== 'get') {
    config.headers.Authorization = `Basic ${encodedCredentials}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
