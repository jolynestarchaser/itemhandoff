require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');

// Map department keys to Thai names
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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
  if (!url) throw new Error('No DB URL');
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const allRecords = await prisma.handoffRecord.findMany();
  console.log(`Total records in DB: ${allRecords.length}`);

  // Filter records for 2026-08-18
  const targetDateStr = '2026-08-18';
  const deptMap = {};

  allRecords.forEach(r => {
    const dStr = formatDateStr(r.handoffDate || r.createdAt);
    if (dStr === targetDateStr) {
      if (!deptMap[r.department]) deptMap[r.department] = [];
      deptMap[r.department].push(r);
    }
  });

  const qualifyingDepts = [];
  for (const dept of Object.keys(deptMap)) {
    qualifyingDepts.push({
      deptKey: dept,
      deptNameTh: getDeptThaiName(dept),
      records: deptMap[dept]
    });
  }

  // Sort qualifying departments by Key
  qualifyingDepts.sort((a, b) => a.deptKey.localeCompare(b.deptKey));

  console.log(`\nFound ${qualifyingDepts.length} departments with records on ${targetDateStr}:`);

  const formattedDate = new Date('2026-08-18').toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderSinglePageHtml = (deptNameTh, grouped, copyLabel) => {
    const rowsHtml = Object.entries(grouped).map(([prodName, serials]) => `
      <tr>
        <td>${prodName}</td>
        <td>${serials.join(', ')}</td>
        <td>${serials.length}</td>
      </tr>
    `).join('');

    return `
    <div class="document-style">
      <div class="copy-label">${copyLabel}</div>
      <h1>ใบส่งสินค้าชั่วคราว</h1>
      
      <div class="header-info">
        <div className="info-row" style="display: flex; align-items: flex-end; margin-bottom: 1rem; font-size: 1rem;">
          <div class="info-label" style="margin-right: 1rem; white-space: nowrap;">วันที่ส่ง</div>
          <div class="info-dots" style="width: 40%; border-bottom: 0.1rem dotted #000; min-width: 200px;">${formattedDate}</div>
        </div>
        <div class="info-row" style="display: flex; align-items: flex-end; margin-bottom: 1rem; font-size: 1rem;">
          <div class="info-label" style="margin-right: 1rem; white-space: nowrap;">แผนก</div>
          <div class="info-dots" style="width: 40%; border-bottom: 0.1rem dotted #000; min-width: 200px;">${deptNameTh}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>ชื่อสินค้า</th>
            <th>Serial Number</th>
            <th>จำนวน</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="signature-area">
        <div class="signature-box">
          <div class="signature-title">ผู้รับสินค้า</div>
          <div>${deptNameTh}</div>
          <br>
          <div style="margin-top: 1rem;">ลายมือชื่อ</div>
          <div class="signature-line"></div>
          <div>ชื่อ</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div class="signature-title">ผู้ส่งสินค้า</div>
          <div>บริษัท อภิลักษณ์ เฮลท์แคร์ คอร์เปอร์เรชั่น</div>
          <div style="margin-top: 1rem;">ลายมือชื่อ</div>
          <div class="signature-line"></div>
          <div>ชื่อ</div>
          <div class="signature-line"></div>
        </div>
      </div>
    </div>
    `;
  };

  // Generate HTML document using EXACT DepartmentDeliveryNote.tsx styling with 2 copies per dept
  const pagesHtml = qualifyingDepts.map((d, index) => {
    // Group records by product name
    const grouped = {};
    d.records.forEach(r => {
      if (!grouped[r.productName]) grouped[r.productName] = [];
      grouped[r.productName].push(r.productId);
    });

    const isLastDept = index === qualifyingDepts.length - 1;

    const copy1 = renderSinglePageHtml(d.deptNameTh, grouped, "ต้นฉบับ (ผู้ส่งสินค้า)");
    const copy2 = renderSinglePageHtml(d.deptNameTh, grouped, "สำเนา (ผู้รับสินค้า)");

    return `
      ${copy1}
      <div class="page-break"></div>
      ${copy2}
      ${isLastDept ? '' : '<div class="page-break"></div>'}
    `;
  }).join('');

  const fullHtml = `
  <!DOCTYPE html>
  <html lang="th">
  <head>
    <meta charset="UTF-8">
    <title>ใบส่งสินค้าชั่วคราว - ประจำวันที่ 18 สิงหาคม 2569</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      @page {
        size: A4;
        margin: 3rem; /* จัดเอกสารให้อยู่ตรงกลาง ซ้าย-ขวา-บน-ล่าง เท่ากัน */
      }
      body {
        margin: 0;
        padding: 0;
        background: #fff;
        font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
        color: #000;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .document-style {
        font-size: 16px;
        font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
        color: #000;
        background: #fff;
        padding: 0;
        margin-bottom: 0;
        position: relative;
      }
      .copy-label {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 0.9rem;
        color: #666;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .document-style h1 {
        font-size: 1.5em; /* ใช้ em สำหรับ Heading */
        text-align: center;
        margin-bottom: 2rem;
        font-weight: bold;
      }
      .document-style .header-info {
        margin-bottom: 2rem;
      }
      .document-style .info-row {
        display: flex;
        align-items: flex-end;
        margin-bottom: 1rem;
        font-size: 1rem;
      }
      .document-style .info-label {
        margin-right: 1rem;
        white-space: nowrap;
      }
      .document-style .info-dots {
        width: 40%;
        border-bottom: 0.1rem dotted #000;
        min-width: 200px;
      }
      .document-style table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2rem;
      }
      .document-style th, .document-style td {
        border: 0.1rem solid #000;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        page-break-inside: avoid;
      }
      .document-style th {
        background-color: #f9f9f9;
        text-align: left;
      }
      .document-style .signature-area {
        display: flex;
        justify-content: space-around;
        margin-top: 4rem;
        page-break-inside: avoid;
      }
      .document-style .signature-box {
        width: 40%;
        font-size: 1rem;
        line-height: 1.5;
      }
      .document-style .signature-title {
        text-align: center;
        margin-bottom: 1.5rem;
        font-weight: bold;
      }
      .document-style .signature-line {
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        border-bottom: 0.1rem dotted #000;
        width: 100%;
      }
    </style>
  </head>
  <body>
    ${pagesHtml}
  </body>
  </html>
  `;

  const outputHtmlPath = path.join(__dirname, 'delivery_notes_18th_august.html');
  const outputPdfPath = path.join(__dirname, 'delivery_notes_18th_august.pdf');

  fs.writeFileSync(outputHtmlPath, fullHtml, 'utf8');
  console.log(`Saved HTML preview to ${outputHtmlPath}`);

  console.log('Launching puppeteer to generate PDF...');
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  
  let chromePath = possiblePaths.find(p => fs.existsSync(p));
  console.log(`Using browser executable: ${chromePath}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    },
    printBackground: true
  });

  await browser.close();
  pool.end();

  console.log(`\n🎉 PDF exported successfully to: ${outputPdfPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
