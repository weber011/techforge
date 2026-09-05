# HealthGrid Architecture

The HealthGrid system is built on a modern, scalable, and decentralized architecture comprising the following core components:

## Overview

- **Frontend Web Application (Next.js)**: The administrative dashboard for National, State, District, and PHC level administrators. It visualizes data, manages resources, and displays AI-driven insights.
- **Backend API (Next.js & Python FastAPI)**: 
  - *Next.js API Routes*: Handles primary business logic, authentication, database interaction (via Prisma), and CRUD operations.
  - *Python FastAPI*: Microservice responsible for running predictive models (AI/ML), data science workflows, and complex data aggregations that require specialized Python libraries (like Pandas, Scikit-learn).
- **Database (PostgreSQL)**: The central relational database storing the system's state, inventory, and historical data. We use Prisma as our ORM to interact with this database.
- **Mobile Application (Android)**: Built for on-ground PHC staff to quickly input inventory updates, attendance, and patient footfall data. It communicates with the backend via REST endpoints.
- **Model Context Protocol (MCP)**: Facilitates interaction between LLMs (Large Language Models) and our data services, allowing natural language queries to be resolved into actionable insights and data retrievals within the dashboard.

## System Interactions

1. **Web Dashboard <-> Next.js API**: The frontend consumes REST endpoints (and Server Actions) to display real-time statuses of PHCs.
2. **Next.js API <-> PostgreSQL**: Next.js interacts with the PostgreSQL database using Prisma ORM.
3. **Next.js API <-> Python FastAPI**: When predictive modeling or heavy data analysis is needed (e.g., forecasting patient surges or inventory requirements), the Next.js API delegates these tasks to the FastAPI service.
4. **Android App <-> Next.js API**: PHC staff submit daily data (footfall, inventory, attendance) which is ingested through dedicated API routes in Next.js.
5. **LLM <-> MCP Server**: The MCP server securely exposes specific data read/write capabilities to LLM assistants used by administrators to query insights.

## Deployment Strategy
- **Web App**: Vercel / AWS Amplify.
- **FastAPI**: Containerized via Docker and deployed on AWS ECS or similar container service.
- **Database**: Managed PostgreSQL (e.g., Supabase, AWS RDS).
