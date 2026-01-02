package io.github.edconde.clinica3s_backend.repository;

import io.github.edconde.clinica3s_backend.entity.AppUser;
import io.github.edconde.clinica3s_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
    long countByRole(Role role);
}

