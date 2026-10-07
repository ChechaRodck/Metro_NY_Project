package com.metrony.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Cuerpos (JSON) que recibe la API.
 * Se juntaron todos en un solo archivo para no tener 40 archivos pequenos.
 * Las fechas van como "2026-09-25" y las fechas con hora como "2026-09-25T15:30:00".
 * Las validaciones fuertes (reglas de negocio) las hace Oracle.
 */
public final class Peticiones {

    private Peticiones() {
    }

    // ===================== RED =====================

    public record LineaRequest(
            @NotBlank String idLinea,
            @NotBlank String nombre,
            String colorMapa,
            @NotNull Long idTerminalOrigen,
            @NotNull Long idTerminalDestino,
            @NotBlank String tipoServicio,
            LocalDate fechaInauguracion,
            BigDecimal longitudKm,
            String operadorResponsable,
            String estadoOperativo) {
    }

    public record EstacionRequest(
            @NotBlank String codigoEstacion,
            @NotBlank String nombre,
            @NotBlank String direccion,
            @NotBlank String distrito,
            BigDecimal latitud,
            BigDecimal longitud,
            LocalDate fechaInauguracion,
            @PositiveOrZero Integer cantidadAccesos,
            @PositiveOrZero Integer cantidadPlataformas,
            @NotBlank String tipoEstacion,
            String estadoOperativo,
            String horaApertura,
            String horaCierre,
            Boolean accesibleDiscapacidad) {
    }

    public record EstacionLineaRequest(
            @NotNull Long idEstacion,
            Integer orden,
            BigDecimal distanciaKm,
            BigDecimal tiempoMin) {
    }

    public record PlataformaRequest(
            @NotBlank String codigoPlataforma,
            @NotBlank String direccionViaje,
            Integer capacidadAprox,
            String estadoOperativo) {
    }

    public record TransferenciaRequest(
            @NotNull Long idEstacion,
            @NotBlank String lineaA,
            @NotBlank String lineaB,
            @NotNull @PositiveOrZero BigDecimal tiempoMin) {
    }

    public record ServicioEstacionRequest(
            @NotNull Long idServicio,
            String observacion) {
    }

    // ===================== RUTAS Y HORARIOS =====================

    public record RutaRequest(
            @NotBlank String codigoRuta,
            @NotBlank String idLinea,
            @NotNull Long idEstacionOrigen,
            @NotNull Long idEstacionDestino,
            @NotBlank String sentido,
            @NotBlank String tipoServicio,
            BigDecimal distanciaTotalKm,
            @NotNull @Positive Integer duracionEstimadaMin,
            LocalDate fechaVigenciaInicio,
            LocalDate fechaVigenciaFin) {
    }

    public record ParadaRequest(
            @NotNull Long idEstacion,
            @NotNull @Positive Integer orden,
            BigDecimal minutosLlegada,
            BigDecimal minutosSalida,
            BigDecimal distanciaKm,
            BigDecimal tiempoMin,
            Boolean seDetiene) {
    }

    public record HorarioRequest(
            @NotBlank String diaSemana,
            @NotBlank String horaInicio,
            @NotBlank String horaFin,
            @NotNull @Positive Integer frecuenciaMin,
            @NotBlank String tipoServicio,
            LocalDate fechaInicioVigor,
            LocalDate fechaFinVigor) {
    }

    // ===================== VIAJES =====================

    public record ProgramarViajeRequest(
            @NotNull Long idRuta,
            @NotNull LocalDateTime salida,
            String codigoTren,
            Long idConductor,
            Integer pasajerosEstimados) {
    }

    public record GenerarViajesRequest(
            @NotNull Long idHorario,
            @NotNull LocalDate fecha) {
    }

    public record AsignacionRequest(
            String codigoTren,
            Long idConductor) {
    }

    public record CancelarRequest(String motivo) {
    }

    public record ReprogramarRequest(@NotNull LocalDateTime nuevaSalida) {
    }

    public record HoraRealRequest(
            LocalDateTime horaReal,
            Integer pasajeros) {
    }

    public record CancelarAfectadosRequest(
            @NotBlank String tipo,
            @NotNull Long id,
            LocalDateTime desde,
            LocalDateTime hasta,
            String motivo,
            Long numeroIncidente) {
    }

    // ===================== TRENES =====================

    public record TrenRequest(
            @NotBlank String codigoTren,
            @NotNull Long idModelo,
            @NotNull Integer anioFabricacion,
            @NotNull @Positive Integer capacidadTotal,
            BigDecimal kilometrajeKm,
            @NotNull Long idDeposito,
            LocalDate fechaUltimaInspeccion,
            @NotNull LocalDate fechaProximaInspeccion) {
    }

    public record VagonRequest(
            @NotBlank String numeroSerie,
            @NotBlank String tipoVagon,
            @NotNull @PositiveOrZero Integer capacidadSentados,
            @NotNull @PositiveOrZero Integer capacidadPie,
            Integer anioFabricacion,
            Boolean accesible) {
    }

    public record AsignarVagonRequest(
            @NotBlank String numeroSerie,
            @NotNull @Positive Integer posicion,
            LocalDateTime fecha) {
    }

    public record EstadoRequest(@NotBlank String estado) {
    }

    // ===================== PERSONAL =====================

    public record EmpleadoRequest(
            @NotBlank String nombres,
            @NotBlank String apellidos,
            @NotNull LocalDate fechaNacimiento,
            String direccion,
            String telefono,
            String correo,
            @NotNull LocalDate fechaContratacion,
            @NotNull Long idCargo,
            @NotBlank String turno,
            @NotNull @Positive BigDecimal salario,
            String estadoLaboral,
            Long idSupervisor) {
    }

    public record CertificacionRequest(
            @NotBlank String tipoCertificacion,
            @NotNull LocalDate fechaEmision,
            @NotNull LocalDate fechaVencimiento,
            @NotBlank String institucionEmisora,
            List<Long> modelos) {
    }

    public record TurnoRequest(
            @NotNull Long idEmpleado,
            @NotNull LocalDateTime horaInicio,
            @NotNull LocalDateTime horaFin,
            @NotBlank String tipoLugar,
            String idLugar,
            String funcion) {
    }

    public record AusenciaRequest(
            @NotNull Long idEmpleado,
            @NotBlank String tipo,
            @NotNull LocalDate fechaInicio,
            @NotNull LocalDate fechaFin,
            String motivo) {
    }

    public record SustitucionRequest(@NotNull Long idSustituto) {
    }

    // ===================== PASAJEROS Y TARJETAS =====================

    public record PasajeroRequest(
            @NotBlank String nombres,
            @NotBlank String apellidos,
            LocalDate fechaNacimiento,
            String correo,
            String telefono,
            @NotBlank String tipoPasajero) {
    }

    public record EmitirTarjetaRequest(
            Long idPasajero,
            @NotBlank String codigoTarifa,
            @PositiveOrZero BigDecimal saldoInicial,
            Long idEstacion) {
    }

    public record RecargaRequest(
            @NotNull @Positive BigDecimal monto,
            @NotBlank String medioPago,
            @NotBlank String canal,
            Long idEstacion) {
    }

    public record AccesoRequest(
            @NotNull Long numeroTarjeta,
            @NotNull Long idEstacion) {
    }

    public record BoletoRequest(
            @NotNull Long idEstacion,
            String codigoTarifa) {
    }

    public record TarifaRequest(
            @NotBlank String codigoTarifa,
            @NotBlank String nombre,
            String descripcion,
            @NotBlank String tipoProducto,
            @NotNull @PositiveOrZero BigDecimal monto,
            @NotBlank String tipoPasajero,
            LocalDate fechaInicioVigencia,
            LocalDate fechaFinVigencia,
            Integer cantidadMaxViajes,
            Integer duracionDias,
            String estado) {
    }

    // ===================== MANTENIMIENTO =====================

    public record EquipoRequest(
            @NotBlank String idEquipo,
            @NotBlank String tipoEquipo,
            @NotBlank String descripcionUbicacion,
            Long idEstacion,
            Long idPlataforma,
            String codigoTren,
            String numeroSerieVagon,
            String fabricante,
            String modelo,
            String numeroSerie,
            LocalDate fechaInstalacion,
            @NotNull @Positive Integer frecuenciaRevisionDias,
            LocalDate fechaProximaRevision) {
    }

    public record OrdenRequest(
            @NotBlank String idEquipo,
            @NotBlank String tipoMantenimiento,
            @NotBlank String descripcion,
            LocalDate fechaProgramada,
            String prioridad,
            @NotNull Long idTecnico,
            @PositiveOrZero BigDecimal costoManoObra) {
    }

    public record TecnicoOrdenRequest(
            @NotNull Long idEmpleado,
            String rol) {
    }

    public record HorasTecnicoRequest(@NotNull @PositiveOrZero BigDecimal horas) {
    }

    public record RepuestoOrdenRequest(
            @NotNull Long idRepuesto,
            @NotNull @Positive Integer cantidad) {
    }

    public record RepuestoRequest(
            @NotBlank String nombre,
            String descripcion,
            @NotNull @PositiveOrZero BigDecimal costoUnitario,
            @NotNull @PositiveOrZero Integer stock) {
    }

    // ===================== INCIDENTES =====================

    public record ElementoRequest(
            @NotBlank String tipoElemento,
            @NotBlank String idElemento,
            String efecto,
            Long idEstacionIni,
            Long idEstacionFin,
            Integer minutosRetraso,
            String descripcion) {
    }

    public record IncidenteRequest(
            @NotBlank String tipoIncidente,
            @NotBlank String descripcion,
            LocalDateTime fechaHoraInicio,
            @NotBlank String lugarAfectado,
            @NotBlank String severidad,
            Long idEmpleadoReporta,
            String reportadoPor,
            String causa,
            Integer pasajerosAfectados,
            List<@Valid ElementoRequest> elementos) {
    }

    public record AccionRequest(@NotBlank String accion) {
    }

    public record CerrarIncidenteRequest(
            LocalDateTime fechaFin,
            String causa,
            Boolean restablecer) {
    }
}
