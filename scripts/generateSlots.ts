import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Make sure your .env.local is set up!
});

async function generateSlots() {
  const eventId = 1; // <-- Replace with your event's ID
  // Get service IDs
  const { rows: services } = await pool.query('SELECT id, name FROM services WHERE name IN ($1, $2)', ['ice_bath', 'massage']);
  const iceBathId = services.find((s: any) => s.name === 'ice_bath').id;
  const massageId = services.find((s: any) => s.name === 'massage').id;

  const startTime = new Date('2025-05-11T18:00:00+04:00'); // 6pm Dubai time
  const slotLengthMinutes = 15;
  const numSlots = 12; // 3 hours / 15 min = 12 slots
  const resourcesPerService = 4;

  for (let i = 0; i < numSlots; i++) {
    const slotTime = new Date(startTime.getTime() + i * slotLengthMinutes * 60000);
    for (let resource = 1; resource <= resourcesPerService; resource++) {
      // Ice bath slots
      await pool.query(
        'INSERT INTO slots (event_id, service_id, resource_number, slot_time) VALUES ($1, $2, $3, $4)',
        [eventId, iceBathId, resource, slotTime]
      );
      // Massage slots
      await pool.query(
        'INSERT INTO slots (event_id, service_id, resource_number, slot_time) VALUES ($1, $2, $3, $4)',
        [eventId, massageId, resource, slotTime]
      );
    }
  }
  console.log('All slots generated!');
  await pool.end();
}

generateSlots().catch(console.error);