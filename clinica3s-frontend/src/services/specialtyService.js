import api from '../api/api';

/**
 * Obtener todas las especialidades
 * @returns {Promise<Array>} Lista de Specialty
 */
export const getSpecialties = async () => {
  const response = await api.get('/api/specialties');
  return response.data;
};

/**
 * Obtener una especialidad por ID
 * @param {number} id - ID de la especialidad
 * @returns {Promise<Object>} Specialty
 */
export const getSpecialtyById = async (id) => {
  const response = await api.get(`/api/specialties/${id}`);
  return response.data;
};

/**
 * Crear nueva especialidad
 * @param {Object} specialtyData - Datos de la especialidad
 * @param {string} specialtyData.name - Nombre de la especialidad
 * @returns {Promise<Object>} Specialty
 */
export const createSpecialty = async (specialtyData) => {
  const response = await api.post('/api/specialties', specialtyData);
  return response.data;
};

/**
 * Actualizar especialidad
 * @param {number} id - ID de la especialidad
 * @param {Object} specialtyData - Datos actualizados
 * @returns {Promise<Object>} Specialty
 */
export const updateSpecialty = async (id, specialtyData) => {
  const response = await api.put(`/api/specialties/${id}`, specialtyData);
  return response.data;
};

/**
 * Eliminar especialidad
 * @param {number} id - ID de la especialidad
 * @returns {Promise<void>}
 */
export const deleteSpecialty = async (id) => {
  await api.delete(`/api/specialties/${id}`);
};
