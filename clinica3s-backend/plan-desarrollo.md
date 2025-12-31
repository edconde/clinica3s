# Plan de Desarrollo Backend: Clínica Odontológica (Spring Boot + JWT)

Este documento detalla la hoja de ruta para implementar el backend. Puedes suministrar estos pasos secuencialmente a tu asistente de IA para generar el código.

---

## 📊 Diagrama Entidad-Relación (E-R)

El diseño de la base de datos se basa en el diagrama E-R incluido en `diagrama-er.png`. Las entidades principales son:

### Entidades Principales

1. **APP_USER** - Usuarios del sistema con autenticación
   - Campos: id, username, password (hash BCrypt), role (ENUM), enabled
   - Roles: ADMIN, DENTIST, RECEPTIONIST

2. **DENTIST** - Información de dentistas
   - Campos: id, name, license_number, commission_rate, user_id (FK)
   - Relación 1:1 con APP_USER (un dentista tiene cuenta opcional)
   - Relación N:M con SPECIALTY (un dentista tiene múltiples especialidades)

3. **SPECIALTY** - Especialidades odontológicas
   - Campos: id, name
   - Ejemplos: Ortodoncia, Odontología General, Endodoncia

4. **SERVICE** - Servicios ofrecidos por la clínica
   - Campos: id, name, standard_cost, list_price, specialty_id (FK)
   - Relación N:1 con SPECIALTY (categorización de servicios)

5. **PATIENT** - Pacientes de la clínica
   - Campos: id, name, birth_date, gender, email

6. **APPOINTMENT** - Citas médicas
   - Campos: id, date_time, status (ENUM), total_amount, patient_id (FK), dentist_id (FK)
   - Estados: PENDING, COMPLETED, NO_SHOW
   - Relación N:1 con PATIENT y DENTIST

7. **APPOINTMENT_DETAIL** - Detalle de servicios por cita
   - Campos: id, quantity, price_applied, payment_date, appointment_id (FK), service_id (FK)
   - Almacena el precio aplicado en el momento de la cita (para histórico BI)

### Relaciones Clave

- **tiene_cuenta**: DENTIST 1:1 APP_USER (opcional)
- **tiene**: DENTIST N:M SPECIALTY
- **categoriza**: SPECIALTY 1:N SERVICE
- **solicita**: PATIENT 1:N APPOINTMENT
- **atiende**: DENTIST 1:N APPOINTMENT
- **contiene**: APPOINTMENT 1:N APPOINTMENT_DETAIL
- **se_usa_en**: SERVICE 1:N APPOINTMENT_DETAIL

---

## 🛠️ Paso 0: Configuración del Proyecto (Project Setup)

### Instrucción para el IDE:

"Genera un proyecto Spring Boot con Java 17+ y Maven. Las dependencias necesarias son:

- **Spring Web** (para REST API)
- **Spring Data JPA** (para la capa de datos)
- **Spring Security** (para autenticación)
- **H2 Database** (para desarrollo rápido) o **PostgreSQL Driver** (si usas Docker)
- **Lombok** (para reducir boilerplate)
- **Validation** (Hibernate Validator)
- **JJWT** (Librerías jjwt-api, jjwt-impl, jjwt-jackson) para manejar Tokens JWT"

---

## 🏗️ Paso 1: Modelo de Dominio (Entities)

### Instrucción para el IDE:

"Crea las entidades JPA basándote en el siguiente diseño. Usa Lombok (@Data, @NoArgsConstructor, @AllArgsConstructor, @Builder).

### Requisitos específicos:

#### AppUser
- Implementa `UserDetails` de Spring Security
- Campos: `id`, `username`, `password`, `role` (Enum: ADMIN, DENTIST, RECEPTIONIST)
- Campo adicional: `enabled` (Boolean)

#### Specialty
- Entidad simple
- Campos: `id`, `name`

#### Dentist
- Relación **Many-to-Many** con `Specialty` usando `@JoinTable`
- Relación **One-to-One** con `AppUser` (campo `user_id`)
- Campos: `name`, `licenseNumber`, `commissionRate`

#### Service
- Relación **Many-to-One** con `Specialty`
- Campos: `name`, `standardCost`, `listPrice`

#### Patient
- Campos: `name`, `birthDate`, `gender`, `email`

#### Appointment
- Relación **Many-to-One** con `Patient` y `Dentist`
- Relación **One-to-Many** con `AppointmentDetail` (cascade = CascadeType.ALL)
- Campos: `dateTime`, `status` (Enum: PENDING, COMPLETED, NO_SHOW), `totalAmount`

#### AppointmentDetail
- Relación **Many-to-One** con `Appointment` y `Service`
- Campos para BI: `quantity`, `priceApplied`, `paymentDate`"

---

## 🔒 Paso 2: Capa de Seguridad (JWT Security)

### Instrucción para el IDE:

"Implementa la seguridad Stateless con JWT:

### Componentes necesarios:

#### JwtService
- Clase utilitaria para generar tokens (firmados con clave secreta)
- Métodos para extraer username y validar tokens

#### ApplicationConfig
- Define el `UserDetailsService` que busque usuarios en el repositorio `AppUserRepository`
- Configura el `AuthenticationProvider`

#### JwtAuthenticationFilter
- Filtro que intercepte peticiones
- Extraiga el header `'Authorization: Bearer...'`
- Valide el token y actualice el `SecurityContextHolder`

#### SecurityConfig
- Deshabilita CSRF
- Configura la sesión como STATELESS
- Define rutas públicas (`/api/auth/**`) y privadas (el resto)
- Añade el filtro JWT antes del `UsernamePasswordAuthenticationFilter`"

---

## 💾 Paso 3: Repositorios y DTOs

### Instrucción para el IDE:

"1. Crea interfaces `JpaRepository` para todas las entidades.

2. En `DentistRepository`, añade un método `Optional<Dentist> findByUserId(Long userId)` (crucial para vincular login con datos).

3. Crea los DTOs (Data Transfer Objects) para evitar exponer entidades:
   - **RegisterRequest** (username, password, role, dentistData...)
   - **AuthResponse** (token, role)
   - **AppointmentDTO** (estructura anidada con lista de servicios IDs para crear citas)
   - **DashboardStatsDTO** (para datos de BI)"

---

## ⚙️ Paso 4: Lógica de Negocio (Services)

### Instrucción para el IDE:

"Implementa los Servicios con la lógica de negocio:

#### AuthenticationService
- Método `register`: codifica password, crea User y si es Dentista crea la entidad Dentist
- Método `login`: autentica y genera token JWT

#### AppointmentService
- `createAppointment(AppointmentDTO dto)`: Debe buscar los servicios por ID, crear los AppointmentDetail, copiar el precio actual del servicio a `priceApplied` y sumar el total en `totalAmount`.
- `findByUserRole(User user)`:
  - Si es ADMIN/RECEPTIONIST → devuelve `findAll()`
  - Si es DENTIST → busca el dentista asociado al usuario y devuelve `findByDentistId()`

#### ReportService
- (Para BI) Un método que devuelva totales agrupados por mes o por dentista usando proyecciones o JPQL custom."

---

## 🔌 Paso 5: Controladores REST (Controllers)

### Instrucción para el IDE:

"Genera los controladores REST (@RestController, @RequestMapping):

#### AuthController
- Endpoints: `/api/auth/register` y `/api/auth/login`

#### AppointmentController
- **GET** `/api/appointments`: Usa el servicio para filtrar según quien esté logueado (Principal)
- **POST** `/api/appointments`: Crea nueva cita
- **PUT** `/api/appointments/{id}/pay`: Marca los detalles como pagados (paymentDate = now())

#### MasterController
- CRUD básico para Patient, Service, Dentist
- Solo accesible por ADMIN/RECEPTIONIST"

---

## 🚀 Paso 6: Carga de Datos (Data Seeding)

### Instrucción para el IDE:

"Crea una clase `DataInitializer` que implemente `CommandLineRunner`.

- Debe ejecutarse al inicio
- Si la BD está vacía, crea:
  - Especialidades (Ortodoncia, General)
  - Servicios (Limpieza, Brackets)
  - Un usuario ADMIN
  - Un usuario DENTIST vinculado a un dentista
  - Unos cuantos pacientes y citas de prueba para testear el BI"

---

## 📝 Notas Adicionales

- El campo `priceApplied` en `AppointmentDetail` es crucial para mantener histórico de precios (los precios de servicios pueden cambiar)
- El campo `paymentDate` permite tracking de pagos para análisis financiero
- La relación opcional entre `Dentist` y `AppUser` permite tener dentistas sin acceso al sistema
- El campo `commissionRate` en Dentist permite calcular comisiones para reportes BI

