# React + Vite

## Modo demostración

El acceso demostrativo de Metro NY es público y está destinado únicamente a la
evaluación local. Con el backend iniciado mediante el perfil Spring `demo`, abra
una PowerShell nueva y ejecute:

```powershell
cd frontend
npm.cmd ci
$env:VITE_API_BASE_URL = "http://localhost:8080"
npm.cmd run dev
```

Después visite `http://localhost:5173/login`. En desarrollo aparecerá el bloque
“Acceso de demostración”, que permite completar sin enviar automáticamente:

- Usuario: `demo_admin`
- Contraseña: `TrenSeguro#2026!`

El backend sigue requiriendo `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` y
`JWT_SECRET` (además de su issuer y audience JWT). Las credenciales demo no se
muestran en builds de producción y el perfil `demo` nunca debe desplegarse
públicamente.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
