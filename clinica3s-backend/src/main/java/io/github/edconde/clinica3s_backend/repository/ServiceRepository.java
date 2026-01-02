package io.github.edconde.clinica3s_backend.repository;
import io.github.edconde.clinica3s_backend.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findBySpecialtyId(Long specialtyId);
}
