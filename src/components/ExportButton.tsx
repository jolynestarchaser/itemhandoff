'use client';

import { useState } from 'react';
import { HandoffRecord } from '@prisma/client';
import { departments as deptDict } from '@/lib/departments';

interface ExportButtonProps {
  records: HandoffRecord[];
}

export default function ExportButton({ records }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // Dynamic import to drastically reduce initial page bundle size
      const XLSX = await import('xlsx');

      // 1. แปลงรูปแบบข้อมูลเตรียมสำหรับนำออกเป็น Excel
      const formattedData = records.map(r => ({
        'Record ID': r.id,
        'Product Name': r.productName,
        'Product ID': r.productId,
        'QR Data': r.qrData,
        'Department': deptDict.find(d => d.key === r.department)?.nameTh || r.department,
        'Date & Time': new Date(r.createdAt).toLocaleString('th-TH')
      }));

      // 2. สร้างหน้าชีต (worksheet) จากข้อมูล JSON
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // 3. สร้างสมุดงาน (workbook) และเพิ่มชีตลงไป
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Handoff Records');

      // 4. สร้างไฟล์ Excel และสั่งให้ดาวน์โหลด โดยตั้งชื่อไฟล์ตามวันที่ปัจจุบัน
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `handoff_records_${dateStr}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      aria-label="ส่งออกข้อมูลเป็นไฟล์ Excel"
      className="btn-secondary flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <svg className="animate-spin h-4 w-4 text-[#2DD4BF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>กำลังส่งออก...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          <span>Export to Excel</span>
        </>
      )}
    </button>
  );
}
