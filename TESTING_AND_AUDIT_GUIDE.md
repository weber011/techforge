# 🧪 HealthGrid AI Jharkhand - Verification, Testing & Audit Guide

This document outlines the **Automated Testing Suite**, **Live Wire-Level API Logging Engine**, **Security Audit Trail System**, and **Judging Demonstration Guide** built for **HealthGrid AI Jharkhand**.

---

## 🌟 Live Access URLs

- **Live Test & Audit Dashboard:** [https://healthgrid-web.vercel.app/admin/test-logs](https://healthgrid-web.vercel.app/admin/test-logs) (or `/test-logs`)
- **State Command Radar:** [https://healthgrid-web.vercel.app/govt](https://healthgrid-web.vercel.app/govt)
- **PHC Staff Station:** [https://healthgrid-web.vercel.app/phc](https://healthgrid-web.vercel.app/phc)
- **Citizen Health Portal:** [https://healthgrid-web.vercel.app/public](https://healthgrid-web.vercel.app/public)

---

## 🚀 1. How to Run the Automated Tests

### Option A: Via Terminal (CLI Automated Runner)

From the project root or `healthgrid-web` directory, execute:

```bash
npm test
```
*or*
```bash
npm run test:api
```

**Expected Terminal Output:**
```
========================================================================
   HEALTHGRID AI JHARKHAND - AUTOMATED TEST SUITE & LOGS VERIFIER   
========================================================================

⚡ Connected to target server: https://healthgrid-web.vercel.app

Executing 11 Core Functional & Security Test Cases...

 ✔ PASS  TC-01 - Successful Login (PHC Officer Authentication) (32ms, HTTP 200)
        └─ MOIC: Dr. S. K. Mahato (MOIC)
 ✔ PASS  TC-02 - Invalid Login (Credential Rejection) (26ms, HTTP 401)
        └─ Correctly returned 401 Unauthorized
 ✔ PASS  TC-03 - Unauthorized Role Access Enforcement (26ms, HTTP 403)
        └─ Correctly returned 403 Forbidden
 ✔ PASS  TC-04 - Medicine Request with Sufficient Stock (26ms, HTTP 200)
        └─ Donor safety check PASS (is_safe: true)
 ✔ PASS  TC-05 - Medicine Request with Insufficient Stock (Safety Buffer Warning) (23ms, HTTP 200)
        └─ Correctly alerted secondary shortage (is_safe: false)
 ✔ PASS  TC-06 - Medicine Transfer Creation & Tracking (22ms, HTTP 200)
        └─ Order ID: TR-RNC-453899
 ✔ PASS  TC-07 - Transfer Quantity Greater than Available Stock Rejection (25ms, HTTP 400)
        └─ Correctly rejected with 400 Bad Request
 ✔ PASS  TC-08 - Duplicate Request Rejection (Cooldown Debounce) (57ms, HTTP 409)
        └─ Correctly blocked duplicate with 409 Conflict
 ✔ PASS  TC-09 - Invalid / Missing GPS Input Validation (26ms, HTTP 400)
        └─ Correctly rejected missing GPS with 400 Bad Request
 ✔ PASS  TC-10 - Emergency 108 Alert Dispatch & Telemetry Routing (22ms, HTTP 200)
        └─ Event ID: EMG-749331
 ✔ PASS  TC-11 - Live Inventory Stock Update & Audit Trail Generation (19ms, HTTP 200)
        └─ Inventory state and audit log successfully updated

------------------------------------------------------------------------
TEST EXECUTION SUMMARY:
  Total Tests:    11
  Passed:         11
  Failed:         0
  Pass Rate:      100%
  Total Duration: 308ms
------------------------------------------------------------------------

✓ ALL TEST CASES VERIFIED SUCCESSFULLY.
```

---

### Option B: Via Visual Testing Dashboard (`/admin/test-logs`)

1. Open **[https://healthgrid-web.vercel.app/admin/test-logs](https://healthgrid-web.vercel.app/admin/test-logs)** in your browser.
2. Click the **"Run All 11 Test Cases"** button.
3. Observe the live execution progress, real-time HTTP response statuses, and execution latencies (ms).
4. Expand any test case card to inspect the exact **Input JSON Payload**, **Expected Outcome**, and **Actual Server Response**.
5. Use the **"Execute"** button on individual cards to re-test specific APIs on demand.

---

## 📊 2. Matrix of the 11 Required Test Cases

| Test ID | Test Name | Target Endpoint | Input Summary | Expected Status | Validation Criteria |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-01** | **Successful Login** | `POST /api/phc/auth` | `phc.kanke@gmail.com` / `kanke@123` | **200 OK** | Authenticates MOIC Dr. S. K. Mahato, returns session token. |
| **TC-02** | **Invalid Login** | `POST /api/phc/auth` | `phc.kanke@gmail.com` / `wrong_pass` | **401 Unauthorized** | Returns `success: false` and logs security failure. |
| **TC-03** | **Unauthorized Role Access** | `POST /api/government/directives` | `sender_role: "CITIZEN"` | **403 Forbidden** | Access denied; logs `SECURITY_VIOLATION` audit event. |
| **TC-04** | **Medicine Request (Sufficient Stock)** | `POST /api/phc/transfer-request` | `requested_quantity: 150` | **200 OK** | Validates donor safety stock buffer (`is_safe: true`). |
| **TC-05** | **Medicine Request (Insufficient Stock)** | `POST /api/phc/transfer-request` | `requested_quantity: 1700` | **200 OK** | Flags secondary shortage warning (`is_safe: false`). |
| **TC-06** | **Medicine Transfer Creation** | `POST /api/phc/transfer-request` | Valid transfer Ormanjhi ➔ Kanke | **200 OK** | Generates unique tracking ID `TR-RNC-XXXXXX`. |
| **TC-07** | **Transfer Exceeding Total Stock** | `POST /api/phc/transfer-request` | `requested_quantity: 999999` | **400 Bad Request** | Rejects quantity exceeding total donor stock. |
| **TC-08** | **Duplicate Request Rejection** | `POST /api/phc/support-request` | Identical payload within 10s | **409 Conflict** | Debounce engine prevents duplicate requisition spam. |
| **TC-09** | **Invalid / Missing Input** | `POST /api/public/emergency` | Omits GPS latitude/longitude | **400 Bad Request** | Validates required GPS coordinate fields. |
| **TC-10** | **Emergency 108 Alert** | `POST /api/public/emergency` | GPS: (23.3441, 85.3096), Critical | **200 OK** | Routes alert to nearest PHC (`RNC-CHC-004`). |
| **TC-11** | **Inventory Stock Update** | `POST /api/phc/inventory` | `new_stock: 750` for `MED-001` | **200 OK** | Updates live stock count and logs `INVENTORY_UPDATE`. |

---

## 📜 3. Backend API Request Logging (`Tab 2`)

Every important API request is captured with full metadata:

```json
{
  "id": "REQ-1725608249-ABC12",
  "timestamp": "2026-09-06T07:07:29.123Z",
  "method": "POST",
  "endpoint": "/api/phc/inventory",
  "user": "phc.kanke@gmail.com",
  "role": "PHC_OFFICER",
  "statusCode": 200,
  "status": "SUCCESS",
  "message": "Medicine stock updated successfully across HealthGrid portals",
  "responseTimeMs": 29,
  "ip": "127.0.0.1"
}
```

### How to View Backend Request Logs:
1. Open **`/admin/test-logs`** ➔ Click **"Backend Request Logs"** (`Tab 2`).
2. Filter logs using the search bar (by endpoint, user, method, or HTTP status code like `200`, `400`, `401`, `403`, `409`).
3. Toggle **"Auto-refresh (4s)"** to see live network telemetry stream as users interact with the system.

---

## 🛡️ 4. Security & Operational Audit Trail (`Tab 3`)

The audit log system records structured, immutable events for all high-value transactions:

- **`LOGIN`**: Officer and citizen authentications (with success / failure indicators).
- **`INVENTORY_UPDATE`**: Stock changes, medicine batch registrations, operational bed updates.
- **`MEDICINE_REQUEST`**: Emergency requisitions escalated from PHCs to State Command.
- **`TRANSFER_CREATION`**: Peer PHC drug transfers created with donor safety assessment.
- **`TRANSFER_APPROVAL` / `TRANSFER_REJECTION`**: Action taken on transfer orders.
- **`EMERGENCY_ALERT`**: 108 Citizen SOS signals with GPS coordinates and assigned hospital.
- **`DIRECTIVE_DISPATCH`**: State Command directives issued to PHCs.
- **`SECURITY_VIOLATION`**: Unauthorized role override attempts.

### How to View Audit Logs:
1. Open **`/admin/test-logs`** ➔ Click **"Security & Operational Audit Trail"** (`Tab 3`).
2. Filter by action type (`LOGIN`, `INVENTORY_UPDATE`, `TRANSFER_CREATION`, `EMERGENCY_ALERT`, `DIRECTIVE_DISPATCH`).
3. View actor, role, facility name, narrative details, and precise ISO timestamps.

---

## 🎯 5. How to Demonstrate to a Judge (3-Minute Script)

### Step 1: Automated Test Suite (1 Minute)
1. Navigate to **`/admin/test-logs`**.
2. State: *"We have implemented a comprehensive 11-point test suite covering authentication, role-based security, donor safety thresholds, duplicate debounce, and 108 emergency routing."*
3. Click **"Run All 11 Test Cases"**.
4. Show the **100% Pass Rate** and sub-50ms average latency.
5. Expand **TC-04** (Sufficient stock ➔ `is_safe: true`) and **TC-07** (999,999 units ➔ `400 Bad Request: Stock exceeded`).

### Step 2: Backend Request Logs & Trace IDs (1 Minute)
1. Click **Tab 2: Backend Request Logs**.
2. Point out: *"Every request generates a trace ID with timestamp, HTTP method, endpoint, user/role, response latency, and outcome message."*
3. Search for `/api/phc/auth` or `401` to show invalid login rejection.

### Step 3: Security & Operational Audit Trail (1 Minute)
1. Click **Tab 3: Audit Trail**.
2. Show the chronological record of transactions: *"Every login, stock update, and 108 SOS dispatch is recorded in an immutable audit trail with actor details and facility IDs."*
3. Open terminal and run `npm test` to prove that the CLI runner matches the web test suite.
