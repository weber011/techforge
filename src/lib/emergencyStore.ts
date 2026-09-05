// HealthGrid Real-Time Emergency Store & Event Bus
export interface EmergencyEvent {
  id: string;
  event_id: string;
  user_id?: string;
  latitude: number;
  longitude: number;
  location_accuracy: number;
  created_at: string;
  received_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  status: 'CREATED' | 'RECEIVED' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | 'CANCELLED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  nearest_facility_id: string;
  assigned_facility_id?: string;
  resolution_notes?: string;
  resolved_at?: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  user_id?: string;
  role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  success: boolean;
}

const globalForEmergency = globalThis as unknown as {
  __HEALTHGRID_EMERGENCIES__?: EmergencyEvent[];
  __HEALTHGRID_AUDIT_LOGS__?: AuditEvent[];
  __HEALTHGRID_SSE_LISTENERS__?: Set<(event: EmergencyEvent) => void>;
};

if (!globalForEmergency.__HEALTHGRID_EMERGENCIES__) {
  globalForEmergency.__HEALTHGRID_EMERGENCIES__ = [
    {
      id: 'emg-init-01',
      event_id: 'EMG-90214',
      latitude: 23.3650,
      longitude: 85.3120,
      location_accuracy: 12,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      received_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'ACKNOWLEDGED',
      severity: 'CRITICAL',
      description: 'Acute respiratory distress reported near Ratu Road',
      nearest_facility_id: 'RNC-CHC-002',
      acknowledged_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      acknowledged_by: 'govtjharkhand123 (Govt Command Officer)',
      updated_at: new Date().toISOString()
    }
  ];
}

if (!globalForEmergency.__HEALTHGRID_AUDIT_LOGS__) {
  globalForEmergency.__HEALTHGRID_AUDIT_LOGS__ = [];
}

if (!globalForEmergency.__HEALTHGRID_SSE_LISTENERS__) {
  globalForEmergency.__HEALTHGRID_SSE_LISTENERS__ = new Set();
}

export function getEmergencyEvents(): EmergencyEvent[] {
  return globalForEmergency.__HEALTHGRID_EMERGENCIES__ || [];
}

export function getEmergencyById(idOrEventId: string): EmergencyEvent | undefined {
  const list = getEmergencyEvents();
  return list.find(e => e.id === idOrEventId || e.event_id === idOrEventId);
}

export function createEmergencyEvent(data: {
  latitude: number;
  longitude: number;
  location_accuracy: number;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description?: string;
  nearest_facility_id: string;
  user_id?: string;
}): EmergencyEvent {
  const eventId = 'EMG-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();
  
  const newEvent: EmergencyEvent = {
    id: 'emg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    event_id: eventId,
    user_id: data.user_id,
    latitude: data.latitude,
    longitude: data.longitude,
    location_accuracy: data.location_accuracy || 10,
    created_at: now,
    received_at: now,
    status: 'RECEIVED',
    severity: data.severity || 'CRITICAL',
    description: data.description || 'Emergency medical assistance requested by citizen.',
    nearest_facility_id: data.nearest_facility_id,
    updated_at: now
  };

  globalForEmergency.__HEALTHGRID_EMERGENCIES__!.unshift(newEvent);

  broadcastEmergency(newEvent);

  logAuditEvent({
    user_id: data.user_id || 'CITIZEN_ANONYMOUS',
    role: 'CITIZEN',
    action: 'EMERGENCY_CREATED',
    resource_type: 'EMERGENCY_EVENT',
    resource_id: newEvent.event_id,
    success: true
  });

  return newEvent;
}

export function updateEmergencyStatus(
  idOrEventId: string,
  status: EmergencyEvent['status'],
  officerName?: string,
  notes?: string
): EmergencyEvent | null {
  const event = getEmergencyById(idOrEventId);
  if (!event) return null;

  event.status = status;
  event.updated_at = new Date().toISOString();

  if (status === 'ACKNOWLEDGED') {
    event.acknowledged_at = new Date().toISOString();
    event.acknowledged_by = officerName || 'Government Officer';
  } else if (status === 'RESOLVED') {
    event.resolved_at = new Date().toISOString();
    event.resolution_notes = notes || 'Resolved by emergency response team';
  }

  broadcastEmergency(event);

  logAuditEvent({
    user_id: officerName || 'GOVT_OFFICER',
    role: 'GOVERNMENT_OFFICIAL',
    action: `EMERGENCY_STATUS_${status}`,
    resource_type: 'EMERGENCY_EVENT',
    resource_id: event.event_id,
    success: true
  });

  return event;
}

export function broadcastEmergency(event: EmergencyEvent) {
  if (globalForEmergency.__HEALTHGRID_SSE_LISTENERS__) {
    globalForEmergency.__HEALTHGRID_SSE_LISTENERS__.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in SSE listener:', err);
      }
    });
  }
}

export function subscribeToEmergencies(listener: (event: EmergencyEvent) => void): () => void {
  globalForEmergency.__HEALTHGRID_SSE_LISTENERS__!.add(listener);
  return () => {
    globalForEmergency.__HEALTHGRID_SSE_LISTENERS__!.delete(listener);
  };
}

export function logAuditEvent(data: {
  user_id?: string;
  role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  success: boolean;
}) {
  const audit: AuditEvent = {
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    ...data,
    timestamp: new Date().toISOString()
  };
  globalForEmergency.__HEALTHGRID_AUDIT_LOGS__!.unshift(audit);
}

export function getAuditLogs(): AuditEvent[] {
  return globalForEmergency.__HEALTHGRID_AUDIT_LOGS__ || [];
}
