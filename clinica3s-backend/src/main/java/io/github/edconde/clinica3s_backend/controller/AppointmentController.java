package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.dto.AppointmentRequest;
import io.github.edconde.clinica3s_backend.dto.AppointmentResponse;
import io.github.edconde.clinica3s_backend.entity.AppUser;
import io.github.edconde.clinica3s_backend.entity.AppointmentStatus;
import io.github.edconde.clinica3s_backend.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Citas", description = "Gestión de citas médicas")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Operation(summary = "Listar citas (paginado con filtros)",
               description = "Obtiene las citas con filtros opcionales. ADMIN/RECEPTIONIST ven todas, DENTIST solo las suyas. " +
                       "Se pueden combinar múltiples filtros: patientId, dentistId, status, startDate, endDate.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de citas obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @GetMapping
    public ResponseEntity<Page<AppointmentResponse>> getAppointments(
            @Parameter(hidden = true) @AuthenticationPrincipal AppUser user,
            @Parameter(description = "ID del paciente") @RequestParam(required = false) Long patientId,
            @Parameter(description = "ID del dentista") @RequestParam(required = false) Long dentistId,
            @Parameter(description = "Estado de la cita (PENDING, COMPLETED, NO_SHOW)") @RequestParam(required = false) AppointmentStatus status,
            @Parameter(description = "Fecha de inicio (formato: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Fecha de fin (formato: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Paginación") @PageableDefault(size = 10, sort = "dateTime") Pageable pageable) {

        // Si el usuario es DENTIST, forzar el filtro por su dentistId
        Long effectiveDentistId = dentistId;
        if (user.getRole() == io.github.edconde.clinica3s_backend.entity.Role.DENTIST) {
            // El servicio ya maneja esto, pero aquí lo hacemos explícito para la API
            effectiveDentistId = appointmentService.getDentistIdForUser(user);
        }

        return ResponseEntity.ok(appointmentService.findWithFilters(patientId, effectiveDentistId, status, startDate, endDate, pageable));
    }

    @Operation(summary = "Obtener cita por ID", description = "Obtiene el detalle de una cita específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cita encontrada"),
            @ApiResponse(responseCode = "404", description = "Cita no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointment(
            @Parameter(description = "ID de la cita") @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    @Operation(summary = "Crear nueva cita", description = "Crea una nueva cita con los servicios especificados. Solo ADMIN y RECEPTIONIST.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cita creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para esta operación")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(request));
    }

    @Operation(summary = "Registrar pago de cita", description = "Marca todos los servicios de la cita como pagados y actualiza el estado a COMPLETED.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pago registrado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cita no encontrada"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para esta operación")
    })
    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<AppointmentResponse> payAppointment(
            @Parameter(description = "ID de la cita") @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.payAppointment(id));
    }

    @Operation(summary = "Actualizar estado de cita", description = "Cambia el estado de una cita (PENDING, COMPLETED, NO_SHOW)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cita no encontrada"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para esta operación")
    })
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DENTIST')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @Parameter(description = "ID de la cita") @PathVariable Long id,
            @Parameter(description = "Nuevo estado") @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }
}

