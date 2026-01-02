package io.github.edconde.clinica3s_backend.controller;

import io.github.edconde.clinica3s_backend.dto.AuthResponse;
import io.github.edconde.clinica3s_backend.dto.ChangePasswordRequest;
import io.github.edconde.clinica3s_backend.dto.LoginRequest;
import io.github.edconde.clinica3s_backend.entity.AppUser;
import io.github.edconde.clinica3s_backend.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para login y gestión de cuenta propia")
public class AuthController {

    private final AuthenticationService authenticationService;

    @Operation(summary = "Iniciar sesión",
               description = "Autentica un usuario y devuelve un token JWT para acceder a los endpoints protegidos.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso, devuelve token JWT"),
            @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
            @ApiResponse(responseCode = "400", description = "Datos de login inválidos")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @Operation(summary = "Cambiar contraseña",
               description = "Permite al usuario autenticado cambiar su propia contraseña.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contraseña cambiada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o contraseñas no coinciden"),
            @ApiResponse(responseCode = "401", description = "No autenticado o contraseña actual incorrecta")
    })
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Parameter(hidden = true) @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody ChangePasswordRequest request) {
        authenticationService.changePassword(user, request);
        return ResponseEntity.ok("Contraseña actualizada exitosamente");
    }
}

