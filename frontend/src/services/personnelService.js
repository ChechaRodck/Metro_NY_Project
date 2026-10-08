import { apiRequest } from "./apiClient";
import {
  dateOnlyValue,
  dateParts,
  labelCode,
  loadSequentially,
  numberValue,
  requireList,
  toIsoLocal,
} from "./serviceUtils";

const employeeStates = { ACTIVO: "Activo", INACTIVO: "Inactivo", VACACIONES: "De vacaciones", PERMISO: "Permiso", SUSPENDIDO: "Suspendido" };
const attendanceStates = { PROGRAMADO: "Programado", PRESENTE: "Presente", AUSENTE: "Ausente", PERMISO: "Permiso", VACACIONES: "Vacaciones" };
const certificationStates = { VIGENTE: "Vigente", VENCIDA: "Vencida", REVOCADA: "Revocada" };

export async function getPersonnel({ signal } = {}) {
  const [employees, roles, shifts, certifications, models] = await loadSequentially(
    [
      (requestSignal) => apiRequest("/api/empleados", { signal: requestSignal }),
      (requestSignal) => apiRequest("/api/cargos", { signal: requestSignal }),
      (requestSignal) => apiRequest("/api/turnos", { signal: requestSignal }),
      (requestSignal) => apiRequest("/api/certificaciones", { signal: requestSignal }),
      (requestSignal) => apiRequest("/api/modelos", { signal: requestSignal }),
    ],
    { signal },
  );
  const adaptedEmployees = requireList(employees, "empleados").map((row) => ({
    id: String(row.idEmpleado), apiId: Number(row.idEmpleado), name: `${row.nombres ?? ""} ${row.apellidos ?? ""}`.trim(),
    firstNames: row.nombres, lastNames: row.apellidos, birthDate: dateOnlyValue(row.fechaNacimiento),
    address: row.direccion ?? "", phone: row.telefono ?? "", email: row.correo ?? "",
    hireDate: dateOnlyValue(row.fechaContratacion), role: row.nombreCargo, roleCode: row.codigoCargo,
    roleId: Number(row.idCargo), shift: row.turno, salary: numberValue(row.salario),
    status: labelCode(row.estadoLaboral, employeeStates).label, statusCode: row.estadoLaboral,
    supervisor: row.supervisor ?? "Sin supervisor", supervisorId: row.idSupervisor == null ? null : Number(row.idSupervisor),
  }));
  const employeeCounts = new Map();
  adaptedEmployees.forEach((employee) => employeeCounts.set(employee.roleCode, (employeeCounts.get(employee.roleCode) ?? 0) + 1));
  return {
    employees: adaptedEmployees,
    roles: requireList(roles, "cargos").map((row) => ({
      id: String(row.idCargo), apiId: Number(row.idCargo), code: row.codigoCargo,
      name: row.nombreCargo, description: row.descripcion ?? "Sin descripción registrada",
      employees: employeeCounts.get(row.codigoCargo) ?? 0, status: "Sin estado",
    })),
    shifts: requireList(shifts, "turnos").map((row) => {
      const start = dateParts(row.horaInicio); const end = dateParts(row.horaFin);
      return { id: String(row.idTurno), apiId: Number(row.idTurno), employeeId: String(row.idEmpleado),
        employee: row.empleado, date: start.date, startTime: start.time, endTime: end.time,
        workplace: row.lugar, function: row.funcion ?? row.cargo,
        attendance: labelCode(row.estadoAsistencia, attendanceStates).label, attendanceCode: row.estadoAsistencia };
    }),
    certifications: requireList(certifications, "certificaciones").map((row) => ({
      id: String(row.idCertificacion), apiId: Number(row.idCertificacion), employeeId: String(row.idEmpleado),
      employee: row.empleado, type: row.tipoCertificacion, issueDate: dateOnlyValue(row.fechaEmision),
      expirationDate: dateOnlyValue(row.fechaVencimiento), institution: row.institucionEmisora,
      models: row.modelos ?? "Sin modelos asociados",
      status: labelCode(row.estado, certificationStates).label, statusCode: row.estado,
    })),
    models: requireList(models, "modelos"),
  };
}

export function createEmployee(form) {
  return apiRequest("/api/empleados", { method: "POST", body: {
    nombres: form.firstNames, apellidos: form.lastNames, fechaNacimiento: form.birthDate,
    direccion: form.address || null, telefono: form.phone || null, correo: form.email || null,
    fechaContratacion: form.hireDate, idCargo: Number(form.roleId), turno: form.shiftCode,
    salario: Number(form.salary), estadoLaboral: "ACTIVO",
    idSupervisor: form.supervisorId ? Number(form.supervisorId) : null,
  } });
}

export function createShift(form) {
  return apiRequest("/api/turnos", { method: "POST", body: {
    idEmpleado: Number(form.employeeId), horaInicio: toIsoLocal(form.date, form.startTime),
    horaFin: toIsoLocal(form.date, form.endTime), tipoLugar: form.placeType,
    idLugar: form.placeId || null, funcion: form.function || null,
  } });
}

export function createCertification(form) {
  return apiRequest(`/api/empleados/${Number(form.employeeId)}/certificaciones`, { method: "POST", body: {
    tipoCertificacion: form.type, fechaEmision: form.issueDate, fechaVencimiento: form.expirationDate,
    institucionEmisora: form.institution, modelos: form.modelIds?.map(Number) ?? [],
  } });
}

export function deactivateEmployee(id) {
  return apiRequest(`/api/empleados/${id}/estado`, { method: "PATCH", body: { estado: "INACTIVO" } });
}

export function revokeCertification(id) {
  return apiRequest(`/api/certificaciones/${id}/estado`, { method: "PATCH", body: { estado: "REVOCADA" } });
}
