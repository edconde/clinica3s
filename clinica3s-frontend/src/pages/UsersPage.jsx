import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Password } from 'primereact/password';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useEffect, useRef, useState } from 'react';
import { getSpecialties } from '../services/specialtyService';
import { createUser, getUsers, setUserEnabled } from '../services/userService';
import { DEFAULT_PAGINATION, ROLES } from '../utils/constants';

const roleOptions = [
  { label: 'Administrador', value: ROLES.ADMIN },
  { label: 'Dentista', value: ROLES.DENTIST },
  { label: 'Recepcionista', value: ROLES.RECEPTIONIST }
];

const emptyUser = {
  username: '',
  password: '',
  name: '',
  role: null,
  // Campos para dentista
  licenseNumber: '',
  commissionRate: 0.15,
  specialtyIds: []
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user, setUser] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [errors, setErrors] = useState({});

  const toast = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, specialtiesData] = await Promise.all([
        getUsers(),
        getSpecialties()
      ]);
      setUsers(usersData);
      setSpecialties(specialtiesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setUser(emptyUser);
    setErrors({});
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setUser(emptyUser);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    
    if (!user.username?.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (user.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }
    
    if (!user.password?.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (user.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!user.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!user.role) {
      newErrors.role = 'El rol es requerido';
    }

    // Validaciones adicionales para dentista
    if (user.role === ROLES.DENTIST) {
      if (!user.licenseNumber?.trim()) {
        newErrors.licenseNumber = 'El número de licencia es requerido';
      }
      if (user.commissionRate === null || user.commissionRate === undefined) {
        newErrors.commissionRate = 'La comisión es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveUser = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const userData = {
        username: user.username.trim(),
        password: user.password,
        name: user.name.trim(),
        role: user.role
      };

      // Agregar datos de dentista si aplica
      if (user.role === ROLES.DENTIST) {
        userData.licenseNumber = user.licenseNumber.trim();
        userData.commissionRate = parseFloat(user.commissionRate) || 0.15;
        // Solo enviar specialtyIds si hay especialidades seleccionadas
        if (user.specialtyIds && user.specialtyIds.length > 0) {
          userData.specialtyIds = user.specialtyIds;
        }
      }

      console.log('Enviando datos de registro:', userData);
      await createUser(userData);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario creado correctamente',
        life: 3000
      });

      hideDialog();
      loadData();
    } catch (err) {
      console.error('Error al crear usuario:', err);
      
      let errorMessage = 'No se pudo crear el usuario';
      if (err.response?.status === 409) {
        errorMessage = 'El nombre de usuario ya existe';
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

  // Función para habilitar/deshabilitar usuario
  const toggleUserEnabled = async (userData) => {
    try {
      await setUserEnabled(userData.id, !userData.enabled);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: `Usuario ${userData.enabled ? 'deshabilitado' : 'habilitado'} correctamente`,
        life: 3000
      });
      loadData();
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cambiar el estado del usuario',
        life: 4000
      });
    }
  };

  // Templates de columnas
  const roleTemplate = (rowData) => {
    const roleLabels = {
      ADMIN: { label: 'Administrador', severity: 'danger' },
      DENTIST: { label: 'Dentista', severity: 'info' },
      RECEPTIONIST: { label: 'Recepcionista', severity: 'warning' }
    };
    const config = roleLabels[rowData.role] || { label: rowData.role, severity: 'secondary' };
    return <Tag value={config.label} severity={config.severity} />;
  };

  const statusTemplate = (rowData) => {
    return (
      <Tag 
        value={rowData.enabled !== false ? 'Activo' : 'Inactivo'} 
        severity={rowData.enabled !== false ? 'success' : 'danger'} 
      />
    );
  };

  // Toolbar
  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Nuevo Usuario"
        icon="pi pi-plus"
        onClick={openNew}
      />
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        onClick={loadData}
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex align-items-center text-500 text-sm">
      <i className="pi pi-info-circle mr-2"></i>
      <span>Si se crea un usuario cuyo rol es "Dentista", se creará automáticamente el perfil de dentista asociado</span>
    </div>
  );

  // Filtrar usuarios según el rol seleccionado
  const filteredUsers = roleFilter
    ? users.filter(u => u.role === roleFilter)
    : users;

  const clearFilters = () => {
    setGlobalFilter('');
    setRoleFilter(null);
  };

  // Footer del dialog
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={hideDialog}
      />
      <Button
        label={saving ? 'Creando...' : 'Crear Usuario'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={saveUser}
        disabled={saving}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  // Template para acciones
  const actionsTemplate = (rowData) => {
    return (
      <Button
        icon={rowData.enabled ? 'pi pi-ban' : 'pi pi-check-circle'}
        severity={rowData.enabled ? 'warning' : 'success'}
        outlined
        size="small"
        tooltip={rowData.enabled ? 'Deshabilitar' : 'Habilitar'}
        tooltipOptions={{ position: 'top' }}
        onClick={() => toggleUserEnabled(rowData)}
      />
    );
  };

  return (
    <div>
      <Toast ref={toast} />

      <Toolbar className="mb-4 border-none p-0 bg-transparent" left={leftToolbarTemplate} right={rightToolbarTemplate} />

      {/* Filtros */}
      <div className="grid mb-4">
        <div className="col-12 md:col-4 lg:col-3">
          <label className="block text-500 text-sm mb-2">Buscar</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full"
            />
          </span>
        </div>
        <div className="col-12 md:col-4 lg:col-3">
          <label className="block text-500 text-sm mb-2">Rol</label>
          <Dropdown
            value={roleFilter}
            options={roleOptions}
            onChange={(e) => setRoleFilter(e.value)}
            placeholder="Todos los roles"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-4 lg:col-3 flex align-items-end">
          <Button
            label="Limpiar filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            onClick={clearFilters}
          />
        </div>
      </div>

      <DataTable
        value={filteredUsers}
        paginator
        rows={DEFAULT_PAGINATION.rows}
        rowsPerPageOptions={DEFAULT_PAGINATION.rowsPerPageOptions}
        dataKey="id"
        globalFilter={globalFilter}
        emptyMessage="No se encontraron usuarios"
        className="shadow-2"
        stripedRows
      >
        <Column field="username" header="Usuario" sortable style={{ minWidth: '150px' }} />
        <Column field="name" header="Nombre" sortable style={{ minWidth: '180px' }} />
        <Column field="role" header="Rol" body={roleTemplate} sortable style={{ minWidth: '130px' }} />
        <Column header="Estado" body={statusTemplate} style={{ minWidth: '100px' }} />
        <Column header="Acciones" body={actionsTemplate} style={{ width: '100px' }} />
      </DataTable>

      {/* Dialog de creación */}
      <Dialog
        visible={dialogVisible}
        onHide={hideDialog}
        header="Nuevo Usuario"
        footer={dialogFooter}
        style={{ width: '550px' }}
        modal
        dismissableMask
        className="p-fluid"
        breakpoints={{ '640px': '95vw' }}
      >
        <div className="grid">
          {/* Datos de cuenta */}
          <div className="col-12">
            <h5 className="text-900 font-medium mt-0 mb-3">Datos de Cuenta</h5>
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Usuario <span className="text-red-500">*</span>
            </label>
            <InputText
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className={errors.username ? 'p-invalid' : ''}
              placeholder="nombre.usuario"
            />
            {errors.username && <small className="p-error">{errors.username}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <Password
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className={errors.password ? 'p-invalid' : ''}
              placeholder="Mínimo 6 caracteres"
              toggleMask
              feedback={false}
            />
            {errors.password && <small className="p-error">{errors.password}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <InputText
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className={errors.name ? 'p-invalid' : ''}
              placeholder="Juan Pérez García"
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Rol <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={user.role}
              options={roleOptions}
              onChange={(e) => setUser({ ...user, role: e.value })}
              className={errors.role ? 'p-invalid' : ''}
              placeholder="Seleccionar rol"
            />
            {errors.role && <small className="p-error">{errors.role}</small>}
          </div>

          {/* Campos adicionales para Dentista */}
          {user.role === ROLES.DENTIST && (
            <>
              <div className="col-12">
                <Divider />
                <h5 className="text-900 font-medium mt-0 mb-3">Datos del Dentista</h5>
              </div>

              <div className="col-12 md:col-6">
                <label className="block text-900 font-medium mb-2">
                  Nº Licencia <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={user.licenseNumber}
                  onChange={(e) => setUser({ ...user, licenseNumber: e.target.value })}
                  className={errors.licenseNumber ? 'p-invalid' : ''}
                  placeholder="COL-12345"
                />
                {errors.licenseNumber && <small className="p-error">{errors.licenseNumber}</small>}
              </div>

              <div className="col-12 md:col-6">
                <label className="block text-900 font-medium mb-2">
                  Comisión (%) <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  value={user.commissionRate * 100}
                  onValueChange={(e) => setUser({ ...user, commissionRate: (e.value || 0) / 100 })}
                  className={errors.commissionRate ? 'p-invalid' : ''}
                  suffix="%"
                  min={0}
                  max={100}
                />
                {errors.commissionRate && <small className="p-error">{errors.commissionRate}</small>}
              </div>

              <div className="col-12">
                <label className="block text-900 font-medium mb-2">Especialidades</label>
                <MultiSelect
                  value={user.specialtyIds}
                  options={specialties}
                  onChange={(e) => setUser({ ...user, specialtyIds: e.value })}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccionar especialidades"
                  display="chip"
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default UsersPage;
