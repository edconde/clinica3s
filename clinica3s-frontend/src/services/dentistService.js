import api from '../api/api';

/**
 * Obtener dentistas con paginación y filtros
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} [params.page=0] - Número de página (0-indexed)
 * @param {number} [params.size=100] - Tamaño de página (100 por defecto para cargar todos)
 * @param {string} [params.sort] - Campo de ordenamiento
 * @param {string} [params.name] - Filtrar por nombre (búsqueda parcial)
 * @param {number} [params.specialtyId] - Filtrar por ID de especialidad
 * @returns {Promise<Object>} PageDentist { content, totalElements, totalPages, ... }
 */
export const getDentists = async ({ page = 0, size = 100, sort, name, specialtyId } = {}) => {
  const params = { page, size };
  if (sort) params.sort = sort;
  if (name) params.name = name;
  if (specialtyId) params.specialtyId = specialtyId;
  
  const response = await api.get('/api/dentists', { params });
  return response.data;
};

/**
 * Obtener un dentista por ID
 * @param {number} id - ID del dentista
 * @returns {Promise<Object>} Dentist
 */
export const getDentistById = async (id) => {
  const response = await api.get(`/api/dentists/${id}`);
  return response.data;
};
