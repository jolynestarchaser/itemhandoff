require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
  if (!url) throw new Error('No db url');
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const records = await prisma.handoffRecord.findMany();
  console.log(`Total records: ${records.length}`);

  // Group by department -> dates
  const deptMap = {};

  records.forEach(r => {
    const dept = r.department;
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(r);
  });

  console.log('\n--- Department Summary ---');
  for (const dept of Object.keys(deptMap)) {
    const recs = deptMap[dept];
    const dates = new Set();
    recs.forEach(r => {
      // Formatted date string (YYYY-MM-DD or similar)
      const d = new Date(r.handoffDate || r.createdAt);
      // Thai / Local day
      const dayStr = d.toISOString().split('T')[0];
      const dayNum = d.getUTCDate(); // or local date
      dates.add(`${dayStr} (day ${d.getDate()})`);
    });
    console.log(`Dept: "${dept}" | Total items: ${recs.length} | Unique dates:`, Array.from(dates));
  }

  pool.end();
}

main().catch(console.error);
