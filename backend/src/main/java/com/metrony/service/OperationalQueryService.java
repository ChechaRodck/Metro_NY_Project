package com.metrony.service;

import com.metrony.dto.OperationalResponses.BlockedCardResponse;
import com.metrony.dto.OperationalResponses.CardBalanceResponse;
import com.metrony.dto.OperationalResponses.CardIssueResponse;
import com.metrony.dto.OperationalResponses.CardSummaryResponse;
import com.metrony.dto.OperationalResponses.CertificationSummaryResponse;
import com.metrony.dto.OperationalResponses.DashboardSummaryResponse;
import com.metrony.dto.OperationalResponses.EmployeeOptionResponse;
import com.metrony.dto.OperationalResponses.HorarioSummaryResponse;
import com.metrony.dto.OperationalResponses.RechargeSummaryResponse;
import com.metrony.repository.PasajeroRepository;
import com.metrony.repository.PersonalRepository;
import com.metrony.repository.ReporteRepository;
import com.metrony.repository.RutaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class OperationalQueryService {

    private final ReporteRepository reportes;
    private final RutaRepository rutas;
    private final PersonalRepository personal;
    private final PasajeroRepository pasajeros;

    public OperationalQueryService(ReporteRepository reportes, RutaRepository rutas,
                                   PersonalRepository personal, PasajeroRepository pasajeros) {
        this.reportes = reportes;
        this.rutas = rutas;
        this.personal = personal;
        this.pasajeros = pasajeros;
    }

    public DashboardSummaryResponse dashboardSummary() {
        Map<String, Object> row = reportes.resumen();
        return new DashboardSummaryResponse(
                longValue(row, "lineasActivas"), longValue(row, "estacionesCerradas"),
                longValue(row, "viajesEnCurso"), longValue(row, "viajesHoy"),
                longValue(row, "trenesDisponibles"), longValue(row, "trenesMantenimiento"),
                longValue(row, "incidentesAbiertos"), longValue(row, "ordenesPendientes"),
                longValue(row, "certificacionesPorVencer"), decimalValue(row, "recaudadoHoy"));
    }

    public List<HorarioSummaryResponse> schedules() {
        return rutas.listarHorarios().stream().map(row -> new HorarioSummaryResponse(
                longValue(row, "idHorario"), longValue(row, "idRuta"), text(row, "codigoRuta"),
                text(row, "idLinea"), text(row, "diaSemana"), text(row, "horaInicio"),
                text(row, "horaFin"), integerValue(row, "frecuenciaMin"), text(row, "tipoServicio"),
                dateValue(row, "fechaInicioVigor"), dateValue(row, "fechaFinVigor"), text(row, "estado")))
                .toList();
    }

    public List<CertificationSummaryResponse> certifications() {
        return personal.listarCertificaciones().stream().map(row -> new CertificationSummaryResponse(
                longValue(row, "idCertificacion"), longValue(row, "idEmpleado"), text(row, "empleado"),
                text(row, "tipoCertificacion"), dateValue(row, "fechaEmision"),
                dateValue(row, "fechaVencimiento"), text(row, "institucionEmisora"),
                text(row, "modelos"), text(row, "estado"))).toList();
    }

    public List<EmployeeOptionResponse> employeeOptions() {
        return personal.listarEmpleados(null, "ACTIVO").stream().map(row -> new EmployeeOptionResponse(
                longValue(row, "idEmpleado"),
                (text(row, "nombres") + " " + text(row, "apellidos")).trim(),
                text(row, "codigoCargo"))).toList();
    }

    public List<CardSummaryResponse> cards() {
        return pasajeros.listarTarjetas().stream().map(OperationalQueryService::card).toList();
    }

    public List<CardSummaryResponse> cardsForPassenger(Long passengerId) {
        return pasajeros.tarjetasDePasajero(passengerId).stream().map(OperationalQueryService::card).toList();
    }

    public CardSummaryResponse card(Long number) {
        return card(pasajeros.buscarTarjeta(number));
    }

    public CardIssueResponse issuedCard(Long number) {
        return new CardIssueResponse(maskCardNumber(number));
    }

    public CardBalanceResponse balance(Long number) {
        Map<String, Object> row = pasajeros.saldo(number);
        return new CardBalanceResponse(maskCardNumber(number), decimalValue(row, "saldo"));
    }

    public List<RechargeSummaryResponse> recharges() {
        return pasajeros.listarRecargas().stream().map(OperationalQueryService::recharge).toList();
    }

    public List<RechargeSummaryResponse> rechargesForCard(Long number) {
        return pasajeros.recargasDeTarjeta(number).stream().map(row -> recharge(row, number)).toList();
    }

    public List<CardSummaryResponse> cardAlerts() {
        return pasajeros.tarjetasConAlerta().stream().map(OperationalQueryService::card).toList();
    }

    public List<BlockedCardResponse> blockedCards() {
        return reportes.tarjetasBloqueadasVencidas().stream().map(row -> new BlockedCardResponse(
                maskCardNumber(row.get("numeroTarjeta")), text(row, "pasajero"), text(row, "estado"),
                dateValue(row, "fechaVencimiento"), decimalValue(row, "saldo"))).toList();
    }

    public static String maskCardNumber(Object value) {
        if (value == null) return "**** **** **** ----";
        String digits = value.toString().replaceAll("\\D", "");
        String suffix = digits.length() <= 4 ? digits : digits.substring(digits.length() - 4);
        return "**** **** **** " + suffix;
    }

    private static CardSummaryResponse card(Map<String, Object> row) {
        return new CardSummaryResponse(
                maskCardNumber(row.get("numeroTarjeta")), longValue(row, "idPasajero"), text(row, "pasajero"),
                text(row, "codigoTarifa"), text(row, "tarifa"), text(row, "tipoProducto"),
                decimalValue(row, "saldo"), dateValue(row, "fechaEmision"),
                dateValue(row, "fechaVencimiento"), text(row, "estado"));
    }

    private static RechargeSummaryResponse recharge(Map<String, Object> row) {
        return recharge(row, row.get("numeroTarjeta"));
    }

    private static RechargeSummaryResponse recharge(Map<String, Object> row, Object number) {
        return new RechargeSummaryResponse(
                longValue(row, "numeroTransaccion"), maskCardNumber(number), text(row, "pasajero"),
                dateTimeValue(row, "fechaHora"), decimalValue(row, "monto"), text(row, "medioPago"),
                text(row, "canal"), longValue(row, "idEstacion"), text(row, "estacion"), text(row, "estado"));
    }

    private static String text(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value == null ? null : value.toString();
    }

    private static Long longValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) return null;
        return value instanceof Number number ? number.longValue() : Long.valueOf(value.toString());
    }

    private static Integer integerValue(Map<String, Object> row, String key) {
        Long value = longValue(row, key);
        return value == null ? null : value.intValue();
    }

    private static BigDecimal decimalValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) return null;
        return value instanceof BigDecimal decimal ? decimal : new BigDecimal(value.toString());
    }

    private static LocalDate dateValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) return null;
        if (value instanceof LocalDate date) return date;
        return LocalDate.parse(value.toString());
    }

    private static LocalDateTime dateTimeValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) return null;
        if (value instanceof LocalDateTime dateTime) return dateTime;
        return LocalDateTime.parse(value.toString());
    }
}
