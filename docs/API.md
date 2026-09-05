# API Documentation

The REST endpoints are primarily served by the Next.js API routes (`/api/*`). The Python FastAPI service exposes internal endpoints for predictive modeling.

## Next.js API Routes

### Authentication
- `POST /api/auth/login`: Authenticate user and return JWT.
- `POST /api/auth/logout`: Invalidate session.
- `GET /api/auth/me`: Get current authenticated user details.

### PHC Management
- `GET /api/phcs`: List all PHCs (filterable by state, district, or status).
- `GET /api/phcs/:id`: Get detailed information for a specific PHC.
- `PUT /api/phcs/:id`: Update PHC configurations (e.g., bed capacity, required staff).

### Inventory & Metrics (Data Ingestion)
These endpoints are primarily used by the Android App.
- `POST /api/metrics/inventory`: Submit daily inventory closing stock and consumption.
- `POST /api/metrics/footfall`: Submit daily patient footfall numbers.
- `POST /api/metrics/occupancy`: Submit daily bed occupancy status.
- `POST /api/metrics/attendance`: Submit daily staff attendance.

### Transfers & Logistics
- `GET /api/transfers`: View suggested and active medicine transfers.
- `POST /api/transfers`: Propose a new medicine transfer.
- `PATCH /api/transfers/:id/status`: Update the status of a transfer (e.g., from `RECOMMENDED` to `APPROVED`).

### Alerts & Risk
- `GET /api/alerts`: Retrieve active alerts for PHCs (filtered by user role).
- `GET /api/risk-scores`: Retrieve risk scores for dashboards.

## Python FastAPI Endpoints (Internal)

- `POST /internal/predict/surge`: Analyzes historical patient footfall and external factors to predict upcoming patient surges.
- `POST /internal/predict/stockout`: Analyzes current inventory and consumption rates to predict which medicines will run out of stock and when.
- `POST /internal/optimize/transfers`: Recommends optimal medicine routing from surplus PHCs to deficit PHCs.
