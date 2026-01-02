package io.github.edconde.clinica3s_backend.repository;

import io.github.edconde.clinica3s_backend.entity.Patient;
import org.springframework.data.jpa.domain.Specification;

public class PatientSpecifications {

    public static Specification<Patient> hasNameContaining(String name) {
        return (root, query, cb) -> name == null || name.isBlank()
                ? null
                : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Patient> hasPhoneContaining(String phone) {
        return (root, query, cb) -> phone == null || phone.isBlank()
                ? null
                : cb.like(root.get("phone"), "%" + phone + "%");
    }

    public static Specification<Patient> hasEmailContaining(String email) {
        return (root, query, cb) -> email == null || email.isBlank()
                ? null
                : cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%");
    }

    public static Specification<Patient> buildSpecification(String name, String phone, String email) {
        return Specification.where(hasNameContaining(name))
                .and(hasPhoneContaining(phone))
                .and(hasEmailContaining(email));
    }
}

