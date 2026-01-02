package io.github.edconde.clinica3s_backend.service;

import io.github.edconde.clinica3s_backend.dto.DashboardStatsDTO;
import io.github.edconde.clinica3s_backend.entity.Appointment;
import io.github.edconde.clinica3s_backend.entity.AppointmentDetail;
import io.github.edconde.clinica3s_backend.entity.AppointmentStatus;
import io.github.edconde.clinica3s_backend.entity.Dentist;
import io.github.edconde.clinica3s_backend.repository.AppointmentRepository;
import io.github.edconde.clinica3s_backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public DashboardStatsDTO getDashboardStats(Integer year) {
        List<Appointment> allAppointments = appointmentRepository.findAll();

        // Filtrar por año si se proporciona
        List<Appointment> filteredAppointments = allAppointments;
        if (year != null) {
            filteredAppointments = allAppointments.stream()
                    .filter(a -> a.getDateTime().getYear() == year)
                    .toList();
        }

        LocalDateTime now = LocalDateTime.now();

        long totalPatients = patientRepository.count();
        long totalAppointments = filteredAppointments.size();

        // Citas completadas (pagadas o no)
        long completedAppointments = filteredAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        // Citas futuras (agendadas a partir de la hora actual)
        long pendingAppointments = filteredAppointments.stream()
                .filter(a -> a.getDateTime().isAfter(now))
                .count();

        // Citas pasadas atendidas pero no cobradas (al menos un detalle sin paymentDate)
        long unpaidAppointments = filteredAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .filter(a -> a.getDetails().stream().anyMatch(d -> d.getPaymentDate() == null))
                .count();

        double totalInvoicing = 0.0;  // Lo que han pagado los clientes
        double totalCost = 0.0;       // Coste para la clínica
        double pendingPayments = 0.0; // Dinero pendiente de cobrar

        for (Appointment appointment : filteredAppointments) {
            for (AppointmentDetail detail : appointment.getDetails()) {
                double amount = detail.getPriceApplied() * detail.getQuantity();
                double cost = detail.getService().getStandardCost() * detail.getQuantity();

                // Si la cita está completada, el coste se ha incurrido
                if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                    totalCost += cost;

                    if (detail.getPaymentDate() != null) {
                        totalInvoicing += amount;
                    } else {
                        pendingPayments += amount;
                    }
                }
            }
        }

        // Ganancia = facturación - costes
        double totalRevenue = totalInvoicing - totalCost;

        List<DashboardStatsDTO.MonthlyStats> monthlyStats = getMonthlyStats(filteredAppointments);
        List<DashboardStatsDTO.DentistStats> dentistStats = getDentistStats(filteredAppointments);

        return DashboardStatsDTO.builder()
                .totalPatients(totalPatients)
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .unpaidAppointments(unpaidAppointments)
                .pendingAppointments(pendingAppointments)
                .totalRevenue(totalRevenue)
                .totalInvoicing(totalInvoicing)
                .totalCost(totalCost)
                .pendingPayments(pendingPayments)
                .monthlyStats(monthlyStats)
                .dentistStats(dentistStats)
                .build();
    }

    private List<DashboardStatsDTO.MonthlyStats> getMonthlyStats(List<Appointment> appointments) {
        Map<YearMonth, DashboardStatsDTO.MonthlyStats> statsMap = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Appointment appointment : appointments) {
            YearMonth yearMonth = YearMonth.from(appointment.getDateTime());

            DashboardStatsDTO.MonthlyStats stats = statsMap.computeIfAbsent(yearMonth,
                    ym -> DashboardStatsDTO.MonthlyStats.builder()
                            .month(ym.format(formatter))
                            .appointments(0L)
                            .revenue(0.0)
                            .build());

            stats.setAppointments(stats.getAppointments() + 1);

            // Solo calcular ingresos y costes para citas completadas
            if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                for (AppointmentDetail detail : appointment.getDetails()) {
                    double cost = detail.getService().getStandardCost() * detail.getQuantity();

                    // Si está pagado, sumar a la ganancia (ingreso - coste)
                    if (detail.getPaymentDate() != null) {
                        double amount = detail.getPriceApplied() * detail.getQuantity();
                        stats.setRevenue(stats.getRevenue() + amount - cost);
                    } else {
                        // Si no está pagado pero la cita está completada, restar el coste
                        stats.setRevenue(stats.getRevenue() - cost);
                    }
                }
            }
        }

        return new ArrayList<>(statsMap.values());
    }

    private List<DashboardStatsDTO.DentistStats> getDentistStats(List<Appointment> appointments) {
        Map<Long, DashboardStatsDTO.DentistStats> statsMap = new HashMap<>();

        for (Appointment appointment : appointments) {
            Dentist dentist = appointment.getDentist();

            DashboardStatsDTO.DentistStats stats = statsMap.computeIfAbsent(dentist.getId(),
                    id -> DashboardStatsDTO.DentistStats.builder()
                            .dentistId(dentist.getId())
                            .dentistName(dentist.getUser().getName())
                            .appointments(0L)
                            .revenue(0.0)
                            .commission(0.0)
                            .build());

            stats.setAppointments(stats.getAppointments() + 1);

            // Solo calcular para citas completadas
            if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                for (AppointmentDetail detail : appointment.getDetails()) {
                    double cost = detail.getService().getStandardCost() * detail.getQuantity();

                    if (detail.getPaymentDate() != null) {
                        double amount = detail.getPriceApplied() * detail.getQuantity();
                        // Revenue es ganancia neta (ingreso - coste)
                        stats.setRevenue(stats.getRevenue() + amount - cost);

                        double commissionRate = dentist.getCommissionRate() != null ? dentist.getCommissionRate() : 0.0;
                        stats.setCommission(stats.getCommission() + (amount * commissionRate / 100));
                    } else {
                        // Si no está pagado pero la cita está completada, restar el coste
                        stats.setRevenue(stats.getRevenue() - cost);
                    }
                }
            }
        }

        return new ArrayList<>(statsMap.values());
    }
}

