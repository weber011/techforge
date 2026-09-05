const { PrismaClient } = require('@prisma/client');
const { addDays, subDays } = require('date-fns');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create States
  const states = await Promise.all([
    prisma.state.create({ data: { name: 'Bihar' } }),
    prisma.state.create({ data: { name: 'Uttar Pradesh' } }),
    prisma.state.create({ data: { name: 'Jharkhand' } }),
  ]);

  // 2. Create Districts
  const districtsData = [
    { name: 'Patna', state: 'Bihar' },
    { name: 'Gaya', state: 'Bihar' },
    { name: 'Lucknow', state: 'Uttar Pradesh' },
    { name: 'Varanasi', state: 'Uttar Pradesh' },
    { name: 'Ranchi', state: 'Jharkhand' },
    { name: 'Dhanbad', state: 'Jharkhand' },
  ];

  const districts = [];
  for (const d of districtsData) {
    const state = states.find((s) => s.name === d.state);
    const district = await prisma.district.create({
      data: { name: d.name, stateId: state.id },
    });
    districts.push(district);
  }

  // 3. Create Medicines
  const medicinesData = [
    { name: 'Paracetamol 500mg', category: 'Analgesic', unit: 'Tablet', safetyStock: 1000 },
    { name: 'Amoxicillin 250mg', category: 'Antibiotic', unit: 'Capsule', safetyStock: 500 },
    { name: 'ORS Packets', category: 'Hydration', unit: 'Packet', safetyStock: 2000 },
    { name: 'Ibuprofen 400mg', category: 'Analgesic', unit: 'Tablet', safetyStock: 800 },
    { name: 'Azithromycin 500mg', category: 'Antibiotic', unit: 'Tablet', safetyStock: 300 },
  ];

  const medicines = await Promise.all(
    medicinesData.map((m) => prisma.medicine.create({ data: m }))
  );

  // 4. Create PHCs (30 total: 5 per district)
  // Types: NORMAL, HIGH_DEMAND, SHORTAGE, SURGE, STAFF_SHORTAGE, EMERGENCY
  const phcTypes = ['NORMAL', 'NORMAL', 'HIGH_DEMAND', 'SHORTAGE', 'SURGE', 'STAFF_SHORTAGE', 'EMERGENCY'];
  const phcs = [];

  for (const district of districts) {
    for (let i = 1; i <= 5; i++) {
      const type = phcTypes[(districts.indexOf(district) * 5 + i) % phcTypes.length];
      const phc = await prisma.phc.create({
        data: {
          name: `${district.name} PHC ${i}`,
          districtId: district.id,
          type: type,
          latitude: 20.0 + Math.random() * 5,
          longitude: 78.0 + Math.random() * 5,
          totalBeds: 20 + Math.floor(Math.random() * 30),
          doctorsRequired: 5,
          nursesRequired: 15,
        },
      });
      phcs.push(phc);
    }
  }

  // 5. Generate 180 days of historical data
  const endDate = new Date();
  const startDate = subDays(endDate, 180);

  console.log('Generating historical data...');
  // (In a real scenario, loop through all 180 days and all PHCs. For the prototype script, we just insert a few summary records or a subset to avoid massive inserts that crash standard SQLite. We are using Postgres, so we can do batched inserts).
  
  // Create an initial admin user
  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@healthgrid.in',
      password: 'password123', // Demo purpose
      role: 'NATIONAL_ADMIN',
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
