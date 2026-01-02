# Clínica3S Backend

Backend desarrollado en Spring Boot para la gestión de clínica odontológica Clínica3S.

## Creación del Proyecto con Spring Initializr

Para crear este proyecto desde cero, utiliza [Spring Initializr](https://start.spring.io/) con la siguiente configuración:

### Configuración Base

| Parámetro | Valor |
|-----------|-------|
| **Project** | Maven |
| **Language** | Java |
| **Spring Boot** | 3.5.9 |
| **Group** | io.github.edconde |
| **Artifact** | clinica3s-backend |
| **Name** | clinica3s backend |
| **Description** | Backend para gestión de clínica - Clinica3S |
| **Package name** | io.github.edconde.clinica3s_backend |
| **Packaging** | Jar |
| **Java** | 17 |

### Dependencias a Seleccionar

- **Spring Web** - Para crear APIs REST
- **Spring Data JPA** - Para persistencia con JPA/Hibernate
- **Spring Security** - Para autenticación y autorización
- **Validation** - Para validación de beans con Jakarta Validation
- **H2 Database** - Base de datos en memoria para desarrollo
- **MySQL Driver** - Driver para base de datos MySQL
- **PostgreSQL Driver** - Driver para base de datos PostgreSQL (producción)
- **Liquibase** - Para gestión de migraciones de base de datos
- **Spring Boot Actuator** - Para monitorización de la aplicación
- **Lombok** - Para reducir código boilerplate

### Dependencias Adicionales (añadir manualmente al pom.xml)

Después de generar el proyecto, añade las siguientes dependencias:

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- SpringDoc OpenAPI 3 (Swagger) -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.7.0</version>
</dependency>

<!-- Datafaker para generar datos de prueba -->
<dependency>
    <groupId>net.datafaker</groupId>
    <artifactId>datafaker</artifactId>
    <version>2.4.2</version>
</dependency>
```

### Enlace Directo

Puedes usar este enlace para generar el proyecto con la configuración base:

[👉 Generar proyecto en Spring Initializr](https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.5.9&packaging=jar&jvmVersion=17&groupId=io.github.edconde&artifactId=clinica3s-backend&name=clinica3s%20backend&description=Backend%20para%20gesti%C3%B3n%20de%20cl%C3%ADnica%20-%20Clinica3S&packageName=io.github.edconde.clinica3s_backend&dependencies=web,data-jpa,security,validation,h2,mysql,postgresql,liquibase,actuator,lombok)

---

## Tecnologías

- **Java 17**
- **Spring Boot 3.5.9**
- **Spring Data JPA** - Persistencia de datos
- **Spring Security** - Autenticación y autorización
- **JWT** - Tokens de autenticación
- **H2 Database** - Base de datos en memoria (desarrollo)
- **MySQL** - Base de datos (soporte)
- **PostgreSQL** - Base de datos (producción)
- **Liquibase** - Gestión de migraciones de base de datos
- **SpringDoc OpenAPI** - Documentación de API (Swagger)
- **Datafaker** - Generación de datos de prueba
- **Spring Boot Actuator** - Monitorización de la aplicación
- **Lombok** - Reducción de código boilerplate
- **Maven** - Gestión de dependencias

## Arquitectura

El proyecto sigue una arquitectura en capas:

```
├── controller/     → Controladores REST (API endpoints)
├── service/        → Lógica de negocio
├── repository/     → Acceso a datos (Spring Data JPA)
├── entity/         → Entidades JPA
├── dto/            → Data Transfer Objects
├── security/       → Configuración de seguridad y JWT
├── config/         → Configuración de Spring
└── exception/      → Manejo global de excepciones
```

## Modelo de Datos

### Entidades principales:

- **AppUser** - Usuarios del sistema con autenticación (roles: ADMIN, DENTIST, RECEPTIONIST)
- **Dentist** - Información de dentistas vinculados a usuarios
- **Specialty** - Especialidades odontológicas
- **Service** - Servicios/tratamientos ofrecidos por la clínica
- **Patient** - Pacientes de la clínica
- **Appointment** - Citas médicas con estado (PENDING, COMPLETED, NO_SHOW)
- **AppointmentDetail** - Detalle de servicios aplicados en cada cita con histórico de precios y pagos

Ver `plan-desarrollo.md` para detalles completos del diagrama E-R.

## Características Implementadas

### Gestión de Usuarios (Rol: ADMIN)
- ✅ CRUD completo de usuarios
- ✅ Gestión de roles (ADMIN, DENTIST, RECEPTIONIST)
- ✅ Vinculación de usuarios con dentistas

### Gestión de Dentistas (Rol: ADMIN, RECEPTIONIST)
- ✅ CRUD de dentistas con especialidades
- ✅ Gestión de tasas de comisión
- ✅ Filtrado por especialidad y nombre (paginado)

### Gestión de Pacientes (Rol: ADMIN, RECEPTIONIST, DENTIST)
- ✅ CRUD de pacientes
- ✅ Búsqueda y filtrado por nombre, teléfono, email (paginado)
- ✅ Consulta de historial de citas

### Gestión de Citas (Rol: ADMIN, RECEPTIONIST, DENTIST)
- ✅ Creación de citas con múltiples servicios
- ✅ Actualización de estado de citas
- ✅ Filtrado por paciente, estado, rango de fechas (paginado)
- ✅ Gestión de pagos de servicios

### Gestión de Servicios y Especialidades (Rol: ADMIN)
- ✅ CRUD de servicios con costes y precios
- ✅ CRUD de especialidades
- ✅ Categorización de servicios por especialidad

### Reportes y Business Intelligence (Rol: ADMIN, RECEPTIONIST)
- ✅ Dashboard con estadísticas generales
- ✅ Métricas por mes (MonthlyStats)
- ✅ Métricas por dentista (DentistStats)
- ✅ Análisis de ingresos, costes y ganancias
- ✅ Control de pagos pendientes
- ✅ Filtrado opcional por año

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro de usuario

### Usuarios (ADMIN)
- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/{id}` - Obtener usuario por ID
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### Dentistas (ADMIN, RECEPTIONIST)
- `GET /api/dentists` - Listar dentistas (paginado, filtros: specialty, name)
- `GET /api/dentists/{id}` - Obtener dentista por ID
- `POST /api/dentists` - Crear dentista
- `PUT /api/dentists/{id}` - Actualizar dentista
- `DELETE /api/dentists/{id}` - Eliminar dentista

### Pacientes (ADMIN, RECEPTIONIST, DENTIST)
- `GET /api/patients` - Listar pacientes (paginado, filtros: name, phone, email)
- `GET /api/patients/{id}` - Obtener paciente por ID
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/{id}` - Actualizar paciente
- `DELETE /api/patients/{id}` - Eliminar paciente

### Citas (ADMIN, RECEPTIONIST, DENTIST)
- `GET /api/appointments` - Listar citas (paginado, filtros: patient, status, startDate, endDate)
- `GET /api/appointments/{id}` - Obtener cita por ID
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/{id}` - Actualizar cita
- `DELETE /api/appointments/{id}` - Eliminar cita

### Especialidades (ADMIN)
- `GET /api/specialties` - Listar todas las especialidades
- `GET /api/specialties/{id}` - Obtener especialidad por ID
- `POST /api/specialties` - Crear especialidad
- `PUT /api/specialties/{id}` - Actualizar especialidad
- `DELETE /api/specialties/{id}` - Eliminar especialidad

### Servicios (ADMIN)
- `GET /api/services` - Listar servicios (paginado)
- `GET /api/services/{id}` - Obtener servicio por ID
- `POST /api/services` - Crear servicio
- `PUT /api/services/{id}` - Actualizar servicio
- `DELETE /api/services/{id}` - Eliminar servicio

### Reportes (ADMIN, RECEPTIONIST)
- `GET /api/reports/dashboard?year={year}` - Estadísticas del dashboard (filtro opcional por año)

## Documentación de API (Swagger)

La documentación interactiva de la API está disponible mediante Swagger/OpenAPI:

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

Swagger permite probar todos los endpoints directamente desde el navegador.

## Ejecución

### Requisitos
- Java 17 o superior
- Maven 3.6+

### Compilar y ejecutar

```bash
# Compilar
mvn clean install

# Ejecutar
mvn spring-boot:run
```

La aplicación estará disponible en: `http://localhost:8080`

### Consola H2
Para acceder a la consola de H2 (desarrollo):
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:clinica3s`
- Usuario: `sa`
- Password: (dejar vacío)

## Perfiles de Ejecución

El proyecto soporta diferentes perfiles:

- **development** (por defecto): Usa H2 en memoria, genera datos de prueba completos solo si la BD está vacía
- **preproduction**: Usa PostgreSQL, **inserta datos de prueba solo en tablas vacías** (inserción condicional por tabla)
- **production**: Usa PostgreSQL, solo crea usuario admin si no existe

### Comportamiento por Perfil:

#### Development
- Verifica si hay usuarios en la BD
- Si está vacía → crea todos los datos de prueba (especialidades, servicios, usuarios, dentistas, 10,000 pacientes, 20,000 citas)
- Si hay datos → no hace nada

#### Preproduction
- **Inserción inteligente y condicional:**
  - Especialidades → solo si `specialty` está vacía
  - Servicios → solo si `service` está vacía
  - Admin → solo si no existe el usuario admin
  - Recepcionistas → solo si no hay usuarios con rol `RECEPTIONIST`
  - Dentistas → solo si `dentist` está vacía
  - Pacientes → solo si `patient` está vacía (crea 10,000)
  - Citas → solo si `appointment` está vacía (crea 20,000)
- **Ventaja:** Permite popular la BD progresivamente o recuperar tablas específicas sin borrar las demás

#### Production
- Solo crea el usuario administrador si no existe
- No genera datos de prueba

Para ejecutar con un perfil específico:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=production
```

## Usuarios de Prueba

En el perfil de **development**, al iniciar la aplicación se crean automáticamente:

| Usuario | Password | Rol |
|---------|----------|-----|
| admin | admin123 | ADMINISTRADOR |
| recepcion1 | recepcion123 | RECEPCIONISTA |
| recepcion2 | recepcion123 | RECEPCIONISTA |
| recepcion3 | recepcion123 | RECEPCIONISTA |
| dr.martinez | dentist123 | DENTISTA |
| dra.lopez | dentist123 | DENTISTA |
| (6 dentistas más) | dentist123 | DENTISTA |

Además se generan:
- 8 especialidades odontológicas
- ~30 servicios categorizados
- 10,000 pacientes aleatorios
- ~20,000 citas (pasadas y futuras, con distribución realista)

## Gestión de Base de Datos con Liquibase

El proyecto utiliza **Liquibase** para gestionar las migraciones de base de datos de forma controlada y versionada.

### Características:
- Migraciones automáticas al iniciar la aplicación
- Versionado de esquema de base de datos
- Rollback de cambios si es necesario
- Independiente del motor de base de datos

Los archivos de migración se encuentran en: `src/main/resources/db/changelog/`

## Monitorización con Actuator

Spring Boot Actuator proporciona endpoints para monitorización:

- `GET /actuator/health` - Estado de salud de la aplicación
- `GET /actuator/info` - Información de la aplicación
- `GET /actuator/metrics` - Métricas de la aplicación

## Seguridad

- Autenticación mediante **JWT** (JSON Web Tokens)
- Autorización basada en **roles** (ADMIN, DENTIST, RECEPTIONIST)
- Contraseñas encriptadas con **BCrypt**
- CORS configurado para desarrollo
- Sesiones **stateless** (sin estado en servidor)

## Configuración

Editar archivos de configuración en `src/main/resources/`:

- `application.yaml` - Configuración general
- `application-development.yaml` - Configuración de desarrollo (H2)
- `application-production.yml` - Configuración de producción (PostgreSQL)

Configuraciones principales:
- Puerto del servidor
- Base de datos (H2, MySQL, PostgreSQL)
- JWT (secret key, expiración)
- Niveles de logging
- Liquibase
- Actuator

## Próximos Pasos

- [ ] Implementar generación de PDF para reportes
- [ ] Añadir envío de emails para recordatorios de citas
- [ ] Implementar sistema de notificaciones
- [ ] Añadir tests unitarios e integración completos
- [ ] Implementar exportación de datos (Excel, CSV)
- [ ] Añadir gráficos en el dashboard
- [ ] Dockerización de la aplicación
- [ ] CI/CD con GitHub Actions

## Autor

Edgar Conde - [@edconde](https://github.com/edconde)

Clínica3S Backend

