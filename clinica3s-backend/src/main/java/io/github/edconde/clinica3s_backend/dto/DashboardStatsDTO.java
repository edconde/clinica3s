package io.github.edconde.clinica3s_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalPatients;          // Número total de pacientes
    private Long totalAppointments;      // Número total de citas
    private Long completedAppointments;  // Número de citas completadas (pagadas o no)
    private Long unpaidAppointments;     // Número de citas pasadas atendidas pero no cobradas
    private Long pendingAppointments;    // Citas agendadas a partir de la hora actual (futuras)
    private Double totalRevenue;         // Ganancia (ingresos - costes)
    private Double totalInvoicing;       // Facturación total (suma de lo que han pagado los clientes)
    private Double totalCost;            // Coste para la clínica de los tratamientos realizados
    private Double pendingPayments;      // Dinero pendiente de cobrar de citas completadas no pagadas
    private List<MonthlyStats> monthlyStats;
    private List<DentistStats> dentistStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStats {
        private String month;           // Mes en formato yyyy-MM
        private Long appointments;      // Número de citas del mes
        private Double revenue;         // Ganancia neta del mes (ingresos - costes)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DentistStats {
        private Long dentistId;
        private String dentistName;
        private Long appointments;      // Número de citas del dentista
        private Double revenue;         // Ganancia neta del dentista (ingresos - costes)
        private Double commission;      // Comisión del dentista (basada en ingresos)
    }
}

