package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.entity.Service;
import io.github.edconde.clinica3s_backend.service.ServiceService;
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

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Servicios", description = "Gestión de servicios odontológicos")
public class ServiceController {

    private final ServiceService serviceService;

    @Operation(summary = "Listar servicios (paginado)", description = "Obtiene todos los servicios odontológicos disponibles con paginación")
    @GetMapping
    public ResponseEntity<Page<Service>> getAllServices(
            @Parameter(description = "Número de página (0-indexed)") @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(serviceService.findAll(pageable));
    }

    @Operation(summary = "Obtener servicio", description = "Obtiene un servicio por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<Service> getService(@Parameter(description = "ID del servicio") @PathVariable Long id) {
        return ResponseEntity.ok(serviceService.findById(id));
    }

    @Operation(summary = "Listar servicios por especialidad", description = "Obtiene todos los servicios de una especialidad específica")
    @GetMapping("/specialty/{specialtyId}")
    public ResponseEntity<List<Service>> getServicesBySpecialty(
            @Parameter(description = "ID de la especialidad") @PathVariable Long specialtyId) {
        return ResponseEntity.ok(serviceService.findBySpecialtyId(specialtyId));
    }

    @Operation(summary = "Crear servicio", description = "Crea un nuevo servicio. Solo ADMIN.")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        return ResponseEntity.ok(serviceService.create(service));
    }

    @Operation(summary = "Actualizar servicio", description = "Actualiza un servicio existente. Solo ADMIN.")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Service> updateService(
            @Parameter(description = "ID del servicio") @PathVariable Long id,
            @RequestBody Service service) {
        return ResponseEntity.ok(serviceService.update(id, service));
    }

    @Operation(summary = "Eliminar servicio", description = "Elimina un servicio. Solo ADMIN.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@Parameter(description = "ID del servicio") @PathVariable Long id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

