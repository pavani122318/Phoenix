/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear Existing Data
  await db.systemSetting.deleteMany().catch(() => {});
  await db.pricing.deleteMany().catch(() => {});
  await db.review.deleteMany().catch(() => {});
  await db.coupon.deleteMany().catch(() => {});
  await db.pigeon.deleteMany().catch(() => {});
  await db.phoenixStation.deleteMany().catch(() => {});
  await db.user.deleteMany().catch(() => {});

  // 2. Create Users
  // Simple plain-text password or basic hash for testing. We will use simple password fields.
  const admin = await db.user.create({
    data: {
      email: 'admin@phoenix.in',
      name: 'Phoenix Administrator',
      password: 'admin', // Simple password for local demo
      role: 'ADMIN',
    },
  });

  const customer = await db.user.create({
    data: {
      email: 'user@phoenix.in',
      name: 'Rajesh Kumar',
      password: 'user', // Simple password for local demo
      role: 'CUSTOMER',
    },
  });

  console.log('Created admin and customer users.');

  // 3. Create Phoenix Stations
  const stationMumbai = await db.phoenixStation.create({
    data: {
      name: 'Phoenix Mumbai Station',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCodes: '400001,400002,400003,400004,400005,400020,400021',
      radiusKm: 15.0,
      isActive: true,
    },
  });

  const stationHyd = await db.phoenixStation.create({
    data: {
      name: 'Phoenix Hyderabad Station',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCodes: '500001,500002,500003,500081,500082,500032',
      radiusKm: 12.0,
      isActive: true,
    },
  });

  const stationDelhi = await db.phoenixStation.create({
    data: {
      name: 'Phoenix Delhi Station',
      city: 'Delhi',
      state: 'Delhi',
      pinCodes: '110001,110002,110003,110004,110011,110021',
      radiusKm: 20.0,
      isActive: true,
    },
  });

  console.log('Created Phoenix Stations (Mumbai, Hyderabad, Delhi).');

  // 4. Create Pigeons
  // Mumbai
  await db.pigeon.createMany({
    data: [
      { name: 'Rani', stationId: stationMumbai.id, status: 'AVAILABLE', healthStatus: 'Excellent', maxRangeKm: 25.0, totalFlights: 12 },
      { name: 'Vikram', stationId: stationMumbai.id, status: 'RESTING', healthStatus: 'Excellent', maxRangeKm: 30.0, totalFlights: 8, lastRestStart: new Date() },
    ],
  });

  // Hyderabad
  await db.pigeon.createMany({
    data: [
      { name: 'Tejas', stationId: stationHyd.id, status: 'AVAILABLE', healthStatus: 'Excellent', maxRangeKm: 20.0, totalFlights: 15 },
      { name: 'Birju', stationId: stationHyd.id, status: 'AVAILABLE', healthStatus: 'Excellent', maxRangeKm: 22.0, totalFlights: 19 },
      { name: 'Shera', stationId: stationHyd.id, status: 'SICK', healthStatus: 'Under Treatment', maxRangeKm: 15.0, totalFlights: 4 },
    ],
  });

  // Delhi
  await db.pigeon.createMany({
    data: [
      { name: 'Samrat', stationId: stationDelhi.id, status: 'AVAILABLE', healthStatus: 'Excellent', maxRangeKm: 35.0, totalFlights: 24 },
      { name: 'Vayu', stationId: stationDelhi.id, status: 'AVAILABLE', healthStatus: 'Excellent', maxRangeKm: 40.0, totalFlights: 31 },
    ],
  });

  console.log('Created Pigeons and assigned to stations.');

  // 5. Create Pricing Options
  const pricingItems = [
    { itemKey: 'base_digital', displayName: 'Digital Copy', priceInINR: 49.0 },
    { itemKey: 'base_classic', displayName: 'Classic Physical Letter', priceInINR: 149.0 },
    { itemKey: 'base_premium', displayName: 'Premium Parchment Letter', priceInINR: 299.0 },
    { itemKey: 'handwriting_service', displayName: 'Realistic Handwriting Printed Style', priceInINR: 79.0 },
    { itemKey: 'pigeon_delivery', displayName: 'Phoenix Carrier Pigeon Delivery', priceInINR: 399.0 },
    { itemKey: 'express_delivery', displayName: 'Phoenix Express Delivery (Postal Partner)', priceInINR: 99.0 },
  ];

  for (const item of pricingItems) {
    await db.pricing.create({ data: item });
  }

  console.log('Created Price Configs.');

  // 6. Create Coupons
  await db.coupon.createMany({
    data: [
      { code: 'WELCOME50', type: 'FIXED', value: 50.0, minAmount: 150.0, isActive: true },
      { code: 'PHOENIX20', type: 'PERCENTAGE', value: 20.0, minAmount: 0.0, isActive: true },
      { code: 'FESTIVAL10', type: 'PERCENTAGE', value: 10.0, minAmount: 100.0, isActive: true },
    ],
  });

  console.log('Created Promotional Coupons.');

  // 7. Create Featured Reviews
  await db.review.createMany({
    data: [
      {
        userName: 'Aarav Sharma',
        rating: 5,
        content: 'Sent an anniversary letter to my wife in Hyderabad. She was in tears when she saw the wax-sealed vintage envelope and the handwritten calligraphy. The tracking map was magical to watch!',
        isFeatured: true,
      },
      {
        userName: 'Priya Patel',
        rating: 5,
        content: 'The premium parchment feels heavy and high-quality, exactly like old post letters. Better than any WhatsApp text could ever be. Truly traditional yet modern.',
        isFeatured: true,
      },
      {
        userName: 'Karan Malhotra',
        rating: 4,
        content: 'A very unique experience. The carrier pigeon assignment and the detailed rest cycles make you appreciate the service. Great animal welfare policies too.',
        isFeatured: true,
      },
    ],
  });

  console.log('Created Featured Reviews.');

  // 8. Create System Settings
  await db.systemSetting.createMany({
    data: [
      { key: 'global_weather_override', value: 'none' }, // 'none', 'heavy_rain', 'extreme_heat', 'storm'
      { key: 'pigeon_welfare_max_daily_flights', value: '2' },
    ],
  });

  console.log('Created System Settings.');
  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
