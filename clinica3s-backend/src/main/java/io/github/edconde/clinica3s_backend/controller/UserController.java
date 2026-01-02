package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.dto.RegisterRequest;
import io.github.edconde.clinica3s_backend.entity.AppUser;
import io.github.edconde.clinica3s_backend.repository.AppUserRepository;
import io.github.edconde.clinica3s_backend.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de usuarios del sistema (solo ADMIN)")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final AuthenticationService authenticationService;
    private final AppUserRepository appUserRepository;

    @Operation(summary = "Crear nuevo usuario",
               description = "Crea un nuevo usuario en el sistema. Si el rol es DENTIST, también crea el registro de dentista asociado. Solo ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de registro inválidos"),
            @ApiResponse(responseCode = "403", description = "Sin permisos - Solo ADMIN"),
            @ApiResponse(responseCode = "409", description = "El nombre de usuario ya existe")
    })
    @PostMapping
    public ResponseEntity<AppUser> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.createUser(request));
    }

    @Operation(summary = "Listar usuarios", description = "Obtiene todos los usuarios del sistema. Solo ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida"),
            @ApiResponse(responseCode = "403", description = "Sin permisos - Solo ADMIN")
    })
    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(appUserRepository.findAll());
    }

    @Operation(summary = "Obtener usuario por ID", description = "Obtiene un usuario específico. Solo ADMIN.")
    @GetMapping("/{id}")
    public ResponseEntity<AppUser> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
    }

    @Operation(summary = "Habilitar/Deshabilitar usuario", description = "Activa o desactiva un usuario. Solo ADMIN.")
    @PutMapping("/{id}/enabled")
    public ResponseEntity<AppUser> toggleUserEnabled(@PathVariable Long id, @RequestParam boolean enabled) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setEnabled(enabled);
        return ResponseEntity.ok(appUserRepository.save(user));
    }

    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario del sistema. Solo ADMIN.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        appUserRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

