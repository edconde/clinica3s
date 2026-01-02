package io.github.edconde.clinica3s_backend.repository;
import io.github.edconde.clinica3s_backend.entity.Appointment;
import io.github.edconde.clinica3s_backend.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment> {
    List<Appointment> findByDentistId(Long dentistId);
    Page<Appointment> findByDentistId(Long dentistId, Pageable pageable);
    List<Appointment> findByPatientId(Long patientId);
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);
    List<Appointment> findByStatus(AppointmentStatus status);
    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);
    List<Appointment> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);
    Page<Appointment> findByDateTimeBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
