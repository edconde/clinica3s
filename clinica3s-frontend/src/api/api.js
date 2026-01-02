import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - Inyectar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - Manejar errores 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Token expirado o inválido - limpiar y redirigir
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Solo redirigir si no estamos ya en login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Sin permisos - puede manejarse en el componente
          console.error('Acceso denegado:', response.data);
          break;
        case 404:
          console.error('Recurso no encontrado:', response.data);
          break;
        case 500:
          console.error('Error del servidor:', response.data);
          break;
        default:
          console.error('Error de API:', response.data);
      }
    } else {
      // Error de red
      console.error('Error de conexión:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
