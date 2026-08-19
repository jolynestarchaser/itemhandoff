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
  console.log(`Total records in DB: ${records.length}`);

  const targetRecords = [];

  for (const r of records) {
    const dHandoff = new Date(r.handoffDate);
    
    // Check local date (Thailand UTC+7) or UTC date
    // Note: getMonth() is 7 for August (0-indexed)
    const isAug17Handoff = dHandoff.getFullYear() === 2026 && dHandoff.getMonth() === 7 && dHandoff.getDate() === 17;
    const isAug17HandoffUTC = dHandoff.getUTCFullYear() === 2026 && dHandoff.getUTCMonth() === 7 && dHandoff.getUTCDate() === 17;

    if (isAug17Handoff || isAug17HandoffUTC) {
      targetRecords.push(r);
    }
  }

  console.log(`Found ${targetRecords.length} records matching August 17, 2026.`);

  // Group target records by department
  const deptSummary = {};
  targetRecords.forEach(r => {
    deptSummary[r.department] = (deptSummary[r.department] || 0) + 1;
  });

  console.log('\n--- Department breakdown for August 17th ---');
  let totalDepts = 0;
  for (const [dept, count] of Object.entries(deptSummary)) {
    totalDepts++;
    console.log(`- ${dept}: ${count} records`);
  }
  console.log(`Total departments affected: ${totalDepts}`);

  pool.end();
}

main().catch(console.error);
