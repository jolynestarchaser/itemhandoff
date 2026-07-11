'use client';

import { HandoffRecord } from '@prisma/client';

interface AllDepartmentsSummaryNoteProps {
  records: HandoffRecord[];
}

export default function AllDepartmentsSummaryNote({ records }: AllDepartmentsSummaryNoteProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // จัดกลุ่ม records ตามแผนก
  const groupedByDept: Record<string, HandoffRecord[]> = {};
  records.forEach((record) => {
    if (!groupedByDept[record.department]) {
      groupedByDept[record.department] = [];
    }
    groupedByDept[record.department].push(record);
  });

  const departments = Object.keys(groupedByDept).sort();

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

      {/* หน้าพิมพ์ — ตัดหน้าอัตโนมัติ */}
      <div className="print-only">
        <div className="print-auto-page" style={{ fontFamily: 'serif' }}>
          <div style={{ padding: '15mm' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
              <div>
                <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
                  สรุปเอกสารส่งมอบสินค้าทั้งหมด
                </h1>
                <p style={{ fontSize: '9pt', color: '#666', margin: '2mm 0 0 0' }}>
                  Inventory Handoff System
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '9pt', color: '#666', margin: 0 }}>{formattedDate}</p>
                <p style={{ fontSize: '9pt', color: '#666', margin: '1mm 0 0 0' }}>
                  รวม {records.length} รายการ / {departments.length} แผนก
                </p>
              </div>
            </div>

            {/* Table ตามแผนก */}
            {departments.map((dept) => (
              <div key={dept} style={{ marginBottom: '8mm', pageBreakInside: 'avoid' }}>
                {/* Department header */}
                <div style={{ backgroundColor: '#e8e8e8', padding: '3mm 5mm', borderRadius: '1mm', marginBottom: '2mm' }}>
                  <h2 style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#333' }}>
                    แผนก {dept}
                    <span style={{ fontSize: '9pt', fontWeight: 'normal', color: '#666', marginLeft: '4mm' }}>
                      ({groupedByDept[dept].length} รายการ)
                    </span>
                  </h2>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #333', padding: '2mm 3mm', textAlign: 'center', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '8%' }}>
                        #
                      </th>
                      <th style={{ border: '1px solid #333', padding: '2mm 3mm', textAlign: 'left', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '45%' }}>
                        ชื่อสินค้า
                      </th>
                      <th style={{ border: '1px solid #333', padding: '2mm 3mm', textAlign: 'center', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '20%' }}>
                        รหัสสินค้า
                      </th>
                      <th style={{ border: '1px solid #333', padding: '2mm 3mm', textAlign: 'center', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '27%' }}>
                        วันที่บันทึก
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDept[dept].map((record, index) => (
                      <tr key={record.id}>
                        <td style={{ border: '1px solid #333', padding: '2mm 3mm', textAlign: 'center' }}>
                          {index + 1}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '2mm 3mm' }}>
                          {record.productName}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '2mm 3mm', textAlign: 'center', fontFamily: 'monospace' }}>
                          {record.productId}
                        </td>
                        <td style={{ border: '1px solid #333', padding: '2mm 3mm', textAlign: 'center', fontSize: '9pt' }}>
                          {new Date(record.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {departments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20mm', color: '#999', fontStyle: 'italic', fontSize: '11pt' }}>
                ไม่มีข้อมูลการส่งมอบ
              </div>
            )}

            {/* Signature section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20mm', paddingTop: '15mm', pageBreakInside: 'avoid' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #333', width: '100%', marginBottom: '3mm' }}>&nbsp;</div>
                <p style={{ fontSize: '10pt', fontWeight: 600, margin: 0 }}>ผู้จัดทำเอกสาร</p>
                <p style={{ fontSize: '8pt', color: '#888', marginTop: '1mm' }}>วันที่ ___/___/______</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #333', width: '100%', marginBottom: '3mm' }}>&nbsp;</div>
                <p style={{ fontSize: '10pt', fontWeight: 600, margin: 0 }}>ผู้ตรวจสอบ</p>
                <p style={{ fontSize: '8pt', color: '#888', marginTop: '1mm' }}>วันที่ ___/___/______</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
