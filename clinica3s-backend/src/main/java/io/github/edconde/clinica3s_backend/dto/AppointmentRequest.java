package io.github.edconde.clinica3s_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {

    @NotNull(message = "La fecha y hora son requeridas")
    private LocalDateTime dateTime;

    @NotNull(message = "El paciente es requerido")
    private Long patientId;

    @NotNull(message = "El dentista es requerido")
    private Long dentistId;

    @NotNull(message = "Los servicios son requeridos")
    private List<ServiceDetailRequest> services;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceDetailRequest {
        @NotNull(message = "El ID del servicio es requerido")
        private Long serviceId;
        private Integer quantity;
    }
}

