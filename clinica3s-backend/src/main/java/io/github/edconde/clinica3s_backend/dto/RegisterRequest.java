package io.github.edconde.clinica3s_backend.dto;
import io.github.edconde.clinica3s_backend.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username es requerido")
    private String username;
    @NotBlank(message = "Password es requerido")
    private String password;
    @NotNull(message = "Role es requerido")
    private Role role;
    private String dentistName;
    private String licenseNumber;
    private Double commissionRate;
    private Set<Long> specialtyIds;
}
