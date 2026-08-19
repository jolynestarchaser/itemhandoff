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

  const aug17Records = records.filter(r => {
    const d = new Date(r.handoffDate);
    // In Thailand timezone UTC+7, or ISO date
    // Let's check both UTC and local date representation
    // d.getFullYear(), d.getMonth() (0-indexed: 7 is August), d.getDate()
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    const date = d.getDate();
    return year === 2026 && month === 8 && date === 17;
  });

  console.log(`Found ${aug17Records.length} records on August 17th (local time).`);

  const deptCounts = {};
  aug17Records.forEach(r => {
    deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
  });

  console.log('Departments with Aug 17 records:');
  console.log(JSON.stringify(deptCounts, null, 2));

  // Also check UTC just in case
  const aug17UtcRecords = records.filter(r => {
    const d = new Date(r.handoffDate);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const date = d.getUTCDate();
    return year === 2026 && month === 8 && date === 17;
  });
  console.log(`Found ${aug17UtcRecords.length} records on August 17th (UTC time).`);

  pool.end();
}

main().catch(console.error);
