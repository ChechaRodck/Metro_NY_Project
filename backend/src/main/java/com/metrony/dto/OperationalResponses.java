package com.metrony.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Contratos de solo lectura agregados para las pantallas operativas.
 *
 * <p>Estos DTO evitan exponer la forma interna de los mapas JDBC y, en el caso
 * de tarjetas, garantizan que el número completo nunca se serialice.</p>
 */
public final class OperationalResponses {

    private OperationalResponses() {
    }

    public record DashboardSummaryResponse(
            Long lineasActivas,
            Long estacionesCerradas,
            Long viajesEnCurso,
            Long viajesHoy,
            Long trenesDisponibles,
            Long trenesMantenimiento,
            Long incidentesAbiertos,
            Long ordenesPendientes,
            Long certificacionesPorVencer,
            BigDecimal recaudadoHoy) {
    }

    public record HorarioSummaryResponse(
            Long idHorario,
            Long idRuta,
            String codigoRuta,
            String idLinea,
            String diaSemana,
            String horaInicio,
            String horaFin,
            Integer frecuenciaMin,
            String tipoServicio,
            LocalDate fechaInicioVigor,
            LocalDate fechaFinVigor,
            String estado) {
    }

    public record CertificationSummaryResponse(
            Long idCertificacion,
            Long idEmpleado,
            String empleado,
            String tipoCertificacion,
            LocalDate fechaEmision,
            LocalDate fechaVencimiento,
            String institucionEmisora,
            String modelos,
            String estado) {
    }

    public record EmployeeOptionResponse(
            Long idEmpleado,
            String nombre,
            String codigoCargo) {
    }

    public record CardSummaryResponse(
            String numeroMascarado,
            Long idPasajero,
            String pasajero,
            String codigoTarifa,
            String tarifa,
            String tipoProducto,
            BigDecimal saldo,
            LocalDate fechaEmision,
            LocalDate fechaVencimiento,
            String estado) {
    }

    public record CardIssueResponse(String numeroMascarado) {
    }

    public record CardBalanceResponse(String numeroMascarado, BigDecimal saldo) {
    }

    public record RechargeSummaryResponse(
            Long numeroTransaccion,
            String numeroMascarado,
            String pasajero,
            LocalDateTime fechaHora,
            BigDecimal monto,
            String medioPago,
            String canal,
            Long idEstacion,
            String estacion,
            String estado) {
    }

    public record BlockedCardResponse(
            String numeroMascarado,
            String pasajero,
            String estado,
            LocalDate fechaVencimiento,
            BigDecimal saldo) {
    }
}
