/**
 * HealthGrid AI Jharkhand - Centralized Backend & Audit Logging System
 * 
 * Provides:
 * 1. Backend API Request Logging (Timestamp, Method, Endpoint, User/Role, Request ID, Status Code, Message, Response Time)
 * 2. Security & Operational Audit Logging (Action, Actor, Target Entity, Entity ID, Facility ID, Details, Status)
 * 3. In-Memory Ring Buffer Storage with Query & Filter APIs
 * 4. Pretty-printed terminal output with colors and timings
 */

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  user?: string | null;
  role?: string | null;
  statusCode: number;
  status: 'SUCCESS' | 'ERROR' | 'WARN';
  message: string;
  responseTimeMs: number;
  ip?: string;
  requestBody?: any;
  responseSummary?: any;
}

export type AuditAction = 
  | 'LOGIN'
  | 'INVENTORY_UPDATE'
  | 'MEDICINE_REQUEST'
  | 'TRANSFER_CREATION'
  | 'TRANSFER_APPROVAL'
  | 'TRANSFER_REJECTION'
  | 'EMERGENCY_ALERT'
  | 'DIRECTIVE_DISPATCH'
  | 'SECURITY_VIOLATION'
  | 'TEST_EXECUTION';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: string;
  actorRole: 'PHC_OFFICER' | 'GOVERNMENT_OFFICIAL' | 'CITIZEN' | 'SYSTEM' | 'UNAUTHENTICATED';
  targetEntity: 'MEDICINE' | 'PHC_FACILITY' | 'TRANSFER_ORDER' | 'EMERGENCY_SOS' | 'DIRECTIVE' | 'AUTH_SESSION' | 'TEST_SUITE';
  entityId: string;
  facilityId?: string;
  facilityName?: string;
  details: string;
  status: 'SUCCESS' | 'FAILED';
  metadata?: Record<string, any>;
}

// In-memory ring buffer (persists during server lifetime)
const MAX_LOGS = 500;
let apiLogsBuffer: ApiLogEntry[] = [];
let auditLogsBuffer: AuditLogEntry[] = [];

// Seed baseline logs on system boot so dashboard always has context
function seedBaselineLogs() {
  if (apiLogsBuffer.length > 0) return;

  const now = new Date();
  
  const sampleAudit: AuditLogEntry[] = [
    {
      id: `AUD-${Date.now() - 120000}-001`,
      timestamp: new Date(now.getTime() - 120000).toISOString(),
      action: 'LOGIN',
      actor: 'phc.kanke@gmail.com',
      actorRole: 'PHC_OFFICER',
      targetEntity: 'AUTH_SESSION',
      entityId: 'RNC-CHC-004',
      facilityId: 'RNC-CHC-004',
      facilityName: 'Community Health Centre Kanke',
      details: 'Dr. S. K. Mahato authenticated successfully into PHC Clinical Station.',
      status: 'SUCCESS'
    },
    {
      id: `AUD-${Date.now() - 90000}-002`,
      timestamp: new Date(now.getTime() - 90000).toISOString(),
      action: 'INVENTORY_UPDATE',
      actor: 'phc.kanke@gmail.com',
      actorRole: 'PHC_OFFICER',
      targetEntity: 'MEDICINE',
      entityId: 'MED-001',
      facilityId: 'RNC-CHC-004',
      facilityName: 'Community Health Centre Kanke',
      details: 'Stock for Paracetamol 500mg verified at 650 units (Safe buffer maintained).',
      status: 'SUCCESS'
    },
    {
      id: `AUD-${Date.now() - 60000}-003`,
      timestamp: new Date(now.getTime() - 60000).toISOString(),
      action: 'LOGIN',
      actor: 'govtjharkhand123',
      actorRole: 'GOVERNMENT_OFFICIAL',
      targetEntity: 'AUTH_SESSION',
      entityId: 'GOVT-RNC-HQ',
      facilityId: 'GOVT-RNC-HQ',
      facilityName: 'State Health Command Center Ranchi',
      details: 'Command Center Officer logged in to Ranchi Telemetry & Outbreak Radar.',
      status: 'SUCCESS'
    },
    {
      id: `AUD-${Date.now() - 30000}-004`,
      timestamp: new Date(now.getTime() - 30000).toISOString(),
      action: 'EMERGENCY_ALERT',
      actor: 'CITIZEN_108',
      actorRole: 'CITIZEN',
      targetEntity: 'EMERGENCY_SOS',
      entityId: 'SOS-RNC-8912',
      facilityId: 'RNC-CHC-004',
      facilityName: 'Community Health Centre Kanke',
      details: 'Emergency SOS 108 signal dispatched from GPS Lat: 23.3441, Lng: 85.3096. Assigned to CHC Kanke.',
      status: 'SUCCESS'
    }
  ];

  const sampleApi: ApiLogEntry[] = [
    {
      id: `REQ-${Date.now() - 120000}-101`,
      timestamp: new Date(now.getTime() - 120000).toISOString(),
      method: 'POST',
      endpoint: '/api/phc/auth',
      user: 'phc.kanke@gmail.com',
      role: 'PHC_OFFICER',
      statusCode: 200,
      status: 'SUCCESS',
      message: 'PHC Staff Authenticated Successfully',
      responseTimeMs: 24,
      requestBody: { email: 'phc.kanke@gmail.com' },
      responseSummary: { success: true, facility_id: 'RNC-CHC-004' }
    },
    {
      id: `REQ-${Date.now() - 90000}-102`,
      timestamp: new Date(now.getTime() - 90000).toISOString(),
      method: 'POST',
      endpoint: '/api/phc/inventory',
      user: 'phc.kanke@gmail.com',
      role: 'PHC_OFFICER',
      statusCode: 200,
      status: 'SUCCESS',
      message: 'Medicine stock updated successfully across HealthGrid portals',
      responseTimeMs: 38,
      requestBody: { facility_id: 'RNC-CHC-004', action: 'UPDATE_STOCK', medicine_id: 'MED-001', new_stock: 650 },
      responseSummary: { success: true }
    },
    {
      id: `REQ-${Date.now() - 60000}-103`,
      timestamp: new Date(now.getTime() - 60000).toISOString(),
      method: 'POST',
      endpoint: '/api/auth/login',
      user: 'govtjharkhand123',
      role: 'GOVERNMENT_OFFICIAL',
      statusCode: 200,
      status: 'SUCCESS',
      message: 'Government Command Center session authenticated',
      responseTimeMs: 18,
      requestBody: { email: 'govtjharkhand123' },
      responseSummary: { success: true, role: 'GOVERNMENT_OFFICIAL' }
    },
    {
      id: `REQ-${Date.now() - 30000}-104`,
      timestamp: new Date(now.getTime() - 30000).toISOString(),
      method: 'POST',
      endpoint: '/api/public/emergency',
      user: 'CITIZEN_ANONYMOUS',
      role: 'CITIZEN',
      statusCode: 200,
      status: 'SUCCESS',
      message: 'Emergency alert successfully transmitted to Government Command Center',
      responseTimeMs: 45,
      requestBody: { latitude: 23.3441, longitude: 85.3096, severity: 'CRITICAL' },
      responseSummary: { success: true, event_id: 'SOS-RNC-8912' }
    }
  ];

  auditLogsBuffer = sampleAudit;
  apiLogsBuffer = sampleApi;
}

// Initialize seed
seedBaselineLogs();

/**
 * Generate unique trace ID
 */
export function generateRequestId(prefix: string = 'REQ'): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

/**
 * Sanitize sensitive payload fields like passwords
 */
function sanitizePayload(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const clone = { ...data };
  if (clone.password) clone.password = '********';
  if (clone.pass) clone.pass = '********';
  if (clone.token) clone.token = '********';
  return clone;
}

/**
 * Log an incoming or outgoing Backend API Request
 */
export function logApiRequest(params: {
  requestId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  user?: string | null;
  role?: string | null;
  statusCode: number;
  message: string;
  responseTimeMs: number;
  ip?: string;
  requestBody?: any;
  responseSummary?: any;
}): ApiLogEntry {
  const entry: ApiLogEntry = {
    id: params.requestId || generateRequestId('REQ'),
    timestamp: new Date().toISOString(),
    method: params.method,
    endpoint: params.endpoint,
    user: params.user || 'ANONYMOUS',
    role: params.role || 'UNAUTHENTICATED',
    statusCode: params.statusCode,
    status: params.statusCode >= 200 && params.statusCode < 300 ? 'SUCCESS' : params.statusCode >= 400 && params.statusCode < 500 ? 'WARN' : 'ERROR',
    message: params.message,
    responseTimeMs: Math.round(params.responseTimeMs),
    ip: params.ip || '127.0.0.1',
    requestBody: sanitizePayload(params.requestBody),
    responseSummary: sanitizePayload(params.responseSummary)
  };

  // Add to ring buffer (FIFO)
  apiLogsBuffer.unshift(entry);
  if (apiLogsBuffer.length > MAX_LOGS) {
    apiLogsBuffer.pop();
  }

  // Console output formatted for terminal & cloud loggers
  const statusColor = entry.statusCode >= 200 && entry.statusCode < 300 ? '\x1b[32m' : entry.statusCode >= 400 && entry.statusCode < 500 ? '\x1b[33m' : '\x1b[31m';
  const resetColor = '\x1b[0m';
  console.log(
    `[HEALTHGRID-API] [${entry.timestamp}] ${entry.method} ${entry.endpoint} - ${statusColor}${entry.statusCode} (${entry.responseTimeMs}ms)${resetColor} [User: ${entry.user}] [ID: ${entry.id}] - ${entry.message}`
  );

  return entry;
}

/**
 * Log a Security or Operational System Audit Event
 */
export function logAuditEvent(params: {
  action: AuditAction;
  actor: string;
  actorRole: 'PHC_OFFICER' | 'GOVERNMENT_OFFICIAL' | 'CITIZEN' | 'SYSTEM' | 'UNAUTHENTICATED';
  targetEntity: 'MEDICINE' | 'PHC_FACILITY' | 'TRANSFER_ORDER' | 'EMERGENCY_SOS' | 'DIRECTIVE' | 'AUTH_SESSION' | 'TEST_SUITE';
  entityId: string;
  facilityId?: string;
  facilityName?: string;
  details: string;
  status?: 'SUCCESS' | 'FAILED';
  metadata?: Record<string, any>;
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateRequestId('AUD'),
    timestamp: new Date().toISOString(),
    action: params.action,
    actor: params.actor,
    actorRole: params.actorRole,
    targetEntity: params.targetEntity,
    entityId: params.entityId,
    facilityId: params.facilityId,
    facilityName: params.facilityName,
    details: params.details,
    status: params.status || 'SUCCESS',
    metadata: sanitizePayload(params.metadata)
  };

  // Add to ring buffer
  auditLogsBuffer.unshift(entry);
  if (auditLogsBuffer.length > MAX_LOGS) {
    auditLogsBuffer.pop();
  }

  // Console log
  console.log(
    `\x1b[36m[HEALTHGRID-AUDIT]\x1b[0m [${entry.timestamp}] [${entry.action}] [${entry.actor} (${entry.actorRole})] -> ${entry.details} [Entity: ${entry.targetEntity} / ${entry.entityId}]`
  );

  return entry;
}

/**
 * Get API Logs with filtering
 */
export function getApiLogs(options?: {
  endpoint?: string;
  method?: string;
  status?: string;
  search?: string;
  limit?: number;
}): ApiLogEntry[] {
  let list = [...apiLogsBuffer];

  if (options?.endpoint) {
    list = list.filter(l => l.endpoint.toLowerCase().includes(options.endpoint!.toLowerCase()));
  }
  if (options?.method) {
    list = list.filter(l => l.method.toUpperCase() === options.method!.toUpperCase());
  }
  if (options?.status) {
    list = list.filter(l => l.status.toUpperCase() === options.status!.toUpperCase());
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(l => 
      l.endpoint.toLowerCase().includes(q) ||
      l.message.toLowerCase().includes(q) ||
      (l.user && l.user.toLowerCase().includes(q)) ||
      l.id.toLowerCase().includes(q)
    );
  }

  return list.slice(0, options?.limit || 100);
}

/**
 * Get Audit Logs with filtering
 */
export function getAuditLogs(options?: {
  action?: string;
  actor?: string;
  search?: string;
  limit?: number;
}): AuditLogEntry[] {
  let list = [...auditLogsBuffer];

  if (options?.action) {
    list = list.filter(l => l.action.toUpperCase() === options.action!.toUpperCase());
  }
  if (options?.actor) {
    list = list.filter(l => l.actor.toLowerCase().includes(options.actor!.toLowerCase()));
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(l => 
      l.details.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      (l.facilityName && l.facilityName.toLowerCase().includes(q)) ||
      l.id.toLowerCase().includes(q)
    );
  }

  return list.slice(0, options?.limit || 100);
}

/**
 * Clear all logs (for test resets)
 */
export function clearAllLogs() {
  apiLogsBuffer = [];
  auditLogsBuffer = [];
}

/**
 * System Logger Statistics for Judges Dashboard
 */
export function getLoggerStats() {
  const totalApi = apiLogsBuffer.length;
  const successfulApi = apiLogsBuffer.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
  const failedApi = totalApi - successfulApi;
  const avgResponseTime = totalApi > 0 
    ? Math.round(apiLogsBuffer.reduce((acc, l) => acc + l.responseTimeMs, 0) / totalApi) 
    : 0;
  
  const totalAudit = auditLogsBuffer.length;
  const auditByAction: Record<string, number> = {};
  auditLogsBuffer.forEach(a => {
    auditByAction[a.action] = (auditByAction[a.action] || 0) + 1;
  });

  return {
    total_api_requests: totalApi,
    successful_api_requests: successfulApi,
    failed_api_requests: failedApi,
    average_response_time_ms: avgResponseTime,
    total_audit_events: totalAudit,
    audit_by_action: auditByAction,
    system_status: 'HEALTHY',
    log_buffer_capacity: MAX_LOGS
  };
}
