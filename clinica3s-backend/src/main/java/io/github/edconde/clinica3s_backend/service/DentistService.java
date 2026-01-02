package io.github.edconde.clinica3s_backend.service;

import io.github.edconde.clinica3s_backend.entity.Dentist;
import io.github.edconde.clinica3s_backend.repository.DentistRepository;
import io.github.edconde.clinica3s_backend.repository.DentistSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DentistService {

    private final DentistRepository dentistRepository;

    public Page<Dentist> findAll(Pageable pageable) {
        return dentistRepository.findAll(pageable);
    }

    public List<Dentist> findAll() {
        return dentistRepository.findAll();
    }

    public Page<Dentist> findWithFilters(String name, Long specialtyId, Pageable pageable) {
        var spec = DentistSpecifications.buildSpecification(name, specialtyId);
        return dentistRepository.findAll(spec, pageable);
    }

    public Dentist findById(Long id) {
        return dentistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dentista no encontrado"));
    }

    public Dentist findByUserId(Long userId) {
        return dentistRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Dentista no encontrado para el usuario"));
    }

    public Dentist findByLicenseNumber(String licenseNumber) {
        return dentistRepository.findByLicenseNumber(licenseNumber)
                .orElseThrow(() -> new RuntimeException("Dentista no encontrado con número de licencia: " + licenseNumber));
    }

    @Transactional
    public Dentist create(Dentist dentist) {
        return dentistRepository.save(dentist);
    }

    @Transactional
    public Dentist update(Long id, Dentist dentist) {
        Dentist existing = findById(id);
        existing.setLicenseNumber(dentist.getLicenseNumber());
        existing.setCommissionRate(dentist.getCommissionRate());
        if (dentist.getSpecialties() != null) {
            existing.setSpecialties(dentist.getSpecialties());
        }
        return dentistRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!dentistRepository.existsById(id)) {
            throw new RuntimeException("Dentista no encontrado");
        }
        dentistRepository.deleteById(id);
    }
}

