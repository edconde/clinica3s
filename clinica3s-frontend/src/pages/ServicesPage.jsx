import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useEffect, useRef, useState } from 'react';
import {
    createService,
    deleteService,
    getServices,
    updateService
} from '../services/serviceService';
import { getSpecialties } from '../services/specialtyService';
import { DEFAULT_PAGINATION } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const emptyService = {
  name: '',
  standardCost: 0,
  listPrice: 0,
  specialty: null
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [service, setService] = useState(emptyService);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState(null);
  const [errors, setErrors] = useState({});

  const toast = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesResponse, specialtiesResponse] = await Promise.all([
        getServices(),
        getSpecialties()
      ]);
      // Manejar respuestas paginadas o arrays directos
      setServices(servicesResponse.content || servicesResponse);
      setSpecialties(specialtiesResponse.content || specialtiesResponse);
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
    setService(emptyService);
    setIsEditing(false);
    setErrors({});
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setService({ ...rowData });
    setIsEditing(true);
    setErrors({});
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setService(emptyService);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    
    if (!service.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!service.standardCost || service.standardCost <= 0) {
      newErrors.standardCost = 'El costo debe ser mayor a 0';
    }
    if (!service.listPrice || service.listPrice <= 0) {
      newErrors.listPrice = 'El precio debe ser mayor a 0';
    }
    if (!service.specialty) {
      newErrors.specialty = 'La especialidad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveService = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const serviceData = {
        name: service.name,
        standardCost: service.standardCost,
        listPrice: service.listPrice,
        specialty: { id: service.specialty.id }
      };

      if (isEditing) {
        await updateService(service.id, serviceData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicio actualizado correctamente',
          life: 3000
        });
      } else {
        await createService(serviceData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicio creado correctamente',
          life: 3000
        });
      }

      hideDialog();
      loadData();
    } catch (err) {
      console.error('Error al guardar servicio:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el servicio',
        life: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `¿Estás seguro de eliminar el servicio "${rowData.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteService(rowData.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Servicio eliminado correctamente',
            life: 3000
          });
          loadData();
        } catch (err) {
          console.error('Error al eliminar servicio:', err);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el servicio',
            life: 4000
          });
        }
      }
    });
  };

  // Templates de columnas
  const standardCostTemplate = (rowData) => {
    return formatCurrency(rowData.standardCost);
  };

  const listPriceTemplate = (rowData) => {
    return formatCurrency(rowData.listPrice);
  };

  const marginTemplate = (rowData) => {
    const margin = ((rowData.listPrice - rowData.standardCost) / rowData.listPrice) * 100;
    const severity = margin >= 30 ? 'success' : margin >= 15 ? 'warning' : 'danger';
    return <Tag value={`${margin.toFixed(1)}%`} severity={severity} />;
  };

  const specialtyTemplate = (rowData) => {
    return rowData.specialty?.name || '-';
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
        label="Nuevo Servicio"
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

  // Filtrar servicios según la especialidad seleccionada
  const filteredServices = specialtyFilter
    ? services.filter(s => s.specialty?.id === specialtyFilter)
    : services;

  const clearFilters = () => {
    setGlobalFilter('');
    setSpecialtyFilter(null);
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
        label={saving ? 'Guardando...' : 'Guardar'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={saveService}
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

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <Toolbar className="mb-4 border-none p-0 bg-transparent" left={leftToolbarTemplate} />

      {/* Filtros */}
      <div className="grid mb-4">
        <div className="col-12 md:col-4 lg:col-3">
          <label className="block text-500 text-sm mb-2">Buscar</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar servicio..."
              className="w-full"
            />
          </span>
        </div>
        <div className="col-12 md:col-4 lg:col-3">
          <label className="block text-500 text-sm mb-2">Especialidad</label>
          <Dropdown
            value={specialtyFilter}
            options={specialties}
            onChange={(e) => setSpecialtyFilter(e.value)}
            optionLabel="name"
            optionValue="id"
            placeholder="Todas las especialidades"
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
        value={filteredServices}
        paginator
        rows={DEFAULT_PAGINATION.rows}
        rowsPerPageOptions={DEFAULT_PAGINATION.rowsPerPageOptions}
        dataKey="id"
        globalFilter={globalFilter}
        emptyMessage="No se encontraron servicios"
        className="shadow-2"
        stripedRows
      >
        <Column field="name" header="Nombre" sortable style={{ minWidth: '200px' }} />
        <Column 
          header="Especialidad" 
          body={specialtyTemplate}
          style={{ minWidth: '150px' }} 
        />
        <Column 
          field="standardCost" 
          header="Costo" 
          body={standardCostTemplate}
          sortable 
          style={{ minWidth: '120px' }} 
        />
        <Column 
          field="listPrice" 
          header="Precio" 
          body={listPriceTemplate}
          sortable 
          style={{ minWidth: '120px' }} 
        />
        <Column 
          header="Margen" 
          body={marginTemplate}
          style={{ minWidth: '100px' }} 
        />
        <Column header="Acciones" body={actionsTemplate} style={{ minWidth: '120px' }} />
      </DataTable>

      {/* Dialog de edición */}
      <Dialog
        visible={dialogVisible}
        onHide={hideDialog}
        header={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
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
              value={service.name}
              onChange={(e) => setService({ ...service, name: e.target.value })}
              className={errors.name ? 'p-invalid' : ''}
              placeholder="Nombre del servicio"
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="col-12">
            <label className="block text-900 font-medium mb-2">
              Especialidad <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={service.specialty}
              options={specialties}
              onChange={(e) => setService({ ...service, specialty: e.value })}
              optionLabel="name"
              className={errors.specialty ? 'p-invalid' : ''}
              placeholder="Seleccionar especialidad"
            />
            {errors.specialty && <small className="p-error">{errors.specialty}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Costo Estándar <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={service.standardCost}
              onValueChange={(e) => setService({ ...service, standardCost: e.value })}
              mode="currency"
              currency="EUR"
              locale="es-ES"
              className={errors.standardCost ? 'p-invalid' : ''}
              min={0}
            />
            {errors.standardCost && <small className="p-error">{errors.standardCost}</small>}
          </div>

          <div className="col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">
              Precio de Lista <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={service.listPrice}
              onValueChange={(e) => setService({ ...service, listPrice: e.value })}
              mode="currency"
              currency="EUR"
              locale="es-ES"
              className={errors.listPrice ? 'p-invalid' : ''}
              min={0}
            />
            {errors.listPrice && <small className="p-error">{errors.listPrice}</small>}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
