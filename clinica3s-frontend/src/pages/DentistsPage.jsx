import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getDentists } from '../services/dentistService';
import { getSpecialties } from '../services/specialtyService';
import { DEFAULT_PAGINATION } from '../utils/constants';
import { formatPercentage } from '../utils/formatters';

const DentistsPage = () => {
  const [dentists, setDentists] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros del servidor
  const [nameFilter, setNameFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState(null);

  const toast = useRef(null);

  const loadDentists = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (nameFilter) params.name = nameFilter;
      if (specialtyFilter) params.specialtyId = specialtyFilter;
      
      const response = await getDentists(params);
      // getDentists devuelve objeto paginado, extraer content
      setDentists(response.content || response);
    } catch (err) {
      console.error('Error al cargar dentistas:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los dentistas',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  }, [nameFilter, specialtyFilter]);

  useEffect(() => {
    loadSpecialties();
  }, []);

  useEffect(() => {
    loadDentists();
  }, [loadDentists]);

  const loadSpecialties = async () => {
    try {
      const data = await getSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
    }
  };

  const clearFilters = () => {
    setNameFilter('');
    setSpecialtyFilter(null);
  };

  // Templates de columnas
  const commissionTemplate = (rowData) => {
    return formatPercentage(rowData.commissionRate);
  };

  const specialtiesTemplate = (rowData) => {
    if (!rowData.specialties?.length) {
      return <span className="text-500">Sin especialidades</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.specialties.map((spec) => (
          <Tag key={spec.id} value={spec.name} severity="info" />
        ))}
      </div>
    );
  };

  const statusTemplate = (rowData) => {
    const isActive = rowData.user?.enabled !== false;
    return (
      <Tag 
        value={isActive ? 'Activo' : 'Inactivo'} 
        severity={isActive ? 'success' : 'danger'} 
      />
    );
  };

  // Toolbar
  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        onClick={loadDentists}
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex align-items-center text-500 text-sm">
      <i className="pi pi-info-circle mr-2"></i>
      <span>Los dentistas se crean desde el panel de Usuarios con rol "Dentista"</span>
    </div>
  );

  if (loading && dentists.length === 0) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />

      <Toolbar className="mb-4 border-none p-0 bg-transparent" left={leftToolbarTemplate} right={rightToolbarTemplate} />

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
            className="w-full lg:w-auto"
          />
        </div>
      </div>

      <DataTable
        value={dentists}
        paginator
        rows={DEFAULT_PAGINATION.rows}
        rowsPerPageOptions={DEFAULT_PAGINATION.rowsPerPageOptions}
        dataKey="id"
        loading={loading}
        emptyMessage="No se encontraron dentistas"
        className="shadow-2"
        stripedRows
      >
        <Column field="user.name" header="Nombre" sortable style={{ minWidth: '200px' }} />
        <Column field="licenseNumber" header="Nº Licencia" sortable style={{ minWidth: '150px' }} />
        <Column 
          field="commissionRate" 
          header="Comisión" 
          body={commissionTemplate}
          sortable 
          style={{ minWidth: '100px' }} 
        />
        <Column 
          header="Especialidades" 
          body={specialtiesTemplate}
          style={{ minWidth: '250px' }} 
        />
        <Column 
          header="Estado" 
          body={statusTemplate}
          style={{ minWidth: '100px' }} 
        />
      </DataTable>
    </div>
  );
};

export default DentistsPage;
