Who does what (5 owners)

1) Tech Lead & Backend Integrations — Chua She Jia (Team Lead)
Scope: overall architecture, DB schema, shared packages, JWT/auth plumb-through, API contracts, review gates.

Own /packages/db (Prisma schema, migrations, seed), /packages/types, /packages/utils, /packages/config.

Stand up apps/api-auth (OIDC mock → JWT cookie) and cross-service auth guard.

Define and freeze v1 API specs for api-task, api-location, api-admin as OpenAPI (YAML) in /packages/types/openapi.

Implement Admin basics in apps/api-admin (RBAC, audit log write).

Coordinate data model changes + performance indexes (earthdistance function if used).
Deliverables: schema.prisma v1, openapi.yaml, working /auth/* flow with httpOnly JWT, migration+seed scripts, Admin RBAC skeleton.
Acceptance: can log in (mock OIDC), hit /auth/me, run migrations from clean DB, see Admin endpoints gated by role.

2) Frontend PWA & Accessibility — Oh Shi Yun Sherry
Scope: React app, routing, forms, voice input, ARIA; link to APIs; file uploads via signed URL.

Own apps/web: routes Login, CreateRequest, Requests, TaskDetail, Chat, Profile.

Build VoiceField (Web Speech API), MapPicker (Google Maps), RequestCard, RatingBadge.

Wire auth cookie, guarded routes, global state (Zustand).

Implement proof upload flow (get signed URL → PUT → notify API).

Accessibility: keyboard nav, roles, labels, focus rings; contrast checks; i18n hooks ready.
Deliverables: end-to-end: create request → list → accept (from volunteer view) → start/complete UI → upload proof → rate.
Acceptance: Lighthouse accessibility ≥ 90 on main flows; Create Request validates with zod; file proof successfully appears on Task detail.

3) Task Service & Media — How En Hsin
Scope: business logic for requests, acceptance, start/complete with code, VIA minutes, media signed URLs.

Own apps/api-task:

CRUD for Request (zod DTOs).

/nearby (DB function or Postgres earthdistance) and/or consume Redis GEO.

/accept, /start (code verify), /complete (minutes calc + status transitions).

/proof/signed-url (MinIO local; GCS provider interface), /requests/:id/attach-proof.

Emit AuditLog events for critical actions.

Unit tests for transitions and minutes math.
Deliverables: covered endpoints with tests; signed-URL provider abstraction; seed data for demo.
Acceptance: happy-path E2E passes (Playwright) and negative cases (wrong code, double-accept) return 4xx.

4) Location & Matching — Mahak Chandna
Scope: volunteer geolocation intake, Redis GEO index, “find volunteers / requests near me”, live updates.

Own apps/api-location:

POST /location (authn user → store last lat/lng into Redis GEO key).

GET /volunteers/nearby + GET /requests/nearby (km radius, sorted by distance).

Optional WS/SSE channel to push volunteer movement to the task’s requestor.

Provide a small client hook for web to publish location every N secs when active.

Benchmarks for GEO radius at typical densities; tune km defaults.
Deliverables: Redis client, GEO add/search, optional WS broadcaster, TypeScript types exported.
Acceptance: with 50+ synthetic volunteers, query returns sorted results <100ms locally; web map updates position stream.

5) DevOps, CI/CD, Security & QA — Shen Xintian
Scope: developer experience, local Docker, secrets handling, CI/CD to Cloud Run, test automation.

Own /infra/docker and /infra/terraform skeleton; Dex mock OIDC config; MinIO bucket setup.

GitHub Actions: build images, run unit tests, run Playwright E2E on PR; artifact push; deploy job (staging).

Secret management plan (local .env vs GitHub OIDC to GCP secrets).

Playwright E2E: login (mock), create → accept → start (code) → upload proof → complete → rate.

Baseline security: CORS, cookie flags, rate limits (per IP/user) gateway side; basic dependency scanning.
Deliverables: docker-compose up brings full stack; deploy.yaml works with provided GCP SA; E2E suite.
Acceptance: New dev can clone, pnpm i, docker compose up, run migrations, and pass all tests in <30 min.

Interfaces & ownership map

Auth → Web: httpOnly cookie kk_jwt; /auth/me returns {id, role, displayName, photoUrl} (She Jia ↔ Sherry).

Web → Task: JSON DTOs for create/accept/start/complete/attach-proof; expose OpenAPI and client fetch wrappers (En Hsin ↔ Sherry).

Web → Location: POST /location heartbeat when user toggles “available” (Mahak ↔ Sherry).

Task ↔ Location: GET /requests/nearby may be served by Task (SQL) or Location (Redis); agree on single source for the demo (Mahak lead, En Hsin consume).

Admin: read-only dashboards pulling from Task DB and Audit logs (She Jia provides queries; basic UI optional).
