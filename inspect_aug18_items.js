require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const deptDict = [
  { key: "Ros200Years1", nameTh: "รส.200 ปี 1" },
  { key: "Ros200Years2", nameTh: "รส.200 ปี 2" },
  { key: "UnderwaterMed", nameTh: "เวชศาสตร์ใต้น้ำ" },
  { key: "EntOutpatient", nameTh: "โสต ศอ นาสิก" },
  { key: "EyeOutpatient", nameTh: "จักษุ" },
  { key: "OperatingRoom", nameTh: "OR" },
  { key: "Anesthesia", nameTh: "วิสัญญี" },
  { key: "LaborRoom", nameTh: "LR" },
  { key: "EmergencyRoom", nameTh: "ER" },
  { key: "ObGynOutpatient", nameTh: "OPD นรีเวช" },
  { key: "PediatricOutpatient", nameTh: "OPD เด็ก" },
  { key: "OrthoOutpatient", nameTh: "OPD Ortho" },
  { key: "SurgeryOutpatient", nameTh: "OPD Sx" },
  { key: "InjectionRoom", nameTh: "ฉีดยา" },
  { key: "AriClinic", nameTh: "OPD ARI" },
  { key: "Chemotherapy", nameTh: "เคมีบำบัด" },
  { key: "Hemodialysis", nameTh: "งานไตเทียม" },
  { key: "CathLab", nameTh: "Cath Lab" },
  { key: "SurgicalIcu", nameTh: "ICU ศัลยกรรม" },
  { key: "Ccu", nameTh: "CCU" },
  { key: "IntermediateCcu", nameTh: "ICCU" },
  { key: "NeurosurgicalIcu", nameTh: "ศัลยกรรมประสาท" },
  { key: "OrthopedicWard", nameTh: "ศัลยกรรมกระดูก" },
  { key: "FemaleSurgicalWard", nameTh: "ศัลยกรรมหญิง" },
  { key: "MaleSurgicalWard", nameTh: "ศัลยกรรมชาย" },
  { key: "Nomklao2", nameTh: "น้อมเกล้า 2" },
  { key: "Nomklao3", nameTh: "น้อมเกล้า 3" },
  { key: "Nomklao4", nameTh: "น้อมเกล้า 4" },
  { key: "LuangPhorChaem2", nameTh: "หลวงพ่อแช่ม 2" },
  { key: "LuangPhorChaem3", nameTh: "หลวงพ่อแช่ม 3" },
  { key: "LuangPhorChaem4", nameTh: "หลวงพ่อแช่ม 4" },
  { key: "MedicalWard2", nameTh: "อายุรกรรม 2" },
  { key: "MedicalWard3", nameTh: "อายุรกรรม 3" },
  { key: "MedicalWard4", nameTh: "อายุรกรรม 4" },
  { key: "MedicalWard5", nameTh: "อายุรกรรม 5" },
  { key: "PrivateMedicalWard5", nameTh: "พิเศษอายุรกรรม 5" },
  { key: "MedicalWard6", nameTh: "อายุรกรรม 6" },
  { key: "PrivateMedicalWard6", nameTh: "พิเศษอายุรกรรม 6" },
  { key: "MedicalWard7", nameTh: "อายุรกรรม 7" },
  { key: "PrivateMedicalWard7", nameTh: "พิเศษอายุรกรรม 7" },
  { key: "MedicalWard8", nameTh: "อายุรกรรม 8" },
  { key: "Rcu", nameTh: "RCU" },
  { key: "MedicalIcu1", nameTh: "ICU อายุรกรรม 1" },
  { key: "MedicalIcu2", nameTh: "ICU อายุรกรรม 2" },
  { key: "StrokeUnit", nameTh: "Stroke unit" },
  { key: "GynecologyWard", nameTh: "นรีเวช" },
  { key: "SickNewborn", nameTh: "Sick Newborn" },
  { key: "PostpartumWard", nameTh: "สูติกรรมหลังคลอด" },
  { key: "RatiphatWard", nameTh: "รติพัฒน์" },
  { key: "Picu", nameTh: "PICU" },
  { key: "Nicu", nameTh: "NICU" },
  { key: "PediatricWard1", nameTh: "กุมารเวชกรรม 1" },
  { key: "PediatricWard2", nameTh: "กุมารเวชกรรม 2" },
  { key: "IT", nameTh: "ไอที" },
  { key: "Marketing", nameTh: "การตลาด" },
  { key: "Sales", nameTh: "ฝ่ายขาย" },
  { key: "Finance", nameTh: "การเงิน" },
  { key: "Operations", nameTh: "ปฏิบัติการ" }
];

function getDeptThaiName(key) {
  const match = deptDict.find(d => d.key === key);
  return match ? match.nameTh : key;
}

function formatDateStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function main() {
  const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
  if (!url) throw new Error('No DB URL');
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const allRecords = await prisma.handoffRecord.findMany();
  const targetDateStr = '2026-08-18';

  const deptMap = {};
  allRecords.forEach(r => {
    const dStr = formatDateStr(r.handoffDate || r.createdAt);
    if (dStr === targetDateStr) {
      if (!deptMap[r.department]) deptMap[r.department] = [];
      deptMap[r.department].push(r);
    }
  });

  const deptKeys = Object.keys(deptMap).sort();
  console.log(`Found ${deptKeys.length} departments with records on ${targetDateStr}:`);

  let totalItems = 0;
  deptKeys.forEach(dept => {
    const recs = deptMap[dept];
    totalItems += recs.length;
    console.log(`\nDept: ${dept} (${getDeptThaiName(dept)}) - ${recs.length} items:`);
    // Group by product
    const prodMap = {};
    recs.forEach(r => {
      if (!prodMap[r.productName]) prodMap[r.productName] = [];
      prodMap[r.productName].push(r.productId);
    });
    for (const [prod, ids] of Object.entries(prodMap)) {
      console.log(`  - ${prod}: ${ids.length} [${ids.join(', ')}]`);
    }
  });

  console.log(`\nTotal items on ${targetDateStr}: ${totalItems}`);

  pool.end();
}

main().catch(console.error);
