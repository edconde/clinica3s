package io.github.edconde.clinica3s_backend.dto;

import io.github.edconde.clinica3s_backend.entity.AppointmentStatus;
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
public class AppointmentResponse {
    private Long id;
    private LocalDateTime dateTime;
    private AppointmentStatus status;
    private Double totalAmount;
    private PatientInfo patient;
    private DentistInfo dentist;
    private List<DetailInfo> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientInfo {
        private Long id;
        private String name;
        private String phone;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DentistInfo {
        private Long id;
        private String name;
        private String licenseNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailInfo {
        private Long id;
        private String serviceName;
        private Integer quantity;
        private Double priceApplied;
        private LocalDateTime paymentDate;
        private Boolean paid;
    }
}

