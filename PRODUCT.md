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

The current product is a Spanish-language academic demonstration. Administrators and operations staff sign in with demo credentials, monitor an operational summary, and work across modules for the metro network, operations and schedules, trains and wagons, personnel, passengers and cards, maintenance, incidents, and reports.

All current data and operational states are demonstrative and must not be represented as live MTA or real-world transit information.

## Capabilities and Constraints

- Preserve the existing React and Vite frontend.
- Preserve the Oracle Database 11g data model in `docs/Script_Metro_NY.sql` and its related model artifacts.
- The Java backend is still under development; future connected functionality must account for that incomplete integration.
- Authentication currently uses demo-only credentials and browser-stored demo sessions.
- The present scope is the administrative and operational frontend. The passenger-facing interface and live network simulation remain planned work.
- The interface language is Spanish.
- Responsive behavior is a product requirement across practical web viewport sizes.

## Brand Commitments

The product name is **Metro NY**. Existing interface variants such as **New York Metro** and **Metro de Nueva York** may appear as descriptive labels, while Metro NY remains the product identity.

The application is an independent academic project with no official affiliation with the Metropolitan Transportation Authority (MTA). Product copy and visuals must not imply endorsement, official status, or access to live MTA systems.

## Evidence on Hand

- The implemented React/Vite administrative interface is in `frontend/`.
- Demo authentication behavior and credentials are defined in `frontend/src/auth.js`.
- Demonstration records for the dashboard and management modules are stored in `frontend/src/data/`.
- The Oracle 11g schema is in `docs/Script_Metro_NY.sql`, with supporting data-model artifacts in `docs/Modelo_Metro_NY/`.
- The Java backend scaffold is in `backend/` and is not yet a completed application integration.
- There is no evidence of official MTA affiliation, live transit feeds, production users, testimonials, or real operational results; future work must not fabricate any of these.

## Product Principles

1. Keep the operational domains connected so users can move from overview to action without losing context.
2. Make status, urgency, and next actions clear for administrators working across dense operational data.
3. Distinguish demo data, planned capabilities, and implemented functionality honestly.
4. Extend the product in stages without compromising the existing administrative workflows or the future passenger experience.
5. Treat accessibility and responsive behavior as core product quality, not optional polish.

## Accessibility & Inclusion

Aim for WCAG 2.1 AA where practical. Maintain keyboard access, visible focus states, semantic structure, sufficient color contrast, non-color status cues, useful labels, and layouts that remain usable across desktop and smaller web viewports.
