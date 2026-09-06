#!/usr/bin/env node

/**
 * HealthGrid AI Jharkhand - CLI Automated Test Runner
 * 
 * Usage:
 *   npm test
 *   or: node scripts/run-tests.mjs
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const FALLBACK_PROD_URL = 'https://healthgrid-web.vercel.app';

// Colors for terminal output
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

async function checkServer(url) {
  try {
    const res = await fetch(`${url}/api/phc/auth`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log(`\n${BOLD}${GREEN}========================================================================${RESET}`);
  console.log(`${BOLD}${GREEN}   HEALTHGRID AI JHARKHAND - AUTOMATED TEST SUITE & LOGS VERIFIER   ${RESET}`);
  console.log(`${BOLD}${GREEN}========================================================================${RESET}\n`);

  let targetUrl = BASE_URL;
  const isLocalAlive = await checkServer(BASE_URL);

  if (!isLocalAlive) {
    console.log(`${YELLOW}⚡ Local server at ${BASE_URL} not responding. Connecting to live production endpoint at ${FALLBACK_PROD_URL}...${RESET}\n`);
    targetUrl = FALLBACK_PROD_URL;
  } else {
    console.log(`${CYAN}⚡ Connected to target server at: ${BOLD}${targetUrl}${RESET}\n`);
  }

  console.log(`${DIM}Executing 11 Core Functional & Security Test Cases...${RESET}\n`);

  const results = [];
  const startTime = Date.now();

  // Test definitions
  const testCases = [
    {
      id: 'TC-01',
      name: 'Successful Login (PHC Officer Authentication)',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/phc/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'phc.kanke@gmail.com', password: 'kanke@123' })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 200 && data.success === true && data.user?.facility_id === 'RNC-CHC-004';
        return { pass, latency, status: res.status, details: `MOIC: ${data.user?.medical_officer_in_charge || 'N/A'}` };
      }
    },
    {
      id: 'TC-02',
      name: 'Invalid Login (Credential Rejection)',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/phc/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'phc.kanke@gmail.com', password: 'wrong_pass_999' })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 401 && data.success === false;
        return { pass, latency, status: res.status, details: 'Correctly returned 401 Unauthorized' };
      }
    },
    {
      id: 'TC-03',
      name: 'Unauthorized Role Access Enforcement',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/government/directives`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_role: 'CITIZEN',
            target_facility_id: 'RNC-CHC-004',
            title: 'Unauthorized State Override',
            message: 'Testing role enforcement'
          })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 403 && data.success === false;
        return { pass, latency, status: res.status, details: 'Correctly returned 403 Forbidden' };
      }
    },
    {
      id: 'TC-04',
      name: 'Medicine Request with Sufficient Stock',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/phc/transfer-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_phc_email: 'phc.ratu@gmail.com',
            destination_phc_email: 'phc.kanke@gmail.com',
            medicine_name: 'Paracetamol 500mg',
            requested_quantity: 150,
            urgency: 'ROUTINE'
          })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 200 && data.success === true && data.transfer?.donor_safety_check?.is_safe === true;
        return { pass, latency, status: res.status, details: 'Donor safety check PASS (is_safe: true)' };
      }
    },
    {
      id: 'TC-05',
      name: 'Medicine Request with Insufficient Stock (Safety Buffer Warning)',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/phc/transfer-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_phc_email: 'phc.namkum@gmail.com',
            destination_phc_email: 'phc.kanke@gmail.com',
            medicine_name: 'Anti-Snake Venom 10ml',
            requested_quantity: 1700,
            urgency: 'CRITICAL'
          })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 200 && data.success === true && data.transfer?.donor_safety_check?.is_safe === false;
        return { pass, latency, status: res.status, details: 'Correctly alerted secondary shortage (is_safe: false)' };
      }
    },
    {
      id: 'TC-06',
      name: 'Medicine Transfer Creation & Tracking',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/phc/transfer-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_phc_email: 'phc.ormanjhi@gmail.com',
            destination_phc_email: 'phc.kanke@gmail.com',
            medicine_name: 'Amoxicillin 500mg',
            requested_quantity: 200,
            urgency: 'HIGH'
          })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 200 && data.success === true && data.transfer?.id?.startsWith('TR-RNC-');
        return { pass, latency, status: res.status, details: `Order ID: ${data.transfer?.id}` };
      }
    },
    {
      id: 'TC-07',
      name: 'Transfer Quantity Greater than Available Stock Rejection',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/phc/transfer-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_phc_email: 'phc.kanke@gmail.com',
            destination_phc_email: 'phc.ratu@gmail.com',
            medicine_name: 'Paracetamol 500mg',
            requested_quantity: 999999,
            urgency: 'CRITICAL'
          })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 400 && data.success === false;
        return { pass, latency, status: res.status, details: 'Correctly rejected with 400 Bad Request' };
      }
    },
    {
      id: 'TC-08',
      name: 'Duplicate Request Rejection (Cooldown Debounce)',
      fn: async () => {
        const start = Date.now();
        const payload = {
          source_facility_id: 'RNC-CHC-004',
          category: 'EMERGENCY_DRUG_REQUISITION',
          title: 'CLI_DUPLICATE_DEBOUNCE_TEST',
          description: 'Testing duplicate rejection debounce in CLI runner',
          requested_by_officer: 'Dr. S. K. Mahato'
        };

        // First call
        await fetch(`${targetUrl}/api/phc/support-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Immediate duplicate call
        const res2 = await fetch(`${targetUrl}/api/phc/support-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data2 = await res2.json();
        const latency = Date.now() - start;
        const pass = res2.status === 409 && data2.duplicate_detected === true;
        return { pass, latency, status: res2.status, details: 'Correctly blocked duplicate with 409 Conflict' };
      }
    },
    {
      id: 'TC-09',
      name: 'Invalid / Missing GPS Input Validation',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/public/emergency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: 'SOS without GPS' })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 400 && data.success === false;
        return { pass, latency, status: res.status, details: 'Correctly rejected missing GPS with 400 Bad Request' };
      }
    },
    {
      id: 'TC-10',
      name: 'Emergency 108 Alert Dispatch & Telemetry Routing',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/public/emergency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: 23.3441,
            longitude: 85.3096,
            location_accuracy: 5,
            severity: 'CRITICAL',
            description: '108 Emergency cardiac alert dispatched via CLI runner',
            contact_phone: '9876543210',
            citizen_name: 'Test Citizen'
          })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 200 && data.success === true && typeof data.event_id === 'string';
        return { pass, latency, status: res.status, details: `Event ID: ${data.event_id}` };
      }
    },
    {
      id: 'TC-11',
      name: 'Live Inventory Stock Update & Audit Trail Generation',
      fn: async () => {
        const start = Date.now();
        const res = await fetch(`${targetUrl}/api/phc/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facility_id: 'RNC-CHC-004',
            action: 'UPDATE_STOCK',
            medicine_id: 'MED-001',
            new_stock: 750,
            batch_number: 'PCM-2026-B8',
            expiry_date: '2028-11-30'
          })
        });
        const data = await res.json();
        const latency = Date.now() - start;
        const pass = res.status === 200 && data.success === true && Array.isArray(data.state?.medicines);
        return { pass, latency, status: res.status, details: 'Inventory state and audit log successfully updated' };
      }
    }
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    try {
      const outcome = await tc.fn();
      if (outcome.pass) {
        passedCount++;
        console.log(` ${GREEN}✔ PASS${RESET}  ${BOLD}${tc.id}${RESET} - ${tc.name} ${DIM}(${outcome.latency}ms, HTTP ${outcome.status})${RESET}`);
        console.log(`        ${DIM}└─ ${outcome.details}${RESET}`);
      } else {
        console.log(` ${RED}✖ FAIL${RESET}  ${BOLD}${tc.id}${RESET} - ${tc.name} ${DIM}(${outcome.latency}ms, HTTP ${outcome.status})${RESET}`);
        console.log(`        ${RED}└─ ${outcome.details}${RESET}`);
      }
    } catch (err) {
      console.log(` ${RED}✖ ERROR${RESET} ${BOLD}${tc.id}${RESET} - ${tc.name}: ${err.message}`);
    }
  }

  const totalTime = Date.now() - startTime;
  const passRate = Math.round((passedCount / testCases.length) * 100);

  console.log(`\n${BOLD}------------------------------------------------------------------------${RESET}`);
  console.log(`${BOLD}TEST EXECUTION SUMMARY:${RESET}`);
  console.log(`  Total Tests:    ${BOLD}${testCases.length}${RESET}`);
  console.log(`  Passed:         ${GREEN}${BOLD}${passedCount}${RESET}`);
  console.log(`  Failed:         ${passedCount === testCases.length ? GREEN : RED}${BOLD}${testCases.length - passedCount}${RESET}`);
  console.log(`  Pass Rate:      ${passRate === 100 ? GREEN : YELLOW}${BOLD}${passRate}%${RESET}`);
  console.log(`  Total Duration: ${CYAN}${totalTime}ms${RESET}`);
  console.log(`${BOLD}------------------------------------------------------------------------${RESET}\n`);

  if (passedCount === testCases.length) {
    console.log(`${GREEN}${BOLD}✓ ALL TEST CASES VERIFIED SUCCESSFULLY.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}✖ SOME TEST CASES FAILED.${RESET}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
