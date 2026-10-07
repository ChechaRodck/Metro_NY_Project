import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { clearAuthSession, useAuthSession } from "../auth";
import "../styles/user-menu.css";

const roleLabels = {
  ADMIN: "Administrador",
  OPERACIONES: "Operaciones",
  MANTENIMIENTO: "Mantenimiento",
  CONSULTA: "Consulta",
};

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("es");
}

function UserMenu() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const displayName =
    session?.user.displayName || session?.user.username || "Usuario";
  const username = session?.user.username ?? "";
  const role = session?.user.roles[0];
  const roleLabel = roleLabels[role] ?? role ?? "Acceso autenticado";

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <details className="account-menu">
      <summary className="account-menu__trigger">
        <div className="account-menu__avatar">{getInitials(displayName)}</div>

        <div className="account-menu__identity">
          <strong>{displayName}</strong>
          <span>{roleLabel}</span>
        </div>

        <ChevronDown
          className="account-menu__chevron"
          size={16}
          aria-hidden="true"
        />
      </summary>

      <div className="account-menu__panel">
        <div className="account-menu__account">
          <UserRound size={18} aria-hidden="true" />
          <div>
            <strong>{displayName}</strong>
            <span>{username}</span>
          </div>
        </div>

        <button type="button" onClick={handleLogout}>
          <LogOut size={17} aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </details>
  );
}

export default UserMenu;
