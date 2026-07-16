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

  const records = await prisma.handoffRecord.findMany({
    where: { department: "RCU" }
  });
  
  console.log(JSON.stringify(records, null, 2));
}

main().catch(console.error);
