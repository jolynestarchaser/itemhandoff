require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');

async function main() {
  const url = process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;
  if (!url) throw new Error('No DB URL found');
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('--- 1. UPDATING DATABASE ---');
  const dateToUse = new Date('2026-08-19T09:00:00.000Z');

  // 1. Intervision A073
  const existingA073 = await prisma.handoffRecord.findFirst({ where: { productId: 'A073' } });
  if (existingA073) {
    await prisma.handoffRecord.update({
      where: { id: existingA073.id },
      data: {
        department: 'Intervision',
        productName: 'APIX Round A',
        qrData: 'APIX Round A A073',
        handoffDate: dateToUse,
      }
    });
    console.log('Updated A073 to department Intervision');
  } else {
    await prisma.handoffRecord.create({
      data: {
        productId: 'A073',
        productName: 'APIX Round A',
        qrData: 'APIX Round A A073',
        department: 'Intervision',
        handoffDate: dateToUse,
        createdAt: dateToUse,
      }
    });
    console.log('Created A073 in department Intervision');
  }

  // 2. RCU C085
  const existingC085 = await prisma.handoffRecord.findFirst({ where: { productId: 'C085' } });
  if (existingC085) {
    await prisma.handoffRecord.update({
      where: { id: existingC085.id },
      data: {
        department: 'Rcu',
        productName: 'APIX Flow C',
        qrData: 'APIX Flow C C085',
        handoffDate: dateToUse,
      }
    });
    console.log('Updated C085 to department Rcu');
  } else {
    await prisma.handoffRecord.create({
      data: {
        productId: 'C085',
        productName: 'APIX Flow C',
        qrData: 'APIX Flow C C085',
        department: 'Rcu',
        handoffDate: dateToUse,
        createdAt: dateToUse,
      }
    });
    console.log('Created C085 in department Rcu');
  }

  console.log('\n--- 2. GENERATING HTML & PDF ---');
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
      deptName: 'Intervision',
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
    <title>ใบส่งสินค้าชั่วคราว - Intervision และ RCU</title>
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

  const outputHtmlPath = path.join(__dirname, 'delivery_notes_intervision_rcu.html');
  const outputPdfPath = path.join(__dirname, 'delivery_notes_intervision_rcu.pdf');

  fs.writeFileSync(outputHtmlPath, fullHtml, 'utf8');
  console.log(`Saved HTML to ${outputHtmlPath}`);

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

  await browser.close();
  pool.end();

  console.log(`\n🎉 PDF exported successfully to: ${outputPdfPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
