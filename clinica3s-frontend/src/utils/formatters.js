import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha ISO a formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} formatStr - Formato de salida (default: 'dd/MM/yyyy')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, formatStr, { locale: es });
  } catch {
    return '-';
  }
};

/**
 * Formatea fecha y hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  return formatDate(date, "dd/MM/yyyy HH:mm");
};

/**
 * Formatea solo la hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Hora formateada
 */
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

/**
 * Formatea fecha para mostrar día y mes en texto
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada (ej: "15 de enero")
 */
export const formatDateLong = (date) => {
  return formatDate(date, "d 'de' MMMM");
};

/**
 * Formatea fecha completa con día de la semana
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada (ej: "Lunes, 15 de enero de 2024")
 */
export const formatDateFull = (date) => {
  return formatDate(date, "EEEE, d 'de' MMMM 'de' yyyy");
};

/**
 * Formatea un número como moneda (EUR)
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'EUR')
 * @returns {string} Cantidad formateada
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '-';
  
  return new Intl.NumberFormat('es-ES').format(number);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor decimal (0.15 = 15%)
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Trunca texto largo con puntos suspensivos
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convierte una fecha a formato ISO para enviar al backend
 * @param {Date} date - Fecha a convertir
 * @returns {string} Fecha en formato ISO
 */
export const toISOString = (date) => {
  if (!date || !isValid(date)) return null;
  return date.toISOString();
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales (máximo 2 caracteres)
 */
export const getInitials = (name) => {
  if (!name) return '??';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};
