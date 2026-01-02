package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.entity.Patient;
import io.github.edconde.clinica3s_backend.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Pacientes", description = "Gestión de pacientes de la clínica")
public class PatientController {

    private final PatientService patientService;

    @Operation(summary = "Listar pacientes (paginado con filtros)",
               description = "Obtiene todos los pacientes registrados con paginación. Filtros opcionales: nombre, teléfono, email.")
    @GetMapping
    public ResponseEntity<Page<Patient>> getAllPatients(
            @Parameter(description = "Filtrar por nombre (búsqueda parcial)") @RequestParam(required = false) String name,
            @Parameter(description = "Filtrar por teléfono (búsqueda parcial)") @RequestParam(required = false) String phone,
            @Parameter(description = "Filtrar por email (búsqueda parcial)") @RequestParam(required = false) String email,
            @Parameter(description = "Paginación") @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(patientService.findWithFilters(name, phone, email, pageable));
    }

    @Operation(summary = "Obtener paciente", description = "Obtiene un paciente por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatient(@Parameter(description = "ID del paciente") @PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @Operation(summary = "Crear paciente", description = "Registra un nuevo paciente. Solo ADMIN y RECEPTIONIST.")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.create(patient));
    }

    @Operation(summary = "Actualizar paciente", description = "Actualiza los datos de un paciente existente. Solo ADMIN y RECEPTIONIST.")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Patient> updatePatient(
            @Parameter(description = "ID del paciente") @PathVariable Long id,
            @RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.update(id, patient));
    }

    @Operation(summary = "Eliminar paciente", description = "Elimina un paciente. Solo ADMIN.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePatient(@Parameter(description = "ID del paciente") @PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

