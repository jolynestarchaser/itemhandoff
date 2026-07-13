const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const records = await prisma.handoffRecord.findMany({ distinct: ['productName'] });
  console.log("DB Products:", records.map(r => r.productName));
}
main().catch(console.error).finally(() => prisma.$disconnect());
