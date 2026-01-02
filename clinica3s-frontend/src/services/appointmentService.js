import api from '../api/api';

/**
 * Obtener citas con paginación y filtros opcionales
 * @param {Object} params - Parámetros de paginación y filtros
 * @param {number} [params.page=0] - Número de página (0-indexed)
 * @param {number} [params.size=10] - Tamaño de página
 * @param {string} [params.sort] - Campo de ordenamiento (ej: "dateTime,desc")
 * @param {number} [params.patientId] - ID del paciente (filtro opcional)
 * @param {number} [params.dentistId] - ID del dentista (filtro opcional)
 * @param {string} [params.status] - Estado: PENDING | COMPLETED | NO_SHOW (filtro opcional)
 * @param {string} [params.startDate] - Fecha inicio ISO (filtro opcional)
 * @param {string} [params.endDate] - Fecha fin ISO (filtro opcional)
 * @returns {Promise<Object>} PageAppointmentResponse { content, totalElements, totalPages, ... }
 */
export const getAppointments = async ({ 
  page = 0, 
  size = 10, 
  sort,
  patientId,
  dentistId,
  status,
  startDate,
  endDate
} = {}) => {
  const params = { page, size };
  
  if (sort) params.sort = sort;
  if (patientId) params.patientId = patientId;
  if (dentistId) params.dentistId = dentistId;
  if (status) params.status = status;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await api.get('/api/appointments', { params });
  return response.data;
};

/**
 * Obtener una cita por ID
 * @param {number} id - ID de la cita
 * @returns {Promise<Object>} AppointmentResponse
 */
export const getAppointmentById = async (id) => {
  const response = await api.get(`/api/appointments/${id}`);
  return response.data;
};

/**
 * Crear nueva cita
 * @param {Object} appointmentData - Datos de la cita
 * @param {string} appointmentData.dateTime - Fecha y hora ISO
 * @param {number} appointmentData.patientId - ID del paciente
 * @param {number} appointmentData.dentistId - ID del dentista
 * @param {Array} appointmentData.services - Array de { serviceId, quantity }
 * @returns {Promise<Object>} AppointmentResponse
 */
export const createAppointment = async (appointmentData) => {
  const response = await api.post('/api/appointments', appointmentData);
  return response.data;
};

/**
 * Actualizar estado de una cita
 * @param {number} id - ID de la cita
 * @param {string} status - PENDING | COMPLETED | NO_SHOW
 * @returns {Promise<Object>} AppointmentResponse
 */
export const updateAppointmentStatus = async (id, status) => {
  const response = await api.put(`/api/appointments/${id}/status`, null, {
    params: { status }
  });
  return response.data;
};

/**
 * Registrar pago de una cita
 * @param {number} id - ID de la cita
 * @returns {Promise<Object>} AppointmentResponse
 */
export const payAppointment = async (id) => {
  const response = await api.put(`/api/appointments/${id}/pay`);
  return response.data;
};
