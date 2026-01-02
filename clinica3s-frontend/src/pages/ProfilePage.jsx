import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Password } from 'primereact/password';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';
import { getInitials } from '../utils/formatters';

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useRef(null);
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const roleLabels = {
    ADMIN: { label: 'Administrador', severity: 'danger' },
    DENTIST: { label: 'Dentista', severity: 'info' },
    RECEPTIONIST: { label: 'Recepcionista', severity: 'warning' }
  };

  const validate = () => {
    const newErrors = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      await changePassword(
        passwords.currentPassword,
        passwords.newPassword,
        passwords.confirmPassword
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Contraseña cambiada correctamente',
        life: 3000
      });

      // Limpiar formulario
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      
      let errorMessage = 'No se pudo cambiar la contraseña';
      if (err.response?.status === 401) {
        errorMessage = 'La contraseña actual es incorrecta';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data || 'Datos inválidos';
      }

      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  const roleConfig = roleLabels[user?.role] || { label: user?.role, severity: 'secondary' };

  return (
    <div className="grid">
      <Toast ref={toast} />

      {/* Información del perfil */}
      <div className="col-12 lg:col-4">
        <Card className="shadow-2">
          <div className="flex flex-column align-items-center text-center">
            <Avatar
              label={getInitials(user?.username || '')}
              size="xlarge"
              shape="circle"
              style={{ 
                backgroundColor: '#6366f1', 
                color: '#ffffff',
                width: '100px',
                height: '100px',
                fontSize: '2.5rem'
              }}
            />
            <h2 className="text-900 font-bold mt-4 mb-2">{user?.username}</h2>
            <Tag value={roleConfig.label} severity={roleConfig.severity} className="mb-3" />
            
            <Divider />
            
            <div className="w-full text-left">
              <div className="mb-3">
                <label className="block text-500 text-sm mb-1">ID de Usuario</label>
                <span className="text-900 font-medium">{user?.userId}</span>
              </div>
              {user?.dentistId && (
                <div className="mb-3">
                  <label className="block text-500 text-sm mb-1">ID de Dentista</label>
                  <span className="text-900 font-medium">{user.dentistId}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Cambiar contraseña */}
      <div className="col-12 lg:col-8">
        <Card title="Cambiar Contraseña" className="shadow-2">
          <p className="text-600 mt-0 mb-4">
            Para cambiar tu contraseña, ingresa tu contraseña actual y luego la nueva contraseña dos veces.
          </p>

          <div className="grid">
            <div className="col-12">
              <label className="block text-900 font-medium mb-2">
                Contraseña Actual <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <Password
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className={`w-full ${errors.currentPassword ? 'p-invalid' : ''}`}
                inputClassName="w-full"
                feedback={false}
                toggleMask
                placeholder="Ingresa tu contraseña actual"
              />
              {errors.currentPassword && (
                <small style={{ color: '#ef4444' }}>{errors.currentPassword}</small>
              )}
            </div>

            <div className="col-12">
              <Divider />
            </div>

            <div className="col-12 md:col-6">
              <label className="block text-900 font-medium mb-2">
                Nueva Contraseña <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <Password
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className={`w-full ${errors.newPassword ? 'p-invalid' : ''}`}
                inputClassName="w-full"
                toggleMask
                placeholder="Mínimo 6 caracteres"
              />
              {errors.newPassword && (
                <small style={{ color: '#ef4444' }}>{errors.newPassword}</small>
              )}
            </div>

            <div className="col-12 md:col-6">
              <label className="block text-900 font-medium mb-2">
                Confirmar Contraseña <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <Password
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
                inputClassName="w-full"
                feedback={false}
                toggleMask
                placeholder="Repite la nueva contraseña"
              />
              {errors.confirmPassword && (
                <small style={{ color: '#ef4444' }}>{errors.confirmPassword}</small>
              )}
            </div>

            <div className="col-12 mt-3">
              <Button
                label={saving ? 'Guardando...' : 'Cambiar Contraseña'}
                icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-lock'}
                onClick={handleChangePassword}
                disabled={saving}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
