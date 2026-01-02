import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentDetailDialog from '../components/appointments/AppointmentDetailDialog';
import { useAuth } from '../context/AuthContext';
import {
    getAppointments,
    payAppointment,
    updateAppointmentStatus
} from '../services/appointmentService';
import { getDentists } from '../services/dentistService';
import { DEFAULT_PAGINATION, STATUS_COLORS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // Datos originales sin filtrar
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  
  // Paginación del servidor
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: DEFAULT_PAGINATION.rows,
    page: 0,
    sortField: 'dateTime',
    sortOrder: 1 // Ascendente: más temprano primero
  });
  
  // Filtros del servidor - fecha inicio y fin por separado
  const [globalFilter, setGlobalFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState(new Date()); // Hoy por defecto
  const [endDateFilter, setEndDateFilter] = useState(new Date()); // Hoy por defecto
  const [dentistFilter, setDentistFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const toast = useRef(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const canCreate = hasRole(['ADMIN', 'RECEPTIONIST']);

  const loadDentists = async () => {
    try {
      const dentistsResponse = await getDentists();
      // getDentists ahora puede devolver paginado
      setDentists(dentistsResponse.content || dentistsResponse);
    } catch (err) {
      console.error('Error al cargar dentistas:', err);
    }
  };

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construir parámetros para la API unificada
      const params = {
        page: lazyParams.page,
        size: lazyParams.rows
      };
      
      // Ordenamiento
      if (lazyParams.sortField) {
        params.sort = `${lazyParams.sortField},${lazyParams.sortOrder === 1 ? 'asc' : 'desc'}`;
      }
      
      // Filtro por estado
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      // Filtro por dentista
      if (dentistFilter) {
        params.dentistId = dentistFilter;
      }
      
      // Filtro por rango de fechas
      if (startDateFilter) {
        const startDate = new Date(startDateFilter);
        startDate.setHours(0, 0, 0, 0);
        params.startDate = startDate.toISOString().slice(0, 19);
      }
      
      if (endDateFilter) {
        const endDate = new Date(endDateFilter);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString().slice(0, 19);
      } else if (startDateFilter) {
        // Si no hay fecha fin pero sí inicio, usar el mismo día
        const endDate = new Date(startDateFilter);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString().slice(0, 19);
      }
      
      const response = await getAppointments(params);
      const appointmentsData = response.content || [];
      
      setAllAppointments(appointmentsData);
      setAppointments(appointmentsData);
      setTotalRecords(response.totalElements || 0);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las citas',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  }, [lazyParams, startDateFilter, endDateFilter, statusFilter, dentistFilter]);

  // Aplicar filtro local cuando cambia globalFilter
  useEffect(() => {
    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      const filtered = allAppointments.filter(a => 
        a.patient?.name?.toLowerCase().includes(search) ||
        a.dentist?.user?.name?.toLowerCase().includes(search) ||
        a.dentist?.name?.toLowerCase().includes(search)
      );
      setAppointments(filtered);
    } else {
      setAppointments(allAppointments);
    }
  }, [globalFilter, allAppointments]);

  useEffect(() => {
    loadDentists();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

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

  const clearFilters = () => {
    setGlobalFilter('');
    setStartDateFilter(new Date()); // Volver a hoy
    setEndDateFilter(new Date()); // Volver a hoy
    setDentistFilter(null);
    setStatusFilter(null);
    // Resetear paginación
    setLazyParams(prev => ({
      ...prev,
      first: 0,
      page: 0
    }));
  };

  const handleStatusChange = async (id, newStatus) => {
    confirmDialog({
      message: `¿Estás seguro de cambiar el estado a "${STATUS_COLORS[newStatus]?.label}"?`,
      header: 'Confirmar cambio de estado',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          setActionLoading(true);
          await updateAppointmentStatus(id, newStatus);
          toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado actualizado correctamente',
            life: 3000
          });
          loadAppointments();
          setDetailDialogVisible(false);
        } catch (err) {
          console.error('Error al actualizar estado:', err);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el estado',
            life: 4000
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handlePay = async (id) => {
    confirmDialog({
      message: '¿Registrar el pago completo de esta cita?',
      header: 'Confirmar pago',
      icon: 'pi pi-wallet',
      accept: async () => {
        try {
          setActionLoading(true);
          await payAppointment(id);
          toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago registrado correctamente',
            life: 3000
          });
          loadAppointments();
          setDetailDialogVisible(false);
        } catch (err) {
          console.error('Error al registrar pago:', err);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar el pago',
            life: 4000
          });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const openDetailDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogVisible(true);
  };

  // Templates de columnas
  const dateTemplate = (rowData) => {
    return formatDateTime(rowData.dateTime);
  };

  const patientTemplate = (rowData) => {
    return (
      <div>
        <span className="font-medium">{rowData.patient?.name}</span>
        {rowData.patient?.email && (
          <span className="block text-500 text-sm">{rowData.patient.email}</span>
        )}
      </div>
    );
  };

  const dentistTemplate = (rowData) => {
    // El nombre puede estar en dentist.user.name o dentist.name dependiendo de la estructura
    return rowData.dentist?.user?.name || rowData.dentist?.name || '-';
  };

  const amountTemplate = (rowData) => {
    const hasPending = rowData.details?.some(d => !d.paid);
    return (
      <span className={hasPending ? 'text-orange-500 font-medium' : 'text-green-500 font-medium'}>
        {formatCurrency(rowData.totalAmount)}
        {hasPending && <i className="pi pi-exclamation-circle ml-2 text-sm"></i>}
      </span>
    );
  };

  const statusTemplate = (rowData) => {
    const statusConfig = STATUS_COLORS[rowData.status];
    return <Tag value={statusConfig?.label || rowData.status} severity={statusConfig?.severity} />;
  };

  const actionsTemplate = (rowData) => {
    const hasPending = rowData.details?.some(d => !d.paid);
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-search"
          rounded
          outlined
          severity="info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
          onClick={() => openDetailDialog(rowData)}
        />
        {hasPending && rowData.status !== 'NO_SHOW' && (
          <Button
            icon="pi pi-wallet"
            rounded
            outlined
            severity="success"
            tooltip="Registrar pago"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handlePay(rowData.id)}
          />
        )}
      </div>
    );
  };

  // Toolbar
  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      {canCreate && (
        <Button
          label="Nueva Cita"
          icon="pi pi-plus"
          onClick={() => navigate('/appointments/new')}
        />
      )}
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        onClick={loadAppointments}
      />
    </div>
  );

  const rightToolbarTemplate = (
    <span className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Buscar paciente o dentista..."
      />
    </span>
  );

  // Status options for filter
  const statusOptions = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Completada', value: 'COMPLETED' },
    { label: 'No asistió', value: 'NO_SHOW' }
  ];

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

      <Toolbar className="mb-4 border-none p-0 bg-transparent\" left={leftToolbarTemplate} right={rightToolbarTemplate} />

      {/* Filtros adicionales */}
      <div className="grid mb-4">
        <div className="col-12 md:col-3 lg:col-2">
          <label className="block text-500 text-sm mb-2">Fecha inicio</label>
          <Calendar
            value={startDateFilter}
            onChange={(e) => {
              const newStart = e.value;
              setStartDateFilter(newStart);
              // Si la nueva fecha inicio es superior a fecha fin, limpiar fecha fin
              if (newStart && endDateFilter && newStart > endDateFilter) {
                setEndDateFilter(null);
              }
            }}
            placeholder="Desde"
            className="w-full"
            showIcon
            dateFormat="dd/mm/yy"
            showButtonBar
          />
        </div>
        <div className="col-12 md:col-3 lg:col-2">
          <label className="block text-500 text-sm mb-2">Fecha fin</label>
          <Calendar
            value={endDateFilter}
            onChange={(e) => {
              const newEnd = e.value;
              setEndDateFilter(newEnd);
              // Si la nueva fecha fin es inferior a fecha inicio, limpiar fecha inicio
              if (newEnd && startDateFilter && newEnd < startDateFilter) {
                setStartDateFilter(null);
              }
            }}
            placeholder="Hasta"
            className="w-full"
            showIcon
            dateFormat="dd/mm/yy"
            showButtonBar
          />
        </div>
        <div className="col-12 md:col-3 lg:col-2">
          <label className="block text-500 text-sm mb-2">Dentista</label>
          <Dropdown
            value={dentistFilter}
            options={dentists}
            onChange={(e) => setDentistFilter(e.value)}
            optionLabel="user.name"
            optionValue="id"
            placeholder="Todos"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 md:col-3 lg:col-2">
          <label className="block text-500 text-sm mb-2">Estado</label>
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => setStatusFilter(e.value)}
            placeholder="Todos"
            className="w-full"
            showClear
          />
        </div>
        <div className="col-12 lg:col-4 flex align-items-end gap-2">
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

      {/* Tabla de citas */}
      <DataTable
        value={appointments}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={DEFAULT_PAGINATION.rowsPerPageOptions}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        dataKey="id"
        loading={loading}
        emptyMessage="No se encontraron citas"
        className="shadow-2"
        stripedRows
        responsiveLayout="scroll"
      >
        <Column 
          field="dateTime" 
          header="Fecha y Hora" 
          body={dateTemplate}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column 
          header="Paciente" 
          body={patientTemplate}
          style={{ minWidth: '200px' }}
        />
        <Column 
          header="Dentista" 
          body={dentistTemplate}
          style={{ minWidth: '150px' }}
        />
        <Column 
          field="totalAmount" 
          header="Importe" 
          body={amountTemplate}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column 
          field="status" 
          header="Estado" 
          body={statusTemplate}
          style={{ minWidth: '120px' }}
        />
        <Column 
          header="Acciones" 
          body={actionsTemplate}
          style={{ minWidth: '120px' }}
        />
      </DataTable>

      {/* Dialog de detalles */}
      <AppointmentDetailDialog
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
        appointment={selectedAppointment}
        onPay={handlePay}
        onStatusChange={handleStatusChange}
        loading={actionLoading}
        canPay={hasRole(['ADMIN', 'RECEPTIONIST'])}
      />
    </div>
  );
};

export default AppointmentsPage;
