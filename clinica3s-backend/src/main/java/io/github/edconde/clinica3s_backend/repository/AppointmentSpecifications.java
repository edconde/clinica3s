package io.github.edconde.clinica3s_backend.repository;

import io.github.edconde.clinica3s_backend.entity.Appointment;
import io.github.edconde.clinica3s_backend.entity.AppointmentStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class AppointmentSpecifications {

    public static Specification<Appointment> hasPatientId(Long patientId) {
        return (root, query, cb) -> patientId == null ? null : cb.equal(root.get("patient").get("id"), patientId);
    }

    public static Specification<Appointment> hasDentistId(Long dentistId) {
        return (root, query, cb) -> dentistId == null ? null : cb.equal(root.get("dentist").get("id"), dentistId);
    }

    public static Specification<Appointment> hasStatus(AppointmentStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Appointment> dateTimeAfter(LocalDateTime startDate) {
        return (root, query, cb) -> startDate == null ? null : cb.greaterThanOrEqualTo(root.get("dateTime"), startDate);
    }

    public static Specification<Appointment> dateTimeBefore(LocalDateTime endDate) {
        return (root, query, cb) -> endDate == null ? null : cb.lessThanOrEqualTo(root.get("dateTime"), endDate);
    }

    public static Specification<Appointment> buildSpecification(
            Long patientId,
            Long dentistId,
            AppointmentStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return Specification.where(hasPatientId(patientId))
                .and(hasDentistId(dentistId))
                .and(hasStatus(status))
                .and(dateTimeAfter(startDate))
                .and(dateTimeBefore(endDate));
    }
}

