import api from '../api/api';

/**
 * Iniciar sesión
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise} AuthResponse { token, role, username, userId, dentistId? }
 */
export const login = async (username, password) => {
  const response = await api.post('/api/auth/login', { username, password });
  return response.data;
};

/**
 * Registrar nuevo usuario (solo ADMIN)
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.username
 * @param {string} userData.password
 * @param {string} userData.role - ADMIN | DENTIST | RECEPTIONIST
 * @param {string} [userData.dentistName] - Requerido si role es DENTIST
 * @param {string} [userData.licenseNumber] - Requerido si role es DENTIST
 * @param {number} [userData.commissionRate] - Porcentaje de comisión (0.0 - 1.0)
 * @param {number[]} [userData.specialtyIds] - IDs de especialidades
 * @returns {Promise} AuthResponse
 */
export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

/**
 * Cerrar sesión - Limpia datos locales
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Obtener token guardado
 * @returns {string|null}
 */
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

/**
 * Obtener usuario guardado
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Guardar datos de sesión
 * @param {string} token 
 * @param {Object} user 
 */
export const saveSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Verificar si hay sesión activa
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getStoredToken();
};

/**
 * Cambiar contraseña del usuario autenticado
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña (mínimo 6 caracteres)
 * @param {string} confirmPassword - Confirmación de la nueva contraseña
 * @returns {Promise<string>} Mensaje de éxito
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const response = await api.put('/api/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword
  });
  return response.data;
};
