package io.github.edconde.clinica3s_backend.repository;

import io.github.edconde.clinica3s_backend.entity.Dentist;
import org.springframework.data.jpa.domain.Specification;

public class DentistSpecifications {

    public static Specification<Dentist> hasNameContaining(String name) {
        return (root, query, cb) -> name == null || name.isBlank()
                ? null
                : cb.like(cb.lower(root.get("user").get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Dentist> hasSpecialtyId(Long specialtyId) {
        return (root, query, cb) -> {
            if (specialtyId == null) {
                return null;
            }
            return cb.equal(root.join("specialties").get("id"), specialtyId);
        };
    }

    public static Specification<Dentist> buildSpecification(String name, Long specialtyId) {
        return Specification.where(hasNameContaining(name))
                .and(hasSpecialtyId(specialtyId));
    }
}
