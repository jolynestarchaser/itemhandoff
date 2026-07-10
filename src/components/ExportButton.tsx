'use client';

import * as XLSX from 'xlsx';
import { HandoffRecord } from '@prisma/client';

interface ExportButtonProps {
  records: HandoffRecord[];
}

export default function ExportButton({ records }: ExportButtonProps) {
  const handleExport = () => {
    // 1. แปลงรูปแบบข้อมูลเตรียมสำหรับนำออกเป็น Excel
    const formattedData = records.map(r => ({
      'Record ID': r.id,
      'Product Name': r.productName,
      'Product ID': r.productId,
      'QR Data': r.qrData,
      'Department': r.department,
      'Date & Time': new Date(r.createdAt).toLocaleString()
    }));

    // 2. สร้างหน้าชีต (worksheet) จากข้อมูล JSON
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // 3. สร้างสมุดงาน (workbook) และเพิ่มชีตลงไป
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Handoff Records');

    // 4. สร้างไฟล์ Excel และสั่งให้ดาวน์โหลด โดยตั้งชื่อไฟล์ตามวันที่ปัจจุบัน
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `handoff_records_${dateStr}.xlsx`);
  };

  return (
    <button 
      onClick={handleExport}
      className="btn-secondary flex items-center gap-2 text-sm cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Export to Excel
    </button>
  );
}
