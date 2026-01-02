import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppointment } from '../services/appointmentService';
import { getDentists } from '../services/dentistService';
import { getPatients } from '../services/patientService';
import { getServices } from '../services/serviceService';
import { formatCurrency } from '../utils/formatters';

const NewAppointmentPage = () => {
  // Estado del formulario
  const [patient, setPatient] = useState(null);
  const [dentist, setDentist] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // Datos maestros
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  
  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Para agregar servicios
  const [selectedService, setSelectedService] = useState(null);
  const [serviceQuantity, setServiceQuantity] = useState(1);

  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      const [patientsResponse, dentistsResponse, servicesResponse] = await Promise.all([
        getPatients({ page: 0, size: 1000 }),
        getDentists({ page: 0, size: 100 }),
        getServices()
      ]);
      // Extraer content de respuestas paginadas
      setPatients(patientsResponse.content || patientsResponse || []);
      setDentists(dentistsResponse.content || dentistsResponse || []);
      setServices(servicesResponse.content || servicesResponse || []);
    } catch (err) {
      console.error('Error al cargar datos maestros:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos necesarios',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda de pacientes para AutoComplete
  const searchPatients = (event) => {
    const query = event.query.toLowerCase();
    const filtered = patients.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
  };

  // Template para mostrar pacientes en AutoComplete
  const patientTemplate = (item) => {
    return (
      <div className="flex align-items-center">
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-500 text-sm">{item.email}</div>
        </div>
      </div>
    );
  };

  // Agregar servicio a la lista
  const addService = () => {
    if (!selectedService) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Selecciona un servicio',
        life: 3000
      });
      return;
    }

    // Verificar si ya existe
    const existingIndex = selectedServices.findIndex(s => s.serviceId === selectedService.id);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad
      const updated = [...selectedServices];
      updated[existingIndex].quantity += serviceQuantity;
      setSelectedServices(updated);
    } else {
      // Agregar nuevo
      setSelectedServices([...selectedServices, {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.listPrice,
        quantity: serviceQuantity
      }]);
    }

    // Resetear selección
    setSelectedService(null);
    setServiceQuantity(1);
  };

  // Eliminar servicio de la lista
  const removeService = (index) => {
    const updated = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(updated);
  };

  // Actualizar cantidad de un servicio
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updated = [...selectedServices];
    updated[index].quantity = newQuantity;
    setSelectedServices(updated);
  };

  // Calcular total
  const calculateTotal = () => {
    return selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  };

  // Validar formulario
  const validate = () => {
    const newErrors = {};
    
    if (!patient) {
      newErrors.patient = 'Selecciona un paciente';
    }
    if (!dentist) {
      newErrors.dentist = 'Selecciona un dentista';
    }
    if (!dateTime) {
      newErrors.dateTime = 'Selecciona fecha y hora';
    }
    if (selectedServices.length === 0) {
      newErrors.services = 'Agrega al menos un servicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar cita
  const handleSave = async () => {
    if (!validate()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor, completa todos los campos requeridos',
        life: 4000
      });
      return;
    }

    try {
      setSaving(true);

      const appointmentData = {
        dateTime: dateTime.toISOString(),
        patientId: patient.id,
        dentistId: dentist.id,
        services: selectedServices.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity
        }))
      };

      await createAppointment(appointmentData);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita creada correctamente',
        life: 3000
      });

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/appointments');
      }, 1000);

    } catch (err) {
      console.error('Error al crear cita:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo crear la cita',
        life: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  // Templates para la tabla de servicios
  const priceTemplate = (rowData) => {
    return formatCurrency(rowData.price);
  };

  const quantityTemplate = (rowData, { rowIndex }) => {
    return (
      <InputNumber
        value={rowData.quantity}
        onValueChange={(e) => updateQuantity(rowIndex, e.value)}
        showButtons
        buttonLayout="horizontal"
        min={1}
        max={99}
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        incrementButtonClassName="p-button-text p-button-sm"
        decrementButtonClassName="p-button-text p-button-sm"
        inputClassName="w-3rem text-center"
      />
    );
  };

  const subtotalTemplate = (rowData) => {
    return formatCurrency(rowData.price * rowData.quantity);
  };

  const removeTemplate = (rowData, { rowIndex }) => {
    return (
      <Button
        icon="pi pi-trash"
        rounded
        outlined
        severity="danger"
        size="small"
        onClick={() => removeService(rowIndex)}
      />
    );
  };

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

      {/* Header */}
      <div className="flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-900 m-0">Nueva Cita</h2>
          <p className="text-500 mt-1 mb-0">Completa los datos para agendar una nueva cita</p>
        </div>
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate('/appointments')}
        />
      </div>

      <div className="grid">
        {/* Datos principales */}
        <div className="col-12 lg:col-8">
          <Card title="Información de la Cita" className="shadow-2 mb-4">
            <div className="grid">
              {/* Paciente */}
              <div className="col-12 md:col-6">
                <label className="block text-900 font-medium mb-2">
                  Paciente <span className="text-red-500">*</span>
                </label>
                <AutoComplete
                  value={patient}
                  suggestions={filteredPatients}
                  completeMethod={searchPatients}
                  field="name"
                  itemTemplate={patientTemplate}
                  onChange={(e) => setPatient(e.value)}
                  placeholder="Buscar paciente..."
                  dropdown
                  className={`w-full ${errors.patient ? 'p-invalid' : ''}`}
                />
                {errors.patient && <small className="p-error">{errors.patient}</small>}
              </div>

              {/* Dentista */}
              <div className="col-12 md:col-6">
                <label className="block text-900 font-medium mb-2">
                  Dentista <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={dentist}
                  options={dentists}
                  onChange={(e) => setDentist(e.value)}
                  optionLabel="user.name"
                  placeholder="Seleccionar dentista"
                  className={`w-full ${errors.dentist ? 'p-invalid' : ''}`}
                  filter
                />
                {errors.dentist && <small className="p-error">{errors.dentist}</small>}
              </div>

              {/* Fecha y Hora */}
              <div className="col-12 md:col-6">
                <label className="block text-900 font-medium mb-2">
                  Fecha y Hora <span className="text-red-500">*</span>
                </label>
                <Calendar
                  value={dateTime}
                  onChange={(e) => setDateTime(e.value)}
                  showTime
                  hourFormat="24"
                  placeholder="Seleccionar fecha y hora"
                  className={`w-full ${errors.dateTime ? 'p-invalid' : ''}`}
                  showIcon
                  minDate={new Date()}
                  dateFormat="dd/mm/yy"
                />
                {errors.dateTime && <small className="p-error">{errors.dateTime}</small>}
              </div>
            </div>
          </Card>

          {/* Servicios */}
          <Card title="Servicios" className="shadow-2">
            {/* Agregar servicio */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                <Dropdown
                  value={selectedService}
                  options={services}
                  onChange={(e) => setSelectedService(e.value)}
                  optionLabel="name"
                  placeholder="Seleccionar servicio"
                  className="w-full"
                  filter
                  itemTemplate={(option) => (
                    <div className="flex justify-content-between align-items-center">
                      <span>{option.name}</span>
                      <span className="text-500">{formatCurrency(option.listPrice)}</span>
                    </div>
                  )}
                />
              </div>
              <InputNumber
                value={serviceQuantity}
                onValueChange={(e) => setServiceQuantity(e.value)}
                showButtons
                min={1}
                max={99}
                className="w-6rem"
              />
              <Button
                label="Agregar"
                icon="pi pi-plus"
                onClick={addService}
              />
            </div>

            {errors.services && (
              <Message severity="warn" text={errors.services} className="w-full mb-3" />
            )}

            {/* Tabla de servicios seleccionados */}
            <DataTable
              value={selectedServices}
              emptyMessage="No hay servicios agregados"
              size="small"
            >
              <Column field="serviceName" header="Servicio" />
              <Column header="Precio Unit." body={priceTemplate} style={{ width: '120px' }} />
              <Column header="Cantidad" body={quantityTemplate} style={{ width: '150px' }} />
              <Column header="Subtotal" body={subtotalTemplate} style={{ width: '120px' }} />
              <Column body={removeTemplate} style={{ width: '60px' }} />
            </DataTable>
          </Card>
        </div>

        {/* Resumen */}
        <div className="col-12 lg:col-4">
          <Card title="Resumen" className="shadow-2 sticky" style={{ top: '1rem' }}>
            {/* Datos del paciente seleccionado */}
            {patient && (
              <div className="mb-4">
                <h5 className="text-500 font-medium mb-2">Paciente</h5>
                <p className="text-900 font-medium m-0">{patient.name}</p>
                <p className="text-500 text-sm m-0">{patient.email}</p>
              </div>
            )}

            {/* Datos del dentista seleccionado */}
            {dentist && (
              <div className="mb-4">
                <h5 className="text-500 font-medium mb-2">Dentista</h5>
                <p className="text-900 font-medium m-0">{dentist.user?.name}</p>
                <p className="text-500 text-sm m-0">Lic: {dentist.licenseNumber}</p>
              </div>
            )}

            {/* Fecha seleccionada */}
            {dateTime && (
              <div className="mb-4">
                <h5 className="text-500 font-medium mb-2">Fecha y Hora</h5>
                <p className="text-900 font-medium m-0">
                  {dateTime.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-500 text-sm m-0">
                  {dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}

            <Divider />

            {/* Total de servicios */}
            <div className="mb-3">
              <h5 className="text-500 font-medium mb-2">Servicios ({selectedServices.length})</h5>
              {selectedServices.map((s, index) => (
                <div key={index} className="flex justify-content-between text-sm mb-1">
                  <span className="text-700">{s.serviceName} x{s.quantity}</span>
                  <span className="text-900">{formatCurrency(s.price * s.quantity)}</span>
                </div>
              ))}
            </div>

            <Divider />

            {/* Total */}
            <div className="flex justify-content-between align-items-center mb-4">
              <span className="text-xl font-bold text-900">Total</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
            </div>

            {/* Botón guardar */}
            <Button
              label={saving ? 'Guardando...' : 'Crear Cita'}
              icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              className="w-full"
              disabled={saving}
              onClick={handleSave}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentPage;
