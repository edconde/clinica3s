package io.github.edconde.clinica3s_backend.service;

import io.github.edconde.clinica3s_backend.dto.AuthResponse;
import io.github.edconde.clinica3s_backend.dto.ChangePasswordRequest;
import io.github.edconde.clinica3s_backend.dto.LoginRequest;
import io.github.edconde.clinica3s_backend.dto.RegisterRequest;
import io.github.edconde.clinica3s_backend.entity.AppUser;
import io.github.edconde.clinica3s_backend.entity.Dentist;
import io.github.edconde.clinica3s_backend.entity.Role;
import io.github.edconde.clinica3s_backend.entity.Specialty;
import io.github.edconde.clinica3s_backend.repository.AppUserRepository;
import io.github.edconde.clinica3s_backend.repository.DentistRepository;
import io.github.edconde.clinica3s_backend.repository.SpecialtyRepository;
import io.github.edconde.clinica3s_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AppUserRepository userRepository;
    private final DentistRepository dentistRepository;
    private final SpecialtyRepository specialtyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AppUser createUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }

        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .name(request.getDentistName() != null ? request.getDentistName() : request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .build();

        user = userRepository.save(user);

        if (request.getRole() == Role.DENTIST) {
            Set<Specialty> specialties = new HashSet<>();
            if (request.getSpecialtyIds() != null && !request.getSpecialtyIds().isEmpty()) {
                specialties = new HashSet<>(specialtyRepository.findAllById(request.getSpecialtyIds()));
            }

            Dentist dentist = Dentist.builder()
                    .licenseNumber(request.getLicenseNumber())
                    .commissionRate(request.getCommissionRate() != null ? request.getCommissionRate() : 0.0)
                    .user(user)
                    .specialties(specialties)
                    .build();

            dentistRepository.save(dentist);
        }

        return user;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Long dentistId = null;
        if (user.getRole() == Role.DENTIST) {
            dentistId = dentistRepository.findByUserId(user.getId())
                    .map(Dentist::getId)
                    .orElse(null);
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .username(user.getUsername())
                .userId(user.getId())
                .dentistId(dentistId)
                .build();
    }

    @Transactional
    public void changePassword(AppUser user, ChangePasswordRequest request) {
        // Verificar que las contraseñas nuevas coinciden
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Las contraseñas nuevas no coinciden");
        }

        // Verificar que la contraseña actual es correcta
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        // Verificar que la nueva contraseña es diferente a la actual
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("La nueva contraseña debe ser diferente a la actual");
        }

        // Actualizar la contraseña
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}

