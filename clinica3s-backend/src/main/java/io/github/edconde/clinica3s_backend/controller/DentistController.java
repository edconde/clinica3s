package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.entity.Dentist;
import io.github.edconde.clinica3s_backend.service.DentistService;
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
@RequestMapping("/api/dentists")
@RequiredArgsConstructor
@Tag(name = "Dentistas", description = "Gestión de dentistas de la clínica")
public class DentistController {

    private final DentistService dentistService;

    @Operation(summary = "Listar dentistas (paginado con filtros)",
               description = "Obtiene todos los dentistas de la clínica con paginación. Filtros opcionales: nombre, especialidad.")
    @GetMapping
    public ResponseEntity<Page<Dentist>> getAllDentists(
            @Parameter(description = "Filtrar por nombre (búsqueda parcial)") @RequestParam(required = false) String name,
            @Parameter(description = "Filtrar por ID de especialidad") @RequestParam(required = false) Long specialtyId,
            @Parameter(description = "Paginación") @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(dentistService.findWithFilters(name, specialtyId, pageable));
    }

    @Operation(summary = "Obtener dentista", description = "Obtiene un dentista por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<Dentist> getDentist(@Parameter(description = "ID del dentista") @PathVariable Long id) {
        return ResponseEntity.ok(dentistService.findById(id));
    }

    @Operation(summary = "Actualizar dentista", description = "Actualiza los datos de un dentista. Solo ADMIN.")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dentist> updateDentist(
            @Parameter(description = "ID del dentista") @PathVariable Long id,
            @RequestBody Dentist dentist) {
        return ResponseEntity.ok(dentistService.update(id, dentist));
    }

    @Operation(summary = "Eliminar dentista", description = "Elimina un dentista. Solo ADMIN.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDentist(@Parameter(description = "ID del dentista") @PathVariable Long id) {
        dentistService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

