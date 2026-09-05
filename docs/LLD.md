# Low-Level Design (LLD)

This document outlines the detailed component interactions and data flows within the HealthGrid system.

## System Data Flow

```mermaid
sequenceDiagram
    participant App as Android App (PHC Staff)
    participant Web as Next.js Web (Admin)
    participant API as Next.js API
    participant DB as PostgreSQL (Prisma)
    participant AI as Python FastAPI

    Note over App, API: Daily Data Ingestion
    App->>API: POST /api/metrics/inventory
    App->>API: POST /api/metrics/footfall
    API->>DB: Save metrics (Inventory, Footfall)
    DB-->>API: Confirm save
    API-->>App: 200 OK

    Note over AI, DB: Async AI Processing (Cron/Trigger)
    API->>AI: Trigger prediction pipeline
    AI->>DB: Fetch historical data & metrics
    DB-->>AI: Return timeseries data
    AI->>AI: Run predictive models (Surge, Stock)
    AI->>DB: Save RiskScores & Alerts
    
    Note over Web, API: Admin Dashboard View
    Web->>API: GET /api/alerts & /api/risk-scores
    API->>DB: Query latest AI insights
    DB-->>API: Results
    API-->>Web: JSON payload
    Web->>Web: Render Dashboard UI
```

## Component Architecture

```mermaid
graph TD
    subgraph Frontend [Client Applications]
        A[Next.js Dashboard UI]
        B[Android App]
    end

    subgraph Backend [Backend Services]
        C[Next.js API Routes]
        D[Python FastAPI AI Service]
        E[MCP Server]
    end

    subgraph Data [Data Layer]
        F[(PostgreSQL DB)]
    end

    A -->|REST / Server Actions| C
    B -->|REST APIs| C
    C -->|Prisma ORM| F
    C -->|Internal HTTP| D
    D -->|Direct Query or API| F
    E -->|Read/Write Operations| C
```

## Core Modules

1. **Auth Module**: 
   - Handles JWT generation, role-based access control (RBAC). 
   - Ensures PHC staff can only access their specific node, while State Admins see aggregate data.

2. **Ingestion Module**: 
   - Validates incoming data from Android clients.
   - Normalizes data structures (ensuring date consistency, resolving conflicts via `@@unique` constraints on date/phcId).

3. **Analytics & AI Module**:
   - Python-based microservice.
   - Connects to PostgreSQL directly for heavy read operations (Pandas dataframes).
   - Computes output metrics and pushes back to PostgreSQL as `Alert` and `RiskScore` records.

4. **Logistics Module**:
   - Evaluates inventory shortages.
   - Interacts with AI predictions to proactively create `MedicineTransfer` records with `RECOMMENDED` status.
