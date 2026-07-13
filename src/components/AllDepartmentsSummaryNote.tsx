'use client';

import { HandoffRecord } from '@prisma/client';

interface AllDepartmentsSummaryNoteProps {
  records: HandoffRecord[];
}

export default function AllDepartmentsSummaryNote({ records }: AllDepartmentsSummaryNoteProps) {
  const handlePrint = () => {
    window.print();
  };

  const BLUE = '#4472C4';
  const MIN_ROWS = 15; // จำนวน row ขั้นต่ำ

  // รวบรวมรายการสินค้าที่ไม่ซ้ำ (unique product names)
  const uniqueProducts: { label: string; name: string }[] = [];
  const productNameSet = new Set<string>();
  records.forEach((r) => {
    if (!productNameSet.has(r.productName)) {
      productNameSet.add(r.productName);
      uniqueProducts.push({
        label: String.fromCharCode(65 + uniqueProducts.length), // A, B, C, ...
        name: r.productName,
      });
    }
  });

  // รวบรวม departments ที่ไม่ซ้ำ
  const departmentSet = new Set<string>();
  records.forEach((r) => departmentSet.add(r.department));
  const departments = Array.from(departmentSet).sort();

  // สร้าง cross-reference matrix: dept → product → count
  const matrix: Record<string, Record<string, number>> = {};
  departments.forEach((dept) => {
    matrix[dept] = {};
    uniqueProducts.forEach((p) => {
      matrix[dept][p.name] = 0;
    });
  });

  records.forEach((r) => {
    if (matrix[r.department] && matrix[r.department][r.productName] !== undefined) {
      matrix[r.department][r.productName]++;
    }
  });

  // คำนวณผลรวมต่อ product
  const totals: Record<string, number> = {};
  uniqueProducts.forEach((p) => {
    totals[p.name] = 0;
    departments.forEach((dept) => {
      totals[p.name] += matrix[dept][p.name];
    });
  });

  // เติม row ว่าง
  const emptyRowsCount = Math.max(0, MIN_ROWS - departments.length);

  return (
    <div>
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

      {/* หน้าพิมพ์ */}
      <div className="print-only">
        <div className="print-auto-page bg-white text-black" style={{ fontFamily: "'TH Sarabun New', 'Sarabun', serif" }}>
          <div style={{ padding: '15mm 20mm' }}>

            {/* Title */}
            <h1 style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', margin: '0 0 2mm 0' }}>
              ใบสรุปรายการส่งมอบ
            </h1>
            <p style={{ textAlign: 'center', fontSize: '12pt', margin: '0 0 8mm 0' }}>
              เลขที่สัญญา .......................
            </p>

            {/* รายการสินค้า */}
            <div style={{ marginBottom: '6mm', fontSize: '11pt' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 3mm 0' }}>รายการสินค้า</p>
              <ul style={{ margin: 0, paddingLeft: '8mm', listStyleType: 'disc' }}>
                {uniqueProducts.map((p) => (
                  <li key={p.label} style={{ marginBottom: '1.5mm', lineHeight: '1.6' }}>
                    {p.name} ({p.label})
                  </li>
                ))}
              </ul>
            </div>

            {/* Cross-reference table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '8mm' }}>
              <thead>
                <tr>
                  <th style={{
                    border: '1px solid #999',
                    padding: '2.5mm 4mm',
                    textAlign: 'center',
                    backgroundColor: BLUE,
                    color: 'white',
                    fontWeight: 'bold',
                  }}>
                    หน่วยงาน
                  </th>
                  {uniqueProducts.map((p) => (
                    <th key={p.label} style={{
                      border: '1px solid #999',
                      padding: '2.5mm 4mm',
                      textAlign: 'center',
                      backgroundColor: BLUE,
                      color: 'white',
                      fontWeight: 'bold',
                      width: `${Math.min(15, 60 / Math.max(uniqueProducts.length, 1))}%`,
                    }}>
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept}>
                    <td style={{ border: '1px solid #999', padding: '2mm 4mm' }}>
                      {dept}
                    </td>
                    {uniqueProducts.map((p) => (
                      <td key={p.label} style={{ border: '1px solid #999', padding: '2mm 4mm', textAlign: 'center' }}>
                        {matrix[dept][p.name] > 0 ? matrix[dept][p.name] : ''}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Empty rows */}
                {Array.from({ length: emptyRowsCount }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td style={{ border: '1px solid #999', padding: '2mm 4mm', height: '7mm' }}>&nbsp;</td>
                    {uniqueProducts.map((p) => (
                      <td key={p.label} style={{ border: '1px solid #999', padding: '2mm 4mm', height: '7mm' }}>&nbsp;</td>
                    ))}
                  </tr>
                ))}
                {/* Totals row */}
                <tr>
                  <td style={{ border: '1px solid #999', padding: '2mm 4mm', fontWeight: 'bold', textAlign: 'right' }}>
                    รวม
                  </td>
                  {uniqueProducts.map((p) => (
                    <td key={p.label} style={{ border: '1px solid #999', padding: '2mm 4mm', textAlign: 'center', fontWeight: 'bold' }}>
                      {totals[p.name] > 0 ? totals[p.name] : ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}
