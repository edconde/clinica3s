import api from '../api/api';

/**
 * Obtener todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios (AppUser)
 */
export const getUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

/**
 * Crear nuevo usuario
 * Si el rol es DENTIST, también crea el registro de dentista asociado
 * @param {Object} userData - Datos del usuario (RegisterRequest)
 * @param {string} userData.username
 * @param {string} userData.password
 * @param {string} userData.role - ADMIN | DENTIST | RECEPTIONIST
 * @param {string} [userData.dentistName] - Requerido si role es DENTIST
 * @param {string} [userData.licenseNumber] - Requerido si role es DENTIST
 * @param {number} [userData.commissionRate] - Porcentaje de comisión (0.0 - 1.0)
 * @param {number[]} [userData.specialtyIds] - IDs de especialidades
 * @returns {Promise<Object>} Usuario creado (AppUser)
 */
export const createUser = async (userData) => {
  const response = await api.post('/api/users', userData);
  return response.data;
};

/**
 * Obtener usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Usuario (AppUser)
 */
export const getUserById = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

/**
 * Habilitar/deshabilitar usuario
 * @param {number} id - ID del usuario
 * @param {boolean} enabled - Estado de habilitación
 * @returns {Promise<Object>} Usuario actualizado
 */
export const setUserEnabled = async (id, enabled) => {
  const response = await api.patch(`/api/users/${id}/enabled`, null, {
    params: { enabled }
  });
  return response.data;
};

export default {
  getUsers,
  createUser,
  getUserById,
  setUserEnabled
};
