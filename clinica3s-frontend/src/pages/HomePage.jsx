import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentDetailDialog from '../components/appointments/AppointmentDetailDialog';
import { useAuth } from '../context/AuthContext';
import { getAppointments, payAppointment, updateAppointmentStatus } from '../services/appointmentService';
import { getDentists } from '../services/dentistService';
import { STATUS_COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

// Horas del día para el calendario (8:00 - 20:00)
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dentists, setDentists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const canPay = hasRole(['ADMIN', 'RECEPTIONIST']);

  // Cargar dentistas
  const loadDentists = async () => {
    try {
      const response = await getDentists({ page: 0, size: 100 });
      const dentistsData = response.content || response || [];
      setDentists(dentistsData);
    } catch (err) {
      console.error('Error al cargar dentistas:', err);
    }
  };

  // Cargar citas del día seleccionado
  const loadDayAppointments = useCallback(async (date) => {
    try {
      setLoading(true);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const params = {
        startDate: startOfDay.toISOString().slice(0, 19),
        endDate: endOfDay.toISOString().slice(0, 19),
        page: 0,
        size: 200
      };

      const response = await getAppointments(params);
      setAppointments(response.content || []);

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
  }, []);

  useEffect(() => {
    loadDentists();
  }, []);

  useEffect(() => {
    loadDayAppointments(selectedDate);
  }, [loadDayAppointments, selectedDate]);

  // Navegar al día anterior
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navegar al día siguiente
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Ir a hoy
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Obtener citas de un dentista en una hora específica
  const getAppointmentsForSlot = (dentistId, hour) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      const aptHour = aptDate.getHours();
      return apt.dentist?.id === dentistId && aptHour === hour;
    });
  };

  // Abrir detalle de cita
  const openAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailVisible(true);
  };

  // Cambiar estado de cita
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
          loadDayAppointments(selectedDate);
          setDetailVisible(false);
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

  // Registrar pago
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
          loadDayAppointments(selectedDate);
          setDetailVisible(false);
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

  // Formatear hora
  const formatHour = (hour) => {
    return `${String(hour).padStart(2, '0')}:00`;
  };

  // Formatear fecha
  const formatDateHeader = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Renderizar celda de cita
  const renderAppointmentCell = (dentistId, hour) => {
    const slotAppointments = getAppointmentsForSlot(dentistId, hour);
    
    if (slotAppointments.length === 0) {
      return (
        <div className="h-full w-full min-h-4rem"></div>
      );
    }

    return (
      <div className="flex flex-column gap-1 p-1">
        {slotAppointments.map(apt => {
          const statusConfig = STATUS_COLORS[apt.status];
          const aptTime = new Date(apt.dateTime);
          
          return (
            <div
              key={apt.id}
              className={`appointment-cell-${apt.id} p-2 border-round cursor-pointer transition-all transition-duration-150 hover:shadow-2`}
              style={{
                backgroundColor: statusConfig?.background || '#f8fafc',
                borderLeft: `3px solid ${statusConfig?.color || '#64748b'}`
              }}
              onClick={() => openAppointmentDetail(apt)}
            >
              <Tooltip target={`.appointment-cell-${apt.id}`} position="top">
                <div className="text-sm">
                  <div className="font-bold">{apt.patient?.name}</div>
                  <div>{aptTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div>{formatCurrency(apt.totalAmount)}</div>
                </div>
              </Tooltip>
              <div className="text-xs font-bold mb-1" style={{ color: statusConfig?.color }}>
                {aptTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm font-medium text-overflow-ellipsis overflow-hidden white-space-nowrap">
                {apt.patient?.name}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />

      {/* Header con navegación */}
      <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="flex align-items-center gap-2">
          <Button
            icon="pi pi-chevron-left"
            rounded
            text
            onClick={goToPreviousDay}
            tooltip="Día anterior"
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button
            label="Hoy"
            outlined
            size="small"
            onClick={goToToday}
          />
          <Button
            icon="pi pi-chevron-right"
            rounded
            text
            onClick={goToNextDay}
            tooltip="Día siguiente"
            tooltipOptions={{ position: 'bottom' }}
          />
          <Calendar
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            className="ml-2"
            style={{ width: '180px' }}
          />
        </div>
        
        <h2 className="text-xl font-bold text-900 m-0 capitalize">
          {formatDateHeader(selectedDate)}
        </h2>

        <Button
          label="Nueva Cita"
          icon="pi pi-plus"
          onClick={() => navigate('/appointments/new')}
        />
      </div>

      {/* Calendario de citas */}
      {loading ? (
        <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <ProgressSpinner />
        </div>
      ) : dentists.length === 0 ? (
        <div className="surface-card shadow-2 border-round p-5 text-center">
          <i className="pi pi-users text-4xl text-300 mb-3"></i>
          <p className="text-500 m-0">No hay dentistas registrados</p>
        </div>
      ) : (
        <div className="surface-card shadow-2 border-round overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: `${dentists.length * 180 + 80}px`, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <th 
                    className="p-3 text-center font-bold border-bottom-1 surface-border"
                    style={{ 
                      width: '80px', 
                      position: 'sticky', 
                      left: 0, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      zIndex: 1,
                      boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <i className="pi pi-clock mb-1" style={{ fontSize: '1.2rem' }}></i>
                    <div className="text-sm">Hora</div>
                  </th>
                  {dentists.map((dentist, index) => (
                    <th 
                      key={dentist.id}
                      className="p-3 text-center font-bold border-bottom-1 border-left-1 surface-border"
                      style={{ 
                        minWidth: '180px',
                        color: '#ffffff',
                        borderLeft: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <div className="flex flex-column align-items-center gap-2">
                        <div 
                          className="border-circle flex align-items-center justify-content-center"
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <i className="pi pi-user" style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <span className="font-semibold">{dentist.user?.name || `Dentista ${dentist.id}`}</span>
                        {dentist.specialties && dentist.specialties[0] && (
                          <span className="text-xs opacity-80">{dentist.specialties[0].name}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour} className="hover:surface-50">
                    <td 
                      className="p-3 text-center font-semibold border-bottom-1 surface-border"
                      style={{ 
                        position: 'sticky', 
                        left: 0, 
                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        color: '#6366f1',
                        fontSize: '0.95rem',
                        zIndex: 1,
                        boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      {formatHour(hour)}
                    </td>
                    {dentists.map((dentist, index) => (
                      <td 
                        key={`${dentist.id}-${hour}`}
                        className="border-bottom-1 border-left-1 surface-border"
                        style={{ 
                          verticalAlign: 'top', 
                          minHeight: '4rem',
                          backgroundColor: index % 2 === 0 ? '#fafbfc' : '#f8f9fa'
                        }}
                      >
                        {renderAppointmentCell(dentist.id, hour)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex justify-content-center gap-4 mt-4">
        <div className="flex align-items-center gap-2">
          <div className="w-1rem h-1rem border-round" style={{ backgroundColor: STATUS_COLORS.PENDING?.background, border: `2px solid ${STATUS_COLORS.PENDING?.color}` }}></div>
          <span className="text-sm text-500">Pendiente</span>
        </div>
        <div className="flex align-items-center gap-2">
          <div className="w-1rem h-1rem border-round" style={{ backgroundColor: STATUS_COLORS.COMPLETED?.background, border: `2px solid ${STATUS_COLORS.COMPLETED?.color}` }}></div>
          <span className="text-sm text-500">Completada</span>
        </div>
        <div className="flex align-items-center gap-2">
          <div className="w-1rem h-1rem border-round" style={{ backgroundColor: STATUS_COLORS.NO_SHOW?.background, border: `2px solid ${STATUS_COLORS.NO_SHOW?.color}` }}></div>
          <span className="text-sm text-500">No asistió</span>
        </div>
      </div>

      {/* Dialog de detalle usando componente reutilizable */}
      <AppointmentDetailDialog
        visible={detailVisible}
        onHide={() => setDetailVisible(false)}
        appointment={selectedAppointment}
        onPay={handlePay}
        onStatusChange={handleStatusChange}
        loading={actionLoading}
        canPay={canPay}
      />

      <ConfirmDialog />
    </div>
  );
};

export default HomePage;
