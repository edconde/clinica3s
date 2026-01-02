package io.github.edconde.clinica3s_backend.config;

import io.github.edconde.clinica3s_backend.entity.*;
import io.github.edconde.clinica3s_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final SpecialtyRepository specialtyRepository;
    private final ServiceRepository serviceRepository;
    private final DentistRepository dentistRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    private final Faker faker = new Faker(new Locale("es"));
    private final Random random = new Random();

    @Value("${application.users.admin.username}")
    private String adminUsername;
    @Value("${application.users.admin.password}")
    private String adminPassword;
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @Override
    @Transactional
    public void run(String... args) {
        // En producción, solo crear el usuario admin si no existe
        if ("production".equalsIgnoreCase(activeProfile)) {
            createAdminUser();
            return;
        }

        if (userRepository.count() > 0) {
            log.info("Base de datos ya inicializada.");
            return;
        }

        log.info("Inicializando datos de prueba...");

        // Crear especialidades
        List<Specialty> specialties = createSpecialties();

        // Crear servicios
        List<Service> services = createServices(specialties);

        // Crear usuarios admin
        createAdminUser();

        // Crear usuarios recepcionistas (3)
        createReceptionists();

        // Crear dentistas con sus usuarios (8 en total)
        List<Dentist> dentists = createDentists(specialties);

        // Crear pacientes (10000)
        List<Patient> patients = createPatients(10000);

        // Crear citas (2000)
        createAppointments(patients, dentists, services, 20000);

        log.info("===========================================");
        log.info("DATOS DE PRUEBA CARGADOS");
        log.info("Usuarios: admin/admin123");
        log.info("Recepcionistas: recepcion1/recepcion123, recepcion2/recepcion123, recepcion3/recepcion123");
        log.info("Dentistas: dr.martinez/dentist123, dra.lopez/dentist123, y 6 más con password dentist123");
        log.info("Pacientes: 10000 generados");
        log.info("Citas: 2000 generadas (pasadas y futuras)");
        log.info("===========================================");
    }

    private List<Specialty> createSpecialties() {
        List<String> specialtyNames = List.of(
                "Odontología General",
                "Ortodoncia",
                "Endodoncia",
                "Cirugía Oral",
                "Periodoncia",
                "Prostodoncia",
                "Odontopediatría",
                "Odontología Conservadora"
        );

        List<Specialty> specialties = new ArrayList<>();
        for (String name : specialtyNames) {
            specialties.add(specialtyRepository.save(Specialty.builder().name(name).build()));
        }
        log.info("Creadas {} especialidades", specialties.size());
        return specialties;
    }

    private List<Service> createServices(List<Specialty> specialties) {
        Map<String, Specialty> specialtyMap = new HashMap<>();
        for (Specialty s : specialties) {
            specialtyMap.put(s.getName(), s);
        }

        List<Service> services = new ArrayList<>();

        // Servicios de Odontología General
        services.add(createService("Limpieza Dental", 30.0, 50.0, specialtyMap.get("Odontología General")));
        services.add(createService("Revisión General", 20.0, 35.0, specialtyMap.get("Odontología General")));
        services.add(createService("Extracción Simple", 40.0, 80.0, specialtyMap.get("Odontología General")));
        services.add(createService("Radiografía Dental", 15.0, 30.0, specialtyMap.get("Odontología General")));

        // Servicios de Ortodoncia
        services.add(createService("Brackets Metálicos", 500.0, 1200.0, specialtyMap.get("Ortodoncia")));
        services.add(createService("Brackets Cerámicos", 700.0, 1800.0, specialtyMap.get("Ortodoncia")));
        services.add(createService("Invisalign", 1500.0, 3500.0, specialtyMap.get("Ortodoncia")));
        services.add(createService("Ajuste de Ortodoncia", 30.0, 60.0, specialtyMap.get("Ortodoncia")));

        // Servicios de Endodoncia
        services.add(createService("Tratamiento de Conducto", 150.0, 300.0, specialtyMap.get("Endodoncia")));
        services.add(createService("Retratamiento de Conducto", 200.0, 400.0, specialtyMap.get("Endodoncia")));
        services.add(createService("Apicoectomía", 250.0, 500.0, specialtyMap.get("Endodoncia")));

        // Servicios de Cirugía Oral
        services.add(createService("Extracción de Muela del Juicio", 100.0, 200.0, specialtyMap.get("Cirugía Oral")));
        services.add(createService("Implante Dental", 800.0, 1500.0, specialtyMap.get("Cirugía Oral")));
        services.add(createService("Injerto Óseo", 400.0, 800.0, specialtyMap.get("Cirugía Oral")));

        // Servicios de Periodoncia
        services.add(createService("Curetaje", 80.0, 150.0, specialtyMap.get("Periodoncia")));
        services.add(createService("Tratamiento Periodontal", 200.0, 400.0, specialtyMap.get("Periodoncia")));
        services.add(createService("Mantenimiento Periodontal", 50.0, 100.0, specialtyMap.get("Periodoncia")));

        // Servicios de Prostodoncia
        services.add(createService("Corona Dental", 300.0, 600.0, specialtyMap.get("Prostodoncia")));
        services.add(createService("Puente Dental", 600.0, 1200.0, specialtyMap.get("Prostodoncia")));
        services.add(createService("Prótesis Removible", 400.0, 800.0, specialtyMap.get("Prostodoncia")));
        services.add(createService("Carillas de Porcelana", 350.0, 700.0, specialtyMap.get("Prostodoncia")));

        // Servicios de Odontopediatría
        services.add(createService("Revisión Infantil", 25.0, 40.0, specialtyMap.get("Odontopediatría")));
        services.add(createService("Selladores Dentales", 20.0, 40.0, specialtyMap.get("Odontopediatría")));
        services.add(createService("Fluorización", 15.0, 30.0, specialtyMap.get("Odontopediatría")));
        services.add(createService("Pulpotomía", 60.0, 120.0, specialtyMap.get("Odontopediatría")));

        // Servicios de Odontología Conservadora
        services.add(createService("Empaste Simple", 40.0, 80.0, specialtyMap.get("Odontología Conservadora")));
        services.add(createService("Empaste Compuesto", 60.0, 120.0, specialtyMap.get("Odontología Conservadora")));
        services.add(createService("Reconstrucción Dental", 100.0, 200.0, specialtyMap.get("Odontología Conservadora")));
        services.add(createService("Blanqueamiento Dental", 150.0, 300.0, specialtyMap.get("Odontología Conservadora")));

        log.info("Creados {} servicios", services.size());
        return services;
    }

    private Service createService(String name, Double standardCost, Double listPrice, Specialty specialty) {
        return serviceRepository.save(Service.builder()
                .name(name)
                .standardCost(standardCost)
                .listPrice(listPrice)
                .specialty(specialty)
                .build());
    }

    private void createAdminUser() {
        if (userRepository.findByUsername(adminUsername).isPresent()) {
            log.info("Usuario admin '{}' ya existe, omitiendo creación", adminUsername);
            return;
        }

        userRepository.save(AppUser.builder()
                .username(adminUsername)
                .name("Administrador del Sistema")
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .enabled(true)
                .build());
        log.info("Usuario admin creado");
    }

    private void createReceptionists() {
        String[] receptionistNames = {"María García López", "Pedro Sánchez Ruiz", "Laura Martín Díaz"};
        for (int i = 1; i <= 3; i++) {
            userRepository.save(AppUser.builder()
                    .username("recepcion" + i)
                    .name(receptionistNames[i - 1])
                    .password(passwordEncoder.encode("recepcion123"))
                    .role(Role.RECEPTIONIST)
                    .enabled(true)
                    .build());
        }
        log.info("Creados 3 usuarios recepcionistas");
    }

    private List<Dentist> createDentists(List<Specialty> specialties) {
        List<Dentist> dentists = new ArrayList<>();

        // Datos predefinidos para los primeros dentistas
        String[][] predefinedDentists = {
                {"dr.martinez", "Dr. Carlos Martínez", "COL-12345"},
                {"dra.lopez", "Dra. Ana López", "COL-67890"},
                {"dr.garcia", "Dr. Miguel García", "COL-11111"},
                {"dra.fernandez", "Dra. Laura Fernández", "COL-22222"},
                {"dr.rodriguez", "Dr. Pablo Rodríguez", "COL-33333"},
                {"dra.sanchez", "Dra. Elena Sánchez", "COL-44444"},
                {"dr.perez", "Dr. Javier Pérez", "COL-55555"},
                {"dra.gomez", "Dra. Carmen Gómez", "COL-66666"}
        };

        for (int i = 0; i < predefinedDentists.length; i++) {
            String[] data = predefinedDentists[i];

            AppUser dentistUser = userRepository.save(AppUser.builder()
                    .username(data[0])
                    .name(data[1])
                    .password(passwordEncoder.encode("dentist123"))
                    .role(Role.DENTIST)
                    .enabled(true)
                    .build());

            // Asignar 1-3 especialidades aleatorias
            Set<Specialty> dentistSpecialties = new HashSet<>();
            int numSpecialties = random.nextInt(3) + 1;
            List<Specialty> shuffled = new ArrayList<>(specialties);
            Collections.shuffle(shuffled);
            for (int j = 0; j < numSpecialties; j++) {
                dentistSpecialties.add(shuffled.get(j));
            }

            Dentist dentist = dentistRepository.save(Dentist.builder()
                    .licenseNumber(data[2])
                    .commissionRate(10.0 + random.nextInt(15))
                    .user(dentistUser)
                    .specialties(dentistSpecialties)
                    .build());

            dentists.add(dentist);
        }

        log.info("Creados {} dentistas", dentists.size());
        return dentists;
    }

    private List<Patient> createPatients(int count) {
        List<Patient> patients = new ArrayList<>();
        String[] genders = {"M", "F"};

        for (int i = 0; i < count; i++) {
            String gender = genders[random.nextInt(2)];
            String firstName = gender.equals("M")
                    ? faker.name().malefirstName()
                    : faker.name().femaleFirstName();
            String lastName = faker.name().lastName();

            Patient patient = patientRepository.save(Patient.builder()
                    .name(firstName + " " + lastName)
                    .birthDate(faker.date().birthday(5, 80).toLocalDateTime().toLocalDate())
                    .gender(gender)
                    .phone(faker.phoneNumber().cellPhone())
                    .email(faker.internet().emailAddress(
                            (firstName + "." + lastName).toLowerCase()
                                    .replaceAll("[^a-z0-9.]", "") + random.nextInt(1000)))
                    .build());

            patients.add(patient);
        }

        log.info("Creados {} pacientes", patients.size());
        return patients;
    }

    private void createAppointments(List<Patient> patients, List<Dentist> dentists,
                                     List<Service> services, int count) {
        LocalDateTime now = LocalDateTime.now();
        int pastCount = 0;
        int futureCount = 0;
        int todayCount = 0;

        // Distribuir citas uniformemente en 455 días (365 pasados + 90 futuros)
        // Esto da aproximadamente 4-5 citas por día
        int totalDays = 365 + 90; // 455 días

        for (int i = 0; i < count; i++) {
            Patient patient = patients.get(random.nextInt(patients.size()));
            Dentist dentist = dentists.get(random.nextInt(dentists.size()));

            // Seleccionar un día aleatorio en el rango de -365 a +90 días
            int dayOffset = random.nextInt(totalDays) - 365; // Rango: -365 a +89
            LocalDateTime appointmentDateTime = now.plusDays(dayOffset)
                    .withHour(9 + random.nextInt(10))
                    .withMinute(random.nextBoolean() ? 0 : 30)
                    .withSecond(0)
                    .withNano(0);

            // Contar por categoría
            if (dayOffset < 0) {
                pastCount++;
            } else if (dayOffset == 0) {
                todayCount++;
            } else {
                futureCount++;
            }

            // Determinar estado basado en si es pasada, futura o de hoy
            AppointmentStatus status;

            if (dayOffset < 0) {
                // Citas pasadas
                double statusRandom = random.nextDouble();
                if (statusRandom < 0.85) {
                    status = AppointmentStatus.COMPLETED;
                } else if (statusRandom < 0.95) {
                    status = AppointmentStatus.NO_SHOW;
                } else {
                    status = AppointmentStatus.PENDING;
                }
            } else if (dayOffset == 0) {
                // Citas de hoy
                if (appointmentDateTime.getHour() < now.getHour()) {
                    status = random.nextDouble() < 0.7 ? AppointmentStatus.COMPLETED : AppointmentStatus.PENDING;
                } else {
                    status = AppointmentStatus.PENDING;
                }
            } else {
                // Citas futuras
                status = AppointmentStatus.PENDING;
            }

            // Crear cita
            Appointment appointment = Appointment.builder()
                    .dateTime(appointmentDateTime)
                    .status(status)
                    .patient(patient)
                    .dentist(dentist)
                    .totalAmount(0.0)
                    .build();

            // Agregar 1-3 servicios aleatorios
            int numServices = random.nextInt(3) + 1;
            double totalAmount = 0.0;
            Set<Long> usedServiceIds = new HashSet<>();

            // Determinar si esta cita completada tendrá pagos pendientes (15% de probabilidad)
            boolean hasUnpaidServices = status == AppointmentStatus.COMPLETED && random.nextDouble() < 0.15;

            for (int j = 0; j < numServices; j++) {
                Service service = services.get(random.nextInt(services.size()));

                // Evitar duplicados
                if (usedServiceIds.contains(service.getId())) {
                    continue;
                }
                usedServiceIds.add(service.getId());

                int quantity = random.nextInt(2) + 1;
                double priceApplied = service.getListPrice();

                AppointmentDetail detail = AppointmentDetail.builder()
                        .service(service)
                        .quantity(quantity)
                        .priceApplied(priceApplied)
                        .build();

                // Si la cita está completada, determinar si este detalle está pagado
                if (status == AppointmentStatus.COMPLETED) {
                    if (hasUnpaidServices) {
                        // Para citas con pagos pendientes, 70% de los detalles no están pagados
                        if (random.nextDouble() <= 0.30) {
                            // Este detalle sí está pagado
                            detail.setPaymentDate(appointmentDateTime.plusMinutes(30 + random.nextInt(60)));
                        }
                        // Si no, paymentDate queda null (pendiente de pago)
                    } else {
                        // Cita completamente pagada
                        detail.setPaymentDate(appointmentDateTime.plusMinutes(30 + random.nextInt(60)));
                    }
                }

                appointment.addDetail(detail);
                totalAmount += priceApplied * quantity;
            }

            appointment.setTotalAmount(totalAmount);
            appointmentRepository.save(appointment);
        }

        log.info("Creadas {} citas ({} pasadas, {} hoy, {} futuras)", count, pastCount, todayCount, futureCount);
    }
}

