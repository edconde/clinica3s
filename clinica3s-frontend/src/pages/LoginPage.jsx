import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const toast = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Obtener la ruta de origen (si venía de una ruta protegida)
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
      
      toast.current?.show({
        severity: 'success',
        summary: '¡Bienvenido!',
        detail: 'Inicio de sesión exitoso',
        life: 2000
      });

      // Pequeño delay para mostrar el toast
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);

    } catch (err) {
      console.error('Error de login:', err);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Usuario o contraseña incorrectos';
            break;
          case 400:
            errorMessage = 'Datos de login inválidos';
            break;
          default:
            errorMessage = err.response.data?.message || 'Error del servidor';
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      setError(errorMessage);
      
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background flex align-items-center justify-content-center px-4">
      <Toast ref={toast} position="top-right" />
      
      <div className="w-full" style={{ maxWidth: '400px' }}>
        {/* Logo y título */}
        <div className="text-center mb-5">
          <div className="flex align-items-center justify-content-center mb-3">
            <img src="/assets/img/dientes-white-background.png" alt="Logo" style={{ height: '60px' }} />
          </div>
          <h1 className="text-white text-4xl font-bold m-0">Clínica 3S</h1>
          <p className="text-white-alpha-70 mt-2">Sistema de Gestión Odontológica</p>
        </div>

        {/* Card de login */}
        <Card className="shadow-8">
          <div className="text-center mb-5">
            <h2 className="text-900 text-2xl font-medium m-0">Iniciar Sesión</h2>
            <p className="text-600 mt-2 mb-0">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <Message 
              severity="error" 
              text={error} 
              className="w-full mb-4"
            />
          )}

          <form onSubmit={handleSubmit}>
            {/* Campo Usuario */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-900 font-medium mb-2">
                Usuario
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-user"></i>
                </span>
                <InputText
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="w-full"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-900 font-medium mb-2">
                Contraseña
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-lock"></i>
                </span>
                <InputText
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <span 
                  className="p-inputgroup-addon cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}></i>
                </span>
              </div>
            </div>

            {/* Botón de login */}
            <Button
              type="submit"
              label={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
              className="w-full mt-3"
              disabled={loading}
            />
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white-alpha-60 text-sm m-0">
            © 2026 Clínica 3S. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
