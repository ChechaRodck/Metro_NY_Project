import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { createDemoSession, demoCredentials } from "../auth";
import useMotionPreferences from "../hooks/useMotionPreferences";
import "../styles/login.css";

const NETWORK_DEPTHS = [
  { xProperty: "--network-far-x", yProperty: "--network-far-y", shift: 3 },
  { xProperty: "--network-mid-x", yProperty: "--network-mid-y", shift: 6 },
  { xProperty: "--network-near-x", yProperty: "--network-near-y", shift: 8 },
];
const STATION_EMPHASIS_RADIUS = 0.22;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const brandPanelRef = useRef(null);
  const { allowsPointerMotion } = useMotionPreferences();
  const navigate = useNavigate();

  useEffect(() => {
    const brandPanel = brandPanelRef.current;

    if (!brandPanel) {
      return undefined;
    }

    const stationNodes = Array.from(
      brandPanel.querySelectorAll("[data-network-station]"),
      (node) => ({
        node,
        x: Number(node.dataset.networkX),
        y: Number(node.dataset.networkY),
      }),
    );

    function resetNetwork() {
      NETWORK_DEPTHS.forEach(({ xProperty, yProperty }) => {
        brandPanel.style.setProperty(xProperty, "0px");
        brandPanel.style.setProperty(yProperty, "0px");
      });

      stationNodes.forEach(({ node }) => {
        node.style.setProperty("--station-emphasis", "0");
      });
    }

    resetNetwork();

    if (!allowsPointerMotion) {
      return undefined;
    }

    let bounds = brandPanel.getBoundingClientRect();
    let animationFrameId = null;
    let pendingOffsetX = 0;
    let pendingOffsetY = 0;
    let pendingPointerX = 0.5;
    let pendingPointerY = 0.5;
    let pointerActive = false;

    function updateBounds() {
      bounds = brandPanel.getBoundingClientRect();
    }

    function renderNetworkPosition() {
      NETWORK_DEPTHS.forEach(({ xProperty, yProperty, shift }) => {
        brandPanel.style.setProperty(
          xProperty,
          `${(pendingOffsetX * shift).toFixed(2)}px`,
        );
        brandPanel.style.setProperty(
          yProperty,
          `${(pendingOffsetY * shift).toFixed(2)}px`,
        );
      });

      stationNodes.forEach(({ node, x, y }) => {
        const distanceFromPointer = Math.hypot(
          x - pendingPointerX,
          y - pendingPointerY,
        );
        const emphasis = pointerActive
          ? clamp(1 - distanceFromPointer / STATION_EMPHASIS_RADIUS, 0, 1)
          : 0;

        node.style.setProperty("--station-emphasis", emphasis.toFixed(3));
      });

      animationFrameId = null;
    }

    function requestNetworkPosition() {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(renderNetworkPosition);
      }
    }

    function handlePointerMove(event) {
      if (!bounds.width || !bounds.height) {
        return;
      }

      const horizontalPosition = clamp(
        (event.clientX - bounds.left) / bounds.width,
        0,
        1,
      );
      const verticalPosition = clamp(
        (event.clientY - bounds.top) / bounds.height,
        0,
        1,
      );
      const horizontalOffset = horizontalPosition * 2 - 1;
      const verticalOffset = verticalPosition * 2 - 1;
      const offsetMagnitude = Math.hypot(horizontalOffset, verticalOffset);
      const motionScale = offsetMagnitude > 1 ? 1 / offsetMagnitude : 1;

      pendingOffsetX = horizontalOffset * motionScale;
      pendingOffsetY = verticalOffset * motionScale;
      pendingPointerX = horizontalPosition;
      pendingPointerY = verticalPosition;
      pointerActive = true;
      requestNetworkPosition();
    }

    function handlePointerEnter(event) {
      updateBounds();
      handlePointerMove(event);
    }

    function handlePointerLeave() {
      pendingOffsetX = 0;
      pendingOffsetY = 0;
      pointerActive = false;
      requestNetworkPosition();
    }

    brandPanel.addEventListener("pointerenter", handlePointerEnter, {
      passive: true,
    });
    brandPanel.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    brandPanel.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    window.addEventListener("resize", updateBounds);

    return () => {
      brandPanel.removeEventListener("pointerenter", handlePointerEnter);
      brandPanel.removeEventListener("pointermove", handlePointerMove);
      brandPanel.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", updateBounds);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resetNetwork();
    };
  }, [allowsPointerMotion]);

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
      <div className="login-shell">
        <section
          className="login-brand-panel"
          aria-label="Metro NY Control Center"
          ref={brandPanelRef}
        >
          <svg
            className="login-network"
            viewBox="0 0 720 760"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            <g className="login-network__depth login-network__depth--far">
              <path
                className="login-network__route login-network__route--quiet"
                d="M-54 112H132L238 218V404L364 530H774"
              />
              <path
                className="login-network__route login-network__route--quiet"
                d="M84-42V140L196 252H430L548 370V810"
              />
              <circle data-network-station data-network-x="0.183" data-network-y="0.147" cx="132" cy="112" r="5" />
              <circle data-network-station data-network-x="0.272" data-network-y="0.332" cx="196" cy="252" r="5" />
              <circle data-network-station data-network-x="0.597" data-network-y="0.332" cx="430" cy="252" r="8" />
              <circle data-network-station data-network-x="0.761" data-network-y="0.487" cx="548" cy="370" r="5" />
            </g>

            <g className="login-network__depth login-network__depth--mid">
              <path
                className="login-network__route login-network__route--skyline"
                d="M-46 650H118L262 506H476L766 216"
              />
              <path
                className="login-network__route login-network__route--skyline"
                d="M340-36V112L450 222V440L588 578V810"
              />
              <circle data-network-station data-network-x="0.164" data-network-y="0.855" cx="118" cy="650" r="5" />
              <circle data-network-station data-network-x="0.364" data-network-y="0.666" cx="262" cy="506" r="8" />
              <circle data-network-station data-network-x="0.625" data-network-y="0.292" cx="450" cy="222" r="5" />
              <circle data-network-station data-network-x="0.661" data-network-y="0.666" cx="476" cy="506" r="5" />
              <circle data-network-station data-network-x="0.817" data-network-y="0.761" cx="588" cy="578" r="5" />
            </g>

            <g className="login-network__depth login-network__depth--near">
              <path
                className="login-network__route login-network__route--signal"
                d="M-48 342H122L234 454H406L520 568H770"
              />
              <path
                className="login-network__route login-network__route--signal"
                d="M246-34V146L356 256V584L470 698H770"
              />
              <circle data-network-station data-network-x="0.169" data-network-y="0.45" cx="122" cy="342" r="5" />
              <circle data-network-station data-network-x="0.325" data-network-y="0.597" cx="234" cy="454" r="8" />
              <circle data-network-station data-network-x="0.494" data-network-y="0.337" cx="356" cy="256" r="5" />
              <circle data-network-station data-network-x="0.564" data-network-y="0.597" cx="406" cy="454" r="5" />
              <circle data-network-station data-network-x="0.722" data-network-y="0.747" cx="520" cy="568" r="8" />
              <circle data-network-station data-network-x="0.653" data-network-y="0.918" cx="470" cy="698" r="5" />
              <circle data-network-station data-network-x="0.889" data-network-y="0.747" cx="640" cy="568" r="5" />
            </g>
          </svg>

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

            <div
              className="login-capabilities"
              aria-label="Capacidades del centro de operaciones"
            >
              <span>Operación centralizada</span>
              <span>Seguimiento operativo</span>
              <span>Acceso administrativo</span>
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

        <section className="login-form-panel" aria-labelledby="login-title">
          <div className="login-card">
            <div className="login-card__heading">
              <span>Acceso interno</span>
              <h2 id="login-title">Iniciar sesión</h2>
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
      </div>

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
