import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useEffect, useRef, useState } from 'react';
import {
    createSpecialty,
    deleteSpecialty,
    getSpecialties,
    updateSpecialty
} from '../services/specialtyService';

const SpecialtiesPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const data = await getSpecialties();
      setSpecialties(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las especialidades',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setFormData({ name: '' });
    setEditMode(false);
    setSelectedSpecialty(null);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const openEdit = (specialty) => {
    setFormData({ name: specialty.name });
    setEditMode(true);
    setSelectedSpecialty(specialty);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSubmitted(false);
  };

  const saveSpecialty = async () => {
    setSubmitted(true);

    if (!formData.name?.trim()) {
      return;
    }

    try {
      if (editMode && selectedSpecialty) {
        await updateSpecialty(selectedSpecialty.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Especialidad actualizada correctamente',
          life: 3000
        });
      } else {
        await createSpecialty(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Especialidad creada correctamente',
          life: 3000
        });
      }
      hideDialog();
      loadSpecialties();
    } catch (error) {
      console.error('Error al guardar especialidad:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'No se pudo guardar la especialidad',
        life: 3000
      });
    }
  };

  const confirmDelete = (specialty) => {
    confirmDialog({
      message: `¿Está seguro de eliminar la especialidad "${specialty.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(specialty)
    });
  };

  const handleDelete = async (specialty) => {
    try {
      await deleteSpecialty(specialty.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Especialidad eliminada correctamente',
        life: 3000
      });
      loadSpecialties();
    } catch (error) {
      console.error('Error al eliminar especialidad:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'No se pudo eliminar la especialidad. Puede que esté en uso.',
        life: 3000
      });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          severity="warning"
          onClick={() => openEdit(rowData)}
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDelete(rowData)}
          tooltip="Eliminar"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        outlined
        onClick={hideDialog}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={saveSpecialty}
      />
    </div>
  );

  // Toolbar
  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Nueva Especialidad"
        icon="pi pi-plus"
        onClick={openNew}
      />
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        onClick={loadSpecialties}
      />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <Toolbar className="mb-4 border-none p-0 bg-transparent" left={leftToolbarTemplate} />

      <DataTable
        value={specialties}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage="No se encontraron especialidades"
        stripedRows
        className="shadow-2"
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" sortable style={{ width: '100px' }} />
        <Column field="name" header="Nombre" sortable />
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          style={{ width: '150px' }}
          exportable={false}
        />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        style={{ width: '450px' }}
        header={editMode ? 'Editar Especialidad' : 'Nueva Especialidad'}
        modal
        dismissableMask
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Nombre *
          </label>
          <InputText
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
            className={submitted && !formData.name?.trim() ? 'p-invalid' : ''}
          />
          {submitted && !formData.name?.trim() && (
            <small className="p-error">El nombre es requerido.</small>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default SpecialtiesPage;
