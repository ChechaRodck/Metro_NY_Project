package com.metrony.service;

import com.metrony.repository.PasajeroRepository;
import com.metrony.repository.PersonalRepository;
import com.metrony.repository.ReporteRepository;
import com.metrony.repository.RutaRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OperationalQueryServiceTest {

    private final ReporteRepository reportes = mock(ReporteRepository.class);
    private final RutaRepository rutas = mock(RutaRepository.class);
    private final PersonalRepository personal = mock(PersonalRepository.class);
    private final PasajeroRepository pasajeros = mock(PasajeroRepository.class);
    private final OperationalQueryService service = new OperationalQueryService(reportes, rutas, personal, pasajeros);

    @Test
    void adaptsTheDashboardSummaryWithoutInventingValues() {
        when(reportes.resumen()).thenReturn(Map.of(
                "lineasActivas", 5, "estacionesCerradas", 1, "viajesEnCurso", 2,
                "viajesHoy", 30, "trenesDisponibles", 8, "trenesMantenimiento", 3,
                "incidentesAbiertos", 4, "ordenesPendientes", 6,
                "certificacionesPorVencer", 7, "recaudadoHoy", new BigDecimal("125.50")));

        var response = service.dashboardSummary();

        assertThat(response.lineasActivas()).isEqualTo(5L);
        assertThat(response.recaudadoHoy()).isEqualByComparingTo("125.50");
    }

    @Test
    void exposesGlobalSchedulesAndCertificationsAsTypedContracts() {
        when(rutas.listarHorarios()).thenReturn(List.of(Map.ofEntries(
                Map.entry("idHorario", 4), Map.entry("idRuta", 2), Map.entry("codigoRuta", "A-N"),
                Map.entry("idLinea", "A"), Map.entry("diaSemana", "LUN-VIE"),
                Map.entry("horaInicio", "05:00"), Map.entry("horaFin", "23:00"),
                Map.entry("frecuenciaMin", 8), Map.entry("tipoServicio", "LOCAL"),
                Map.entry("fechaInicioVigor", LocalDateTime.of(2026, 1, 1, 0, 0)), Map.entry("estado", "ACTIVO"))));
        when(personal.listarCertificaciones()).thenReturn(List.of(Map.ofEntries(
                Map.entry("idCertificacion", 9), Map.entry("idEmpleado", 3), Map.entry("empleado", "Ana Metro"),
                Map.entry("tipoCertificacion", "CONDUCCION"), Map.entry("fechaEmision", LocalDateTime.of(2025, 1, 1, 0, 0)),
                Map.entry("fechaVencimiento", LocalDateTime.of(2027, 1, 1, 0, 0)), Map.entry("institucionEmisora", "Metro NY"),
                Map.entry("modelos", "R160"), Map.entry("estado", "VIGENTE"))));

        assertThat(service.schedules()).singleElement().satisfies(schedule -> {
            assertThat(schedule.idHorario()).isEqualTo(4L);
            assertThat(schedule.codigoRuta()).isEqualTo("A-N");
        });
        assertThat(service.certifications()).singleElement().satisfies(certification -> {
            assertThat(certification.idEmpleado()).isEqualTo(3L);
            assertThat(certification.estado()).isEqualTo("VIGENTE");
        });
    }

    @Test
    void exposesOnlyTheFieldsRequiredByEmployeeSelectors() {
        when(personal.listarEmpleados(null, "ACTIVO")).thenReturn(List.of(Map.of(
                "idEmpleado", 12,
                "nombres", "Ana",
                "apellidos", "Metro",
                "codigoCargo", "CONDUCTOR")));

        assertThat(service.employeeOptions()).singleElement().satisfies(option -> {
            assertThat(option.idEmpleado()).isEqualTo(12L);
            assertThat(option.nombre()).isEqualTo("Ana Metro");
            assertThat(option.codigoCargo()).isEqualTo("CONDUCTOR");
        });
    }

    @Test
    void masksEveryCardNumberInCardAndRechargeResponses() {
        long fullNumber = 1234567890124242L;
        when(pasajeros.listarTarjetas()).thenReturn(List.of(Map.ofEntries(
                Map.entry("numeroTarjeta", fullNumber), Map.entry("idPasajero", 2),
                Map.entry("pasajero", "Usuario QA"), Map.entry("codigoTarifa", "VI-REG"),
                Map.entry("tarifa", "Viaje individual"), Map.entry("tipoProducto", "VIAJE_INDIVIDUAL"),
                Map.entry("saldo", new BigDecimal("10.00")), Map.entry("fechaEmision", LocalDateTime.of(2026, 1, 1, 0, 0)),
                Map.entry("estado", "ACTIVA"))));
        when(pasajeros.listarRecargas()).thenReturn(List.of(Map.ofEntries(
                Map.entry("numeroTransaccion", 15), Map.entry("numeroTarjeta", fullNumber),
                Map.entry("pasajero", "Usuario QA"), Map.entry("fechaHora", LocalDateTime.of(2026, 1, 2, 8, 30)),
                Map.entry("monto", new BigDecimal("20.00")), Map.entry("medioPago", "EFECTIVO"),
                Map.entry("canal", "TAQUILLA"), Map.entry("estado", "APROBADA"))));

        assertThat(service.cards()).singleElement().satisfies(card ->
                assertThat(card.numeroMascarado()).isEqualTo("**** **** **** 4242"));
        assertThat(service.recharges()).singleElement().satisfies(recharge ->
                assertThat(recharge.numeroMascarado()).isEqualTo("**** **** **** 4242"));
    }

    @Test
    void maskNeverReturnsTheOriginalNumber() {
        assertThat(OperationalQueryService.maskCardNumber(1234567890123456L))
                .isEqualTo("**** **** **** 3456")
                .doesNotContain("1234567890123456");
        assertThat(OperationalQueryService.maskCardNumber(null)).isEqualTo("**** **** **** ----");
    }
}
