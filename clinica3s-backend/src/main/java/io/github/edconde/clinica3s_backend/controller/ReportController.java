package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.dto.DashboardStatsDTO;
import io.github.edconde.clinica3s_backend.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
@Tag(name = "Reportes", description = "Estadísticas y reportes para Business Intelligence")
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Obtener estadísticas del dashboard",
               description = "Devuelve estadísticas generales: total pacientes, citas, ingresos, pagos pendientes, stats por mes y por dentista. Se puede filtrar opcionalmente por año.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos para esta operación")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @Parameter(description = "Año para filtrar las estadísticas (ej: 2025, 2026). Si no se especifica, se incluyen todos los años.")
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(reportService.getDashboardStats(year));
    }
}

