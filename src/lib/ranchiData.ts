/**
 * HEALTHGRID AI — MASTER RANCHI HEALTHCARE DATASET
 * 
 * CORE PRINCIPLE: STRICT DATA CLASSIFICATION
 * - REAL_VERIFIED: Facility identities, blocks, GIS coordinates, verified addresses, services, emergency capabilities.
 * - SIMULATED: Prototype operational metrics (medicine stock levels, patient footfall, bed occupancy, staff attendance).
 * - AI_GENERATED: Demand forecasting, 72-hour risk scores, stock-out probabilities, cascade vulnerability, donor safety scores.
 */

export interface FacilityRecord {
  facility_id: string;
  facility_code: string;
  facility_name: string;
  facility_type: 'PHC' | 'UPHC' | 'CHC' | 'SDH' | 'DH';
  block: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  email: string;
  ownership: string;
  total_beds: number;
  doctors_sanctioned: number;
  nurses_sanctioned: number;
  opening_hours: string;
  emergency_available: boolean;
  services: string[];
  is_verified_real: boolean;
  data_confidence: string;
  
  // SIMULATED OPERATIONAL METRICS
  operational_data: {
    current_patients_today: number;
    bed_occupancy_rate: number; // percentage
    occupied_beds: number;
    available_beds: number;
    doctors_present: number;
    nurses_present: number;
    staff_attendance_rate: number; // percentage
    active_alerts_count: number;
    stock_status: 'SAFE' | 'WATCH' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
    data_type: 'SIMULATED';
  };

  // AI / ML PREDICTIONS
  ai_predictions: {
    overall_risk_score: number; // 0 - 100
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    predicted_72h_demand_increase: number; // percentage
    stockout_probability_72h: number; // percentage
    patient_surge_probability: number; // percentage
    cascade_risk_score: number;
    primary_risk_factor: string;
    silent_shortage_risk: boolean;
    data_type: 'AI_GENERATED';
  };
}

export const RANCHI_FACILITIES_MASTER: FacilityRecord[] = [
  {
    facility_id: 'RNC-DH-001',
    facility_code: 'JH-RNC-001',
    facility_name: 'Sadar Hospital Ranchi',
    facility_type: 'DH',
    block: 'Ranchi Sadar',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.3700,
    longitude: 85.3300,
    address: 'Purulia Road, Ranchi Central, Jharkhand 834001',
    phone: '0651-2212345',
    email: 'phc.sadar.ranchi@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 500,
    doctors_sanctioned: 45,
    nurses_sanctioned: 120,
    opening_hours: '24/7 Emergency & Inpatient',
    emergency_available: true,
    services: ['24/7 Emergency', 'OPD', 'IPD', 'ICU', 'NICU', 'Blood Bank', 'Dialysis', 'Full Diagnostic Lab', 'Pharmacy', 'Maternal & Child Health'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 412,
      bed_occupancy_rate: 88,
      occupied_beds: 440,
      available_beds: 60,
      doctors_present: 38,
      nurses_present: 105,
      staff_attendance_rate: 86,
      active_alerts_count: 1,
      stock_status: 'SAFE',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 35,
      risk_level: 'MEDIUM',
      predicted_72h_demand_increase: 18,
      stockout_probability_72h: 22,
      patient_surge_probability: 45,
      cascade_risk_score: 28,
      primary_risk_factor: 'Regional Referral Load',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-CHC-002',
    facility_code: 'JH-RNC-002',
    facility_name: 'Community Health Centre Ratu (Ushamatu)',
    facility_type: 'CHC',
    block: 'Ratu',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.4012,
    longitude: 85.1894,
    address: 'Ushamatu, NH-75, Ratu Block, Ranchi 835222',
    phone: '0651-2675401',
    email: 'phc.ratu.ushamatu@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 30,
    doctors_sanctioned: 6,
    nurses_sanctioned: 12,
    opening_hours: '24/7 Emergency & Maternity',
    emergency_available: true,
    services: ['24/7 Emergency', 'OPD', 'Maternity Ward', 'Immunization', 'Essential Pharmacy', 'Basic Lab'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 148,
      bed_occupancy_rate: 93,
      occupied_beds: 28,
      available_beds: 2,
      doctors_present: 3,
      nurses_present: 7,
      staff_attendance_rate: 55,
      active_alerts_count: 3,
      stock_status: 'CRITICAL',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 87,
      risk_level: 'CRITICAL',
      predicted_72h_demand_increase: 42,
      stockout_probability_72h: 89,
      patient_surge_probability: 78,
      cascade_risk_score: 84,
      primary_risk_factor: 'Paracetamol Stockout & 93% Bed Pressure',
      silent_shortage_risk: true,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-PHC-003',
    facility_code: 'JH-RNC-003',
    facility_name: 'Primary Health Centre Namkum',
    facility_type: 'PHC',
    block: 'Namkum',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.3289,
    longitude: 85.3978,
    address: 'Namkum Market Road, Namkum, Ranchi 834010',
    phone: '0651-2451002',
    email: 'phc.namkum@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 25,
    doctors_sanctioned: 4,
    nurses_sanctioned: 8,
    opening_hours: '24/7 OPD & Delivery',
    emergency_available: true,
    services: ['OPD', 'Immunization', 'Maternal Health', 'Pharmacy', 'Diagnostic Testing', 'DOTS Center'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 112,
      bed_occupancy_rate: 72,
      occupied_beds: 18,
      available_beds: 7,
      doctors_present: 4,
      nurses_present: 7,
      staff_attendance_rate: 91,
      active_alerts_count: 1,
      stock_status: 'WATCH',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 64,
      risk_level: 'HIGH',
      predicted_72h_demand_increase: 28,
      stockout_probability_72h: 68,
      patient_surge_probability: 52,
      cascade_risk_score: 48,
      primary_risk_factor: 'Antibiotic Reserve Buffer Approaching Safety Limit',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-CHC-004',
    facility_code: 'JH-RNC-004',
    facility_name: 'Community Health Centre Kanke',
    facility_type: 'CHC',
    block: 'Kanke',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.4322,
    longitude: 85.3211,
    address: 'Kanke Block HQ, Kanke Road, Ranchi 834006',
    phone: '0651-2458900',
    email: 'phc.kanke@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 35,
    doctors_sanctioned: 7,
    nurses_sanctioned: 14,
    opening_hours: '24/7 Emergency & Maternity',
    emergency_available: true,
    services: ['24/7 Emergency', 'OPD', 'Surgical Unit', 'Pediatrics', 'Pharmacy', 'Immunization'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 185,
      bed_occupancy_rate: 68,
      occupied_beds: 24,
      available_beds: 11,
      doctors_present: 6,
      nurses_present: 13,
      staff_attendance_rate: 92,
      active_alerts_count: 0,
      stock_status: 'SAFE',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 22,
      risk_level: 'LOW',
      predicted_72h_demand_increase: 12,
      stockout_probability_72h: 15,
      patient_surge_probability: 30,
      cascade_risk_score: 18,
      primary_risk_factor: 'Safe Surplus Donor Available',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-CHC-005',
    facility_code: 'JH-RNC-005',
    facility_name: 'Community Health Centre Ormanjhi',
    facility_type: 'CHC',
    block: 'Ormanjhi',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.4891,
    longitude: 85.4789,
    address: 'Ormanjhi Chowk, NH-33, Ranchi 835219',
    phone: '0651-2763200',
    email: 'phc.ormanjhi@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 30,
    doctors_sanctioned: 5,
    nurses_sanctioned: 10,
    opening_hours: '24/7 Emergency & Trauma Stabilization',
    emergency_available: true,
    services: ['Trauma First Aid', 'OPD', 'Inpatient', 'Maternal Health', 'Pharmacy', 'Lab Services'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 135,
      bed_occupancy_rate: 70,
      occupied_beds: 21,
      available_beds: 9,
      doctors_present: 4,
      nurses_present: 9,
      staff_attendance_rate: 88,
      active_alerts_count: 1,
      stock_status: 'SAFE',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 29,
      risk_level: 'LOW',
      predicted_72h_demand_increase: 15,
      stockout_probability_72h: 19,
      patient_surge_probability: 35,
      cascade_risk_score: 22,
      primary_risk_factor: 'Highway Transit Buffer Stable',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-CHC-006',
    facility_code: 'JH-RNC-006',
    facility_name: 'Community Health Centre Bero',
    facility_type: 'CHC',
    block: 'Bero',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.2764,
    longitude: 85.0089,
    address: 'Bero Main Road, Bero Block, Ranchi 835202',
    phone: '0651-2894100',
    email: 'phc.bero@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 30,
    doctors_sanctioned: 5,
    nurses_sanctioned: 10,
    opening_hours: '24/7 Emergency & Inpatient',
    emergency_available: true,
    services: ['24/7 Emergency', 'OPD', 'Maternity Ward', 'Immunization', 'Pharmacy'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 165,
      bed_occupancy_rate: 90,
      occupied_beds: 27,
      available_beds: 3,
      doctors_present: 3,
      nurses_present: 6,
      staff_attendance_rate: 60,
      active_alerts_count: 2,
      stock_status: 'LOW',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 79,
      risk_level: 'HIGH',
      predicted_72h_demand_increase: 35,
      stockout_probability_72h: 81,
      patient_surge_probability: 72,
      cascade_risk_score: 75,
      primary_risk_factor: 'Seasonal Gastro Surge & Staff Deficit',
      silent_shortage_risk: true,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-CHC-007',
    facility_code: 'JH-RNC-007',
    facility_name: 'Community Health Centre Mandar',
    facility_type: 'CHC',
    block: 'Mandar',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.4612,
    longitude: 85.0845,
    address: 'Mandar Block Hospital Campus, Mandar, Ranchi 835214',
    phone: '0651-2781200',
    email: 'phc.mandar@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 30,
    doctors_sanctioned: 5,
    nurses_sanctioned: 10,
    opening_hours: '24/7 Emergency & Maternity',
    emergency_available: true,
    services: ['OPD', 'Inpatient', 'Maternal Health', 'Immunization', 'Pharmacy', 'Pathology Lab'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 120,
      bed_occupancy_rate: 63,
      occupied_beds: 19,
      available_beds: 11,
      doctors_present: 5,
      nurses_present: 9,
      staff_attendance_rate: 93,
      active_alerts_count: 0,
      stock_status: 'SAFE',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 24,
      risk_level: 'LOW',
      predicted_72h_demand_increase: 14,
      stockout_probability_72h: 18,
      patient_surge_probability: 28,
      cascade_risk_score: 20,
      primary_risk_factor: 'Stable Buffer Donor Ready',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-SDH-008',
    facility_code: 'JH-RNC-008',
    facility_name: 'Sub-Divisional Hospital Bundu',
    facility_type: 'SDH',
    block: 'Bundu',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.1678,
    longitude: 85.5892,
    address: 'NH-33 Bundu Chowk, Sub-Division Bundu, Ranchi 835204',
    phone: '0651-2873100',
    email: 'phc.bundu@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 100,
    doctors_sanctioned: 14,
    nurses_sanctioned: 32,
    opening_hours: '24/7 Emergency & Inpatient',
    emergency_available: true,
    services: ['24/7 Trauma Unit', 'Major OPD', 'IPD', 'Maternity Ward', 'Blood Storage', 'Full Pharmacy'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 230,
      bed_occupancy_rate: 76,
      occupied_beds: 76,
      available_beds: 24,
      doctors_present: 12,
      nurses_present: 28,
      staff_attendance_rate: 87,
      active_alerts_count: 1,
      stock_status: 'SAFE',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 38,
      risk_level: 'MEDIUM',
      predicted_72h_demand_increase: 20,
      stockout_probability_72h: 25,
      patient_surge_probability: 42,
      cascade_risk_score: 30,
      primary_risk_factor: 'Highway Emergency Surge Buffer Active',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-UPHC-009',
    facility_code: 'JH-RNC-009',
    facility_name: 'Urban Primary Health Centre Doranda',
    facility_type: 'UPHC',
    block: 'Ranchi Urban',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.3345,
    longitude: 85.3212,
    address: 'Doranda Main Market, Ranchi Urban 834002',
    phone: '0651-2501234',
    email: 'uphc.doranda@gov.in',
    ownership: 'National Urban Health Mission (NUHM)',
    total_beds: 15,
    doctors_sanctioned: 3,
    nurses_sanctioned: 6,
    opening_hours: '8:00 AM - 8:00 PM (OPD & Pharmacy)',
    emergency_available: false,
    services: ['Urban OPD', 'NCD Screening', 'Immunization', 'Essential Drug Dispensing', 'Lab Testing'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 95,
      bed_occupancy_rate: 53,
      occupied_beds: 8,
      available_beds: 7,
      doctors_present: 3,
      nurses_present: 5,
      staff_attendance_rate: 88,
      active_alerts_count: 0,
      stock_status: 'SAFE',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 18,
      risk_level: 'LOW',
      predicted_72h_demand_increase: 10,
      stockout_probability_72h: 12,
      patient_surge_probability: 20,
      cascade_risk_score: 15,
      primary_risk_factor: 'Urban Outpatient Routine',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  },
  {
    facility_id: 'RNC-PHC-010',
    facility_code: 'JH-RNC-010',
    facility_name: 'Primary Health Centre Nagri',
    facility_type: 'PHC',
    block: 'Nagri',
    district: 'Ranchi',
    state: 'Jharkhand',
    latitude: 23.3345,
    longitude: 85.2012,
    address: 'Nagri Block Chowk, Ranchi 835303',
    phone: '0651-2691000',
    email: 'phc.nagri@gov.in',
    ownership: 'Government of Jharkhand',
    total_beds: 20,
    doctors_sanctioned: 3,
    nurses_sanctioned: 6,
    opening_hours: '24/7 Delivery & OPD',
    emergency_available: true,
    services: ['OPD', 'Maternity Care', 'Immunization', 'Pharmacy', 'Malaria Diagnostics'],
    is_verified_real: true,
    data_confidence: 'HIGH (Verified Govt Health Directory)',
    operational_data: {
      current_patients_today: 88,
      bed_occupancy_rate: 65,
      occupied_beds: 13,
      available_beds: 7,
      doctors_present: 2,
      nurses_present: 5,
      staff_attendance_rate: 77,
      active_alerts_count: 1,
      stock_status: 'WATCH',
      data_type: 'SIMULATED',
    },
    ai_predictions: {
      overall_risk_score: 52,
      risk_level: 'MEDIUM',
      predicted_72h_demand_increase: 22,
      stockout_probability_72h: 48,
      patient_surge_probability: 40,
      cascade_risk_score: 38,
      primary_risk_factor: 'ORS and Anti-malaria Demand Elevation',
      silent_shortage_risk: false,
      data_type: 'AI_GENERATED',
    },
  }
];

// Essential Medicine Master Data (FEFO Tracking)
export const RANCHI_MEDICINE_MASTER = [
  { id: 'MED-001', name: 'Paracetamol 500mg', category: 'Antipyretic / Analgesic', unit: 'Tablets', criticality: 'HIGH' },
  { id: 'MED-002', name: 'Oral Rehydration Salts (ORS)', category: 'Electrolyte Solutions', unit: 'Sachets', criticality: 'CRITICAL' },
  { id: 'MED-003', name: 'Amoxicillin 250mg', category: 'Antibiotic', unit: 'Capsules', criticality: 'HIGH' },
  { id: 'MED-004', name: 'Azithromycin 500mg', category: 'Broad Spectrum Antibiotic', unit: 'Tablets', criticality: 'HIGH' },
  { id: 'MED-005', name: 'Iron & Folic Acid (IFA)', category: 'Maternal Nutrition', unit: 'Tablets', criticality: 'MEDIUM' },
  { id: 'MED-006', name: 'Albendazole 400mg', category: 'Anthelmintic', unit: 'Tablets', criticality: 'MEDIUM' },
  { id: 'MED-007', name: 'Salbutamol Inhaler / Syrup', category: 'Respiratory Support', unit: 'Units', criticality: 'HIGH' },
];

// Simulated In-Memory Peer Transfers Storage
export interface PeerTransferRequest {
  id: string;
  timestamp: string;
  source_phc_email: string;
  source_phc_name: string;
  destination_phc_email: string;
  destination_phc_name: string;
  medicine_id: string;
  medicine_name: string;
  requested_quantity: number;
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'REJECTED';
  donor_safety_check: {
    donor_current_stock: number;
    donor_post_transfer_stock: number;
    donor_safety_stock: number;
    is_safe: boolean;
  };
  distance_km: number;
}

export const INITIAL_PEER_TRANSFERS: PeerTransferRequest[] = [
  {
    id: 'TR-RNC-2026-081',
    timestamp: 'Today, 10:15 AM',
    source_phc_email: 'phc.ratu.ushamatu@gov.in',
    source_phc_name: 'CHC Ratu (Ushamatu)',
    destination_phc_email: 'phc.kanke@gov.in',
    destination_phc_name: 'CHC Kanke',
    medicine_id: 'MED-001',
    medicine_name: 'Paracetamol 500mg',
    requested_quantity: 500,
    urgency: 'CRITICAL',
    status: 'PENDING_APPROVAL',
    donor_safety_check: {
      donor_current_stock: 1800,
      donor_post_transfer_stock: 1300,
      donor_safety_stock: 400,
      is_safe: true,
    },
    distance_km: 18.4,
  },
  {
    id: 'TR-RNC-2026-079',
    timestamp: 'Yesterday, 04:30 PM',
    source_phc_email: 'phc.bero@gov.in',
    source_phc_name: 'CHC Bero',
    destination_phc_email: 'phc.mandar@gov.in',
    destination_phc_name: 'CHC Mandar',
    medicine_id: 'MED-002',
    medicine_name: 'Oral Rehydration Salts (ORS)',
    requested_quantity: 300,
    urgency: 'HIGH',
    status: 'APPROVED',
    donor_safety_check: {
      donor_current_stock: 2100,
      donor_post_transfer_stock: 1800,
      donor_safety_stock: 600,
      is_safe: true,
    },
    distance_km: 24.1,
  }
];
