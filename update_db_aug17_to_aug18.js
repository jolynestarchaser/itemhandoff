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
  
  let updatedCount = 0;
  const deptUpdatedCounts = {};

  for (const record of records) {
    const d = new Date(record.handoffDate);
    
    // Check if the record is on August 17, 2026 (Month index 7 = August)
    if (d.getFullYear() === 2026 && d.getMonth() === 7 && d.getDate() === 17) {
      const newHandoffDate = new Date(d);
      newHandoffDate.setDate(newHandoffDate.getDate() + 1); // 17 -> 18

      const updateData = { handoffDate: newHandoffDate };

      // Also update createdAt if it was on August 17
      const c = new Date(record.createdAt);
      if (c.getFullYear() === 2026 && c.getMonth() === 7 && c.getDate() === 17) {
        const newCreatedAt = new Date(c);
        newCreatedAt.setDate(newCreatedAt.getDate() + 1);
        updateData.createdAt = newCreatedAt;
      }

      await prisma.handoffRecord.update({
        where: { id: record.id },
        data: updateData
      });

      updatedCount++;
      deptUpdatedCounts[record.department] = (deptUpdatedCounts[record.department] || 0) + 1;
    }
  }

  console.log(`Successfully updated ${updatedCount} records from August 17th to August 18th across ${Object.keys(deptUpdatedCounts).length} departments.\n`);
  console.log('Summary by department:');
  console.log(JSON.stringify(deptUpdatedCounts, null, 2));

  pool.end();
}

main().catch(console.error);
