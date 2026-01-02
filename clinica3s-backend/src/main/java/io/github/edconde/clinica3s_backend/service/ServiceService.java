package io.github.edconde.clinica3s_backend.service;

import io.github.edconde.clinica3s_backend.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public Page<io.github.edconde.clinica3s_backend.entity.Service> findAll(Pageable pageable) {
        return serviceRepository.findAll(pageable);
    }

    public List<io.github.edconde.clinica3s_backend.entity.Service> findAll() {
        return serviceRepository.findAll();
    }

    public io.github.edconde.clinica3s_backend.entity.Service findById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }

    public List<io.github.edconde.clinica3s_backend.entity.Service> findBySpecialtyId(Long specialtyId) {
        return serviceRepository.findBySpecialtyId(specialtyId);
    }

    @Transactional
    public io.github.edconde.clinica3s_backend.entity.Service create(io.github.edconde.clinica3s_backend.entity.Service service) {
        return serviceRepository.save(service);
    }

    @Transactional
    public io.github.edconde.clinica3s_backend.entity.Service update(Long id, io.github.edconde.clinica3s_backend.entity.Service service) {
        io.github.edconde.clinica3s_backend.entity.Service existing = findById(id);
        existing.setName(service.getName());
        existing.setStandardCost(service.getStandardCost());
        existing.setListPrice(service.getListPrice());
        existing.setSpecialty(service.getSpecialty());
        return serviceRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new RuntimeException("Servicio no encontrado");
        }
        serviceRepository.deleteById(id);
    }
}

