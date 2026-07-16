require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
  if (!url) throw new Error("No database URL");
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Move "Rcu" records that are on the 17th back to the 16th
  const records = await prisma.handoffRecord.findMany({
    where: { department: "Rcu" }
  });
  
  let updatedCount = 0;
  for (const record of records) {
    const d = new Date(record.handoffDate);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (dateStr === "2026-07-17") {
      const newDate = new Date(d);
      newDate.setDate(newDate.getDate() - 1); // Move back to 16th
      
      await prisma.handoffRecord.update({
        where: { id: record.id },
        data: { handoffDate: newDate }
      });
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} Rcu records to change date from 17th back to 16th.`);
}

main().catch(console.error);
