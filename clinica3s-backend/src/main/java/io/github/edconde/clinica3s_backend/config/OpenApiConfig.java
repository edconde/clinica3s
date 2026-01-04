package io.github.edconde.clinica3s_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Clinica3S API")
                        .description("API REST para gestión de clínica odontológica - Sistema de citas, pacientes, dentistas y servicios")
                        .version("1.0.0")
                        //.contact(new Contact()
                        //        .name("Clinica3S")
                        //        .email("info@clinica3s.com")
                        //        .url("https://clinica3s.com"))
                        //.license(new License()
                        //        .name("MIT License")
                        //        .url("https://opensource.org/licenses/MIT"))
                        )
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Introduce el token JWT obtenido del endpoint /api/auth/login")));
    }
}

