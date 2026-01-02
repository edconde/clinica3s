package io.github.edconde.clinica3s_backend.service;

import io.github.edconde.clinica3s_backend.entity.Patient;
import io.github.edconde.clinica3s_backend.repository.PatientRepository;
import io.github.edconde.clinica3s_backend.repository.PatientSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public Page<Patient> findAll(Pageable pageable) {
        return patientRepository.findAll(pageable);
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Page<Patient> findWithFilters(String name, String phone, String email, Pageable pageable) {
        var spec = PatientSpecifications.buildSpecification(name, phone, email);
        return patientRepository.findAll(spec, pageable);
    }

    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }

    public Patient findByEmail(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con email: " + email));
    }

    @Transactional
    public Patient create(Patient patient) {
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient update(Long id, Patient patient) {
        Patient existing = findById(id);
        existing.setName(patient.getName());
        existing.setBirthDate(patient.getBirthDate());
        existing.setGender(patient.getGender());
        existing.setPhone(patient.getPhone());
        existing.setEmail(patient.getEmail());
        return patientRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Paciente no encontrado");
        }
        patientRepository.deleteById(id);
    }
}
