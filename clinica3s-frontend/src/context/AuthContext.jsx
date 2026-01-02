import { createContext, useCallback, useContext, useState } from 'react';
import * as authService from '../services/authService';

// Crear contexto
const AuthContext = createContext(null);

// Obtener datos iniciales de localStorage
const getInitialToken = () => authService.getStoredToken();
const getInitialUser = () => authService.getStoredUser();

/**
 * Provider de autenticación
 * Envuelve la aplicación y provee estado de auth global
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(getInitialToken);
  // Loading se mantiene por si se usa en el futuro para operaciones async
  const [loading] = useState(false);

  /**
   * Iniciar sesión
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>} Datos del usuario
   */
  const login = useCallback(async (username, password) => {
    const response = await authService.login(username, password);
    
    const userData = {
      id: response.userId,
      username: response.username,
      role: response.role,
      dentistId: response.dentistId || null
    };
    
    // Guardar en localStorage
    authService.saveSession(response.token, userData);
    
    // Actualizar estado
    setToken(response.token);
    setUser(userData);
    
    return userData;
  }, []);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string|string[]} roles - Rol o array de roles permitidos
   * @returns {boolean}
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  }, [user]);

  /**
   * Verificar si es administrador
   * @returns {boolean}
   */
  const isAdmin = useCallback(() => {
    return user?.role === 'ADMIN';
  }, [user]);

  /**
   * Verificar si es dentista
   * @returns {boolean}
   */
  const isDentist = useCallback(() => {
    return user?.role === 'DENTIST';
  }, [user]);

  /**
   * Verificar si es recepcionista
   * @returns {boolean}
   */
  const isReceptionist = useCallback(() => {
    return user?.role === 'RECEPTIONIST';
  }, [user]);

  // Valor del contexto
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    hasRole,
    isAdmin,
    isDentist,
    isReceptionist
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de autenticación
 * @returns {Object} Contexto de auth
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;
