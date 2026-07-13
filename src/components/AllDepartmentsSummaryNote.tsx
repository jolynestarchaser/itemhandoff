'use client';

import { HandoffRecord } from '@prisma/client';

interface AllDepartmentsSummaryNoteProps {
  records: HandoffRecord[];
}

export default function AllDepartmentsSummaryNote({ records }: AllDepartmentsSummaryNoteProps) {
  const handlePrint = () => {
    window.print();
  };

  // กำหนดรายการสินค้าหลัก (A, B, C) ตามโครงสร้าง
  const uniqueProducts = [
    { label: 'A', name: 'รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)', shortName: 'APIX Round A' },
    { label: 'B', name: 'รถเข็นคอมพิวเตอร์ All-in-one สำหรับงานเจาะเลือด (Phlebotomy Computer Cart)', shortName: 'APIX RX B' },
    { label: 'C', name: 'รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)', shortName: 'APIX Flow C' },
  ];

  // รวบรวม departments ที่ไม่ซ้ำ
  const departmentSet = new Set<string>();
  records.forEach((r) => departmentSet.add(r.department));
  const departments = Array.from(departmentSet).sort();

  // สร้าง cross-reference matrix: dept → label → count
  const matrix: Record<string, Record<string, number>> = {};
  departments.forEach((dept) => {
    matrix[dept] = {};
    uniqueProducts.forEach((p) => {
      matrix[dept][p.label] = 0;
    });
  });

  records.forEach((r) => {
    // จับคู่ productName จาก DB กับรายการสินค้าที่กำหนดไว้
    const matchedProduct = uniqueProducts.find(p => 
      p.name === r.productName || 
      p.shortName === r.productName ||
      r.productName.includes(p.shortName) ||
      p.shortName.includes(r.productName)
    );

    if (matchedProduct && matrix[r.department]) {
      matrix[r.department][matchedProduct.label]++;
    }
  });

  // คำนวณผลรวมต่อ product
  const totals: Record<string, number> = {};
  uniqueProducts.forEach((p) => {
    totals[p.label] = 0;
    departments.forEach((dept) => {
      totals[p.label] += matrix[dept][p.label];
    });
  });

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .document-style {
          font-size: 16px; /* Base size สำหรับ 1rem */
          font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
          color: #000;
          background: #fff;
          padding: 3rem;
          margin-bottom: 2rem;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
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
        }
        .document-style h1 {
          font-size: 1.5em; /* ใช้ em สำหรับ Heading */
          text-align: center;
          margin-bottom: 1rem;
          font-weight: bold;
        }
        .document-style .contract-no {
          text-align: center;
          font-size: 1rem;
          margin-bottom: 2rem;
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
        .document-style .legend-area {
          font-size: 0.9rem;
          margin-top: 1.5rem;
          page-break-inside: avoid;
        }
        .document-style .legend-area ul {
          padding-left: 1.5rem;
          margin-top: 0.5rem;
        }
        .document-style .legend-area li {
          margin-bottom: 0.3rem;
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
          พิมพ์เอกสารสรุปทั้งหมด
        </button>
      </div>

      <div className="document-style">
        <h1>ใบสรุปรายการส่งมอบ</h1>
        <p className="contract-no">เลขที่สัญญา ...........................................................</p>
        
        <table>
          <thead>
            <tr>
              <th>ชื่อแผนก</th>
              {uniqueProducts.map((p) => (
                <th key={p.label} style={{ textAlign: 'center' }}>
                  {p.label}<br />
                  <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>({p.shortName})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept}>
                <td>{dept}</td>
                {uniqueProducts.map((p) => (
                  <td key={p.label} style={{ textAlign: 'center' }}>
                    {matrix[dept][p.label] > 0 ? matrix[dept][p.label] : '-'}
                  </td>
                ))}
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={uniqueProducts.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>ไม่มีรายการจัดส่ง</td>
              </tr>
            )}
            {/* Totals row */}
            {departments.length > 0 && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>รวมทั้งหมด</td>
                {uniqueProducts.map((p) => (
                  <td key={p.label} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {totals[p.label] > 0 ? totals[p.label] : '-'}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="legend-area">
          <strong>คำอธิบายรายละเอียดสินค้ารายการ {uniqueProducts.map(p => p.label).join(', ')}:</strong>
          <ul>
            {uniqueProducts.map((p) => (
              <li key={p.label}>
                <strong>{p.label} ({p.name}):</strong> {p.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
