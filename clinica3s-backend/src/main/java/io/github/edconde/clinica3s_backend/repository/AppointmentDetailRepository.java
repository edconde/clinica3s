package io.github.edconde.clinica3s_backend.repository;
import io.github.edconde.clinica3s_backend.entity.AppointmentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AppointmentDetailRepository extends JpaRepository<AppointmentDetail, Long> {
    List<AppointmentDetail> findByAppointmentId(Long appointmentId);
}
