package io.github.edconde.clinica3s_backend.dto;
import io.github.edconde.clinica3s_backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Role role;
    private String username;
    private Long userId;
    private Long dentistId;
}
