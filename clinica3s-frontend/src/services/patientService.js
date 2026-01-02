import api from '../api/api';

/**
 * Obtener pacientes con paginación y filtros
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} [params.page=0] - Número de página (0-indexed)
 * @param {number} [params.size=10] - Tamaño de página
 * @param {string} [params.sort] - Campo de ordenamiento (ej: "name,asc")
 * @param {string} [params.name] - Filtrar por nombre (búsqueda parcial)
 * @param {string} [params.phone] - Filtrar por teléfono (búsqueda parcial)
 * @param {string} [params.email] - Filtrar por email (búsqueda parcial)
 * @returns {Promise<Object>} PagePatient { content, totalElements, totalPages, ... }
 */
export const getPatients = async ({ page = 0, size = 10, sort, name, phone, email } = {}) => {
  const params = { page, size };
  if (sort) params.sort = sort;
  if (name) params.name = name;
  if (phone) params.phone = phone;
  if (email) params.email = email;
  
  const response = await api.get('/api/patients', { params });
  return response.data;
};

/**
 * Buscar pacientes por nombre (para autocomplete)
 * @param {string} query - Texto de búsqueda
 * @returns {Promise<Array>} Lista de pacientes que coinciden
 */
export const searchPatients = async (query) => {
  const response = await api.get('/api/patients', { 
    params: { page: 0, size: 20, sort: 'name,asc' } 
  });
  // Filtrar en cliente por ahora (si el backend no tiene endpoint de búsqueda)
  const patients = response.data.content || response.data;
  if (!query) return patients;
  const lowerQuery = query.toLowerCase();
  return patients.filter(p => p.name.toLowerCase().includes(lowerQuery));
};

/**
 * Obtener un paciente por ID
 * @param {number} id - ID del paciente
 * @returns {Promise<Object>} Patient
 */
export const getPatientById = async (id) => {
  const response = await api.get(`/api/patients/${id}`);
  return response.data;
};

/**
 * Crear nuevo paciente
 * @param {Object} patientData - Datos del paciente
 * @param {string} patientData.name - Nombre completo
 * @param {string} patientData.birthDate - Fecha de nacimiento (YYYY-MM-DD)
 * @param {string} patientData.gender - M | F | O
 * @param {string} patientData.email - Email
 * @returns {Promise<Object>} Patient
 */
export const createPatient = async (patientData) => {
  const response = await api.post('/api/patients', patientData);
  return response.data;
};

/**
 * Actualizar paciente
 * @param {number} id - ID del paciente
 * @param {Object} patientData - Datos actualizados
 * @returns {Promise<Object>} Patient
 */
export const updatePatient = async (id, patientData) => {
  const response = await api.put(`/api/patients/${id}`, patientData);
  return response.data;
};

/**
 * Eliminar paciente
 * @param {number} id - ID del paciente
 * @returns {Promise<void>}
 */
export const deletePatient = async (id) => {
  await api.delete(`/api/patients/${id}`);
};
