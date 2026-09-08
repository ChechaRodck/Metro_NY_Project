export const reportSummary = {
  estimatedPassengers: 2400000,
  passengerChange: 8.2,
  completedTrips: 1186,
  tripCompletionRate: 95,
  activeIncidents: 7,
  operationalAvailability: 94.6,
};

export const passengerFlowData = [
  { day: "Lun", passengers: 1840000 },
  { day: "Mar", passengers: 1970000 },
  { day: "Mié", passengers: 2120000 },
  { day: "Jue", passengers: 2050000 },
  { day: "Vie", passengers: 2390000 },
  { day: "Sáb", passengers: 1760000 },
  { day: "Dom", passengers: 1510000 },
];

export const linePerformanceData = [
  {
    line: "A",
    name: "Eighth Avenue Express",
    trips: 248,
    punctuality: 96,
    color: "#0b4abf",
  },
  {
    line: "1",
    name: "Broadway–Seventh Avenue",
    trips: 232,
    punctuality: 94,
    color: "#ef2b2d",
  },
  {
    line: "4",
    name: "Lexington Avenue Express",
    trips: 218,
    punctuality: 88,
    color: "#009b3a",
  },
  {
    line: "7",
    name: "Flushing Local",
    trips: 205,
    punctuality: 92,
    color: "#b933ad",
  },
  {
    line: "E",
    name: "Eighth Avenue Local",
    trips: 195,
    punctuality: 97,
    color: "#0b4abf",
  },
  {
    line: "L",
    name: "Canarsie Local",
    trips: 181,
    punctuality: 85,
    color: "#9ca3af",
  },
];

export const incidentDistributionData = [
  {
    name: "Crítica",
    value: 1,
    color: "#dc2626",
  },
  {
    name: "Alta",
    value: 2,
    color: "#f97316",
  },
  {
    name: "Media",
    value: 2,
    color: "#f59e0b",
  },
  {
    name: "Baja",
    value: 2,
    color: "#0ea5e9",
  },
];

export const maintenanceCostData = [
  { month: "Abr", cost: 28400 },
  { month: "May", cost: 31200 },
  { month: "Jun", cost: 29850 },
  { month: "Jul", cost: 35600 },
  { month: "Ago", cost: 33100 },
  { month: "Sep", cost: 38650 },
];

export const generatedReports = [
  {
    id: "REP-2026-041",
    name: "Resumen operativo semanal",
    type: "Operaciones",
    period: "25 ago - 31 ago 2026",
    generatedAt: "2026-09-01T08:30",
    generatedBy: "Otto Muñoz",
    status: "Disponible",
    format: "PDF",
  },
  {
    id: "REP-2026-040",
    name: "Flujo de pasajeros por línea",
    type: "Pasajeros",
    period: "Agosto 2026",
    generatedAt: "2026-08-31T16:45",
    generatedBy: "Sarah Miller",
    status: "Disponible",
    format: "XLSX",
  },
  {
    id: "REP-2026-039",
    name: "Incidentes y tiempos de respuesta",
    type: "Incidentes",
    period: "Agosto 2026",
    generatedAt: "2026-08-31T11:20",
    generatedBy: "Robert Thompson",
    status: "Disponible",
    format: "PDF",
  },
  {
    id: "REP-2026-038",
    name: "Costos de mantenimiento",
    type: "Mantenimiento",
    period: "Julio - Agosto 2026",
    generatedAt: "2026-08-30T14:10",
    generatedBy: "Laura Williams",
    status: "Disponible",
    format: "XLSX",
  },
  {
    id: "REP-2026-037",
    name: "Disponibilidad de trenes y vagones",
    type: "Flota",
    period: "Agosto 2026",
    generatedAt: "2026-08-29T09:05",
    generatedBy: "Carlos Mendoza",
    status: "Procesando",
    format: "PDF",
  },
];

export const reportTypes = [
  "Resumen operativo",
  "Operaciones",
  "Pasajeros",
  "Incidentes",
  "Mantenimiento",
  "Flota",
  "Personal",
];

export const reportFormats = ["PDF", "XLSX", "CSV"];

export const reportPeriods = [
  "Últimos 7 días",
  "Últimos 30 días",
  "Mes actual",
  "Trimestre actual",
  "Año actual",
  "Personalizado",
];