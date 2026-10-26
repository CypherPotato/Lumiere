package com.biblioteca.backend.dto;

import java.util.List;

public record AdminMetricasDTO(
        long totalUsuarios,
        long novosUsuarios,
        long logins24h,
        List<Hora> loginsPorHora,
        long totalLivros,
        long livrosDisponiveis,
        long livrosSuspensos,
        long livrosRemovidos,
        long volumeTrocas
) {
    public record Hora(String hora, long total) {}
}
