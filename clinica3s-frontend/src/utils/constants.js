// Roles de usuario
export const ROLES = {
  ADMIN: 'ADMIN',
  DENTIST: 'DENTIST',
  RECEPTIONIST: 'RECEPTIONIST'
};

// Estados de citas
export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW'
};

// Configuración de colores para estados
export const STATUS_COLORS = {
  PENDING: {
    severity: 'warning',
    background: '#fef3c7',
    color: '#92400e',
    label: 'Pendiente'
  },
  COMPLETED: {
    severity: 'success',
    background: '#d1fae5',
    color: '#065f46',
    label: 'Completada'
  },
  NO_SHOW: {
    severity: 'danger',
    background: '#fee2e2',
    color: '#991b1b',
    label: 'No asistió'
  }
};

// Opciones de género para pacientes
export const GENDER_OPTIONS = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otro', value: 'O' }
];

// Configuración de menú por rol
export const MENU_ITEMS = {
  ADMIN: [
    { label: 'Inicio', icon: 'pi pi-home', to: '/' },
    { label: 'Finanzas', icon: 'pi pi-chart-bar', to: '/dashboard' },
    { label: 'Citas', icon: 'pi pi-calendar', to: '/appointments' },
    { label: 'Pacientes', icon: 'pi pi-users', to: '/patients' },
    { label: 'Dentistas', icon: 'pi pi-user', to: '/dentists' },
    { label: 'Servicios', icon: 'pi pi-list', to: '/services' },
    { label: 'Especialidades', icon: 'pi pi-tags', to: '/specialties' },
    { label: 'Usuarios', icon: 'pi pi-lock', to: '/users' }
  ],
  RECEPTIONIST: [
    { label: 'Inicio', icon: 'pi pi-home', to: '/' },
    { label: 'Finanzas', icon: 'pi pi-chart-bar', to: '/dashboard' },
    { label: 'Citas', icon: 'pi pi-calendar', to: '/appointments' },
    { label: 'Pacientes', icon: 'pi pi-users', to: '/patients' }
  ],
  DENTIST: [
    { label: 'Inicio', icon: 'pi pi-home', to: '/' },
    { label: 'Citas', icon: 'pi pi-calendar', to: '/appointments' }
  ]
};

// Colores para gráficas
export const CHART_COLORS = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  secondary: '#64748b',
  // Paleta para múltiples series
  palette: [
    '#6366f1',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#06b6d4'
  ]
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.'
};

// Configuración de paginación por defecto
export const DEFAULT_PAGINATION = {
  rows: 10,
  rowsPerPageOptions: [5, 10, 25, 50]
};
