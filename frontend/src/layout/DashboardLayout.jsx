import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import {
  BarChart3,
  Bell,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  Menu,
  Route,
  Search,
  TrainFront,
  TriangleAlert,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import "../styles/layout.css";

const navigation = [
  {
    to: "/",
    label: "Resumen",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/red",
    label: "Red del metro",
    icon: Route,
  },
  {
    to: "/operaciones",
    label: "Operaciones",
    icon: CalendarClock,
  },
  {
    to: "/flota",
    label: "Trenes y vagones",
    icon: TrainFront,
  },
  {
    to: "/personal",
    label: "Personal",
    icon: UsersRound,
  },
  {
    to: "/pasajeros",
    label: "Pasajeros y tarjetas",
    icon: CreditCard,
  },
  {
    to: "/mantenimiento",
    label: "Mantenimiento",
    icon: Wrench,
  },
  {
    to: "/incidentes",
    label: "Incidentes",
    icon: TriangleAlert,
  },
  {
    to: "/reportes",
    label: "Reportes",
    icon: BarChart3,
  },
];

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <div className="brand">
            <div className="brand__icon">M</div>

            <div>
              <p className="brand__name">Metro NY</p>
              <span className="brand__subtitle">Control Center</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__close"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar__section-label">ADMINISTRACIÓN</div>

        <nav className="sidebar__navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} strokeWidth={1.9} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="system-status">
            <span className="system-status__indicator" />

            <div>
              <strong>Sistema operativo</strong>
              <span>Todos los servicios activos</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="menu-button"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="topbar__eyebrow">Centro de operaciones</p>
              <h1 className="topbar__title">Metro de Nueva York</h1>
            </div>
          </div>

          <div className="topbar__actions">
            <label className="search-box">
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar en el sistema..."
                aria-label="Buscar en el sistema"
              />
            </label>

            <button
              type="button"
              className="notification-button"
              aria-label="Ver notificaciones"
            >
              <Bell size={20} />
              <span className="notification-button__badge">3</span>
            </button>

            <div className="user-profile">
              <div className="user-profile__avatar">OM</div>

              <div className="user-profile__information">
                <strong>Otto Muñoz</strong>
                <span>Administrador</span>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;