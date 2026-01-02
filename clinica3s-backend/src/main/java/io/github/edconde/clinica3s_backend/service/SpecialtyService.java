package io.github.edconde.clinica3s_backend.service;

import io.github.edconde.clinica3s_backend.entity.Specialty;
import io.github.edconde.clinica3s_backend.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;

    public Page<Specialty> findAll(Pageable pageable) {
        return specialtyRepository.findAll(pageable);
    }

    public List<Specialty> findAll() {
        return specialtyRepository.findAll();
    }

    public Specialty findById(Long id) {
        return specialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));
    }

    public Specialty findByName(String name) {
        return specialtyRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + name));
    }

    @Transactional
    public Specialty create(Specialty specialty) {
        return specialtyRepository.save(specialty);
    }

    @Transactional
    public Specialty update(Long id, Specialty specialty) {
        Specialty existing = findById(id);
        existing.setName(specialty.getName());
        return specialtyRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!specialtyRepository.existsById(id)) {
            throw new RuntimeException("Especialidad no encontrada");
        }
        specialtyRepository.deleteById(id);
    }
}

