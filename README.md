# Clinica3S
Sistema de gestión integral para clínicas odontológicas

Proyecto desarrollado para la asignatura de Sistemas de Información del Máster en Ingeniería Informática (MEI).

---

## 📋 Descripción del Proyecto

**Clinica3S** es una aplicación web completa para la gestión de clínicas dentales que permite administrar citas, pacientes, dentistas, servicios odontológicos y especialidades. El sistema incluye un dashboard de Business Intelligence con KPIs y gráficas para análisis de rendimiento, ingresos y tendencias.

### Características Principales

- 🔐 **Autenticación y autorización** con JWT y control de acceso por roles (Admin, Recepcionista, Dentista)
- 📅 **Gestión de citas** con calendario visual tipo Google Calendar
- 👥 **Administración de pacientes** con historial completo
- 👨‍⚕️ **Gestión de dentistas** y sus especialidades
- 💼 **Catálogo de servicios** odontológicos con costes y precios
- 📊 **Dashboard de BI** con KPIs, gráficas y reportes de facturación
- 💰 **Control financiero** con seguimiento de ingresos, costes, comisiones y pagos pendientes
- 📱 **Interfaz responsive** con diseño moderno y componentes PrimeReact

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      Clinica3S                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐     ┌──────────────────┐              │
│  │    Frontend      │────▶│     Backend      │              │
│  │  React + Vite    │     │  Spring Boot     │              │
│  │  PrimeReact      │     │  + Spring        │              │
│  │                  │     │    Security      │              │
│  │  Puerto: 5173    │     │  Puerto: 8080    │              │
│  └──────────────────┘     └────────┬─────────┘              │
│                                    │                         │
│                           ┌────────▼─────────┐              │
│                           │    H2 Database   │              │
│                           │   (Desarrollo)   │              │
│                           │                  │              │
│                           │   PostgreSQL     │              │
│                           │   (Producción)   │              │
│                           └──────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| **Frontend** | React 19 + Vite | Interfaz de usuario SPA con PrimeReact |
| **Backend** | Spring Boot 3.5.9 | API REST con autenticación JWT |
| **Base de Datos** | H2 (dev) / PostgreSQL (prod) | Persistencia de datos |
| **Documentación API** | SpringDoc OpenAPI (Swagger) | Documentación interactiva de la API |

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Java 17** o superior
- **Maven 3.8+**
- **Node.js 18+** y npm
- **Git**

### Instalación y Ejecución

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/edconde/clinica3s.git
cd clinica3s
```

#### 2. Backend (Spring Boot)

```bash
# Navegar al directorio del backend
cd clinica3s-backend

# Compilar y ejecutar (puerto 8080)
./mvnw spring-boot:run

# O en Windows
mvnw.cmd spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

**Documentación Swagger:** `http://localhost:8080/swagger-ui.html`

**Consola H2 (desarrollo):** `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:clinica3s`
- Usuario: `sa`
- Password: _(vacío)_

#### 3. Frontend (React + Vite)

```bash
# En otra terminal, navegar al directorio del frontend
cd clinica3s-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (puerto 5173)
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

#### 4. Credenciales de Acceso

Por defecto, el sistema crea un usuario administrador con datos de prueba:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | ADMIN |

Otros usuarios de prueba son generados automáticamente en modo desarrollo.

---

## 📦 Estructura del Proyecto

```
clinica3s/
├── clinica3s-backend/          # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/io/github/edconde/clinica3s_backend/
│   │   │   │   ├── controller/    # Controladores REST
│   │   │   │   ├── service/       # Lógica de negocio
│   │   │   │   ├── repository/    # Repositorios JPA
│   │   │   │   ├── entity/        # Entidades del dominio
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── security/      # Configuración JWT
│   │   │   │   ├── config/        # Configuración Spring
│   │   │   │   └── exception/     # Manejo de excepciones
│   │   │   └── resources/
│   │   │       ├── application.yaml
│   │   │       ├── application-development.yaml
│   │   │       ├── application-preproduction.yaml
│   │   │       ├── application-production.yaml
│   │   │       ├── schema-postgresql.sql
│   │   │       └── data-postgresql.sql
│   │   └── test/
│   ├── docs/
│   │   ├── plan-desarrollo.md     # Documentación técnica
│   │   └── api-docs.json          # Especificación OpenAPI
│   ├── pom.xml
│   └── README.md
│
└── clinica3s-frontend/         # Frontend React
    ├── src/
    │   ├── api/                # Configuración Axios
    │   ├── components/         # Componentes React
    │   │   ├── appointments/
    │   │   ├── common/
    │   │   ├── dashboard/
    │   │   └── layout/
    │   ├── context/            # Context API
    │   ├── pages/              # Páginas principales
    │   ├── services/           # Servicios API
    │   └── utils/              # Utilidades
    ├── public/
    ├── docs/
    │   ├── plan-desarrollo.md  # Documentación técnica
    │   └── api-docs.json
    ├── package.json
    ├── vite.config.js
    └── README.md
```

---

## 🛠️ Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Java** | 17 | Lenguaje de programación |
| **Spring Boot** | 3.5.9 | Framework base |
| **Spring Data JPA** | 3.5.x | Capa de persistencia |
| **Spring Security** | 6.5.x | Autenticación y autorización |
| **JWT (JJWT)** | 0.12.6 | Tokens de autenticación |
| **H2 Database** | 2.x | BD en memoria (desarrollo) |
| **PostgreSQL** | - | BD producción |
| **SpringDoc OpenAPI** | 2.7.0 | Documentación Swagger |
| **Datafaker** | 2.4.2 | Generación de datos de prueba |
| **Lombok** | 1.18.x | Reducción de boilerplate |
| **Maven** | 3.9.x | Gestión de dependencias |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.2.0 | Framework UI |
| **Vite** | 7.2.4 | Build tool |
| **PrimeReact** | 10.9.7 | Biblioteca de componentes UI |
| **PrimeIcons** | 7.0.0 | Iconografía |
| **PrimeFlex** | 4.0.0 | Sistema de rejilla CSS |
| **React Router DOM** | 7.11.0 | Enrutamiento |
| **Axios** | 1.13.2 | Cliente HTTP |
| **Chart.js** | 4.5.1 | Gráficas y visualización |
| **date-fns** | 4.1.0 | Manejo de fechas |
| **TailwindCSS** | 4.1.18 | Framework CSS |

---

## 📊 Modelo de Datos

El sistema gestiona las siguientes entidades principales:

### Entidades

1. **APP_USER** - Usuarios del sistema
   - Campos: username, name, password (BCrypt), role, enabled
   - Roles: ADMIN, RECEPTIONIST, DENTIST

2. **DENTIST** - Información de dentistas
   - Relación 1:1 con APP_USER
   - Relación N:M con SPECIALTY
   - Campos: licenseNumber, commissionRate

3. **SPECIALTY** - Especialidades odontológicas
   - Ejemplos: Ortodoncia, Endodoncia, Cirugía Oral, Odontopediatría

4. **SERVICE** - Servicios/tratamientos
   - Relación N:1 con SPECIALTY
   - Campos: name, standardCost, listPrice

5. **PATIENT** - Pacientes
   - Campos: name, birthDate, gender, phone, email

6. **APPOINTMENT** - Citas médicas
   - Relación N:1 con PATIENT y DENTIST
   - Estados: PENDING, COMPLETED, NO_SHOW
   - Campos: dateTime, status, totalAmount

7. **APPOINTMENT_DETAIL** - Detalle de servicios por cita
   - Relación N:1 con APPOINTMENT y SERVICE
   - Campos: quantity, priceApplied, paymentDate

### Diagrama de Relaciones

```
APP_USER ──1:1── DENTIST ──N:M── SPECIALTY
                   │                 │
                   │                 │
                   │             categoriza
                   │                 │
                   │                 ▼
              atiende            SERVICE
                   │                 │
                   ▼                 │
              APPOINTMENT            │
                   │                 │
                   │              se_usa_en
                   │                 │
              contiene               │
                   │                 │
                   ▼                 ▼
            APPOINTMENT_DETAIL ──────┘
                   
PATIENT ──solicita─▶ APPOINTMENT
```

---

## 🔐 Sistema de Seguridad

### Autenticación JWT

El sistema utiliza **JSON Web Tokens (JWT)** para autenticación stateless:

1. El usuario envía credenciales a `/api/auth/login`
2. El servidor valida y devuelve un token JWT
3. El cliente incluye el token en el header `Authorization: Bearer <token>` en cada petición
4. El servidor valida el token y extrae el usuario

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso completo: usuarios, dentistas, pacientes, citas, servicios, reportes |
| **RECEPTIONIST** | Gestión de citas, pacientes, servicios (sin acceso a usuarios ni reportes completos) |
| **DENTIST** | Consulta de sus propias citas y agenda |

### Endpoints Protegidos

- **Públicos**: `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- **Autenticados**: Todo lo demás requiere token JWT válido
- **Por rol**: Algunas rutas están restringidas por roles específicos

---

## 📱 Funcionalidades Principales

### Dashboard de Business Intelligence

- **8 KPIs en tiempo real**:
  - Total de pacientes
  - Total de citas / Citas completadas
  - Citas pendientes
  - Citas sin cobrar
  - Facturación total
  - Coste total
  - Ganancia neta
  - Pagos pendientes

- **3 Gráficas interactivas**:
  - Ingresos por dentista (barras)
  - Estado de citas (dona)
  - Tendencia mensual de ingresos y citas (líneas)

- **Filtrado por año** con selector desplegable

### Gestión de Citas

- **Calendario visual** estilo Google Calendar
  - Vista semanal con navegación por días
  - Horario de 8:00 a 20:00
  - Columna por cada dentista
  - Códigos de color según estado de cita

- **Lista de citas** con filtros avanzados:
  - Por paciente, dentista, estado, rango de fechas
  - Vista de detalles con servicios aplicados
  - Edición de estado y pagos

- **Formulario de nueva cita**:
  - Selección de paciente y dentista
  - Fecha y hora
  - Asignación de servicios con cantidades
  - Cálculo automático del total

### Gestión de Pacientes

- Listado con paginación y búsqueda
- Formulario de alta/edición con validación
- Campos: nombre, fecha de nacimiento, género, teléfono, email
- Historial de citas

### Gestión de Dentistas

- Alta/baja/modificación de dentistas
- Asignación de especialidades
- Configuración de tasa de comisión
- Vinculación con usuario del sistema

### Gestión de Servicios

- Catálogo de tratamientos
- Campos: nombre, categoría (especialidad), coste estándar, precio de venta
- Cálculo de márgenes

### Gestión de Usuarios

- Creación de cuentas (solo ADMIN)
- Asignación de roles
- Cambio de contraseña
- Activación/desactivación

---

## 🧪 Datos de Prueba

En modo **desarrollo**, el sistema genera automáticamente:

- 1 usuario admin
- 2-3 recepcionistas
- 8 especialidades odontológicas
- 5-8 dentistas con especialidades asignadas
- 30-50 servicios categorizados
- 100-200 pacientes
- 300-500 citas con estados y pagos variados

Esto permite probar todas las funcionalidades sin configuración adicional.

---

## 📖 Documentación Adicional

### Backend
- [README Backend](clinica3s-backend/README.md) - Instalación y configuración detallada
- [Plan de Desarrollo Backend](clinica3s-backend/docs/plan-desarrollo.md) - Arquitectura y decisiones técnicas
- [API Docs](http://localhost:8080/swagger-ui.html) - Documentación interactiva Swagger (con aplicación en ejecución)

### Frontend
- [README Frontend](clinica3s-frontend/README.md) - Instalación y scripts disponibles
- [Plan de Desarrollo Frontend](clinica3s-frontend/docs/plan-desarrollo.md) - Componentes y estructura

---

## 🚀 Despliegue en Producción

### Preparación del Backend

#### 1. Añadir dependencias para producción

Añadir al `pom.xml`:

```xml
<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Spring Boot Actuator (monitorización) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

#### 2. Configurar perfil de producción

Crear/modificar `application-production.yaml`:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate
    show-sql: false
  
  # Inicialización de base de datos con scripts SQL
  sql:
    init:
      mode: always
      platform: postgresql
      continue-on-error: true

application:
  security:
    jwt:
      secret-key: ${JWT_SECRET}
      expiration: ${JWT_EXPIRATION:86400000}
    cors:
      allowed-origins: ${CORS_ALLOWED_ORIGINS}
  users:
    admin:
      username: ${ADMIN_USERNAME:admin}
      password: ${ADMIN_PASSWORD}

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: when_authorized
```

#### 3. Variables de entorno requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `ENVIRONMENT` | Perfil activo | `production` |
| `DATABASE_URL` | URL conexión PostgreSQL | `jdbc:postgresql://host:5432/clinica3s` |
| `DATABASE_USERNAME` | Usuario BD | `clinica3s_user` |
| `DATABASE_PASSWORD` | Contraseña BD | `SecurePassword123!` |
| `JWT_SECRET` | Clave JWT (mín. 256 bits) | `TuClaveSecretaMuyLarga...` |
| `ADMIN_PASSWORD` | Contraseña admin inicial | `AdminSecure123!` |
| `CORS_ALLOWED_ORIGINS` | URLs frontend permitidas | `https://clinica3s.onrender.com` |

#### 4. Compilar para producción

```bash
cd clinica3s-backend
./mvnw clean package -DskipTests
```

El archivo JAR estará en `target/clinica3s-backend-0.0.1-SNAPSHOT.jar`

### Preparación del Frontend

#### 1. Configurar URL del API

Modificar `src/api/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

#### 2. Variables de entorno

Crear archivo `.env.production`:

```
VITE_API_URL=https://clinica3s-api.onrender.com
```

#### 3. Compilar para producción

```bash
cd clinica3s-frontend
npm install
npm run build
```

Los archivos estáticos estarán en `dist/`

### Despliegue en Render.com

#### Paso 1: Base de Datos PostgreSQL

1. Dashboard → New → PostgreSQL
2. Configurar:
   - **Name**: `clinica3s-db`
   - **Database**: `clinica3s`
   - **Region**: Elegir más cercana
   - **Plan**: Free o según necesidades
3. Copiar **Internal Database URL**

#### Paso 2: Backend (Web Service)

1. Dashboard → New → Web Service
2. Conectar repositorio Git
3. Configurar:
   - **Name**: `clinica3s-backend`
   - **Root Directory**: `clinica3s-backend`
   - **Runtime**: Java
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/clinica3s-backend-0.0.1-SNAPSHOT.jar`
4. Variables de entorno (ver tabla anterior)
5. **Health Check Path**: `/actuator/health`

#### Paso 3: Frontend (Static Site)

1. Dashboard → New → Static Site
2. Conectar repositorio Git
3. Configurar:
   - **Name**: `clinica3s-frontend`
   - **Root Directory**: `clinica3s-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Variables de entorno:
   ```
   VITE_API_URL=https://clinica3s-backend.onrender.com
   ```
5. **Rewrite Rules**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

#### Paso 4: Actualizar CORS

Actualizar variable `CORS_ALLOWED_ORIGINS` del backend con la URL real del frontend:

```
CORS_ALLOWED_ORIGINS=https://clinica3s-frontend.onrender.com
```

### Verificación del Despliegue

```bash
# Health check del backend
curl https://clinica3s-backend.onrender.com/actuator/health

# Login de prueba
curl -X POST https://clinica3s-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"TU_PASSWORD"}'
```

Acceder al frontend en `https://clinica3s-frontend.onrender.com` y verificar login.

---

## 🐛 Troubleshooting

### Backend no conecta a PostgreSQL

- Verificar que `DATABASE_URL` usa formato JDBC: `jdbc:postgresql://...`
- Comprobar que backend y BD están en la misma región de Render
- Usar **Internal Database URL** en lugar de External

### Error CORS en frontend

- Verificar que `CORS_ALLOWED_ORIGINS` incluye la URL exacta del frontend
- No incluir `/` al final de las URLs
- Comprobar que el token JWT se envía correctamente

### Esquema de base de datos no se crea en PostgreSQL

- Verificar que los archivos `schema-postgresql.sql` y `data-postgresql.sql` existen en `src/main/resources/`
- Comprobar que `spring.sql.init.mode=always` está configurado
- Revisar logs de inicio para detectar errores en la ejecución de scripts SQL
- Asegurar que `spring.jpa.hibernate.ddl-auto=validate` (no debe ser `create` o `update` en producción)

### Aplicación "se duerme" (Render Free)

- El plan gratuito suspende servicios tras 15 min de inactividad
- Primera request tarda ~30s en despertar
- Considerar plan de pago para servicios siempre activos

---

## 📄 Licencia

Este proyecto es software educativo desarrollado para el Máster en Ingeniería Informática (MEI).

---

## 👥 Autores

Desarrollado por estudiantes del MEI - Universidad de Vigo

---

## 📞 Soporte

Para más información, consultar la documentación detallada en los subdirectorios `docs/` de cada módulo.

---

**Documento actualizado**: Enero 2026  
**Versión**: 1.0