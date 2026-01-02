import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useEffect, useRef, useState } from 'react';
import {
    createPatient,
    deletePatient,
    getPatients,
    updatePatient
} from '../services/patientService';
import { DEFAULT_PAGINATION, GENDER_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const emptyPatient = {
  name: '',
  phone: '',
  email: '',
  birthDate: null,
  gender: ''
};

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [patient, setPatient] = useState(emptyPatient);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Filtros del servidor
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  
  // Estado de paginación del servidor
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: DEFAULT_PAGINATION.rows,
    page: 0,
    sortField: null,
    sortOrder: null
  });

  const toast = useRef(null);

  useEffect(() => {
    loadPatients();
  }, [lazyParams, nameFilter, phoneFilter, emailFilter]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: lazyParams.page,
        size: lazyParams.rows
      };
      if (lazyParams.sortField) {
        params.sort = `${lazyParams.sortField},${lazyParams.sortOrder === 1 ? 'asc' : 'desc'}`;
      }
      
      // Agregar filtros
      if (nameFilter) params.name = nameFilter;
      if (phoneFilter) params.phone = phoneFilter;
      if (emailFilter) params.email = emailFilter;
      
      const response = await getPatients(params);
      setPatients(response.content || []);
      setTotalRecords(response.totalElements || 0);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los pacientes',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setNameFilter('');
    setPhoneFilter('');
    setEmailFilter('');
    setLazyParams(prev => ({ ...prev, first: 0, page: 0 }));
  };

  const onPage = (event) => {
    setLazyParams({
      ...lazyParams,
      first: event.first,
      rows: event.rows,
      page: event.page
    });
  };

  const onSort = (event) => {
    setLazyParams({
      ...lazyParams,
      sortField: event.sortField,
      sortOrder: event.sortOrder
    });
  };

  const openNew = () => {
    setPatient(emptyPatient);
    setIsEditing(false);
    setErrors({});
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setPatient({
      ...rowData,
      birthDate: rowData.birthDate ? new Date(rowData.birthDate) : null
    });
    setIsEditing(true);
    setErrors({});
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setPatient(emptyPatient);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    
    if (!patient.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!patient.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    // Email es opcional, pero si se proporciona debe ser válido
    if (patient.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!patient.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }
    if (!patient.gender) {
      newErrors.gender = 'El género es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePatient = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const patientData = {
        ...patient,
        birthDate: patient.birthDate instanceof Date 
          ? patient.birthDate.toISOString().split('T')[0]
          : patient.birthDate
      };

      if (isEditing) {
        await updatePatient(patient.id, patientData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Paciente actualizado correctamente',
          life: 3000
        });
      } else {
        await createPatient(patientData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Paciente creado correctamente',
          life: 3000
        });
      }

      hideDialog();
      loadPatients();
    } catch (err) {
      console.error('Error al guardar paciente:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el paciente',
        life: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `¿Estás seguro de eliminar al paciente "${rowData.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deletePatient(rowData.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Paciente eliminado correctamente',
            life: 3000
          });
          loadPatients();
        } catch (err) {
          console.error('Error al eliminar paciente:', err);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el paciente',
            life: 4000
          });
        }
      }
    });
  };

  // Templates de columnas
  const birthDateTemplate = (rowData) => {
    return formatDate(rowData.birthDate);
  };

  const genderTemplate = (rowData) => {
    const genderLabel = GENDER_OPTIONS.find(g => g.value === rowData.gender)?.label;
    return genderLabel || rowData.gender;
  };

  const actionsTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          severity="warning"
          onClick={() => openEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDelete(rowData)}
        />
      </div>
    );
  };

  // Toolbar
  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Nuevo Paciente"
        icon="pi pi-plus"
        onClick={openNew}
      />
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        onClick={loadPatients}
      />
    </div>
  );

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
        label={saving ? 'Guardando...' : 'Guardar'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={savePatient}
        disabled={saving}
      />
    </div>
  );

  if (loading && patients.length === 0) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <Toolbar className="mb-4 border-none p-0 bg-transparent" left={leftToolbarTemplate} />

      {/* Filtros */}
      <div className="grid mb-4">
        <div className="col-12 md:col-4 lg:col-3">
          <label className="block text-500 text-sm mb-2">Nombre</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full"
            />
          </span>
        </div>
        <div className="col-12 md:col-4 lg:col-3">
          <label className="block text-500 text-sm mb-2">Teléfono</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-phone" />
            <InputText
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              placeholder="Buscar por teléfono..."
              className="w-full"
            />
          </span>
        </div>
        <div className="col-12 md:col-4 lg:col-3">
          <label className="block text-500 text-sm mb-2">Email</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-envelope" />
            <InputText
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Buscar por email..."
              className="w-full"
            />
          </span>
        </div>
        <div className="col-12 lg:col-3 flex align-items-end">
          <Button
            label="Limpiar filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            onClick={clearFilters}
            className="w-full lg:w-auto"
          />
        </div>
      </div>

      <DataTable
        value={patients}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        rowsPerPageOptions={DEFAULT_PAGINATION.rowsPerPageOptions}
        dataKey="id"
        loading={loading}
        emptyMessage="No se encontraron pacientes"
        className="shadow-2"
        stripedRows
      >
        <Column field="name" header="Nombre" sortable style={{ minWidth: '200px' }} />
        <Column field="phone" header="Teléfono" sortable style={{ minWidth: '130px' }} />
        <Column field="email" header="Email" sortable style={{ minWidth: '180px' }} />
        <Column 
          field="birthDate" 
          header="Fecha Nacimiento" 
          body={birthDateTemplate}
          sortable 
          style={{ minWidth: '150px' }} 
        />
        <Column 
          field="gender" 
          header="Género" 
          body={genderTemplate}
          style={{ minWidth: '100px' }} 
        />
        <Column header="Acciones" body={actionsTemplate} style={{ minWidth: '120px' }} />
      </DataTable>

      {/* Dialog de edición */}
      <Dialog
        visible={dialogVisible}
        onHide={hideDialog}
        header={isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        footer={dialogFooter}
        style={{ width: '500px' }}
        modal
        dismissableMask
        className="p-fluid"
        breakpoints={{ '640px': '95vw' }}
      >
        <div className="grid">
          <div className="col-12">
            <label className="block text-900 font-medium mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <InputText
              value={patient.name}
              onChange={(e) => setPatient({ ...patient, name: e.target.value })}
              className={errors.name ? 'p-invalid' : ''}
              placeholder="Nombre completo"
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <InputText
              value={patient.phone}
              onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
              className={errors.phone ? 'p-invalid' : ''}
              placeholder="+34 600 000 000"
            />
            {errors.phone && <small className="p-error">{errors.phone}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Email (opcional)
            </label>
            <InputText
              value={patient.email}
              onChange={(e) => setPatient({ ...patient, email: e.target.value })}
              className={errors.email ? 'p-invalid' : ''}
              placeholder="correo@ejemplo.com"
              type="email"
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </label>
            <Calendar
              value={patient.birthDate}
              onChange={(e) => setPatient({ ...patient, birthDate: e.value })}
              className={errors.birthDate ? 'p-invalid' : ''}
              placeholder="dd/mm/aaaa"
              dateFormat="dd/mm/yy"
              showIcon
              maxDate={new Date()}
            />
            {errors.birthDate && <small className="p-error">{errors.birthDate}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Género <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={patient.gender}
              options={GENDER_OPTIONS}
              onChange={(e) => setPatient({ ...patient, gender: e.value })}
              className={errors.gender ? 'p-invalid' : ''}
              placeholder="Seleccionar"
            />
            {errors.gender && <small className="p-error">{errors.gender}</small>}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PatientsPage;
