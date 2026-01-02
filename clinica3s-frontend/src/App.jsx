import { PrimeReactProvider, addLocale, locale } from 'primereact/api';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import AppointmentsPage from './pages/AppointmentsPage';
import DashboardPage from './pages/DashboardPage';
import DentistsPage from './pages/DentistsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import PatientsPage from './pages/PatientsPage';
import ProfilePage from './pages/ProfilePage';
import ServicesPage from './pages/ServicesPage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import UsersPage from './pages/UsersPage';

// Registrar locale español en PrimeReact
addLocale('es', {
  startsWith: 'Comienza con',
  contains: 'Contiene',
  notContains: 'No contiene',
  endsWith: 'Termina con',
  equals: 'Igual',
  notEquals: 'No igual',
  noFilter: 'Sin filtro',
  lt: 'Menor que',
  lte: 'Menor o igual que',
  gt: 'Mayor que',
  gte: 'Mayor o igual que',
  dateIs: 'Fecha es',
  dateIsNot: 'Fecha no es',
  dateBefore: 'Fecha es antes',
  dateAfter: 'Fecha es después',
  clear: 'Limpiar',
  apply: 'Aplicar',
  matchAll: 'Coincidir todo',
  matchAny: 'Coincidir cualquiera',
  addRule: 'Agregar regla',
  removeRule: 'Eliminar regla',
  accept: 'Sí',
  reject: 'No',
  choose: 'Elegir',
  upload: 'Subir',
  cancel: 'Cancelar',
  completed: 'Completado',
  pending: 'Pendiente',
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  chooseYear: 'Elegir año',
  chooseMonth: 'Elegir mes',
  chooseDate: 'Elegir fecha',
  prevDecade: 'Década anterior',
  nextDecade: 'Década siguiente',
  prevYear: 'Año anterior',
  nextYear: 'Año siguiente',
  prevMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  prevHour: 'Hora anterior',
  nextHour: 'Hora siguiente',
  prevMinute: 'Minuto anterior',
  nextMinute: 'Minuto siguiente',
  prevSecond: 'Segundo anterior',
  nextSecond: 'Segundo siguiente',
  am: 'AM',
  pm: 'PM',
  today: 'Hoy',
  weekHeader: 'Sem',
  firstDayOfWeek: 1,
  dateFormat: 'dd/mm/yy',
  weak: 'Débil',
  medium: 'Media',
  strong: 'Fuerte',
  passwordPrompt: 'Ingrese una contraseña',
  emptyFilterMessage: 'Sin resultados',
  searchMessage: '{0} resultados disponibles',
  selectionMessage: '{0} elementos seleccionados',
  emptySelectionMessage: 'Ningún elemento seleccionado',
  emptySearchMessage: 'Sin resultados',
  emptyMessage: 'No hay opciones disponibles',
  aria: {
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    nullLabel: 'No seleccionado',
    star: '1 estrella',
    stars: '{star} estrellas',
    selectAll: 'Todos los elementos seleccionados',
    unselectAll: 'Todos los elementos deseleccionados',
    close: 'Cerrar',
    previous: 'Anterior',
    next: 'Siguiente',
    navigation: 'Navegación',
    scrollTop: 'Ir arriba',
    moveTop: 'Mover arriba',
    moveUp: 'Mover hacia arriba',
    moveDown: 'Mover hacia abajo',
    moveBottom: 'Mover al final',
    moveToTarget: 'Mover al destino',
    moveToSource: 'Mover al origen',
    moveAllToTarget: 'Mover todo al destino',
    moveAllToSource: 'Mover todo al origen',
    pageLabel: 'Página {page}',
    firstPageLabel: 'Primera página',
    lastPageLabel: 'Última página',
    nextPageLabel: 'Página siguiente',
    prevPageLabel: 'Página anterior',
    rowsPerPageLabel: 'Filas por página',
    jumpToPageDropdownLabel: 'Ir a página',
    jumpToPageInputLabel: 'Ir a página',
    selectRow: 'Fila seleccionada',
    unselectRow: 'Fila deseleccionada',
    expandRow: 'Fila expandida',
    collapseRow: 'Fila colapsada',
    showFilterMenu: 'Mostrar menú de filtro',
    hideFilterMenu: 'Ocultar menú de filtro',
    filterOperator: 'Operador de filtro',
    filterConstraint: 'Restricción de filtro',
    editRow: 'Editar fila',
    saveEdit: 'Guardar edición',
    cancelEdit: 'Cancelar edición',
    listView: 'Vista de lista',
    gridView: 'Vista de cuadrícula',
    slide: 'Deslizar',
    slideNumber: '{slideNumber}',
    zoomImage: 'Ampliar imagen',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    rotateRight: 'Rotar derecha',
    rotateLeft: 'Rotar izquierda'
  }
});

// Establecer español como locale activo
locale('es');

// Configuración de PrimeReact
const primeReactConfig = {
  ripple: true,
  inputStyle: 'outlined'
};

function App() {
  return (
    <PrimeReactProvider value={primeReactConfig}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta de login - pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas - requieren autenticación */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >              {/* Inicio - todos los roles */}
              <Route path="/" element={<HomePage />} />

              {/* Dashboard/Finanzas - ADMIN y RECEPTIONIST */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute roles={['ADMIN', 'RECEPTIONIST']}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Perfil - todos los roles */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Citas - todos los roles */}
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route 
                path="/appointments/new" 
                element={
                  <ProtectedRoute roles={['ADMIN', 'RECEPTIONIST']}>
                    <NewAppointmentPage />
                  </ProtectedRoute>
                } 
              />

              {/* Pacientes - ADMIN y RECEPTIONIST */}
              <Route 
                path="/patients" 
                element={
                  <ProtectedRoute roles={['ADMIN', 'RECEPTIONIST']}>
                    <PatientsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Dentistas - solo ADMIN */}
              <Route 
                path="/dentists" 
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <DentistsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Servicios - solo ADMIN */}
              <Route 
                path="/services" 
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <ServicesPage />
                  </ProtectedRoute>
                } 
              />

              {/* Especialidades - solo ADMIN */}
              <Route 
                path="/specialties" 
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <SpecialtiesPage />
                  </ProtectedRoute>
                } 
              />

              {/* Usuarios - solo ADMIN */}
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Ruta por defecto - redirige a dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PrimeReactProvider>
  );
}

export default App;
