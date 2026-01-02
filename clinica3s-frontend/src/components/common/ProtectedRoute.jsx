import { ProgressSpinner } from 'primereact/progressspinner';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar
 * @param {string|string[]} [props.roles] - Roles permitidos (opcional)
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <ProgressSpinner 
          style={{ width: '50px', height: '50px' }} 
          strokeWidth="4" 
          animationDuration=".5s" 
        />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (roles && !hasRole(roles)) {
    // Usuario autenticado pero sin permisos - redirigir a dashboard
    return <Navigate to="/" replace />;
  }

  // Usuario autenticado y con permisos
  return children;
};

export default ProtectedRoute;
