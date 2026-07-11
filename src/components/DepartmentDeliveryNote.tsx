'use client';

import { HandoffRecord } from '@prisma/client';

interface DepartmentDeliveryNoteProps {
  department: string;
  records: HandoffRecord[];
}

export default function DepartmentDeliveryNote({ department, records }: DepartmentDeliveryNoteProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Component ย่อยสำหรับ 1 หน้า A4 (1 สำเนา)
  const NotePage = ({ title, copyLabel }: { title: string; copyLabel: string }) => (
    <div className="print-page bg-white text-black" style={{ fontFamily: 'serif' }}>
      <div style={{ padding: '15mm', height: '267mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
          <div>
            <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
              {title}
            </h1>
            <p style={{ fontSize: '9pt', color: '#666', margin: '2mm 0 0 0' }}>
              Inventory Handoff System
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '9pt', fontWeight: 600, color: '#444', margin: 0 }}>{copyLabel}</p>
            <p style={{ fontSize: '9pt', color: '#666', margin: '1mm 0 0 0' }}>{formattedDate}</p>
          </div>
        </div>

        {/* Department info */}
        <div style={{ marginBottom: '6mm', padding: '4mm 6mm', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '2mm' }}>
          <p style={{ fontSize: '9pt', color: '#888', margin: '0 0 1mm 0', textTransform: 'uppercase', fontWeight: 600 }}>แผนกผู้รับมอบ</p>
          <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: 0, color: '#333' }}>{department}</p>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #333', padding: '3mm 4mm', textAlign: 'center', backgroundColor: '#e8e8e8', fontWeight: 'bold', width: '10%' }}>
                ลำดับ
              </th>
              <th style={{ border: '1px solid #333', padding: '3mm 4mm', textAlign: 'left', backgroundColor: '#e8e8e8', fontWeight: 'bold', width: '50%' }}>
                ชื่อสินค้า
              </th>
              <th style={{ border: '1px solid #333', padding: '3mm 4mm', textAlign: 'center', backgroundColor: '#e8e8e8', fontWeight: 'bold', width: '20%' }}>
                รหัสสินค้า
              </th>
              <th style={{ border: '1px solid #333', padding: '3mm 4mm', textAlign: 'center', backgroundColor: '#e8e8e8', fontWeight: 'bold', width: '20%' }}>
                วันที่บันทึก
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record, index) => (
                <tr key={record.id}>
                  <td style={{ border: '1px solid #333', padding: '2mm 4mm', textAlign: 'center' }}>
                    {index + 1}
                  </td>
                  <td style={{ border: '1px solid #333', padding: '2mm 4mm' }}>
                    {record.productName}
                  </td>
                  <td style={{ border: '1px solid #333', padding: '2mm 4mm', textAlign: 'center', fontFamily: 'monospace' }}>
                    {record.productId}
                  </td>
                  <td style={{ border: '1px solid #333', padding: '2mm 4mm', textAlign: 'center', fontSize: '9pt' }}>
                    {new Date(record.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ border: '1px solid #333', padding: '6mm', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                  ไม่มีรายการสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p style={{ fontSize: '9pt', color: '#666', marginTop: '4mm', textAlign: 'right' }}>
          จำนวนรวม: <strong style={{ color: '#333' }}>{records.length}</strong> รายการ
        </p>

        {/* Signature section — pushed to bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', gap: '20mm', paddingTop: '15mm' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #333', width: '100%', marginBottom: '3mm' }}>&nbsp;</div>
            <p style={{ fontSize: '10pt', fontWeight: 600, margin: 0 }}>ผู้ส่งมอบ</p>
            <p style={{ fontSize: '8pt', color: '#888', marginTop: '1mm' }}>วันที่ ___/___/______</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #333', width: '100%', marginBottom: '3mm' }}>&nbsp;</div>
            <p style={{ fontSize: '10pt', fontWeight: 600, margin: 0 }}>ผู้รับมอบ</p>
            <p style={{ fontSize: '8pt', color: '#888', marginTop: '1mm' }}>วันที่ ___/___/______</p>
          </div>
        </div>
      </div>
    </div>
  );

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
          พิมพ์ใบส่งมอบชั่วคราว
        </button>
      </div>

      {/* 2 หน้า A4 แยกกัน */}
      <div className="print-only">
        <NotePage title="ใบส่งมอบสินค้าชั่วคราว" copyLabel="สำเนาผู้ส่ง" />
        <NotePage title="ใบส่งมอบสินค้าชั่วคราว" copyLabel="สำเนาผู้รับ" />
      </div>
    </div>
  );
}
