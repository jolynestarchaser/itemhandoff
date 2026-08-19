'use client';

import { HandoffRecord } from '@prisma/client';
import { departments as deptDict } from '@/lib/departments';

interface Day18DeliveryNotesProps {
  records: HandoffRecord[];
}

export default function Day18DeliveryNotes({ records }: Day18DeliveryNotesProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDateStr = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Group all records by department
  const deptMap: Record<string, HandoffRecord[]> = {};
  const targetDateStr = '2026-08-18';

  records.forEach((r) => {
    const dStr = formatDateStr(r.handoffDate || r.createdAt);
    if (dStr === targetDateStr) {
      if (!deptMap[r.department]) deptMap[r.department] = [];
      deptMap[r.department].push(r);
    }
  });

  const qualifyingDepts: { key: string; nameTh: string; records: HandoffRecord[] }[] = [];

  Object.keys(deptMap).forEach((deptKey) => {
    const deptRecords = deptMap[deptKey];
    const nameTh = deptDict.find((d) => d.key === deptKey)?.nameTh || deptKey;
    qualifyingDepts.push({
      key: deptKey,
      nameTh,
      records: deptRecords,
    });
  });

  // Sort departments by Key
  qualifyingDepts.sort((a, b) => a.key.localeCompare(b.key));

  const formattedDate = new Date('2026-08-18').toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalItems = qualifyingDepts.reduce((sum, d) => sum + d.records.length, 0);

  const renderNotePage = (deptNameTh: string, groupedRecords: Record<string, string[]>, copyLabel: string) => (
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
          <div className="info-dots">{deptNameTh}</div>
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
              <td>{serials.length}</td>
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
          <div>{deptNameTh}</div>
          <br />
          <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
          <div className="signature-line"></div>
          <div>ชื่อ</div>
          <div className="signature-line"></div>
        </div>
        <div className="signature-box">
          <div className="signature-title">ผู้ส่งสินค้า</div>
          <div>บริษัท อภิลักษณ์ เฮลท์แคร์ คอร์เปอร์เรชั่น</div>
          <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
          <div className="signature-line"></div>
          <div>ชื่อ</div>
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
          .no-print {
            display: none !important;
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

      {/* Control bar (hidden during print) */}
      <div className="no-print mb-6 p-6 bg-white/5 border border-white/10 rounded-2xl text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              ใบส่งสินค้าชั่วคราว (ประจำวันที่ 18 สิงหาคม 2569)
            </h2>
            <p className="text-sm text-gray-400">
              พบทั้งหมด <span className="text-[#F58220] font-bold">{qualifyingDepts.length}</span> แผนก รวม <span className="text-[#F58220] font-bold">{totalItems}</span> รายการ ({qualifyingDepts.length * 2} หน้า: ต้นฉบับ + สำเนา)
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="py-3 px-6 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F58220]/20 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
            </svg>
            พิมพ์ใบส่งมอบ ({qualifyingDepts.length * 2} หน้า)
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-400 border-t border-white/10 pt-3 mt-2">
          <span className="font-semibold text-gray-300">รายชื่อแผนกที่รวมอยู่:</span>
          {qualifyingDepts.map((d) => (
            <span key={d.key} className="bg-white/10 px-2 py-1 rounded text-gray-200">
              {d.nameTh} ({d.records.length})
            </span>
          ))}
        </div>
      </div>

      {/* Pages Container */}
      <div className="print-only-wrapper">
        {qualifyingDepts.map((d, index) => {
          // Group by product name
          const groupedRecords: Record<string, string[]> = {};
          d.records.forEach((r) => {
            if (!groupedRecords[r.productName]) groupedRecords[r.productName] = [];
            groupedRecords[r.productName].push(r.productId);
          });

          const isLastDept = index === qualifyingDepts.length - 1;

          return (
            <div key={d.key}>
              {/* Copy 1: ต้นฉบับ (ผู้ส่งสินค้า) */}
              {renderNotePage(d.nameTh, groupedRecords, "ต้นฉบับ (ผู้ส่งสินค้า)")}
              <div className="page-break" />

              {/* Copy 2: สำเนา (ผู้รับสินค้า) */}
              {renderNotePage(d.nameTh, groupedRecords, "สำเนา (ผู้รับสินค้า)")}
              {!isLastDept && <div className="page-break" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
