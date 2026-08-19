'use client';

import React, { useState, useMemo } from 'react';
import { HandoffRecord } from '@prisma/client';
import { departments as deptDict, departmentCategories, DepartmentCategory } from '@/lib/departments';
import Link from 'next/link';

interface PrintHubManagerProps {
  records: HandoffRecord[];
}

export default function PrintHubManager({ records }: PrintHubManagerProps) {
  // Document Type Mode
  const [docType, setDocType] = useState<'dept_delivery' | 'summary_matrix' | 'daily_batch' | 'single_slip'>('dept_delivery');

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedProductType, setSelectedProductType] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Single slip state
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');

  const handlePrint = () => {
    window.print();
  };

  const formatDateStr = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Extract all unique dates from records
  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      set.add(formatDateStr(r.handoffDate || r.createdAt));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [records]);

  // Filter records based on active controls
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const dStr = formatDateStr(r.handoffDate || r.createdAt);
      if (selectedDate !== 'all' && dStr !== selectedDate) return false;

      if (selectedDept !== 'all' && r.department !== selectedDept) return false;

      if (selectedCategory !== 'all') {
        const deptObj = deptDict.find(d => d.key === r.department);
        if (!deptObj || deptObj.category !== selectedCategory) return false;
      }

      if (selectedProductType !== 'all') {
        const prefix = (r.productId || '')[0];
        if (prefix !== selectedProductType) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const deptObj = deptDict.find(d => d.key === r.department);
        const deptName = deptObj ? deptObj.nameTh.toLowerCase() : r.department.toLowerCase();
        const prod = (r.productName || '').toLowerCase();
        const code = (r.productId || '').toLowerCase();
        if (!deptName.includes(query) && !prod.includes(query) && !code.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [records, selectedDate, selectedDept, selectedCategory, selectedProductType, searchQuery]);

  // Group filtered records by Department
  const deptGrouped = useMemo(() => {
    const map: Record<string, HandoffRecord[]> = {};
    filteredRecords.forEach(r => {
      if (!map[r.department]) map[r.department] = [];
      map[r.department].push(r);
    });

    const list: { key: string; nameTh: string; records: HandoffRecord[] }[] = [];
    Object.keys(map).forEach(key => {
      const nameTh = deptDict.find(d => d.key === key)?.nameTh || key;
      list.push({ key, nameTh, records: map[key] });
    });

    return list.sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'));
  }, [filteredRecords]);

  // Unique products for Summary Matrix
  const uniqueProducts = [
    { label: 'A', name: 'รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)', shortName: 'APIX Round A' },
    { label: 'B', name: 'รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)', shortName: 'APIX RX B' },
    { label: 'C', name: 'รถเข็นคอมพิวเตอร์ All-in-one สำหรับงานเจาะเลือด (Phlebotomy Computer Cart)', shortName: 'APIX Flow C' },
  ];

  // Estimated Page Count calculation
  const estimatedPages = useMemo(() => {
    if (docType === 'dept_delivery') return deptGrouped.length * 2; // ต้นฉบับ + สำเนา
    if (docType === 'summary_matrix') return 1;
    if (docType === 'daily_batch') return deptGrouped.length * 2;
    if (docType === 'single_slip') return 2;
    return 1;
  }, [docType, deptGrouped]);

  return (
    <div>
      {/* Standard Original Print & Document CSS without any shadows */}
      <style dangerouslySetInnerHTML={{ __html: `
        .document-style {
          font-size: 16px; /* Base size สำหรับ 1rem */
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

      {/* Control Panel (Hidden during print) */}
      <div className="no-print max-w-5xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#F58220]/20 text-[#F58220] border border-[#F58220]/30 text-xs font-semibold">
                🖨️ Print Hub
              </span>
              <span className="text-xs text-gray-400">ศูนย์รวมเอกสารการพิมพ์</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ศูนย์รวม <span className="text-[#F58220]">การพิมพ์เอกสารทั้งหมด</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              เลือกแบบฟอร์ม กรองข้อมูลแผนก/วันที่ และสั่งพิมพ์เอกสารมาตรฐานโรงพยาบาลได้ในคลิกเดียว
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/template-builder"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <span>✨</span>
              <span>สร้าง Template PDF เอง</span>
            </Link>

            <button
              onClick={handlePrint}
              disabled={filteredRecords.length === 0}
              className="px-6 py-2.5 bg-[#F58220] hover:bg-[#d9721a] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#F58220]/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
              </svg>
              <span>สั่งพิมพ์ ({estimatedPages} หน้า)</span>
            </button>
          </div>
        </div>

        {/* 1. Document Type Switcher (Cards) */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            1. เลือกรูปแบบเอกสารที่ต้องการพิมพ์:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Type 1: Department Delivery Note */}
            <div
              onClick={() => setDocType('dept_delivery')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                docType === 'dept_delivery'
                  ? 'bg-[#F58220]/20 border-[#F58220] shadow-lg shadow-[#F58220]/20 scale-102'
                  : 'bg-black/50 border-white/10 hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📄</span>
                  <h3 className="text-sm font-bold text-white">ใบส่งสินค้าแยกแผนก</h3>
                </div>
                <p className="text-xs text-gray-400">
                  ใบส่งสินค้าชั่วคราว 2 หน้า (ต้นฉบับ + สำเนา) แยกรายแผนก
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-[#F58220] font-semibold">{deptGrouped.length} แผนก</span>
                <span className="text-gray-400">{deptGrouped.length * 2} หน้า A4</span>
              </div>
            </div>

            {/* Type 2: Summary Matrix Report */}
            <div
              onClick={() => setDocType('summary_matrix')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                docType === 'summary_matrix'
                  ? 'bg-[#F58220]/20 border-[#F58220] shadow-lg shadow-[#F58220]/20 scale-102'
                  : 'bg-black/50 border-white/10 hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📊</span>
                  <h3 className="text-sm font-bold text-white">ใบสรุปภาพรวม Matrix</h3>
                </div>
                <p className="text-xs text-gray-400">
                  ตารางเมทริกซ์รวมทุกแผนก แยกคอลัมน์ A, B, C ตามข้อตกลงสัญญา
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-[#F58220] font-semibold">สรุปทุกแผนก</span>
                <span className="text-gray-400">1 หน้า A4</span>
              </div>
            </div>

            {/* Type 3: Daily Batch Notes */}
            <div
              onClick={() => setDocType('daily_batch')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                docType === 'daily_batch'
                  ? 'bg-[#F58220]/20 border-[#F58220] shadow-lg shadow-[#F58220]/20 scale-102'
                  : 'bg-black/50 border-white/10 hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📅</span>
                  <h3 className="text-sm font-bold text-white">เอกสารแยกตามวันที่</h3>
                </div>
                <p className="text-xs text-gray-400">
                  รวมใบส่งมอบของวันที่ระบุ (เช่น 15, 18, 19 ส.ค.) พร้อมสำเนา
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-[#F58220] font-semibold">{uniqueDates.length} วันที่มีการส่ง</span>
                <span className="text-gray-400">แยกตามวันที่</span>
              </div>
            </div>

            {/* Type 4: Single Item Slip */}
            <div
              onClick={() => setDocType('single_slip')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                docType === 'single_slip'
                  ? 'bg-[#F58220]/20 border-[#F58220] shadow-lg shadow-[#F58220]/20 scale-102'
                  : 'bg-black/50 border-white/10 hover:bg-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🏷️</span>
                  <h3 className="text-sm font-bold text-white">สลิปส่งมอบรายคัน</h3>
                </div>
                <p className="text-xs text-gray-400">
                  พิมพ์สลิปส่งมอบแยกเป็นรายคันเดี่ยวๆ พร้อมข้อมูล QR Code
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-[#F58220] font-semibold">รายคันเฉพาะ</span>
                <span className="text-gray-400">2 หน้า / คัน</span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Filter Controls Bar */}
        <div className="p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              2. ตัวกรองข้อมูล (Filters):
            </span>
            <button
              onClick={() => {
                setSelectedDept('all');
                setSelectedCategory('all');
                setSelectedDate('all');
                setSelectedProductType('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#F58220] hover:underline"
            >
              รีเซ็ตตัวกรองทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* Filter by Date */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">📅 เลือกวันที่:</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
              >
                <option value="all">ทุกวันที่ (ทั้งหมด {records.length} รายการ)</option>
                {uniqueDates.map(dStr => {
                  const displayDate = new Date(dStr).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <option key={dStr} value={dStr}>
                      วันที่ {displayDate} ({records.filter(r => formatDateStr(r.handoffDate || r.createdAt) === dStr).length} คัน)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter by Department */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">🏥 เลือกแผนก:</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-black/90 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
              >
                <option value="all">ทุกแผนก ({deptGrouped.length} แผนก)</option>
                {deptDict.map(d => (
                  <option key={d.key} value={d.key}>{d.nameTh}</option>
                ))}
              </select>
            </div>

            {/* Filter by Category */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">🏷️ กลุ่มแผนก:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/90 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
              >
                <option value="all">ทุกกลุ่มแผนก</option>
                <option value="ward">หอผู้ป่วยใน (IPD)</option>
                <option value="opd">ผู้ป่วยนอก (OPD)</option>
                <option value="icu">หอวิกฤต (ICU / CCU)</option>
                <option value="or_procedure">ผ่าตัด / หัตถการ</option>
                <option value="specialized">เฉพาะทาง / แม่และเด็ก</option>
                <option value="support">สนับสนุน / สำนักงาน</option>
              </select>
            </div>

            {/* Filter by Product Type */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">🚗 ประเภทรถเข็น:</label>
              <select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value as any)}
                className="w-full bg-black/90 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
              >
                <option value="all">ทั้งหมด (A, B, C)</option>
                <option value="A">รหัส A: APIX Round A (รถ Notebook)</option>
                <option value="B">รหัส B: APIX RX B (รถจัดยา 20 ช่อง)</option>
                <option value="C">รหัส C: APIX Flow C (รถ Treatment เจาะเลือด)</option>
              </select>
            </div>

          </div>

          {/* Quick Search */}
          <div className="pt-2 border-t border-white/5 flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ค้นหาด้วยชื่อแผนก หรือ รหัสรถ (เช่น SICU, B015, A001)..."
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F58220]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 bg-white/10 text-gray-300 text-xs rounded-xl"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        </div>

        {/* 3. Summary Stats Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#F58220]/15 via-black/40 to-blue-500/15 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-400">พบข้อมูล:</span>
              <span className="font-bold text-[#F58220] text-sm">{filteredRecords.length}</span>
              <span>คัน</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-400">จำนวนแผนก:</span>
              <span className="font-bold text-white text-sm">{deptGrouped.length}</span>
              <span>แผนก</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-400">หน้ากระดาษ A4:</span>
              <span className="font-bold text-emerald-400 text-sm">{estimatedPages}</span>
              <span>หน้า</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <span>💡 ทิป: สามารถกดปุ่มสั่งพิมพ์เพื่อบันทึกเป็นไฟล์ PDF ได้โดยตรงจาก Browser</span>
          </div>
        </div>

      </div>

      {/* 4. Documents Print Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        
        {filteredRecords.length === 0 ? (
          <div className="no-print p-12 text-center border border-white/10 rounded-2xl bg-white/5 space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-white">ไม่พบรายการเอกสารตามเงื่อนไขที่เลือก</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              ลองปรับเปลี่ยนตัวกรองวันที่ แผนก หรือคำค้นหา เพื่อแสดงเอกสารที่ต้องการ
            </p>
          </div>
        ) : (
          <div>
            {/* VIEW 1: Department Delivery Notes (2 Pages per Dept: Original + Copy) */}
            {docType === 'dept_delivery' && (
              <div>
                {deptGrouped.map((deptItem) => {
                  const groupedByProduct: Record<string, string[]> = {};
                  deptItem.records.forEach(r => {
                    if (!groupedByProduct[r.productName]) groupedByProduct[r.productName] = [];
                    groupedByProduct[r.productName].push(r.productId);
                  });

                  const sampleDate = deptItem.records[0]?.handoffDate || deptItem.records[0]?.createdAt || new Date();
                  const formattedDate = new Date(sampleDate).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  const renderSlip = (copyLabel: string) => (
                    <div key={`${deptItem.key}-${copyLabel}`} className="document-style">
                      <div className="copy-label">{copyLabel}</div>
                      <h1>ใบส่งสินค้าชั่วคราว</h1>
                      
                      <div className="header-info">
                        <div className="info-row">
                          <div className="info-label">วันที่ส่ง</div>
                          <div className="info-dots">{formattedDate}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">แผนก</div>
                          <div className="info-dots">{deptItem.nameTh}</div>
                        </div>
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th style={{ width: '55%' }}>ชื่อสินค้า</th>
                            <th style={{ width: '30%' }}>Serial Number</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>จำนวน</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(groupedByProduct).map(([prodName, serials]) => (
                            <tr key={prodName}>
                              <td>{prodName}</td>
                              <td>{serials.join(', ')}</td>
                              <td style={{ textAlign: 'center' }}>{serials.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="signature-area">
                        <div className="signature-box">
                          <div className="signature-title">ผู้รับสินค้า</div>
                          <div>โรงพยาบาลวชิระภูเก็ต</div>
                          <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
                          <div className="signature-line"></div>
                          <div>ชื่อ</div>
                          <div className="signature-line"></div>
                        </div>

                        <div className="signature-box">
                          <div className="signature-title">ผู้ส่งสินค้า</div>
                          <div>บริษัท แอพพิกซ์ อินโนเวชั่น จำกัด</div>
                          <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
                          <div className="signature-line"></div>
                          <div>ชื่อ</div>
                          <div className="signature-line"></div>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div key={deptItem.key} className="mb-8">
                      {renderSlip('ต้นฉบับ')}
                      {renderSlip('สำเนา')}
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: Summary Matrix Report */}
            {docType === 'summary_matrix' && (() => {
              const allDepts = Array.from(new Set(filteredRecords.map(r => r.department))).sort();
              
              const matrix: Record<string, Record<string, number>> = {};
              allDepts.forEach(dept => {
                matrix[dept] = { A: 0, B: 0, C: 0 };
              });

              filteredRecords.forEach(r => {
                const prefix = (r.productId || '')[0];
                if (matrix[r.department] && matrix[r.department][prefix] !== undefined) {
                  matrix[r.department][prefix]++;
                }
              });

              const totals = { A: 0, B: 0, C: 0 };
              allDepts.forEach(dept => {
                totals.A += matrix[dept].A;
                totals.B += matrix[dept].B;
                totals.C += matrix[dept].C;
              });

              return (
                <div className="document-style">
                  <h1>ใบสรุปรายการส่งมอบ (Summary Delivery Note)</h1>
                  <p className="contract-no">สัญญาเลขที่ วภ 104/2569 | โรงพยาบาลวชิระภูเก็ต</p>

                  <table>
                    <thead>
                      <tr>
                        <th>ชื่อแผนก</th>
                        <th style={{ textAlign: 'center' }}>
                          A<br /><span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>(APIX Round A)</span>
                        </th>
                        <th style={{ textAlign: 'center' }}>
                          B<br /><span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>(APIX RX B)</span>
                        </th>
                        <th style={{ textAlign: 'center' }}>
                          C<br /><span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>(APIX Flow C)</span>
                        </th>
                        <th style={{ textAlign: 'center', backgroundColor: '#eee' }}>รวม (คัน)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDepts.map(deptKey => {
                        const thaiName = deptDict.find(d => d.key === deptKey)?.nameTh || deptKey;
                        const rowTotal = matrix[deptKey].A + matrix[deptKey].B + matrix[deptKey].C;
                        return (
                          <tr key={deptKey}>
                            <td>{thaiName}</td>
                            <td style={{ textAlign: 'center' }}>{matrix[deptKey].A > 0 ? matrix[deptKey].A : '-'}</td>
                            <td style={{ textAlign: 'center' }}>{matrix[deptKey].B > 0 ? matrix[deptKey].B : '-'}</td>
                            <td style={{ textAlign: 'center' }}>{matrix[deptKey].C > 0 ? matrix[deptKey].C : '-'}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rowTotal}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                        <td style={{ textAlign: 'right' }}>รวมทั้งหมด ({allDepts.length} แผนก):</td>
                        <td style={{ textAlign: 'center' }}>{totals.A}</td>
                        <td style={{ textAlign: 'center' }}>{totals.B}</td>
                        <td style={{ textAlign: 'center' }}>{totals.C}</td>
                        <td style={{ textAlign: 'center', color: '#F58220' }}>{totals.A + totals.B + totals.C}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="legend-area">
                    <strong>คำอธิบายรายละเอียดสินค้ารายการ A, B, C:</strong>
                    <ul>
                      {uniqueProducts.map((p) => (
                        <li key={p.label}>
                          <strong>{p.label} ({p.shortName}):</strong> {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* VIEW 3: Daily Batch Notes */}
            {docType === 'daily_batch' && (
              <div>
                {uniqueDates.map(dateStr => {
                  const dayRecords = filteredRecords.filter(r => formatDateStr(r.handoffDate || r.createdAt) === dateStr);
                  if (dayRecords.length === 0) return null;

                  const displayDate = new Date(dateStr).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <div key={dateStr} className="mb-12">
                      <div className="no-print bg-[#F58220]/20 border border-[#F58220]/30 rounded-xl p-3 mb-4 text-[#F58220] font-bold text-sm">
                        📅 ชุดเอกสารประจำวันที่ {displayDate} (พบ {dayRecords.length} คัน)
                      </div>

                      {(() => {
                        const dayDepts: Record<string, HandoffRecord[]> = {};
                        dayRecords.forEach(r => {
                          if (!dayDepts[r.department]) dayDepts[r.department] = [];
                          dayDepts[r.department].push(r);
                        });

                        return Object.keys(dayDepts).map(deptKey => {
                          const thaiName = deptDict.find(d => d.key === deptKey)?.nameTh || deptKey;
                          const recs = dayDepts[deptKey];
                          const groupedByProduct: Record<string, string[]> = {};
                          recs.forEach(r => {
                            if (!groupedByProduct[r.productName]) groupedByProduct[r.productName] = [];
                            groupedByProduct[r.productName].push(r.productId);
                          });

                          return (
                            <div key={deptKey} className="document-style mb-6">
                              <div className="copy-label">ต้นฉบับ</div>
                              <h1>ใบส่งสินค้าชั่วคราว</h1>
                              <div className="header-info">
                                <div className="info-row">
                                  <div className="info-label">วันที่ส่ง</div>
                                  <div className="info-dots">{displayDate}</div>
                                </div>
                                <div className="info-row">
                                  <div className="info-label">แผนก</div>
                                  <div className="info-dots">{thaiName}</div>
                                </div>
                              </div>
                              <table>
                                <thead>
                                  <tr>
                                    <th style={{ width: '55%' }}>ชื่อสินค้า</th>
                                    <th style={{ width: '30%' }}>Serial Number</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>จำนวน</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(groupedByProduct).map(([pName, serials]) => (
                                    <tr key={pName}>
                                      <td>{pName}</td>
                                      <td>{serials.join(', ')}</td>
                                      <td style={{ textAlign: 'center' }}>{serials.length}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="signature-area">
                                <div className="signature-box">
                                  <div className="signature-title">ผู้รับสินค้า</div>
                                  <div>โรงพยาบาลวชิระภูเก็ต</div>
                                  <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
                                  <div className="signature-line"></div>
                                  <div>ชื่อ</div>
                                  <div className="signature-line"></div>
                                </div>
                                <div className="signature-box">
                                  <div className="signature-title">ผู้ส่งสินค้า</div>
                                  <div>บริษัท แอพพิกซ์ อินโนเวชั่น จำกัด</div>
                                  <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
                                  <div className="signature-line"></div>
                                  <div>ชื่อ</div>
                                  <div className="signature-line"></div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 4: Single Slip */}
            {docType === 'single_slip' && (() => {
              const targetRecord = filteredRecords.find(r => r.id === selectedRecordId) || filteredRecords[0];
              if (!targetRecord) return null;

              const thaiName = deptDict.find(d => d.key === targetRecord.department)?.nameTh || targetRecord.department;
              const dateFormatted = new Date(targetRecord.handoffDate || targetRecord.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div>
                  <div className="no-print mb-4 p-4 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
                    <label className="text-xs font-semibold text-gray-300">เลือกรถที่ต้องการพิมพ์สลิป:</label>
                    <select
                      value={selectedRecordId || targetRecord.id}
                      onChange={(e) => setSelectedRecordId(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F58220]"
                    >
                      {filteredRecords.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.productId} - {r.productName} ({deptDict.find(d => d.key === r.department)?.nameTh || r.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="document-style">
                    <div className="copy-label">สลิปส่งมอบรายคัน</div>
                    <h1>ใบส่งมอบอุปกรณ์รายชิ้น</h1>
                    <div className="header-info">
                      <div className="info-row">
                        <div className="info-label">แผนกที่รับมอบ</div>
                        <div className="info-dots">{thaiName}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">วันที่</div>
                        <div className="info-dots">{dateFormatted}</div>
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>รายการ</th>
                          <th>Serial Number</th>
                          <th>QR Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{targetRecord.productName}</td>
                          <td style={{ fontWeight: 'bold' }}>{targetRecord.productId}</td>
                          <td style={{ fontSize: '0.85em' }}>{targetRecord.qrData}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="signature-area">
                      <div className="signature-box">
                        <div className="signature-title">ผู้รับมอบ</div>
                        <div>โรงพยาบาลวชิระภูเก็ต</div>
                        <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
                        <div className="signature-line"></div>
                        <div>ชื่อ</div>
                        <div className="signature-line"></div>
                      </div>
                      <div className="signature-box">
                        <div className="signature-title">ผู้ส่งมอบ</div>
                        <div>บริษัท แอพพิกซ์ อินโนเวชั่น จำกัด</div>
                        <div style={{ marginTop: '1rem' }}>ลายมือชื่อ</div>
                        <div className="signature-line"></div>
                        <div>ชื่อ</div>
                        <div className="signature-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
