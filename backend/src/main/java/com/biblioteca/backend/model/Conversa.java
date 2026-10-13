package com.biblioteca.backend.model;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "conversa")
@NoArgsConstructor
public class Conversa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dataCriacao = LocalDateTime.now();

    @ManyToMany
    @JoinTable(
        name = "conversa_usuario",
        joinColumns = @JoinColumn(name = "conversa_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> participantes = new ArrayList<>();

    @OneToMany(mappedBy = "conversa")
    private List<Mensagem> mensagens = new ArrayList<>();
}
