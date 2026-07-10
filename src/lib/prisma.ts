import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// ฟังก์ชันสร้างอินสแตนซ์ของ Prisma Client พร้อม Driver Adapter
const prismaClientSingleton = () => {
  const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

// ประกาศประเภทข้อมูลแบบ global เพื่อป้องกันปัญหาการสร้างอินสแตนซ์ซ้ำซ้อนในโหมด Development
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// เลือกใช้ Prisma Client จากตัวแปร global (ถ้ามี) หรือสร้างตัวใหม่
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// บันทึกอินสแตนซ์ลงใน global ในโหมด Development เพื่อให้นำกลับมาใช้ใหม่ได้หลังการรีโหลดโค้ดแบบ Hot Reload
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
