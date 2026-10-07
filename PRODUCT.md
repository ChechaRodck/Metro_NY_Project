# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary current users are Spanish-speaking metro administrators and operations staff working in an academic demonstration environment. They use the application to review and manage the operational domains of a metro system from one administrative interface.

A passenger-facing interface is planned for a later stage but is outside the current administrative and operational frontend scope.

## Product Purpose

Metro NY is an independent academic web application that demonstrates how a metro system's administrative and operational information can be managed through a unified control center. It brings together network status, schedules and trips, fleet, personnel, passengers, maintenance, incidents, and reporting.

Success means users can understand the state of the demonstrated system and move between its related management workflows without relying on separate tools or disconnected views.

## Positioning

Metro NY's core value is the connection of the metro's major administrative and operational domains within one control center rather than presenting them as isolated records. A future differentiator, once the backend is ready, will be an integrated visual simulation of trains moving through the network.

## Operating Context

The current product is a Spanish-language academic demonstration. Administrators and operations staff authenticate through the Java backend, receive a signed JWT access token, monitor an operational summary, and work across modules for the metro network, operations and schedules, trains and wagons, personnel, passengers and cards, maintenance, incidents, and reports.

Authentication and the line catalogue are the first real backend integrations: the frontend uses `POST /api/auth/login` and protected `GET /api/lineas`, backed by the Oracle environment validated with Oracle XE 21c. Records and operational states in the remaining frontend modules are still demonstrative until their endpoints are connected, and none of the application data may be represented as live MTA or real-world transit information.

## Capabilities and Constraints

- Preserve the existing React and Vite frontend.
- Preserve the Oracle Database 11g-compatible data model and migration constraints while development and smoke testing use Oracle XE 21c.
- The Java backend now provides JWT authentication and protected read access to lines; integration of the remaining management modules is still under development.
- Authentication uses backend-validated credentials, a signed JWT, in-memory state, and `sessionStorage` for restoration within the current browser tab.
- The present scope is the administrative and operational frontend. The passenger-facing interface and live network simulation remain planned work.
- The interface language is Spanish.
- Responsive behavior is a product requirement across practical web viewport sizes.

## Brand Commitments

The product name is **Metro NY**. Existing interface variants such as **New York Metro** and **Metro de Nueva York** may appear as descriptive labels, while Metro NY remains the product identity.

The application is an independent academic project with no official affiliation with the Metropolitan Transportation Authority (MTA). Product copy and visuals must not imply endorsement, official status, or access to live MTA systems.

## Evidence on Hand

- The implemented React/Vite administrative interface is in `frontend/`.
- Frontend session handling is defined in `frontend/src/auth.js`; API requests are centralized under `frontend/src/services/`.
- `POST /api/auth/login` and `GET /api/lineas` are connected to the Java backend. Line mutations remain disabled in the frontend.
- Demonstration records for the dashboard and management modules other than the connected line catalogue are stored in `frontend/src/data/`.
- The Oracle 11g schema is in `docs/Script_Metro_NY.sql`, with supporting data-model artifacts in `docs/Modelo_Metro_NY/`.
- The Java backend in `backend/` provides the secured authentication and line-reading vertical slice; broader frontend integration remains pending.
- There is no evidence of official MTA affiliation, live transit feeds, production users, testimonials, or real operational results; future work must not fabricate any of these.

## Product Principles

1. Keep the operational domains connected so users can move from overview to action without losing context.
2. Make status, urgency, and next actions clear for administrators working across dense operational data.
3. Distinguish demo data, planned capabilities, and implemented functionality honestly.
4. Extend the product in stages without compromising the existing administrative workflows or the future passenger experience.
5. Treat accessibility and responsive behavior as core product quality, not optional polish.

## Accessibility & Inclusion

Aim for WCAG 2.1 AA where practical. Maintain keyboard access, visible focus states, semantic structure, sufficient color contrast, non-color status cues, useful labels, and layouts that remain usable across desktop and smaller web viewports.
