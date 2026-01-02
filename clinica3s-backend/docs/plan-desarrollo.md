# Plan de Desarrollo Backend: Clínica Odontológica (Spring Boot + JWT)

Este documento describe la arquitectura, el modelo de datos y las funcionalidades implementadas en el backend del sistema de gestión de clínica odontológica Clínica3S.

---

## 📊 Modelo de Datos

El diseño de la base de datos se basa en el diagrama E-R incluido en `diagrama-er.png`. El modelo implementa las siguientes entidades:

### Entidades Principales

1. **APP_USER** - Usuarios del sistema con autenticación
   - Campos: id, username, name, password (hash BCrypt), role (ENUM), enabled
   - Roles: ADMIN, DENTIST, RECEPTIONIST
   - **CAMBIO**: Añadido campo `name` (nombre real del usuario)

2. **DENTIST** - Información de dentistas
   - Campos: id, license_number, commission_rate, user_id (FK)
   - Relación 1:1 con APP_USER (un dentista tiene cuenta)
   - Relación N:M con SPECIALTY (un dentista tiene múltiples especialidades)
   - **CAMBIO**: El campo `name` se movió a APP_USER ya que todos los usuarios tienen nombre

3. **SPECIALTY** - Especialidades odontológicas
   - Campos: id, name
   - Ejemplos: Ortodoncia, Odontología General, Endodoncia, Cirugía Oral, Periodoncia, Prostodoncia, Odontopediatría, Odontología Conservadora

4. **SERVICE** - Servicios ofrecidos por la clínica
   - Campos: id, name, standard_cost, list_price, specialty_id (FK)
   - Relación N:1 con SPECIALTY (categorización de servicios)

5. **PATIENT** - Pacientes de la clínica
   - Campos: id, name, birth_date, gender, phone, email
   - **CAMBIO**: Añadido campo `phone` (obligatorio)

6. **APPOINTMENT** - Citas médicas
   - Campos: id, date_time, status (ENUM), total_amount, patient_id (FK), dentist_id (FK)
   - Estados: PENDING, COMPLETED, NO_SHOW
   - Relación N:1 con PATIENT y DENTIST

7. **APPOINTMENT_DETAIL** - Detalle de servicios por cita
   - Campos: id, quantity, price_applied, payment_date, appointment_id (FK), service_id (FK)
   - Almacena el precio aplicado en el momento de la cita (para histórico BI)

### Relaciones Clave

- **tiene_cuenta**: DENTIST 1:1 APP_USER (obligatoria - cada dentista tiene un usuario vinculado)
- **tiene**: DENTIST N:M SPECIALTY
- **categoriza**: SPECIALTY 1:N SERVICE
- **solicita**: PATIENT 1:N APPOINTMENT
- **atiende**: DENTIST 1:N APPOINTMENT
- **contiene**: APPOINTMENT 1:N APPOINTMENT_DETAIL
- **se_usa_en**: SERVICE 1:N APPOINTMENT_DETAIL

---

## 🛠️ Tecnologías y Configuración del Proyecto

El proyecto está construido con **Spring Boot 3.5.9** y **Java 17**, utilizando **Maven** como gestor de dependencias. Las principales tecnologías implementadas son:

### Dependencias Core
- **Spring Web** - Framework para construir APIs REST
- **Spring Data JPA** - Capa de persistencia con JPA/Hibernate
- **Spring Security** - Sistema de autenticación y autorización
- **Lombok** - Reducción de código boilerplate mediante anotaciones
- **Validation** - Validación de beans con Hibernate Validator

### Bases de Datos
- **H2 Database** - Base de datos en memoria para desarrollo
- **PostgreSQL Driver** - Base de datos para producción y preproducción
- **Liquibase** - Gestión de migraciones de esquema de base de datos

### Seguridad
- **JJWT** (jjwt-api, jjwt-impl, jjwt-jackson) - Implementación de autenticación con tokens JWT

### Documentación y Utilidades
- **SpringDoc OpenAPI** - Generación automática de documentación Swagger
- **Datafaker** - Generación de datos de prueba realistas
- **Spring Boot Actuator** - Endpoints de monitorización y métricas

---

## 🏗️ Arquitectura del Sistema

El proyecto implementa una **arquitectura en capas** que separa las responsabilidades:

```
controller/     → Controladores REST (endpoints de la API)
service/        → Lógica de negocio
repository/     → Acceso a datos (Spring Data JPA)
entity/         → Entidades JPA (modelo de dominio)
dto/            → Data Transfer Objects
security/       → Configuración de seguridad y JWT
config/         → Configuración de Spring
exception/      → Manejo global de excepciones
```

### Capa de Entidades (Domain Model)

Las entidades JPA están diseñadas con **Lombok** para reducir código repetitivo (@Data, @NoArgsConstructor, @AllArgsConstructor, @Builder).

#### AppUser
Implementa `UserDetails` de Spring Security para integrarse con el sistema de autenticación. Contiene:
- Campos: `id`, `username`, `name`, `password`, `role`, `enabled`
- Roles disponibles: ADMIN, DENTIST, RECEPTIONIST
- El campo `name` almacena el nombre real del usuario (aplicable a todos los roles)

#### Dentist
Representa la información profesional de los dentistas:
- Relación **Many-to-Many** con `Specialty` mediante tabla intermedia
- Relación **One-to-One** obligatoria con `AppUser`
- Campos: `licenseNumber`, `commissionRate`
- El `commissionRate` permite calcular comisiones en reportes de BI

#### Specialty
Entidad simple que categoriza las especialidades odontológicas:
- Campos: `id`, `name`
- Ejemplos: Ortodoncia, Odontología General, Endodoncia, Cirugía Oral, Periodoncia, Prostodoncia, Odontopediatría, Odontología Conservadora

#### Service
Catálogo de servicios/tratamientos de la clínica:
- Relación **Many-to-One** con `Specialty`
- Campos: `name`, `standardCost`, `listPrice`
- `standardCost` representa el coste para la clínica
- `listPrice` es el precio de venta al público

#### Patient
Información de los pacientes:
- Campos: `name`, `birthDate`, `gender`, `phone`, `email`
- El campo `phone` es obligatorio para facilitar el contacto

#### Appointment
Representa las citas médicas:
- Relación **Many-to-One** con `Patient` y `Dentist`
- Relación **One-to-Many** con `AppointmentDetail` (cascade = CascadeType.ALL)
- Campos: `dateTime`, `status`, `totalAmount`
- Estados posibles: PENDING, COMPLETED, NO_SHOW

#### AppointmentDetail
Detalle de servicios aplicados en cada cita:
- Relación **Many-to-One** con `Appointment` y `Service`
- Campos: `quantity`, `priceApplied`, `paymentDate`
- `priceApplied` mantiene histórico de precios (crucial para BI, ya que los precios pueden cambiar)
- `paymentDate` permite tracking de pagos para análisis financiero

---

## 🔒 Sistema de Seguridad

El sistema implementa autenticación **stateless** mediante **JWT (JSON Web Tokens)**:

### Componentes de Seguridad

#### JwtService
Servicio utilitario que gestiona los tokens JWT:
- Generación de tokens firmados con clave secreta
- Extracción de username desde el token
- Validación de tokens y verificación de expiración

#### ApplicationConfig
Configuración central de Spring Security:
- Define el `UserDetailsService` que carga usuarios desde `AppUserRepository`
- Configura el `AuthenticationProvider` para la autenticación
- Bean para el encoder de contraseñas (BCrypt)

#### JwtAuthenticationFilter
Filtro personalizado que:
- Intercepta todas las peticiones HTTP
- Extrae el token del header `Authorization: Bearer <token>`
- Valida el token y establece el contexto de seguridad
- Se ejecuta antes del `UsernamePasswordAuthenticationFilter`

#### SecurityConfig
Configuración de políticas de seguridad:
- Deshabilita CSRF (no necesario en APIs stateless)
- Configura sesiones como STATELESS
- Define rutas públicas: `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- Protege el resto de endpoints según roles
- Integra el filtro JWT en la cadena de seguridad

---

## 💾 Capa de Datos

### Repositorios

Se utilizan interfaces `JpaRepository` de Spring Data JPA para todas las entidades, proporcionando operaciones CRUD automáticas.

#### Métodos Personalizados Destacados

- **DentistRepository**: `Optional<Dentist> findByUserId(Long userId)` - Vincula el usuario autenticado con sus datos de dentista
- **PatientRepository**: Métodos de búsqueda con paginación y filtros
- **AppointmentRepository**: Consultas complejas con filtrado por paciente, estado, fechas

### Data Transfer Objects (DTOs)

El sistema utiliza DTOs para evitar exponer directamente las entidades:

- **RegisterRequest** - Datos para registro de usuarios
- **LoginRequest** - Credenciales de acceso
- **AuthResponse** - Respuesta con token y rol
- **AppointmentRequest/Response** - Estructuras anidadas para citas con detalles de servicios
- **DashboardStatsDTO** - Estadísticas de Business Intelligence con sub-DTOs:
  - `MonthlyStats` - Métricas agrupadas por mes
  - `DentistStats` - Métricas por dentista
- **PatientDTO**, **DentistDTO**, **ServiceDTO** - Transferencia de datos de entidades

---

## ⚙️ Capa de Servicios

La capa de servicios implementa la lógica de negocio:

### AuthenticationService
Gestiona la autenticación y registro:
- `register()`: Codifica contraseña con BCrypt, crea usuario y entidad vinculada (Dentist si aplica)
- `login()`: Autentica credenciales y genera token JWT

### AppointmentService
Gestión de citas médicas:
- `createAppointment()`: Crea cita con múltiples servicios, copia `listPrice` a `priceApplied` y calcula `totalAmount`
- Consultas paginadas con filtros (paciente, estado, rango de fechas)
- Control de acceso según rol del usuario autenticado

### PatientService
Operaciones CRUD de pacientes con:
- Paginación y búsqueda por nombre, teléfono, email
- Validaciones de negocio

### DentistService
Gestión de dentistas:
- CRUD con validación de número de colegiado
- Filtrado por especialidad y nombre (paginado)
- Gestión de especialidades asignadas

### ServiceService y SpecialtyService
Gestión de catálogo de servicios y especialidades:
- CRUD básico
- SpecialtyService sin paginación (pocas especialidades)

### ReportService
Generación de estadísticas para Business Intelligence:
- Dashboard con métricas generales
- Agrupación por mes y por dentista
- Cálculos de ingresos, costes, ganancias y pagos pendientes
- Filtrado opcional por año

---

## 🔌 API REST (Controladores)

Los controladores exponen endpoints REST con documentación Swagger/OpenAPI.

### AuthController
Endpoints públicos de autenticación:
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión (retorna JWT)

### UserController (ADMIN)
Gestión de usuarios del sistema:
- `GET /api/users` - Listado de usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### DentistController (ADMIN, RECEPTIONIST)
Gestión de dentistas:
- `GET /api/dentists` - Listado paginado con filtros (specialty, name)
- CRUD completo de dentistas

### PatientController (ADMIN, RECEPTIONIST, DENTIST)
Gestión de pacientes:
- `GET /api/patients` - Listado paginado con filtros (name, phone, email)
- CRUD completo de pacientes

### AppointmentController (ADMIN, RECEPTIONIST, DENTIST)
Gestión de citas:
- `GET /api/appointments` - Listado paginado con filtros combinables (patient, status, startDate, endDate)
- `POST /api/appointments` - Crear cita con múltiples servicios
- `PUT /api/appointments/{id}` - Actualizar cita
- Gestión de pagos de detalles de cita

### SpecialtyController (ADMIN)
Catálogo de especialidades:
- `GET /api/specialties` - Listado completo (sin paginación)
- CRUD de especialidades

### ServiceController (ADMIN)
Catálogo de servicios:
- `GET /api/services` - Listado paginado
- CRUD de servicios con costes y precios

### ReportController (ADMIN, RECEPTIONIST)
Reportes de Business Intelligence:
- `GET /api/reports/dashboard?year={year}` - Dashboard con estadísticas (filtro opcional por año)

---

## 🚀 Inicialización de Datos

El sistema incluye un `DataInitializer` que implementa `CommandLineRunner`:

### Comportamiento según Perfil

#### Perfil Development
Si la base de datos está vacía, crea automáticamente:

- **8 Especialidades** odontológicas completas
- **~30 Servicios** categorizados por especialidad con costes y precios
- **1 Usuario ADMIN** (credenciales configurables)
- **3 Usuarios RECEPTIONIST**
- **8 Usuarios DENTIST** vinculados a dentistas con especialidades asignadas
- **10,000 Pacientes** aleatorios generados con Datafaker (nombres, fechas de nacimiento, contactos)
- **~20,000 Citas** distribuidas uniformemente:
    - Rango temporal: 365 días pasados + 90 días futuros
    - Estados realistas según la fecha
    - 15% de citas completadas tienen pagos parciales pendientes
    - Cada cita incluye 1-3 servicios aleatorios

#### Perfil Preproduction
- Inserta en cada tabla la misma cantidad de datos de prueba que en Development,
  pero sólo si la tabla está vacía, para evitar crear datos de nuevo en redespliegues.

#### Perfil Production
- Solo crea el usuario administrador si no existe
- No genera datos de prueba


---

## 📝 Características Destacadas del Sistema

### Histórico de Precios y Análisis Financiero
- El campo `priceApplied` en `AppointmentDetail` mantiene el precio en el momento de la cita, fundamental para:
  - Mantener histórico preciso cuando los precios de servicios cambian
  - Análisis de BI y reportes financieros confiables
  - Auditoría de facturación

### Sistema de Pagos Flexible
- El campo `paymentDate` permite tracking detallado de pagos:
  - Control de pagos parciales por servicio dentro de una cita
  - Identificación de cuentas pendientes de cobro
  - Reportes de flujo de caja y pagos pendientes
  - 15% de citas completadas tienen pagos parciales (simulación realista)

### Gestión Integral de Usuarios
- Todos los usuarios (ADMIN, RECEPTIONIST, DENTIST) tienen un nombre real asociado (`name` en `AppUser`)
- Cada dentista está vinculado obligatoriamente a un usuario del sistema (relación 1:1)
- Sistema de roles con permisos granulares

### Business Intelligence Avanzado
- Reportes con métricas clave:
  - **Financieras**: Ingresos, costes, ganancias netas, pagos pendientes
  - **Operacionales**: Total de citas, citas completadas, citas futuras, citas no pagadas
  - **Por Dentista**: Rendimiento individual con comisiones calculadas
  - **Temporales**: Agrupación por mes con filtrado opcional por año
- El `commissionRate` en Dentist permite calcular comisiones automáticamente

### Arquitectura Escalable
- Servicios intermedios entre controladores y repositorios (separación de responsabilidades)
- Paginación implementada en consultas de alto volumen (pacientes, citas)
- Filtros mediante query params para búsquedas combinadas y flexibles
- DTOs para evitar exposición de entidades y control de datos transferidos

### Gestión de Base de Datos Profesional
- **Liquibase** para control de versiones del esquema
- Migraciones automáticas y rollback controlado
- Soporte multi-base de datos (H2, MySQL, PostgreSQL)

### Documentación y Monitorización
- **Swagger/OpenAPI** para documentación interactiva de la API
- **Spring Boot Actuator** para métricas y health checks
- Endpoints de monitorización para entornos productivos

### Contacto con Pacientes
- Campo `phone` obligatorio en pacientes para facilitar comunicaciones
- Información de contacto completa (teléfono y email)

---

## 🔍 Decisiones de Diseño

### ¿Por qué `priceApplied` en lugar de referencia directa al precio del servicio?
Los precios de servicios pueden cambiar con el tiempo. Mantener el precio aplicado en cada cita preserva la integridad histórica de la facturación y permite análisis precisos de ingresos pasados.

### ¿Por qué paginación en pacientes y citas pero no en especialidades?
Las especialidades son un catálogo pequeño y relativamente estático (~8 registros), mientras que pacientes (10,000+) y citas (20,000+) crecen continuamente y requieren paginación para rendimiento óptimo.

### ¿Por qué servicios intermedios en lugar de repositorios directos en controladores?
La capa de servicios permite:
- Centralizar lógica de negocio compleja
- Transacciones controladas
- Reutilización de código
- Testing más sencillo con mocks
- Evolución del sistema sin impactar controladores

### ¿Por qué JWT stateless en lugar de sesiones?
JWT permite escalabilidad horizontal sin compartir estado de sesión entre servidores, ideal para arquitecturas distribuidas y microservicios.

---

## 📚 Referencias

- **Diagrama E-R**: `diagrama-er.png` - Modelo visual de la base de datos
- **Documentación API**: Disponible en `/swagger-ui.html` cuando la aplicación está en ejecución
- **README.md del proyecto**: El directorio clinica3s-backend tiene su propio README.md que consiste en una guía completa de instalación, configuración y uso del sistema

