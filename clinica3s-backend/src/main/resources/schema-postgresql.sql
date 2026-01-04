-- =====================================================
-- Schema inicial para Clinica3S - PostgreSQL
-- =====================================================

-- Tabla de usuarios de la aplicación
CREATE TABLE IF NOT EXISTS app_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DENTIST', 'RECEPTIONIST')),
    enabled BOOLEAN DEFAULT TRUE
);

-- Tabla de especialidades
CREATE TABLE IF NOT EXISTS specialty (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Tabla de dentistas
CREATE TABLE IF NOT EXISTS dentist (
    id BIGSERIAL PRIMARY KEY,
    license_number VARCHAR(255) NOT NULL UNIQUE,
    commission_rate DOUBLE PRECISION,
    user_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL
);

-- Tabla intermedia dentista-especialidad (ManyToMany)
CREATE TABLE IF NOT EXISTS dentist_specialty (
    dentist_id BIGINT NOT NULL REFERENCES dentist(id) ON DELETE CASCADE,
    specialty_id BIGINT NOT NULL REFERENCES specialty(id) ON DELETE CASCADE,
    PRIMARY KEY (dentist_id, specialty_id)
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS patient (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth_date DATE,
    gender VARCHAR(50),
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255)
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS service (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    standard_cost DOUBLE PRECISION NOT NULL,
    list_price DOUBLE PRECISION NOT NULL,
    specialty_id BIGINT REFERENCES specialty(id) ON DELETE SET NULL
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS appointment (
    id BIGSERIAL PRIMARY KEY,
    date_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'NO_SHOW')),
    total_amount DOUBLE PRECISION,
    patient_id BIGINT NOT NULL REFERENCES patient(id) ON DELETE RESTRICT,
    dentist_id BIGINT NOT NULL REFERENCES dentist(id) ON DELETE RESTRICT
);

-- Tabla de detalles de cita
CREATE TABLE IF NOT EXISTS appointment_detail (
    id BIGSERIAL PRIMARY KEY,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_applied DOUBLE PRECISION NOT NULL,
    payment_date TIMESTAMP,
    appointment_id BIGINT NOT NULL REFERENCES appointment(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES service(id) ON DELETE RESTRICT
);

-- =====================================================
-- Índices para mejorar rendimiento
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointment_date_time ON appointment(date_time);
CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointment(status);
CREATE INDEX IF NOT EXISTS idx_appointment_patient ON appointment(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_dentist ON appointment(dentist_id);
CREATE INDEX IF NOT EXISTS idx_appointment_detail_appointment ON appointment_detail(appointment_id);
CREATE INDEX IF NOT EXISTS idx_service_specialty ON service(specialty_id);
CREATE INDEX IF NOT EXISTS idx_dentist_user ON dentist(user_id);
