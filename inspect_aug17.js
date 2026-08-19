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
    return d.getFullYear() === 2026 && (d.getMonth() + 1) === 8 && d.getDate() === 17;
  });

  console.log('Sample 5 records on Aug 17:');
  aug17Records.slice(0, 5).forEach(r => {
    console.log({
      id: r.id,
      department: r.department,
      productName: r.productName,
      productId: r.productId,
      handoffDate: r.handoffDate,
      handoffDateISO: r.handoffDate ? r.handoffDate.toISOString() : null,
      createdAt: r.createdAt,
      createdAtISO: r.createdAt ? r.createdAt.toISOString() : null,
    });
  });

  pool.end();
}

main().catch(console.error);
