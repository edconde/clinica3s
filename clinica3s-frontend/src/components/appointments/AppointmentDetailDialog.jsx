import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { STATUS_COLORS } from '../../utils/constants';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

/**
 * Dialog para mostrar detalles de una cita
 * @param {Object} props
 * @param {boolean} props.visible - Si el dialog está visible
 * @param {Function} props.onHide - Función para cerrar el dialog
 * @param {Object} props.appointment - Datos de la cita
 * @param {Function} props.onPay - Función para registrar pago
 * @param {Function} props.onStatusChange - Función para cambiar estado
 * @param {boolean} props.loading - Si hay una operación en curso
 */
const AppointmentDetailDialog = ({ 
  visible, 
  onHide, 
  appointment, 
  onPay, 
  onStatusChange,
  loading,
  canPay = true
}) => {
  if (!appointment) return null;

  const { patient, dentist, details, status, totalAmount, dateTime, id } = appointment;

  // Calcular total pagado y pendiente
  const totalPaid = details?.filter(d => d.paid).reduce((sum, d) => sum + (d.priceApplied * d.quantity), 0) || 0;
  const totalPending = totalAmount - totalPaid;
  const hasPendingPayments = totalPending > 0;

  // Template para el estado de pago de cada servicio
  const paidTemplate = (rowData) => {
    return rowData.paid ? (
      <Tag severity="success" value="Pagado" />
    ) : (
      <Tag severity="warning" value="Pendiente" />
    );
  };

  // Template para el precio
  const priceTemplate = (rowData) => {
    return formatCurrency(rowData.priceApplied * rowData.quantity);
  };

  // Footer del dialog
  const footer = (
    <div className="flex flex-wrap justify-content-between gap-2">
      <div className="flex gap-2">
        {status !== 'COMPLETED' && (
          <Button
            label="Completar"
            icon="pi pi-check"
            severity="success"
            outlined
            onClick={() => onStatusChange(id, 'COMPLETED')}
            loading={loading}
          />
        )}
        {status !== 'NO_SHOW' && status !== 'COMPLETED' && (
          <Button
            label="No asistió"
            icon="pi pi-times"
            severity="danger"
            outlined
            onClick={() => onStatusChange(id, 'NO_SHOW')}
            loading={loading}
          />
        )}
      </div>
      <div className="flex gap-2">
        {hasPendingPayments && (
          <Button
            label="Registrar Pago"
            icon="pi pi-wallet"
            onClick={() => onPay(id)}
            loading={loading}
            disabled={!canPay}
            tooltip={!canPay ? 'No tienes permisos para registrar pagos' : undefined}
            tooltipOptions={{ position: 'top' }}
          />
        )}
        <Button
          label="Cerrar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          onClick={onHide}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Detalle de Cita"
      footer={footer}
      style={{ width: '700px' }}
      modal
      dismissableMask
      className="p-fluid"
      breakpoints={{ '960px': '90vw' }}
    >
      {/* Información general */}
      <div className="grid">
        <div className="col-12 md:col-6">
          <div className="mb-3">
            <label className="block text-500 text-sm mb-1">Fecha y Hora</label>
            <span className="text-900 font-medium">{formatDateTime(dateTime)}</span>
          </div>
          <div className="mb-3">
            <label className="block text-500 text-sm mb-1">Estado</label>
            <Tag 
              value={STATUS_COLORS[status]?.label || status} 
              severity={STATUS_COLORS[status]?.severity}
            />
          </div>
        </div>
        <div className="col-12 md:col-6">
          <div className="mb-3">
            <label className="block text-500 text-sm mb-1">Paciente</label>
            <span className="text-900 font-medium">{patient?.name}</span>
            {patient?.phone && (
              <span className="block text-500 text-sm">{patient.phone}</span>
            )}
          </div>
          <div className="mb-3">
            <label className="block text-500 text-sm mb-1">Dentista</label>
            <span className="text-900 font-medium">{dentist?.user?.name || dentist?.name || '-'}</span>
            {dentist?.licenseNumber && (
              <span className="block text-500 text-sm">Lic: {dentist.licenseNumber}</span>
            )}
          </div>
        </div>
      </div>

      <Divider />

      {/* Tabla de servicios */}
      <h4 className="mt-0 mb-3">Servicios</h4>
      <DataTable value={details || []} size="small" className="mb-4">
        <Column field="serviceName" header="Servicio" />
        <Column field="quantity" header="Cant." style={{ width: '70px' }} />
        <Column header="Precio" body={priceTemplate} style={{ width: '120px' }} />
        <Column header="Estado" body={paidTemplate} style={{ width: '100px' }} />
      </DataTable>

      {/* Resumen de pago */}
      <div className="surface-100 border-round p-3">
        <div className="flex justify-content-between mb-2">
          <span className="text-500">Total:</span>
          <span className="text-900 font-bold">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-content-between mb-2">
          <span className="text-500">Pagado:</span>
          <span className="text-green-500 font-medium">{formatCurrency(totalPaid)}</span>
        </div>
        <Divider className="my-2" />
        <div className="flex justify-content-between">
          <span className="text-900 font-medium">Pendiente:</span>
          <span className={`font-bold ${hasPendingPayments ? 'text-orange-500' : 'text-green-500'}`}>
            {formatCurrency(totalPending)}
          </span>
        </div>
      </div>
    </Dialog>
  );
};

export default AppointmentDetailDialog;
