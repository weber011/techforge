import { RANCHI_FACILITIES_MASTER, RANCHI_MEDICINE_MASTER, FacilityRecord } from './ranchiData';

export interface PhcUser {
  facility_id: string;
  facility_name: string;
  facility_type: string;
  block: string;
  email: string;
  alias_email: string;
  password: string;
  phone: string;
  medical_officer_in_charge: string;
}

export interface PhcMedicineStock {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_safety_stock: number;
  batch_number: string;
  expiry_date: string;
  status: 'SAFE' | 'LOW' | 'CRITICAL';
}

export interface PhcLiveState {
  facility_id: string;
  facility_name: string;
  total_beds: number;
  available_beds: number;
  occupied_beds: number;
  doctors_present: number;
  doctors_sanctioned: number;
  nurses_present: number;
  nurses_sanctioned: number;
  ambulance_ready: boolean;
  medicines: PhcMedicineStock[];
  last_updated: string;
}

export interface GovtDirective {
  id: string;
  directive_code: string;
  created_at: string;
  sender_officer_id: string;
  target_facility_id: string;
  target_facility_name: string;
  target_email: string;
  priority: 'URGENT_DIRECTIVE' | 'STOCK_INQUIRY' | 'ROUTINE_AUDIT';
  title: string;
  message: string;
  status: 'PENDING_RESPONSE' | 'APPROVED_AND_READY' | 'PROBLEM_REPORTED';
  phc_response_notes?: string;
  phc_responded_at?: string;
  phc_responded_by?: string;
}

// Master PHC Credentials Registry (10 Ranchi Facilities)
export const PHC_CREDENTIALS_MASTER: PhcUser[] = [
  {
    facility_id: 'RNC-CHC-004',
    facility_name: 'Community Health Centre Kanke',
    facility_type: 'CHC',
    block: 'Kanke',
    email: 'phc.kanke@gmail.com',
    alias_email: 'phc.kanke@gov.in',
    password: 'kanke@123',
    phone: '0651-2458900',
    medical_officer_in_charge: 'Dr. S. K. Mahato (MOIC)'
  },
  {
    facility_id: 'RNC-CHC-002',
    facility_name: 'Community Health Centre Ratu (Ushamatu)',
    facility_type: 'CHC',
    block: 'Ratu',
    email: 'phc.ratu@gmail.com',
    alias_email: 'phc.ratu.ushamatu@gov.in',
    password: 'ratu@123',
    phone: '0651-2675401',
    medical_officer_in_charge: 'Dr. Rameshwar Singh (MOIC)'
  },
  {
    facility_id: 'RNC-PHC-003',
    facility_name: 'Primary Health Centre Namkum',
    facility_type: 'PHC',
    block: 'Namkum',
    email: 'phc.namkum@gmail.com',
    alias_email: 'phc.namkum@gov.in',
    password: 'namkum@123',
    phone: '0651-2451002',
    medical_officer_in_charge: 'Dr. Ananya Roy (MOIC)'
  },
  {
    facility_id: 'RNC-CHC-005',
    facility_name: 'Community Health Centre Ormanjhi',
    facility_type: 'CHC',
    block: 'Ormanjhi',
    email: 'phc.ormanjhi@gmail.com',
    alias_email: 'phc.ormanjhi@gov.in',
    password: 'ormanjhi@123',
    phone: '0651-2763200',
    medical_officer_in_charge: 'Dr. Manoj Soren (MOIC)'
  },
  {
    facility_id: 'RNC-CHC-006',
    facility_name: 'Community Health Centre Bero',
    facility_type: 'CHC',
    block: 'Bero',
    email: 'phc.bero@gmail.com',
    alias_email: 'phc.bero@gov.in',
    password: 'bero@123',
    phone: '0651-2894100',
    medical_officer_in_charge: 'Dr. Alok Minz (MOIC)'
  },
  {
    facility_id: 'RNC-CHC-007',
    facility_name: 'Community Health Centre Mandar',
    facility_type: 'CHC',
    block: 'Mandar',
    email: 'phc.mandar@gmail.com',
    alias_email: 'phc.mandar@gov.in',
    password: 'mandar@123',
    phone: '0651-2781200',
    medical_officer_in_charge: 'Dr. Preeti Xalxo (MOIC)'
  },
  {
    facility_id: 'RNC-SDH-008',
    facility_name: 'Sub-Divisional Hospital Bundu',
    facility_type: 'SDH',
    block: 'Bundu',
    email: 'phc.bundu@gmail.com',
    alias_email: 'phc.bundu@gov.in',
    password: 'bundu@123',
    phone: '0651-2873100',
    medical_officer_in_charge: 'Dr. Rajeshwar Prasad (Surgeon Supt.)'
  },
  {
    facility_id: 'RNC-UPHC-009',
    facility_name: 'Urban Primary Health Centre Doranda',
    facility_type: 'UPHC',
    block: 'Ranchi Urban',
    email: 'phc.doranda@gmail.com',
    alias_email: 'uphc.doranda@gov.in',
    password: 'doranda@123',
    phone: '0651-2501234',
    medical_officer_in_charge: 'Dr. Fatima Begum (Urban MO)'
  },
  {
    facility_id: 'RNC-PHC-010',
    facility_name: 'Primary Health Centre Nagri',
    facility_type: 'PHC',
    block: 'Nagri',
    email: 'phc.nagri@gmail.com',
    alias_email: 'phc.nagri@gov.in',
    password: 'nagri@123',
    phone: '0651-2691000',
    medical_officer_in_charge: 'Dr. Sunil Kujur (MOIC)'
  },
  {
    facility_id: 'RNC-DH-001',
    facility_name: 'Sadar Hospital Ranchi',
    facility_type: 'DH',
    block: 'Ranchi Sadar',
    email: 'phc.sadar.ranchi@gmail.com',
    alias_email: 'phc.sadar.ranchi@gov.in',
    password: 'sadar@123',
    phone: '0651-2212345',
    medical_officer_in_charge: 'Dr. B. K. Singh (Civil Surgeon)'
  }
];

// In-Memory Global State Holder (persists across Next.js API calls)
const globalForPhc = globalThis as unknown as {
  __HEALTHGRID_PHC_STATES__?: Record<string, PhcLiveState>;
  __HEALTHGRID_GOVT_DIRECTIVES__?: GovtDirective[];
};

function createDefaultMedicines(facilityId: string): PhcMedicineStock[] {
  const isSadar = facilityId === 'RNC-DH-001';
  const isKanke = facilityId === 'RNC-CHC-004';
  const isRatu = facilityId === 'RNC-CHC-002';

  return [
    {
      id: 'MED-001',
      name: 'Paracetamol 500mg',
      category: 'Antipyretic / Analgesic',
      unit: 'Tablets',
      current_stock: isSadar ? 12000 : isKanke ? 2400 : isRatu ? 180 : 1200,
      min_safety_stock: 400,
      batch_number: 'PCM-JH-2026-B1',
      expiry_date: '2027-11-30',
      status: isRatu ? 'CRITICAL' : 'SAFE'
    },
    {
      id: 'MED-002',
      name: 'Oral Rehydration Salts (ORS)',
      category: 'Electrolyte Solutions',
      unit: 'Sachets',
      current_stock: isSadar ? 8500 : isKanke ? 1900 : isRatu ? 220 : 1100,
      min_safety_stock: 350,
      batch_number: 'ORS-JH-2026-C4',
      expiry_date: '2028-04-15',
      status: isRatu ? 'LOW' : 'SAFE'
    },
    {
      id: 'MED-003',
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      unit: 'Capsules',
      current_stock: isSadar ? 6000 : 950,
      min_safety_stock: 300,
      batch_number: 'AMX-JH-2026-A9',
      expiry_date: '2027-08-20',
      status: 'SAFE'
    },
    {
      id: 'MED-004',
      name: 'Anti-Snake Venom (ASV Polyvalent)',
      category: 'Emergency Antivenom',
      unit: 'Vials',
      current_stock: isSadar ? 150 : isKanke ? 45 : isRatu ? 8 : 25,
      min_safety_stock: 15,
      batch_number: 'ASV-JH-2026-X1',
      expiry_date: '2027-12-31',
      status: isRatu ? 'LOW' : 'SAFE'
    },
    {
      id: 'MED-005',
      name: 'Medical Oxygen Cylinders (D-Type 47L)',
      category: 'Emergency Oxygen Support',
      unit: 'Cylinders',
      current_stock: isSadar ? 80 : isKanke ? 18 : isRatu ? 4 : 12,
      min_safety_stock: 6,
      batch_number: 'O2-JH-RNC-99',
      expiry_date: '2029-01-01',
      status: isRatu ? 'LOW' : 'SAFE'
    },
    {
      id: 'MED-006',
      name: 'Azithromycin 500mg',
      category: 'Broad Spectrum Antibiotic',
      unit: 'Tablets',
      current_stock: isSadar ? 4200 : 800,
      min_safety_stock: 250,
      batch_number: 'AZI-JH-2026-D2',
      expiry_date: '2027-09-30',
      status: 'SAFE'
    },
    {
      id: 'MED-007',
      name: 'Iron & Folic Acid (IFA)',
      category: 'Maternal Nutrition',
      unit: 'Tablets',
      current_stock: isSadar ? 9000 : 3200,
      min_safety_stock: 500,
      batch_number: 'IFA-JH-2026-E5',
      expiry_date: '2028-02-28',
      status: 'SAFE'
    }
  ];
}

// Initialize default PHC live states
if (!globalForPhc.__HEALTHGRID_PHC_STATES__) {
  const states: Record<string, PhcLiveState> = {};
  for (const fac of RANCHI_FACILITIES_MASTER) {
    states[fac.facility_id] = {
      facility_id: fac.facility_id,
      facility_name: fac.facility_name,
      total_beds: fac.total_beds,
      available_beds: fac.operational_data.available_beds,
      occupied_beds: fac.operational_data.occupied_beds,
      doctors_present: fac.operational_data.doctors_present,
      doctors_sanctioned: fac.doctors_sanctioned,
      nurses_present: fac.operational_data.nurses_present,
      nurses_sanctioned: fac.nurses_sanctioned,
      ambulance_ready: true,
      medicines: createDefaultMedicines(fac.facility_id),
      last_updated: new Date().toISOString()
    };
  }
  globalForPhc.__HEALTHGRID_PHC_STATES__ = states;
}

// Initialize default Government Directives
if (!globalForPhc.__HEALTHGRID_GOVT_DIRECTIVES__) {
  globalForPhc.__HEALTHGRID_GOVT_DIRECTIVES__ = [
    {
      id: 'dir-001',
      directive_code: 'DIR-JH-2026-104',
      created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      sender_officer_id: 'govtjharkhand123 (Ranchi Command)',
      target_facility_id: 'RNC-CHC-004',
      target_facility_name: 'Community Health Centre Kanke',
      target_email: 'phc.kanke@gmail.com',
      priority: 'URGENT_DIRECTIVE',
      title: 'Urgent: Pre-allocate 300 units Paracetamol & 10 ASV Vials for Ratu Support',
      message: 'Surveillance radar indicates a 42% fever surge in Ratu Block. Kanke is designated primary buffer donor. Confirm dispatch readiness within 1 hour.',
      status: 'APPROVED_AND_READY',
      phc_response_notes: 'Confirmed by MOIC Dr. Mahato. 300 Paracetamol tablets and 10 ASV vials packed and ready for cold-chain transit.',
      phc_responded_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      phc_responded_by: 'Dr. S. K. Mahato (MOIC)'
    },
    {
      id: 'dir-002',
      directive_code: 'DIR-JH-2026-105',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      sender_officer_id: 'govtjharkhand123 (Ranchi Command)',
      target_facility_id: 'RNC-CHC-002',
      target_facility_name: 'Community Health Centre Ratu (Ushamatu)',
      target_email: 'phc.ratu@gmail.com',
      priority: 'URGENT_DIRECTIVE',
      title: 'Emergency Fever Ward Preparation & Bed Capacity Audit',
      message: 'State Command requires immediate setup of 6 temporary observation beds and status of nebulizers for viral surge.',
      status: 'PENDING_RESPONSE'
    }
  ];
}

// Authentication Helper
export function authenticatePhcUser(emailInput: string, passwordInput: string): PhcUser | null {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  const user = PHC_CREDENTIALS_MASTER.find(u => 
    (u.email.toLowerCase() === cleanEmail || u.alias_email.toLowerCase() === cleanEmail) &&
    u.password === cleanPass
  );

  return user || null;
}

export function getPhcUserByEmail(email: string): PhcUser | undefined {
  const clean = email.trim().toLowerCase();
  return PHC_CREDENTIALS_MASTER.find(u => u.email.toLowerCase() === clean || u.alias_email.toLowerCase() === clean);
}

export function getPhcUserById(facilityId: string): PhcUser | undefined {
  return PHC_CREDENTIALS_MASTER.find(u => u.facility_id === facilityId);
}

// Inventory & State Getters/Updaters
export function getPhcLiveState(facilityId: string): PhcLiveState | null {
  return globalForPhc.__HEALTHGRID_PHC_STATES__?.[facilityId] || null;
}

export function getAllPhcLiveStates(): Record<string, PhcLiveState> {
  return globalForPhc.__HEALTHGRID_PHC_STATES__ || {};
}

export function updatePhcLiveState(
  facilityId: string, 
  partial: Partial<PhcLiveState>
): PhcLiveState | null {
  if (!globalForPhc.__HEALTHGRID_PHC_STATES__?.[facilityId]) {
    return null;
  }

  const current = globalForPhc.__HEALTHGRID_PHC_STATES__[facilityId];
  const updated: PhcLiveState = {
    ...current,
    ...partial,
    last_updated: new Date().toISOString()
  };

  globalForPhc.__HEALTHGRID_PHC_STATES__[facilityId] = updated;
  return updated;
}

export function updatePhcMedicineStock(
  facilityId: string,
  medicineId: string,
  newStock: number,
  batchNumber?: string,
  expiryDate?: string
): PhcLiveState | null {
  const state = getPhcLiveState(facilityId);
  if (!state) return null;

  const meds = [...state.medicines];
  const idx = meds.findIndex(m => m.id === medicineId);

  if (idx >= 0) {
    const minSafety = meds[idx].min_safety_stock;
    const status = newStock <= minSafety * 0.4 ? 'CRITICAL' : newStock <= minSafety ? 'LOW' : 'SAFE';
    meds[idx] = {
      ...meds[idx],
      current_stock: newStock,
      status,
      batch_number: batchNumber || meds[idx].batch_number,
      expiry_date: expiryDate || meds[idx].expiry_date
    };
  }

  return updatePhcLiveState(facilityId, { medicines: meds });
}

export function addNewMedicineToPhc(
  facilityId: string,
  medicine: {
    name: string;
    category: string;
    unit: string;
    current_stock: number;
    min_safety_stock: number;
    batch_number: string;
    expiry_date: string;
  }
): PhcLiveState | null {
  const state = getPhcLiveState(facilityId);
  if (!state) return null;

  const newMed: PhcMedicineStock = {
    id: 'MED-CUSTOM-' + Date.now().toString(36),
    ...medicine,
    status: medicine.current_stock <= medicine.min_safety_stock ? 'LOW' : 'SAFE'
  };

  return updatePhcLiveState(facilityId, { medicines: [...state.medicines, newMed] });
}

// Government Directives Getters/Updaters
export function getAllDirectives(): GovtDirective[] {
  return globalForPhc.__HEALTHGRID_GOVT_DIRECTIVES__ || [];
}

export function getDirectivesForFacility(facilityIdOrEmail: string): GovtDirective[] {
  const all = getAllDirectives();
  const clean = facilityIdOrEmail.toLowerCase().trim();
  return all.filter(d => 
    d.target_facility_id.toLowerCase() === clean || 
    d.target_email.toLowerCase() === clean
  );
}

export function createGovtDirective(data: {
  target_facility_id: string;
  priority: GovtDirective['priority'];
  title: string;
  message: string;
  sender_officer_id?: string;
}): GovtDirective {
  const phcUser = getPhcUserById(data.target_facility_id) || PHC_CREDENTIALS_MASTER[0];
  const now = new Date().toISOString();
  const code = 'DIR-JH-' + Math.floor(1000 + Math.random() * 9000);

  const directive: GovtDirective = {
    id: 'dir-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    directive_code: code,
    created_at: now,
    sender_officer_id: data.sender_officer_id || 'govtjharkhand123',
    target_facility_id: phcUser.facility_id,
    target_facility_name: phcUser.facility_name,
    target_email: phcUser.email,
    priority: data.priority,
    title: data.title,
    message: data.message,
    status: 'PENDING_RESPONSE'
  };

  globalForPhc.__HEALTHGRID_GOVT_DIRECTIVES__!.unshift(directive);
  return directive;
}

export function respondToGovtDirective(data: {
  directive_id: string;
  status: 'APPROVED_AND_READY' | 'PROBLEM_REPORTED';
  response_notes: string;
  responded_by?: string;
}): GovtDirective | null {
  const all = getAllDirectives();
  const directive = all.find(d => d.id === data.directive_id || d.directive_code === data.directive_id);
  if (!directive) return null;

  directive.status = data.status;
  directive.phc_response_notes = data.response_notes;
  directive.phc_responded_at = new Date().toISOString();
  directive.phc_responded_by = data.responded_by || 'PHC Medical Officer';

  return directive;
}
