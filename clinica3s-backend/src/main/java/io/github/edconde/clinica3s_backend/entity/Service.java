package io.github.edconde.clinica3s_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "service")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "standard_cost", nullable = false)
    private Double standardCost;

    @Column(name = "list_price", nullable = false)
    private Double listPrice;

    @ManyToOne
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;
}

