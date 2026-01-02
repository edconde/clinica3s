package io.github.edconde.clinica3s_backend.repository;
import io.github.edconde.clinica3s_backend.entity.Dentist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface DentistRepository extends JpaRepository<Dentist, Long>, JpaSpecificationExecutor<Dentist> {
    Optional<Dentist> findByUserId(Long userId);
    Optional<Dentist> findByLicenseNumber(String licenseNumber);
}
