import api from "../api/api";

/**
 * Obtener estadísticas del dashboard
 * @param {number} year - Año para filtrar las estadísticas (opcional)
 * @returns {Promise<object>} Datos del dashboard con KPIs y datos para gráficos
 */
export const getDashboardStats = async (year = null) => {
  const params = {};
  if (year) {
    params.year = year;
  }
  const response = await api.get("/api/reports/dashboard", { params });
  return response.data;
};

/**
 * Obtener reporte de ingresos por período
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<object>} Datos de ingresos
 */
export const getRevenueReport = async (startDate, endDate) => {
  const response = await api.get("/api/reportes/ingresos", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Obtener reporte de citas por dentista
 * @param {number} dentistaId - ID del dentista (opcional)
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @returns {Promise<object>} Datos de citas por dentista
 */
export const getAppointmentsByDentist = async (dentistaId, startDate, endDate) => {
  const params = { startDate, endDate };
  if (dentistaId) params.dentistaId = dentistaId;
  
  const response = await api.get("/api/reportes/citas-por-dentista", { params });
  return response.data;
};

/**
 * Obtener servicios más solicitados
 * @param {number} limit - Número máximo de servicios a retornar
 * @returns {Promise<Array>} Lista de servicios más populares
 */
export const getTopServices = async (limit = 10) => {
  const response = await api.get("/api/reportes/servicios-populares", {
    params: { limit },
  });
  return response.data;
};

/**
 * Obtener evolución mensual de citas
 * @param {number} year - Año a consultar
 * @returns {Promise<Array>} Datos mensuales de citas
 */
export const getMonthlyAppointments = async (year) => {
  const response = await api.get("/api/reportes/citas-mensuales", {
    params: { year },
  });
  return response.data;
};

export default {
  getDashboardStats,
  getRevenueReport,
  getAppointmentsByDentist,
  getTopServices,
  getMonthlyAppointments,
};
