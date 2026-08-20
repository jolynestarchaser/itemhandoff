/**
 * Isolated Print Utility for Inventory Handoff
 * Renders print content into a clean, isolated iframe with pure white background,
 * eliminating all dark-mode background bleed, browser scrollbars, and layout shifts.
 */

export function printHtmlDocument(htmlContent: string, title: string = 'เอกสารส่งมอบพัสดุ'): void {
  if (typeof window === 'undefined') return;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 3rem; /* จัดเอกสารให้อยู่ตรงกลาง ซ้าย-ขวา-บน-ล่าง เท่ากัน */
            }
            * {
              box-sizing: border-box;
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              background-color: #ffffff !important;
              color: #000000 !important;
              font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .document-style {
              font-size: 16px; /* Base size สำหรับ 1rem */
              font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
              color: #000;
              background: #ffffff !important;
              background-color: #ffffff !important;
              padding: 0;
              margin-bottom: 0;
              position: relative;
              width: 100%;
              box-shadow: none !important;
              border: none !important;
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
              height: 0;
            }
            .document-style h1 {
              font-size: 1.5em; /* ใช้ em สำหรับ Heading */
              text-align: center;
              margin-bottom: 2rem;
              font-weight: bold;
            }
            .document-style .contract-no {
              text-align: center;
              font-size: 1rem;
              margin-bottom: 2rem;
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
              background-color: #f9f9f9 !important;
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
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 300);
  } catch (e) {
    console.error('Print iframe failed, falling back to window.print', e);
    window.print();
  }
}
