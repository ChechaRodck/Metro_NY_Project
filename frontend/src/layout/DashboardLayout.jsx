import { useEffect, useMemo, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
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
import UserMenu from "../components/UserMenu";

const MOBILE_SIDEBAR_QUERY = "(max-width: 900px)";
const SIDEBAR_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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

const initialNotifications = [
  {
    id: 1,
    title: "Demora en la línea 4",
    detail: "Tiempo estimado de espera: 8 minutos.",
    time: "Hace 4 min",
    to: "/incidentes",
    tone: "warning",
    unread: true,
  },
  {
    id: 2,
    title: "Mantenimiento programado",
    detail: "El tren M-104 entra al taller a las 18:00.",
    time: "Hace 18 min",
    to: "/mantenimiento",
    tone: "blue",
    unread: true,
  },
  {
    id: 3,
    title: "Reporte operativo disponible",
    detail: "El reporte semanal está listo para revisión.",
    time: "Hace 1 h",
    to: "/reportes",
    tone: "green",
    unread: true,
  },
];

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebar, setIsMobileSidebar] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_SIDEBAR_QUERY).matches
      : false,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const sidebarRef = useRef(null);
  const sidebarCloseRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const desktopCollapseButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const mobileDrawerActive = isMobileSidebar && sidebarOpen;
  const sidebarHidden = isMobileSidebar
    ? !sidebarOpen
    : sidebarCollapsed;

  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    if (!normalizedQuery) {
      return [];
    }

    return navigation.filter((item) =>
      normalizeText(item.label).includes(normalizedQuery),
    );
  }, [searchQuery]);

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  useEffect(() => {
    setSearchOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_SIDEBAR_QUERY);

    function handleSidebarContextChange(event) {
      const focusWasInsideSidebar = sidebarRef.current?.contains(
        document.activeElement,
      );
      const focusWasOnMobileClose =
        document.activeElement === sidebarCloseRef.current;

      setIsMobileSidebar(event.matches);
      setSidebarOpen(false);

      if (!focusWasInsideSidebar) {
        return;
      }

      window.requestAnimationFrame(() => {
        if (event.matches) {
          mobileMenuButtonRef.current?.focus();
        } else if (sidebarCollapsed || focusWasOnMobileClose) {
          desktopCollapseButtonRef.current?.focus();
        }
      });
    }

    mediaQuery.addEventListener("change", handleSidebarContextChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSidebarContextChange);
    };
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!mobileDrawerActive) {
      return undefined;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      sidebarCloseRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [mobileDrawerActive]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function openSearchResult(path) {
    navigate(path);
    setSearchQuery("");
    setSearchOpen(false);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (searchResults.length > 0) {
      openSearchResult(searchResults[0].to);
    }
  }

  function openNotification(notification) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((item) =>
        item.id === notification.id
          ? { ...item, unread: false }
          : item,
      ),
    );

    navigate(notification.to);
    setNotificationOpen(false);
  }

  function markAllAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  }

  function openMobileSidebar() {
    setSearchOpen(false);
    setNotificationOpen(false);
    setSidebarOpen(true);
  }

  function closeMobileSidebar({ restoreFocus = true } = {}) {
    setSidebarOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        mobileMenuButtonRef.current?.focus();
      });
    }
  }

  function handleSidebarKeyDown(event) {
    if (!mobileDrawerActive) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileSidebar();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      sidebarRef.current?.querySelectorAll(SIDEBAR_FOCUSABLE_SELECTOR) ?? [],
    ).filter((element) => element.getClientRects().length > 0);

    if (focusableElements.length === 0) {
      event.preventDefault();
      sidebarRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <div className="app-shell">
      {mobileDrawerActive && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => closeMobileSidebar()}
        />
      )}

      <aside
        id="primary-sidebar"
        ref={sidebarRef}
        className={`sidebar ${
          sidebarCollapsed ? "sidebar--collapsed" : ""
        } ${mobileDrawerActive ? "sidebar--open" : ""}`}
        aria-label="Navegación principal"
        aria-hidden={sidebarHidden}
        inert={sidebarHidden}
        tabIndex={-1}
        onKeyDown={handleSidebarKeyDown}
      >
        <div className="sidebar__header">
          <div className="brand">
            <div className="brand__icon">M</div>

            <div>
              <p className="brand__name">NEW YORK METRO</p>
              <span className="brand__subtitle">Control Center</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__close"
            aria-label="Cerrar menú"
            ref={sidebarCloseRef}
            onClick={() => closeMobileSidebar()}
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
                onClick={() =>
                  closeMobileSidebar({ restoreFocus: false })
                }
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

      <div
        className="main-area"
        aria-hidden={mobileDrawerActive ? true : undefined}
        inert={mobileDrawerActive}
      >
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              ref={desktopCollapseButtonRef}
              className="sidebar-collapse-button"
              aria-label={
                sidebarCollapsed
                  ? "Mostrar menú lateral"
                  : "Ocultar menú lateral"
              }
              title={
                sidebarCollapsed
                  ? "Mostrar menú lateral"
                  : "Ocultar menú lateral"
              }
              aria-controls="primary-sidebar"
              aria-expanded={!sidebarCollapsed}
              onClick={() =>
                setSidebarCollapsed((valorActual) => !valorActual)
              }
            >
              {sidebarCollapsed ? "»" : "«"}
            </button>
            <button
              type="button"
              ref={mobileMenuButtonRef}
              className="menu-button"
              aria-label="Abrir menú"
              aria-controls="primary-sidebar"
              aria-expanded={mobileDrawerActive}
              onClick={openMobileSidebar}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="topbar__eyebrow">Centro de operaciones</p>
              <h1 className="topbar__title">Metro de Nueva York</h1>
            </div>
          </div>

          <div className="topbar__actions">
            <div className="search-area" ref={searchRef}>
              <form
                className="search-box"
                role="search"
                onSubmit={handleSearchSubmit}
              >
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Buscar en el sistema..."
                  aria-label="Buscar en el sistema"
                  aria-expanded={searchOpen}
                  aria-controls="system-search-results"
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                    setNotificationOpen(false);
                  }}
                />
              </form>

              {searchOpen && searchQuery.trim() && (
                <div
                  className="search-results"
                  id="system-search-results"
                >
                  <span className="search-results__label">
                    Módulos encontrados
                  </span>

                  {searchResults.length > 0 ? (
                    searchResults.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          type="button"
                          key={item.to}
                          onClick={() => openSearchResult(item.to)}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })
                  ) : (
                    <p>No se encontró ningún módulo.</p>
                  )}
                </div>
              )}
            </div>

            <div className="notification-area" ref={notificationRef}>
              <button
                type="button"
                className="notification-button"
                aria-label="Ver notificaciones"
                aria-expanded={notificationOpen}
                aria-controls="notification-panel"
                onClick={() => {
                  setNotificationOpen((isOpen) => !isOpen);
                  setSearchOpen(false);
                }}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="notification-button__badge">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  className="notification-panel"
                  id="notification-panel"
                >
                  <div className="notification-panel__header">
                    <div>
                      <strong>Notificaciones</strong>
                      <span>{unreadCount} sin leer</span>
                    </div>

                    {unreadCount > 0 && (
                      <button type="button" onClick={markAllAsRead}>
                        Marcar como leídas
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <button
                        type="button"
                        className={`notification-item ${
                          notification.unread
                            ? "notification-item--unread"
                            : ""
                        }`}
                        key={notification.id}
                        onClick={() => openNotification(notification)}
                      >
                        <span
                          className={`notification-item__indicator notification-item__indicator--${notification.tone}`}
                        />

                        <span className="notification-item__content">
                          <strong>{notification.title}</strong>
                          <span>{notification.detail}</span>
                          <small>{notification.time}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <UserMenu />
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
