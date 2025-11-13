# Simple Caching Machine — minimal submission

This repo contains a minimal submission fulfilling SRS/SAD/STP requirements:
- REST API: PUT/GET/DELETE /v1/cache/{key}
- TTL expiry, LRU eviction (count-based)
- Admin endpoint POST /v1/admin/config/eviction (Bearer token required)
- /health and /metrics endpoints
- Simple React GUI to PUT/GET keys

## Run backend (local)
cd backend
npm ci
# optionally set ADMIN_TOKEN and MAX_ITEMS env vars
ADMIN_TOKEN=dev-admin-token MAX_ITEMS=500 node server.js

## Run frontend
cd frontend
npm ci
npm start
# frontend expects backend at http://localhost:4000 by default

## Run tests & coverage
cd backend
npm test
npm run coverage

## CI
A GitHub Actions workflow is included at .github/workflows/ci.yml implementing Build -> Test -> Coverage -> Lint -> Security -> Package.

## Notes vs project docs
- API endpoints and behaviors follow SRS and SAD: PUT/GET semantics, TTL query param, admin eviction endpoint and metrics endpoints. See SRS/SAD. :contentReference[oaicite:11]{index=11} :contentReference[oaicite:12]{index=12}
- CI pipeline implements the 5 stages required in rubric (Build, Test, Coverage, Lint, Security) and creates a deployment artifact. :contentReference[oaicite:13]{index=13}
"# 5STAGE" 
