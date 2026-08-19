require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function formatDateStr(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

async function inspect() {
  console.log('=== 1. Intervision records ===');
  const inter = await prisma.handoffRecord.findMany({ where: { department: { in: ['Intervision', 'intervision', 'Intervention', 'intervention'] } } });
  console.log('Intervision/Intervention count:', inter.length, inter);

  console.log('\n=== 2. MedicalIcu2 records ===');
  const micu2 = await prisma.handoffRecord.findMany({ where: { department: 'MedicalIcu2' } });
  console.log('Total MedicalIcu2:', micu2.length);
  micu2.forEach(r => {
    console.log(`  - [${r.id}] ${r.productId} (${r.productName}) date: ${formatDateStr(r.handoffDate || r.createdAt)}`);
  });

  console.log('\n=== 3. EmergencyRoom records ===');
  const er = await prisma.handoffRecord.findMany({ where: { department: { in: ['EmergencyRoom', 'ER', 'er'] } } });
  console.log('Total EmergencyRoom:', er.length);
  er.forEach(r => {
    console.log(`  - [${r.id}] ${r.productId} (${r.productName}) date: ${formatDateStr(r.handoffDate || r.createdAt)}`);
  });

  pool.end();
}
inspect().catch(console.error);
