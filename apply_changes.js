require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');

function formatDateStr(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

async function main() {
  const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
  if (!url) throw new Error('No DB URL found');
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('=== 1. UPDATE DB: CHANGE INTERVISION TO INTERVENTION ===');
  const updateInterResult = await prisma.handoffRecord.updateMany({
    where: { department: { in: ['Intervision', 'intervision'] } },
    data: { department: 'Intervention' }
  });
  console.log(`Updated ${updateInterResult.count} records from Intervision -> Intervention`);

  console.log('\n=== 2. UPDATE DB: REMOVE MEDICALICU2 ON AUG 18 ===');
  const allMicu2 = await prisma.handoffRecord.findMany({ where: { department: 'MedicalIcu2' } });
  const micu2ToDelete = allMicu2.filter(r => formatDateStr(r.handoffDate || r.createdAt) === '2026-08-18');
  console.log(`Found ${micu2ToDelete.length} records in MedicalIcu2 on 2026-08-18:`, micu2ToDelete.map(r => r.productId));

  if (micu2ToDelete.length > 0) {
    const deleteMicu2Result = await prisma.handoffRecord.deleteMany({
      where: { id: { in: micu2ToDelete.map(r => r.id) } }
    });
    console.log(`Deleted ${deleteMicu2Result.count} records from MedicalIcu2 for Aug 18.`);
  }

  console.log('\n=== 3. UPDATE DB: REMOVE ER (EMERGENCY ROOM) A019-A028 ON AUG 18 ===');
  const targetErIds = ['A019', 'A020', 'A021', 'A022', 'A023', 'A024', 'A025', 'A026', 'A027', 'A028'];
  const allEr = await prisma.handoffRecord.findMany({
    where: {
      department: { in: ['EmergencyRoom', 'ER', 'er'] },
      productId: { in: targetErIds }
    }
  });
  const erToDelete = allEr.filter(r => formatDateStr(r.handoffDate || r.createdAt) === '2026-08-18');
  console.log(`Found ${erToDelete.length} matching ER records on 2026-08-18:`, erToDelete.map(r => r.productId));

  if (erToDelete.length > 0) {
    const deleteErResult = await prisma.handoffRecord.deleteMany({
      where: { id: { in: erToDelete.map(r => r.id) } }
    });
    console.log(`Deleted ${deleteErResult.count} records (A019-A028) from ER for Aug 18.`);
  }

  console.log('\n=== 4. GENERATE PDF FOR INTERVENTION AND RCU ===');
  const dateToUse = new Date('2026-08-19T09:00:00.000Z');
  const formattedDate = dateToUse.toLocaleDateString('th-TH', {
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
        <div class="info-row" style="display: flex; align-items: flex-end; margin-bottom: 1rem; font-size: 1rem;">
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
          <br>
          <div style="margin-top: 1rem;">ลายมือชื่อ</div>
          <div class="signature-line"></div>
          <div>ชื่อ</div>
          <div class="signature-line"></div>
        </div>
      </div>
    </div>
    `;
  };

  const docs = [
    {
      deptName: 'Intervention',
      grouped: {
        'APIX Round A': ['A073']
      }
    },
    {
      deptName: 'RCU',
      grouped: {
        'APIX Flow C': ['C085']
      }
    }
  ];

  const pagesHtml = docs.map((d, index) => {
    const isLast = index === docs.length - 1;
    const copy1 = renderSinglePageHtml(d.deptName, d.grouped, 'ต้นฉบับ (ผู้ส่งสินค้า)');
    const copy2 = renderSinglePageHtml(d.deptName, d.grouped, 'สำเนา (ผู้รับสินค้า)');
    return `
      ${copy1}
      <div class="page-break"></div>
      ${copy2}
      ${isLast ? '' : '<div class="page-break"></div>'}
    `;
  }).join('');

  const fullHtml = `
  <!DOCTYPE html>
  <html lang="th">
  <head>
    <meta charset="UTF-8">
    <title>ใบส่งสินค้าชั่วคราว - Intervention และ RCU</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      @page {
        size: A4;
        margin: 3rem;
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
        font-size: 1.5em;
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

  const outputHtmlPath = path.join(__dirname, 'delivery_notes_intervention_rcu.html');
  const outputPdfPath = path.join(__dirname, 'delivery_notes_intervention_rcu.pdf');

  fs.writeFileSync(outputHtmlPath, fullHtml, 'utf8');
  console.log(`Saved HTML to ${outputHtmlPath}`);

  // Also update delivery_notes_intervision_rcu.html for compatibility
  fs.writeFileSync(path.join(__dirname, 'delivery_notes_intervision_rcu.html'), fullHtml, 'utf8');

  console.log('Launching browser to generate PDF...');
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  let chromePath = possiblePaths.find(p => fs.existsSync(p));
  console.log(`Using browser: ${chromePath}`);

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

  // Copy/save to old name as well
  fs.copyFileSync(outputPdfPath, path.join(__dirname, 'delivery_notes_intervision_rcu.pdf'));

  await browser.close();
  pool.end();

  console.log(`\n🎉 PDF exported successfully to:\n- ${outputPdfPath}\n- ${path.join(__dirname, 'delivery_notes_intervision_rcu.pdf')}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
