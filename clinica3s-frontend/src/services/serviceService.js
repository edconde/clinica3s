import api from '../api/api';

/**
 * Obtener todos los servicios (con paginación grande para cargar todos)
 * @returns {Promise<Object>} PageService o array de Service
 */
export const getServices = async () => {
  const response = await api.get('/api/services', { 
    params: { page: 0, size: 1000 } 
  });
  return response.data;
};

/**
 * Obtener un servicio por ID
 * @param {number} id - ID del servicio
 * @returns {Promise<Object>} Service
 */
export const getServiceById = async (id) => {
  const response = await api.get(`/api/services/${id}`);
  return response.data;
};

/**
 * Crear nuevo servicio
 * @param {Object} serviceData - Datos del servicio
 * @param {string} serviceData.name - Nombre del servicio
 * @param {number} serviceData.standardCost - Costo estándar
 * @param {number} serviceData.listPrice - Precio de lista
 * @param {Object} serviceData.specialty - { id: number } Especialidad asociada
 * @returns {Promise<Object>} Service
 */
export const createService = async (serviceData) => {
  const response = await api.post('/api/services', serviceData);
  return response.data;
};

/**
 * Actualizar servicio
 * @param {number} id - ID del servicio
 * @param {Object} serviceData - Datos actualizados
 * @returns {Promise<Object>} Service
 */
export const updateService = async (id, serviceData) => {
  const response = await api.put(`/api/services/${id}`, serviceData);
  return response.data;
};

/**
 * Eliminar servicio
 * @param {number} id - ID del servicio
 * @returns {Promise<void>}
 */
export const deleteService = async (id) => {
  await api.delete(`/api/services/${id}`);
};
