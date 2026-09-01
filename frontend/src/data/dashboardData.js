export const dashboardStats = [
  {
    id: 1,
    label: "Líneas operativas",
    value: "18",
    detail: "2 con alertas menores",
    trend: "+2.4%",
    tone: "blue",
    icon: "train",
  },
  {
    id: 2,
    label: "Viajes programados",
    value: "1,248",
    detail: "Para el día de hoy",
    trend: "+5.1%",
    tone: "purple",
    icon: "calendar",
  },
  {
    id: 3,
    label: "Pasajeros estimados",
    value: "2.4 M",
    detail: "Durante las últimas 24 h",
    trend: "+8.2%",
    tone: "green",
    icon: "users",
  },
  {
    id: 4,
    label: "Incidentes activos",
    value: "7",
    detail: "1 requiere atención",
    trend: "-12%",
    tone: "orange",
    icon: "alert",
  },
];

export const lineStatus = [
  {
    id: 1,
    code: "A",
    name: "Eighth Avenue Express",
    color: "#0039a6",
    status: "Operativa",
    delay: "A tiempo",
  },
  {
    id: 2,
    code: "1",
    name: "Broadway–Seventh Avenue",
    color: "#ee352e",
    status: "Operativa",
    delay: "A tiempo",
  },
  {
    id: 3,
    code: "4",
    name: "Lexington Avenue Express",
    color: "#00933c",
    status: "Demoras",
    delay: "8 min",
  },
  {
    id: 4,
    code: "7",
    name: "Flushing Local",
    color: "#b933ad",
    status: "Operativa",
    delay: "A tiempo",
  },
  {
    id: 5,
    code: "L",
    name: "Canarsie Local",
    color: "#a7a9ac",
    status: "Mantenimiento",
    delay: "Servicio parcial",
  },
];

export const upcomingTrips = [
  {
    id: "NY-2401",
    route: "A",
    destination: "Far Rockaway",
    departure: "08:35",
    platform: "P-04",
    status: "En abordaje",
  },
  {
    id: "NY-2402",
    route: "1",
    destination: "South Ferry",
    departure: "08:42",
    platform: "P-02",
    status: "Programado",
  },
  {
    id: "NY-2403",
    route: "4",
    destination: "Woodlawn",
    departure: "08:48",
    platform: "P-06",
    status: "Retrasado",
  },
  {
    id: "NY-2404",
    route: "7",
    destination: "Flushing–Main St",
    departure: "08:55",
    platform: "P-03",
    status: "Programado",
  },
];

export const recentIncidents = [
  {
    id: "INC-0842",
    title: "Falla temporal de señalización",
    location: "Estación Grand Central–42 St",
    severity: "Alta",
    time: "Hace 18 min",
  },
  {
    id: "INC-0841",
    title: "Escalera eléctrica fuera de servicio",
    location: "Estación Times Square",
    severity: "Media",
    time: "Hace 42 min",
  },
  {
    id: "INC-0839",
    title: "Congestión en plataforma",
    location: "Estación Fulton Street",
    severity: "Baja",
    time: "Hace 1 h",
  },
];

export const passengerFlow = [
  { day: "Lun", passengers: 1850000 },
  { day: "Mar", passengers: 1980000 },
  { day: "Mié", passengers: 2120000 },
  { day: "Jue", passengers: 2050000 },
  { day: "Vie", passengers: 2390000 },
  { day: "Sáb", passengers: 1760000 },
  { day: "Dom", passengers: 1520000 },
];