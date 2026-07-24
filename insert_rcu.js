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

  const d = new Date('2026-07-17T09:00:00.000Z');

  // Let's first try to find the product name for C083 and C084 if they exist
  const existingC083 = await prisma.handoffRecord.findFirst({ where: { productId: 'C083' } });
  const existingC084 = await prisma.handoffRecord.findFirst({ where: { productId: 'C084' } });

  const nameC083 = existingC083 ? existingC083.productName : 'Product C083';
  const nameC084 = existingC084 ? existingC084.productName : 'Product C084';

  await prisma.handoffRecord.create({
    data: { qrData: `${nameC083} C083`, productName: nameC083, productId: 'C083', department: 'RCU', createdAt: d, handoffDate: d }
  });

  await prisma.handoffRecord.create({
    data: { qrData: `${nameC084} C084`, productName: nameC084, productId: 'C084', department: 'RCU', createdAt: d, handoffDate: d }
  });

  console.log('Inserted successfully!');
}
main().catch(console.error);
