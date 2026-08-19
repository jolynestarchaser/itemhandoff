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
  
  const month8Records = records.filter(r => {
    const d = new Date(r.handoffDate);
    return d.getFullYear() === 2026 && d.getMonth() === 7; // Month index 7 = August (Month 8)
  });

  console.log(`Total Month 8 (August 2026) records: ${month8Records.length}`);
  
  const datesInMonth8 = {};
  month8Records.forEach(r => {
    const d = new Date(r.handoffDate);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    datesInMonth8[dayStr] = (datesInMonth8[dayStr] || 0) + 1;
  });

  console.log('Dates present in Month 8:', datesInMonth8);

  pool.end();
}

main().catch(console.error);
