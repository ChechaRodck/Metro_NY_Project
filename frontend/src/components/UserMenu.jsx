import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { clearDemoSession } from "../auth";
import "../styles/user-menu.css";

function UserMenu() {
  const navigate = useNavigate();

  function handleLogout() {
    clearDemoSession();
    navigate("/login", { replace: true });
  }

  return (
    <details className="account-menu">
      <summary className="account-menu__trigger">
        <div className="account-menu__avatar">OM</div>

        <div className="account-menu__identity">
          <strong>Otto Muñoz</strong>
          <span>Administrador</span>
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
            <strong>Otto Muñoz</strong>
            <span>admin@metrony.com</span>
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
