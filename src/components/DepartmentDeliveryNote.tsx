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

  const BLUE = '#4472C4';
  const MIN_ROWS = 12; // จำนวน row ขั้นต่ำ (เติม row ว่างให้เต็มหน้า)

  // สร้าง label A, B, C ... สำหรับแต่ละสินค้า
  const labeledRecords = records.map((r, i) => ({
    ...r,
    label: String.fromCharCode(65 + i), // A, B, C, ...
  }));

  // เติม row ว่างให้ครบ MIN_ROWS
  const emptyRowsCount = Math.max(0, MIN_ROWS - records.length);

  // Component สำหรับ 1 หน้า A4
  const NotePage = ({ copyType }: { copyType: 'sender' | 'receiver' }) => (
    <div className="print-page bg-white text-black" style={{ fontFamily: "'TH Sarabun New', 'Sarabun', serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: '15mm 20mm', width: '100%', boxSizing: 'border-box' }}>

        {/* Title */}
        <h1 style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', margin: '0 0 6mm 0' }}>
          ใบส่งสินค้าชั่วคราว
        </h1>

        {/* วันที่ส่ง / หน่วยงาน */}
        <div style={{ marginBottom: '6mm', fontSize: '11pt', lineHeight: '2' }}>
          <p style={{ margin: 0 }}>
            วันที่ส่ง {''}
            <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '55mm' }}>&nbsp;</span>
          </p>
          <p style={{ margin: 0 }}>
            หน่วยงาน {''}
            <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '55mm', fontWeight: 'bold' }}>
              {department}
            </span>
          </p>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '6mm' }}>
          <thead>
            <tr>
              <th style={{
                border: '1px solid #999',
                padding: '2.5mm 4mm',
                textAlign: 'left',
                backgroundColor: BLUE,
                color: 'white',
                fontWeight: 'bold',
                width: '70%',
              }}>
                ชื่อสินค้า
              </th>
              <th style={{
                border: '1px solid #999',
                padding: '2.5mm 4mm',
                textAlign: 'left',
                backgroundColor: BLUE,
                color: 'white',
                fontWeight: 'bold',
                width: '30%',
              }}>
                Serial Number
              </th>
            </tr>
          </thead>
          <tbody>
            {labeledRecords.map((record) => (
              <tr key={record.id}>
                <td style={{ border: '1px solid #999', padding: '2mm 4mm', verticalAlign: 'top' }}>
                  {record.label}. {record.productName}
                </td>
                <td style={{ border: '1px solid #999', padding: '2mm 4mm', verticalAlign: 'top' }}>
                  {record.productId}
                </td>
              </tr>
            ))}
            {/* Empty rows */}
            {Array.from({ length: emptyRowsCount }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td style={{ border: '1px solid #999', padding: '2mm 4mm', height: '7mm' }}>&nbsp;</td>
                <td style={{ border: '1px solid #999', padding: '2mm 4mm', height: '7mm' }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15mm', marginTop: '12mm', fontSize: '11pt' }}>
          {/* ผู้รับสินค้า */}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 3mm 0', textAlign: 'center' }}>ผู้รับสินค้า</p>
            <p style={{ margin: '0 0 1mm 0', color: '#666', fontSize: '10pt' }}>
              {copyType === 'receiver' ? department : ''}
            </p>
            <p style={{ margin: '8mm 0 0 0' }}>
              ลายมือชื่อ {''}
              <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '40mm' }}>&nbsp;</span>
            </p>
            <p style={{ margin: '5mm 0 0 0' }}>
              ชื่อ {''}
              <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '45mm' }}>&nbsp;</span>
            </p>
            <p style={{ margin: '5mm 0 0 0' }}>
              วันที่ {''}
              <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '45mm' }}>&nbsp;</span>
            </p>
          </div>

          {/* ผู้ส่งสินค้า */}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 3mm 0', textAlign: 'center' }}>ผู้ส่งสินค้า</p>
            <p style={{ margin: '0 0 1mm 0', color: '#666', fontSize: '10pt' }}>&nbsp;</p>
            <p style={{ margin: '8mm 0 0 0' }}>
              ลายมือชื่อ {''}
              <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '40mm' }}>&nbsp;</span>
            </p>
            <p style={{ margin: '5mm 0 0 0' }}>
              ชื่อ {''}
              <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '45mm' }}>&nbsp;</span>
            </p>
            <p style={{ margin: '5mm 0 0 0' }}>
              วันที่ {''}
              <span style={{ borderBottom: '1px dotted #333', display: 'inline-block', width: '45mm' }}>&nbsp;</span>
            </p>
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
        <NotePage copyType="sender" />
        <NotePage copyType="receiver" />
      </div>
    </div>
  );
}
