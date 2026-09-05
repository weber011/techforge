# HealthGrid Database Schema

The database is a PostgreSQL instance managed by Prisma ORM. Below is an explanation of the core models and their relationships as defined in `healthgrid-web/prisma/schema.prisma`.

## Core Entities

### Hierarchical Models
- **State**: Represents a geographical state.
  - *Relations*: 1-to-Many with `District`.
- **District**: Represents a district within a State.
  - *Relations*: Belongs to a `State`, 1-to-Many with `Phc`.
- **Phc (Primary Health Centre)**: The core node in the system. Tracks details like location (latitude/longitude), total beds, required doctors, and nurses.
  - *Relations*: Belongs to a `District`. Has many `User`, `Inventory`, `PatientFootfall`, `BedOccupancy`, `StaffAttendance`, `Alert`, `RiskScore`, and `MedicineTransfer`.

### User Management
- **User**: Represents system users (Administrators at different levels and PHC Staff).
  - *Fields*: Name, Email, Password, Role (`NATIONAL_ADMIN`, `STATE_ADMIN`, `DISTRICT_ADMIN`, `PHC_ADMIN`, `PHC_STAFF`).
  - *Relations*: Optionally belongs to a specific `Phc`.

### Inventory & Resources
- **Medicine**: A catalog of available medicines, their categories, units, and safety stock levels.
  - *Relations*: 1-to-Many with `Inventory` and `MedicineTransfer`.
- **Inventory**: Tracks daily stock levels of medicines at a specific PHC.
  - *Fields*: Opening stock, received, consumed, closing stock.
  - *Relations*: Belongs to `Phc` and `Medicine`.
- **MedicineTransfer**: Logs the transfer of medicines between different PHCs to balance stock.
  - *Fields*: Quantity, Status (`RECOMMENDED`, `APPROVED`, etc.).
  - *Relations*: Belongs to a `Medicine`, a "From" `Phc`, and a "To" `Phc`.

### Daily Metrics
- **PatientFootfall**: Daily logs of patient visits categorizing by emergency, fever, and respiratory cases.
  - *Relations*: Belongs to `Phc`.
- **BedOccupancy**: Daily logs of available and occupied beds.
  - *Relations*: Belongs to `Phc`.
- **StaffAttendance**: Daily logs of present doctors and nurses.
  - *Relations*: Belongs to `Phc`.

### Insights & AI Outputs
- **Alert**: System-generated or user-created alerts regarding stock-outs, bed capacity, surges, etc.
  - *Fields*: Alert Type, Severity, Status.
  - *Relations*: Belongs to `Phc`.
- **RiskScore**: AI-generated risk assessment for a PHC on a given date.
  - *Fields*: Score (0-100), JSON string of contributing risk factors.
  - *Relations*: Belongs to `Phc`.
