# Aheadly Backend Context

This document explains the backend implemented under `server/` for Aheadly: what it does, what data it serves, and how each part supports the demo narrative.

## 1) What the Backend Is

The backend is a Node.js + Express API for ward-level public health intelligence.

It provides:
- Live ward health risk (HRI) computation from environmental + disease + community signals
- Real-time event streaming (SSE) for UI updates
- Report ingestion and feedback-loop recomputation
- Intervention simulation and persistence
- ASHA-to-SMC field intelligence lifecycle
- Copilot context generation from real DB values
- Satellite simulation for live demo stress-testing

Canonical HRI is maintained as **/12**. API responses also include compatibility values on **/100**.

## 2) High-Level Architecture

Backend entrypoints:
- `server/server.js`
- `server/src/app.js`

Core modules:
- `server/src/config/`: environment + PostgreSQL pool
- `server/src/db/`: schema migration, seed data, HRI repository functions
- `server/src/services/`: HRI engine + SSE bus
- `server/src/routes/`: API routes
- `server/src/middleware/`: validation, role headers, error handling
- `server/scripts/`: migrate/seed/smoke execution scripts

## 3) Data Model (What Is Stored)

Primary tables:
- `wards`: ward identity + demographics (population, vaccination coverage, elderly %, comorbidity burden)
- `satellite_data`: LST, MNDWI, NDVI, rainfall by ward over time
- `disease_reports`: case counts and trend by ward/date
- `community_reports`: citizen/ASHA sanitation and symptom reports
- `hri_scores`: computed HRI snapshots (latest + history by timestamp)
- `hri_history`: daily HRI snapshot per ward
- `interventions`: implemented interventions with before/after HRI details
- `field_flags`: ASHA flags routed to SMC workflow
- `alerts`: operational alerts
- `hospitals` + `hospital_capacity`: facility and live capacity data
- `predictions`: seeded forecast rows

Key index for fast ward list query:
- `hri_scores (ward_id, computed_at DESC)`

## 4) HRI Model (What Is Computed)

Implemented in `server/src/services/hriEngine.js`.

Signals (0.0 to 2.0):
- Heat exposure (from LST)
- Water stagnation (from MNDWI)
- Vector density (derived from heat + stagnation + NDVI)
- Disease burden (case load per population + trend multiplier)
- Sanitation stress (7-day community report density)
- Wastewater index (sanitation + stagnation + rainfall)

Multipliers:
- Seasonal multiplier (month-based)
- Vulnerability multiplier (vaccination gap + elderly % + comorbidity burden)

Outputs:
- `final_hri` on /12
- `severity` (`LOW`, `MODERATE`, `HIGH`)
- `convergence_count` (# of elevated signals)

Dual-scale compatibility fields are exposed by API:
- `hri_12`, `severity_12`
- `hri_100`, `severity_100`

## 5) API Surface (What Information It Provides)

### Health + Ward Intelligence
- `GET /api/wards`
  - Returns all wards with latest HRI snapshot, signal breakdown, reports_7d, cases_7d.
  - Uses single SQL query with latest-HRI subquery per ward.
- `GET /api/wards/:id`
  - Returns full ward drilldown:
    - ward metadata
    - latest HRI
    - 30-day HRI history
    - recent interventions/reports/flags/disease entries

### HRI Operations
- `POST /api/hri/compute/:wardId`
  - Recomputes HRI for one ward and persists snapshot.
- `POST /api/hri/compute-all`
  - Recomputes all wards.

### Feedback Loop (Citizen/Community)
- `POST /api/reports`
  - Stores report, recomputes ward HRI, inserts new `hri_scores` row.
  - Returns `hri_update` before/after payload.
- `GET /api/reports`
- `GET /api/reports/:wardId`

### Intervention Engine
- `POST /api/interventions`
  - Applies intervention reductions server-side.
  - Persists intervention audit + new HRI snapshot.
  - Returns before/after HRI + projected case reduction.
- `GET /api/interventions/:wardId`

### ASHA -> SMC Field Intelligence
- `POST /api/field-flags`
  - Creates field flag from household risk intelligence.
- `GET /api/field-flags`
  - Lists field flags with pending count.
- `PATCH /api/field-flags/:id`
  - Marks reviewed/action state.

### Copilot Context
- `GET /api/context/:wardId`
  - Returns a DB-grounded text context string for LLM prompting:
    - live HRI and signal values
    - top diseases
    - reports and pending flags
    - city-level high-risk counts and average HRI

### Satellite + Demo Simulation
- `GET /api/satellite/:wardId`
  - Latest satellite values for ward.
- `POST /api/satellite/refresh`
  - Recompute all wards (admin-style operation).
- `POST /api/satellite/simulate`
  - Demo scenario injector (`heat_spike | rain_event | drought`), then recomputes HRI.

### Operational Data
- `GET /api/predictions`
- `GET /api/predictions/:wardId`
- `GET /api/hospitals`
- `PATCH /api/hospitals/:id/capacity`
- `GET /api/alerts`
- `POST /api/alerts`

### Realtime Stream
- `GET /api/stream` (SSE)

## 6) Realtime Events (SSE)

Published events:
- `hri.updated`
- `report.created`
- `intervention.applied`
- `field_flag.created`
- `field_flag.reviewed`
- `alert.created`

Frontend reconnection behavior is implemented with:
- close on error
- reconnect after 3 seconds

This is important for Railway cold starts during demos.

## 7) Auth Model

Light role-header gate (demo-oriented):
- `x-user-role`: `ASHA | SMC | HOSPITAL`
- `x-user-name`
- optional `x-role-secret` if `ROLE_HEADER_SECRET` is configured

Role checks are route-specific (example: SMC-only mutation routes).

## 8) Environment and Startup

Key env vars (`server/.env.example`):
- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `ROLE_HEADER_SECRET`
- `DEFAULT_ROLE`

Scripts (`server/package.json`):
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:init`
- `npm run smoke`
- `npm run dev`

## 9) Execution Order Mapping (Implemented)

1. DB schema + seed scripts prepared
2. `GET /api/wards`, `GET /api/wards/:id` implemented
3. `POST /api/reports` recompute loop implemented
4. `POST /api/interventions` implemented
5. Field-flag lifecycle implemented
6. `GET /api/context/:wardId` implemented
7. `GET /api/stream` SSE implemented
8. Frontend wiring added in approved files

## 10) Frontend Integrations Using This Backend

Shared frontend helpers:
- `client/src/services/aheadlyApi.js`
- `client/src/services/aheadlyRealtime.js`

Updated pages/components:
- `CommunitySanitation` -> `POST /api/reports`
- `InterventionPlanner` -> `POST /api/interventions`
- `ASHAField` -> `POST /api/field-flags`
- `DigitalTwin` -> `GET /api/wards` + SSE `hri.updated`
- `AheadlyCopilot` -> `GET /api/context/:wardId`

## 11) Current Operational Note

Database-backed runtime requires a valid `DATABASE_URL`.
Without it, DB routes/scripts fail with explicit configuration errors.

Once configured, run:
1. `npm run db:migrate`
2. `npm run db:seed`
3. `npm run smoke`

This verifies core backend behavior end-to-end.
