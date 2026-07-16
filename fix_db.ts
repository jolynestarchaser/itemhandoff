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

  const records = await prisma.handoffRecord.findMany();
  
  let updatedCount = 0;
  for (const record of records) {
    const d = new Date(record.handoffDate);
    // Format to YYYY-MM-DD in local time
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Check if date is the 16th and department is NOT "RCU"
    if (dateStr === "2026-07-16" && record.department !== "RCU") {
      const newDate = new Date(d);
      newDate.setDate(newDate.getDate() + 1); // Change to 17th
      
      await prisma.handoffRecord.update({
        where: { id: record.id },
        data: { handoffDate: newDate }
      });
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} records to change date from 16th to 17th (excluding RCU).`);
}

main().catch(console.error);
