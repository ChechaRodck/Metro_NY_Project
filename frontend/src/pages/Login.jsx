import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TrainFront,
} from "lucide-react";
import { createDemoSession, demoCredentials } from "../auth";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function fillDemoCredentials() {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Ingresa el correo y la contraseña para continuar.");
      return;
    }

    const validEmail =
      email.trim().toLowerCase() === demoCredentials.email.toLowerCase();
    const validPassword = password === demoCredentials.password;

    if (!validEmail || !validPassword) {
      setError("Las credenciales no coinciden con el acceso de demostración.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    createDemoSession(rememberSession);
    navigate("/", { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="Metro NY Control Center">
        <div className="login-brand">
          <div className="login-brand__mark">M</div>
          <div>
            <strong>Metro NY</strong>
            <span>Control Center</span>
          </div>
        </div>

        <div className="login-brand-panel__content">
          <span className="login-brand-panel__eyebrow">
            Centro de operaciones
          </span>
          <h1>La red completa, bajo control.</h1>
          <p>
            Supervisa líneas, viajes, flota e incidencias desde una sola
            plataforma operativa.
          </p>

          <div className="login-feature-list">
            <div className="login-feature">
              <TrainFront size={20} />
              <div>
                <strong>Operación centralizada</strong>
                <span>Consulta el estado de la red en tiempo real.</span>
              </div>
            </div>

            <div className="login-feature">
              <Activity size={20} />
              <div>
                <strong>Seguimiento operativo</strong>
                <span>Gestiona viajes, mantenimiento e incidentes.</span>
              </div>
            </div>

            <div className="login-feature">
              <ShieldCheck size={20} />
              <div>
                <strong>Acceso administrativo</strong>
                <span>Área reservada para personal autorizado.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-system-status">
          <span />
          <div>
            <strong>Sistema operativo</strong>
            <small>Todos los servicios de demostración activos</small>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="login-card__mobile-brand">
            <div className="login-brand__mark">M</div>
            <strong>Metro NY</strong>
          </div>

          <div className="login-card__heading">
            <span>Acceso interno</span>
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales para acceder al centro de control.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span>Correo institucional</span>
              <div className="login-input">
                <Mail size={19} aria-hidden="true" />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@metrony.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                />
              </div>
            </label>

            <label className="login-field">
              <span>Contraseña</span>
              <div className="login-input">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(event) => setRememberSession(event.target.checked)}
                />
                <span>Recordar sesión</span>
              </label>

              <button
                type="button"
                className="login-demo-fill"
                onClick={fillDemoCredentials}
              >
                Usar acceso de demostración
              </button>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="blob-button"
              disabled={isSubmitting}
            >
              <span className="blob-button__label">
                {isSubmitting ? (
                  "Verificando acceso..."
                ) : (
                  <>
                    Ingresar al sistema
                    <CheckCircle2 size={18} />
                  </>
                )}
              </span>

              <span className="blob-button__inner" aria-hidden="true">
                <span className="blob-button__blobs">
                  <span className="blob-button__blob" />
                  <span className="blob-button__blob" />
                  <span className="blob-button__blob" />
                  <span className="blob-button__blob" />
                </span>
              </span>
            </button>

            <div className="login-demo-note">
              <strong>Credenciales de demostración</strong>
              <span>{demoCredentials.email}</span>
              <span>{demoCredentials.password}</span>
            </div>
          </form>

          <p className="login-card__footer">
            Entorno académico · Los datos actuales son de demostración
          </p>
        </div>
      </section>

      <svg className="login-goo-filter" aria-hidden="true">
        <defs>
          <filter id="login-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </main>
  );
}

export default Login;
