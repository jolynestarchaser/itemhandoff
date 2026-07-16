'use client';

import { HandoffRecord } from '@prisma/client';

interface DepartmentDeliveryNoteProps {
  department: string;
  records: HandoffRecord[];
  date?: string; // YYYY-MM-DD
}

export default function DepartmentDeliveryNote({ department, records, date }: DepartmentDeliveryNoteProps) {
  const handlePrint = () => {
    window.print();
  };

  const displayDate = date ? new Date(date) : new Date();
  const formattedDate = displayDate.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group records by product name
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.productName]) {
      acc[record.productName] = [];
    }
    acc[record.productName].push(record.productId);
    return acc;
  }, {} as Record<string, string[]>);

  // Component สำหรับ 1 หน้า A4
  const NotePage = ({ copyLabel }: { copyLabel: string }) => (
    <div className="document-style">
      <div className="copy-label">{copyLabel}</div>
      <h1>ใบส่งสินค้าชั่วคราว</h1>
      
      <div className="header-info">
        <div className="info-row">
          <div className="info-label">วันที่ส่ง</div>
          <div className="info-dots">{formattedDate}</div>
        </div>
        <div className="info-row">
          <div className="info-label">แผนก</div>
          <div className="info-dots">{department}</div>
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
          {Object.entries(groupedRecords).map(([productName, serials]) => (
            <tr key={productName}>
              <td>{productName}</td>
              <td>{serials.join(', ')}</td>
              <td style={{ textAlign: 'center' }}>{serials.length}</td>
            </tr>
          ))}
          {Object.keys(groupedRecords).length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>ไม่มีรายการสินค้า</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="signature-area">
        <div className="signature-box">
          <div className="signature-title">ผู้รับสินค้า</div>
          <div>{department}</div>
          <br></br>
          <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
          <div className="signature-line"></div>
          <div>ชื่อ</div>
          <div className="signature-line"></div>
          <div>วันที่</div>
          <div className="signature-line"></div>
        </div>
        <div className="signature-box">
          <div className="signature-title">ผู้ส่งสินค้า</div>
          <div>บริษัท อภิลักษณ์ เฮลท์แคร์ คอร์เปอร์เรชั่น</div>
          <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
          <div className="signature-line"></div>
          <div>ชื่อ</div>
          <div className="signature-line"></div>
          <div>วันที่</div>
          <div className="signature-line"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .document-style {
          font-size: 16px;
          font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
          color: #000;
          background: #fff;
          padding: 3rem;
          margin-bottom: 2rem;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          position: relative;
        }
        .copy-label {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.9rem;
          color: #666;
        }
        @media print {
          @page {
            size: A4;
            margin: 3rem; /* จัดเอกสารให้อยู่ตรงกลาง ซ้าย-ขวา-บน-ล่าง เท่ากัน */
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .document-style {
            padding: 0;
            margin-bottom: 0;
            box-shadow: none;
          }
          .page-break {
            page-break-after: always;
          }
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
      `}} />

      {/* ปุ่มพิมพ์ (ซ่อนเมื่อพิมพ์) */}
      <div className="no-print mb-4">
        <button
          onClick={handlePrint}
          className="w-full py-3 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
          </svg>
          พิมพ์ใบส่งมอบชั่วคราว
        </button>
      </div>

      <div className="print-only-wrapper">
        <NotePage copyLabel="ต้นฉบับ (ผู้ส่งสินค้า)" />
        <div className="page-break" />
        <NotePage copyLabel="สำเนา (ผู้รับสินค้า)" />
      </div>
    </div>
  );
}
