package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.entity.Specialty;
import io.github.edconde.clinica3s_backend.service.SpecialtyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
@Tag(name = "Especialidades", description = "Gestión de especialidades odontológicas")
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    @Operation(summary = "Listar especialidades", description = "Obtiene todas las especialidades odontológicas")
    @GetMapping
    public ResponseEntity<List<Specialty>> getAllSpecialties() {
        return ResponseEntity.ok(specialtyService.findAll());
    }

    @Operation(summary = "Obtener especialidad", description = "Obtiene una especialidad por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<Specialty> getSpecialty(@Parameter(description = "ID de la especialidad") @PathVariable Long id) {
        return ResponseEntity.ok(specialtyService.findById(id));
    }

    @Operation(summary = "Crear especialidad", description = "Crea una nueva especialidad. Solo ADMIN.")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialty> createSpecialty(@RequestBody Specialty specialty) {
        return ResponseEntity.ok(specialtyService.create(specialty));
    }

    @Operation(summary = "Actualizar especialidad", description = "Actualiza una especialidad existente. Solo ADMIN.")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialty> updateSpecialty(
            @Parameter(description = "ID de la especialidad") @PathVariable Long id,
            @RequestBody Specialty specialty) {
        return ResponseEntity.ok(specialtyService.update(id, specialty));
    }

    @Operation(summary = "Eliminar especialidad", description = "Elimina una especialidad. Solo ADMIN.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSpecialty(@Parameter(description = "ID de la especialidad") @PathVariable Long id) {
        specialtyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

