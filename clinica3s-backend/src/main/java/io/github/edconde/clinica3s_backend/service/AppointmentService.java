package io.github.edconde.clinica3s_backend.service;

import io.github.edconde.clinica3s_backend.dto.AppointmentRequest;
import io.github.edconde.clinica3s_backend.dto.AppointmentResponse;
import io.github.edconde.clinica3s_backend.entity.*;
import io.github.edconde.clinica3s_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DentistRepository dentistRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        Dentist dentist = dentistRepository.findById(request.getDentistId())
                .orElseThrow(() -> new RuntimeException("Dentista no encontrado"));

        Appointment appointment = Appointment.builder()
                .dateTime(request.getDateTime())
                .status(AppointmentStatus.PENDING)
                .patient(patient)
                .dentist(dentist)
                .totalAmount(0.0)
                .build();

        double totalAmount = 0.0;

        for (AppointmentRequest.ServiceDetailRequest serviceReq : request.getServices()) {
            io.github.edconde.clinica3s_backend.entity.Service service = serviceRepository
                    .findById(serviceReq.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado: " + serviceReq.getServiceId()));

            int quantity = serviceReq.getQuantity() != null ? serviceReq.getQuantity() : 1;

            AppointmentDetail detail = AppointmentDetail.builder()
                    .service(service)
                    .quantity(quantity)
                    .priceApplied(service.getListPrice())
                    .build();

            appointment.addDetail(detail);
            totalAmount += service.getListPrice() * quantity;
        }

        appointment.setTotalAmount(totalAmount);
        appointment = appointmentRepository.save(appointment);

        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> findByUserRole(AppUser user) {
        List<Appointment> appointments;

        if (user.getRole() == Role.DENTIST) {
            Dentist dentist = dentistRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Dentista no encontrado para el usuario"));
            appointments = appointmentRepository.findByDentistId(dentist.getId());
        } else {
            appointments = appointmentRepository.findAll();
        }

        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<AppointmentResponse> findByUserRolePaged(AppUser user, Pageable pageable) {
        Page<Appointment> appointments;

        if (user.getRole() == Role.DENTIST) {
            Dentist dentist = dentistRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Dentista no encontrado para el usuario"));
            appointments = appointmentRepository.findByDentistId(dentist.getId(), pageable);
        } else {
            appointments = appointmentRepository.findAll(pageable);
        }

        return appointments.map(this::mapToResponse);
    }

    public List<AppointmentResponse> findAll() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse findById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        return mapToResponse(appointment);
    }

    public Long getDentistIdForUser(AppUser user) {
        Dentist dentist = dentistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Dentista no encontrado para el usuario"));
        return dentist.getId();
    }

    public Page<AppointmentResponse> findWithFilters(
            Long patientId,
            Long dentistId,
            AppointmentStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        var spec = AppointmentSpecifications.buildSpecification(patientId, dentistId, status, startDate, endDate);
        return appointmentRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional
    public AppointmentResponse payAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        LocalDateTime now = LocalDateTime.now();
        for (AppointmentDetail detail : appointment.getDetails()) {
            if (detail.getPaymentDate() == null) {
                detail.setPaymentDate(now);
            }
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);

        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        return mapToResponse(appointment);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .dateTime(appointment.getDateTime())
                .status(appointment.getStatus())
                .totalAmount(appointment.getTotalAmount())
                .patient(AppointmentResponse.PatientInfo.builder()
                        .id(appointment.getPatient().getId())
                        .name(appointment.getPatient().getName())
                        .phone(appointment.getPatient().getPhone())
                        .email(appointment.getPatient().getEmail())
                        .build())
                .dentist(AppointmentResponse.DentistInfo.builder()
                        .id(appointment.getDentist().getId())
                        .name(appointment.getDentist().getUser().getName())
                        .licenseNumber(appointment.getDentist().getLicenseNumber())
                        .build())
                .details(appointment.getDetails().stream()
                        .map(detail -> AppointmentResponse.DetailInfo.builder()
                                .id(detail.getId())
                                .serviceName(detail.getService().getName())
                                .quantity(detail.getQuantity())
                                .priceApplied(detail.getPriceApplied())
                                .paymentDate(detail.getPaymentDate())
                                .paid(detail.getPaymentDate() != null)
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}

