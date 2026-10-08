import { apiRequest } from "./apiClient";
import { dateParts, labelCode, numberValue, requireList } from "./serviceUtils";

const passengerStates = { ACTIVO: "Activo", INACTIVO: "Inactivo", SUSPENDIDO: "Suspendido" };
const cardStates = { ACTIVA: "Activa", BLOQUEADA: "Bloqueada", VENCIDA: "Vencida", PERDIDA: "Perdida", CANCELADA: "Cancelada" };
const fareStates = { ACTIVA: "Activa", INACTIVA: "Inactiva" };

export async function getPassengerLedger({ signal } = {}) {
  const [passengers, cards, recharges, fares, stations] = await Promise.all([
    apiRequest("/api/pasajeros", { signal }), apiRequest("/api/tarjetas", { signal }),
    apiRequest("/api/recargas", { signal }), apiRequest("/api/tarifas", { signal }),
    apiRequest("/api/estaciones", { signal }),
  ]);
  return {
    passengers: requireList(passengers, "pasajeros").map((row) => ({
      id: String(row.idPasajero), apiId: Number(row.idPasajero), name: `${row.nombres ?? ""} ${row.apellidos ?? ""}`.trim(),
      firstNames: row.nombres, lastNames: row.apellidos, document: "No registrado en el modelo",
      phone: row.telefono ?? "—", email: row.correo ?? "—", registrationDate: row.fechaRegistro ?? "",
      trips: null, typeCode: row.tipoPasajero,
      status: labelCode(row.estado, passengerStates).label, statusCode: row.estado,
    })),
    cards: requireList(cards, "tarjetas").map((row) => ({
      id: row.numeroMascarado, number: row.numeroMascarado, passengerId: row.idPasajero == null ? null : String(row.idPasajero),
      passenger: row.pasajero ?? "Anónima", type: row.tarifa, fareCode: row.codigoTarifa,
      balance: numberValue(row.saldo), issueDate: row.fechaEmision ?? "", expirationDate: row.fechaVencimiento ?? "",
      status: labelCode(row.estado, cardStates).label, statusCode: row.estado,
    })),
    recharges: requireList(recharges, "recargas").map((row) => {
      const when = dateParts(row.fechaHora);
      return { id: String(row.numeroTransaccion), cardNumber: row.numeroMascarado, passenger: row.pasajero,
        date: when.date, time: when.time, amount: numberValue(row.monto), method: row.medioPago,
        reference: `TRX-${row.numeroTransaccion}`, channel: row.canal,
        status: row.estado ? labelCode(row.estado).label : "Aprobada", statusCode: row.estado ?? "APROBADA" };
    }),
    fares: requireList(fares, "tarifas").map((row) => ({
      id: row.codigoTarifa, code: row.codigoTarifa, name: row.nombre, description: row.descripcion ?? "—",
      category: labelCode(row.tipoPasajero).label, categoryCode: row.tipoPasajero,
      productType: row.tipoProducto, price: numberValue(row.monto),
      validity: row.duracionDias ? `${row.duracionDias} días` : row.cantidadMaxViajes ? `${row.cantidadMaxViajes} viajes` : "Según uso",
      durationDays: row.duracionDias, maxTrips: row.cantidadMaxViajes,
      startDate: row.fechaInicioVigencia, endDate: row.fechaFinVigencia,
      status: labelCode(row.estado, fareStates).label, statusCode: row.estado,
    })),
    stations,
  };
}

export function createPassenger(form) {
  return apiRequest("/api/pasajeros", { method: "POST", body: {
    nombres: form.firstNames, apellidos: form.lastNames, fechaNacimiento: form.birthDate || null,
    correo: form.email || null, telefono: form.phone || null, tipoPasajero: form.passengerType,
  } });
}

export function issueCard(form) {
  return apiRequest("/api/tarjetas", { method: "POST", body: {
    idPasajero: form.passengerId ? Number(form.passengerId) : null,
    codigoTarifa: form.fareCode, saldoInicial: Number(form.balance || 0),
    idEstacion: form.stationId ? Number(form.stationId) : null,
  } });
}

export function rechargeCard(form) {
  const rawNumber = String(form.cardNumber ?? "").replaceAll(/\D/g, "");
  return apiRequest(`/api/tarjetas/${rawNumber}/recargas`, { method: "POST", body: {
    monto: Number(form.amount), medioPago: form.paymentMethod, canal: form.channel,
    idEstacion: form.stationId ? Number(form.stationId) : null,
  } });
}

export function createFare(form) {
  return apiRequest("/api/tarifas", { method: "POST", body: {
    codigoTarifa: form.code, nombre: form.name, descripcion: form.description || null,
    tipoProducto: form.productType, monto: Number(form.price), tipoPasajero: form.categoryCode,
    fechaInicioVigencia: form.startDate || null, fechaFinVigencia: form.endDate || null,
    cantidadMaxViajes: form.maxTrips ? Number(form.maxTrips) : null,
    duracionDias: form.durationDays ? Number(form.durationDays) : null, estado: "ACTIVA",
  } });
}

export function deactivatePassenger(id) {
  return apiRequest(`/api/pasajeros/${id}/estado`, { method: "PATCH", body: { estado: "INACTIVO" } });
}

export function deactivateFare(id) {
  return apiRequest(`/api/tarifas/${encodeURIComponent(id)}/estado`, { method: "PATCH", body: { estado: "INACTIVA" } });
}
