import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client with support for all standard Vercel KV / Upstash environment variables
export const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

// Initial 30 Realistic PHCs across 3 States & 6 Districts
export const INITIAL_PHCS = [
  // Bihar - Patna
  { id: 'PHC_PAT_01', name: 'Patna Sadar PHC', district: 'Patna', state: 'Bihar', type: 'NORMAL', latitude: 25.5941, longitude: 85.1376, totalBeds: 35, riskScore: 24, activeAlertsCount: 0 },
  { id: 'PHC_PAT_02', name: 'Danapur PHC', district: 'Patna', state: 'Bihar', type: 'HIGH_DEMAND', latitude: 25.6334, longitude: 85.0454, totalBeds: 40, riskScore: 58, activeAlertsCount: 1 },
  { id: 'PHC_PAT_03', name: 'Phulwari Sharif PHC', district: 'Patna', state: 'Bihar', type: 'SHORTAGE', latitude: 25.5786, longitude: 85.0782, totalBeds: 25, riskScore: 84, activeAlertsCount: 2 },
  { id: 'PHC_PAT_04', name: 'Fatwah PHC', district: 'Patna', state: 'Bihar', type: 'NORMAL', latitude: 25.5034, longitude: 85.3114, totalBeds: 20, riskScore: 18, activeAlertsCount: 0 },
  { id: 'PHC_PAT_05', name: 'Bakhtiarpur PHC', district: 'Patna', state: 'Bihar', type: 'SURGE', latitude: 25.4578, longitude: 85.5298, totalBeds: 30, riskScore: 68, activeAlertsCount: 1 },

  // Bihar - Gaya
  { id: 'PHC_GAY_01', name: 'Gaya Town PHC', district: 'Gaya', state: 'Bihar', type: 'NORMAL', latitude: 24.7914, longitude: 85.0002, totalBeds: 30, riskScore: 28, activeAlertsCount: 0 },
  { id: 'PHC_GAY_02', name: 'Bodh Gaya PHC', district: 'Gaya', state: 'Bihar', type: 'EMERGENCY', latitude: 24.6961, longitude: 84.9869, totalBeds: 45, riskScore: 88, activeAlertsCount: 3 },
  { id: 'PHC_GAY_03', name: 'Tekari PHC', district: 'Gaya', state: 'Bihar', type: 'STAFF_SHORTAGE', latitude: 24.9392, longitude: 84.8291, totalBeds: 20, riskScore: 62, activeAlertsCount: 1 },
  { id: 'PHC_GAY_04', name: 'Sherghati PHC', district: 'Gaya', state: 'Bihar', type: 'NORMAL', latitude: 24.5694, longitude: 84.7892, totalBeds: 25, riskScore: 32, activeAlertsCount: 0 },
  { id: 'PHC_GAY_05', name: 'Manpur PHC', district: 'Gaya', state: 'Bihar', type: 'HIGH_DEMAND', latitude: 24.8102, longitude: 85.0345, totalBeds: 35, riskScore: 54, activeAlertsCount: 1 },

  // Uttar Pradesh - Lucknow
  { id: 'PHC_LKO_01', name: 'Hazratganj Urban PHC', district: 'Lucknow', state: 'Uttar Pradesh', type: 'NORMAL', latitude: 26.8467, longitude: 80.9462, totalBeds: 50, riskScore: 22, activeAlertsCount: 0 },
  { id: 'PHC_LKO_02', name: 'Chinhat PHC', district: 'Lucknow', state: 'Uttar Pradesh', type: 'EMERGENCY', latitude: 26.8834, longitude: 81.0456, totalBeds: 35, riskScore: 91, activeAlertsCount: 3 },
  { id: 'PHC_LKO_03', name: 'Kakori PHC', district: 'Lucknow', state: 'Uttar Pradesh', type: 'SHORTAGE', latitude: 26.8833, longitude: 80.7833, totalBeds: 25, riskScore: 78, activeAlertsCount: 2 },
  { id: 'PHC_LKO_04', name: 'Bakshi Ka Talab PHC', district: 'Lucknow', state: 'Uttar Pradesh', type: 'NORMAL', latitude: 26.9856, longitude: 80.9234, totalBeds: 30, riskScore: 35, activeAlertsCount: 0 },
  { id: 'PHC_LKO_05', name: 'Sarojini Nagar PHC', district: 'Lucknow', state: 'Uttar Pradesh', type: 'HIGH_DEMAND', latitude: 26.7567, longitude: 80.8712, totalBeds: 40, riskScore: 61, activeAlertsCount: 1 },

  // Uttar Pradesh - Varanasi
  { id: 'PHC_VAR_01', name: 'Kashi Urban PHC', district: 'Varanasi', state: 'Uttar Pradesh', type: 'NORMAL', latitude: 25.3176, longitude: 82.9739, totalBeds: 40, riskScore: 26, activeAlertsCount: 0 },
  { id: 'PHC_VAR_02', name: 'Shivpur PHC', district: 'Varanasi', state: 'Uttar Pradesh', type: 'SURGE', latitude: 25.3589, longitude: 82.9567, totalBeds: 35, riskScore: 72, activeAlertsCount: 2 },
  { id: 'PHC_VAR_03', name: 'Pindra PHC', district: 'Varanasi', state: 'Uttar Pradesh', type: 'STAFF_SHORTAGE', latitude: 25.4833, longitude: 82.8167, totalBeds: 25, riskScore: 64, activeAlertsCount: 1 },
  { id: 'PHC_VAR_04', name: 'Cholapur PHC', district: 'Varanasi', state: 'Uttar Pradesh', type: 'NORMAL', latitude: 25.4678, longitude: 83.0456, totalBeds: 20, riskScore: 19, activeAlertsCount: 0 },
  { id: 'PHC_VAR_05', name: 'Arajiline PHC', district: 'Varanasi', state: 'Uttar Pradesh', type: 'SHORTAGE', latitude: 25.2678, longitude: 82.8765, totalBeds: 30, riskScore: 81, activeAlertsCount: 2 },

  // Jharkhand - Ranchi
  { id: 'PHC_RNC_01', name: 'Ranchi Sadar PHC', district: 'Ranchi', state: 'Jharkhand', type: 'NORMAL', latitude: 23.3441, longitude: 85.3096, totalBeds: 45, riskScore: 21, activeAlertsCount: 0 },
  { id: 'PHC_RNC_02', name: 'Kanke PHC', district: 'Ranchi', state: 'Jharkhand', type: 'HIGH_DEMAND', latitude: 23.4322, longitude: 85.3211, totalBeds: 35, riskScore: 56, activeAlertsCount: 1 },
  { id: 'PHC_RNC_03', name: 'Namkum PHC', district: 'Ranchi', state: 'Jharkhand', type: 'SHORTAGE', latitude: 23.3289, longitude: 85.3978, totalBeds: 25, riskScore: 76, activeAlertsCount: 2 },
  { id: 'PHC_RNC_04', name: 'Ratu PHC', district: 'Ranchi', state: 'Jharkhand', type: 'NORMAL', latitude: 23.4012, longitude: 85.1894, totalBeds: 20, riskScore: 17, activeAlertsCount: 0 },
  { id: 'PHC_RNC_05', name: 'Ormanjhi PHC', district: 'Ranchi', state: 'Jharkhand', type: 'SURGE', latitude: 23.4891, longitude: 85.4789, totalBeds: 30, riskScore: 69, activeAlertsCount: 1 },

  // Jharkhand - Dhanbad
  { id: 'PHC_DHN_01', name: 'Dhanbad Urban PHC', district: 'Dhanbad', state: 'Jharkhand', type: 'NORMAL', latitude: 23.7957, longitude: 86.4304, totalBeds: 40, riskScore: 29, activeAlertsCount: 0 },
  { id: 'PHC_DHN_02', name: 'Jharia PHC', district: 'Dhanbad', state: 'Jharkhand', type: 'EMERGENCY', latitude: 23.7419, longitude: 86.4139, totalBeds: 50, riskScore: 89, activeAlertsCount: 3 },
  { id: 'PHC_DHN_03', name: 'Katras PHC', district: 'Dhanbad', state: 'Jharkhand', type: 'STAFF_SHORTAGE', latitude: 23.8167, longitude: 86.2833, totalBeds: 25, riskScore: 65, activeAlertsCount: 1 },
  { id: 'PHC_DHN_04', name: 'Govindpur PHC', district: 'Dhanbad', state: 'Jharkhand', type: 'NORMAL', latitude: 23.8345, longitude: 86.5234, totalBeds: 20, riskScore: 22, activeAlertsCount: 0 },
  { id: 'PHC_DHN_05', name: 'Nirsa PHC', district: 'Dhanbad', state: 'Jharkhand', type: 'HIGH_DEMAND', latitude: 23.7891, longitude: 86.7123, totalBeds: 35, riskScore: 57, activeAlertsCount: 1 },
];

export const INITIAL_INVENTORIES: Record<string, Record<string, { stock: number; dailyConsumption: number; safetyStock: number }>> = {};
INITIAL_PHCS.forEach(phc => {
  INITIAL_INVENTORIES[phc.id] = {
    'MED_PARA_500': {
      stock: phc.type === 'SHORTAGE' || phc.type === 'EMERGENCY' ? 120 : 1800,
      dailyConsumption: 65,
      safetyStock: 500,
    },
    'MED_AMOX_250': {
      stock: phc.type === 'SHORTAGE' ? 80 : 1200,
      dailyConsumption: 40,
      safetyStock: 300,
    },
    'MED_ORS_PKT': {
      stock: phc.type === 'SURGE' ? 300 : 2500,
      dailyConsumption: 95,
      safetyStock: 800,
    },
    'MED_IBU_400': {
      stock: 1400,
      dailyConsumption: 35,
      safetyStock: 400,
    },
    'MED_AZI_500': {
      stock: 900,
      dailyConsumption: 25,
      safetyStock: 250,
    },
  };
});

// Helper to get or seed PHCs from Upstash Redis or In-Memory
export async function getHealthGridPHCs() {
  if (redis) {
    try {
      const cached = await redis.get<typeof INITIAL_PHCS>('healthgrid:phcs');
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
      // Seed to Upstash
      await redis.set('healthgrid:phcs', INITIAL_PHCS);
      return INITIAL_PHCS;
    } catch (err) {
      console.warn('Upstash fetch failed, using fallback data:', err);
    }
  }
  return INITIAL_PHCS;
}

// Helper to get or seed Inventories from Upstash Redis
export async function getHealthGridInventories() {
  if (redis) {
    try {
      const cached = await redis.get<typeof INITIAL_INVENTORIES>('healthgrid:inventories');
      if (cached) {
        return cached;
      }
      await redis.set('healthgrid:inventories', INITIAL_INVENTORIES);
      return INITIAL_INVENTORIES;
    } catch (err) {
      console.warn('Upstash inventories fetch failed, using fallback:', err);
    }
  }
  return INITIAL_INVENTORIES;
}
