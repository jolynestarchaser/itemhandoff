'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HandoffRecord } from '@prisma/client';
import { departments as deptDict } from '@/lib/departments';
import ExportButton from '@/components/ExportButton';
import AllDepartmentsSummaryNote from '@/components/AllDepartmentsSummaryNote';

interface SummaryDocManagerProps {
  records: HandoffRecord[];
}

interface DeptDateItem {
  key: string;
  deptKey: string;
  deptNameTh: string;
  deptNameEn: string;
  dateStr: string;
  displayDateTh: string;
  records: HandoffRecord[];
  countA: number;
  countB: number;
  countC: number;
  countOther: number;
  totalCount: number;
  productSummary: Record<string, string[]>;
}

export default function SummaryDocManager({ records }: SummaryDocManagerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatDateStr = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Group records into itemized delivery units (by Date and Department)
  const { deliveryItems, uniqueDates } = useMemo(() => {
    const map: Record<string, DeptDateItem> = {};
    const dateSet = new Set<string>();

    records.forEach((r) => {
      const dStr = formatDateStr(r.handoffDate || r.createdAt);
      dateSet.add(dStr);

      const itemKey = `${dStr}_${r.department}`;
      if (!map[itemKey]) {
        const foundDept = deptDict.find((d) => d.key === r.department);
        const displayDateTh = new Date(dStr).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        map[itemKey] = {
          key: itemKey,
          deptKey: r.department,
          deptNameTh: foundDept?.nameTh || r.department,
          deptNameEn: foundDept?.nameEn || r.department,
          dateStr: dStr,
          displayDateTh,
          records: [],
          countA: 0,
          countB: 0,
          countC: 0,
          countOther: 0,
          totalCount: 0,
          productSummary: {},
        };
      }

      const item = map[itemKey];
      item.records.push(r);
      item.totalCount++;

      const pid = (r.productId || '').toUpperCase();
      if (pid.startsWith('A')) item.countA++;
      else if (pid.startsWith('B')) item.countB++;
      else if (pid.startsWith('C')) item.countC++;
      else item.countOther++;

      if (!item.productSummary[r.productName]) {
        item.productSummary[r.productName] = [];
      }
      item.productSummary[r.productName].push(r.productId);
    });

    const items = Object.values(map).sort((a, b) => {
      // Sort by Date descending, then department name
      if (a.dateStr !== b.dateStr) {
        return b.dateStr.localeCompare(a.dateStr);
      }
      return a.deptNameTh.localeCompare(b.deptNameTh, 'th');
    });

    const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));

    return { deliveryItems: items, uniqueDates: dates };
  }, [records]);

  // Filter items based on selected date & search query
  const filteredItems = useMemo(() => {
    return deliveryItems.filter((item) => {
      if (selectedDate !== 'all' && item.dateStr !== selectedDate) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDept = item.deptNameTh.toLowerCase().includes(q) || item.deptNameEn.toLowerCase().includes(q);
        const matchProduct = item.records.some(
          (r) => r.productId.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q)
        );
        return matchDept || matchProduct;
      }

      return true;
    });
  }, [deliveryItems, selectedDate, searchQuery]);

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="text-white pb-20">
      {/* On-screen UI — Hidden during printing */}
      <div className="no-print space-y-6">
        {/* Back Link & Page Title */}
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors mb-3">
            <span>&larr;</span>
            <span>กลับหน้าหลัก (Home)</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F58220]/15 border border-[#F58220]/30 text-[#F58220] text-xs font-semibold mb-1">
                <span>📄</span>
                <span>Delivery Documents & Manifests</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                รายการเอกสารส่งมอบสินค้า
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                จัดกลุ่มแยกเป็นรายการตามแผนกและวันที่ เพื่อให้ตรวจสอบและสั่งพิมพ์ได้สะดวกรวดเร็ว
              </p>
            </div>

            {/* Global Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintAll}
                className="px-4 py-2.5 bg-[#F58220] hover:bg-[#d9721a] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#F58220]/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                <span>พิมพ์เอกสารทั้งหมด (A4)</span>
              </button>

              <ExportButton records={records} />
            </div>
          </div>
        </div>

        {/* Date Filter & Fast Links */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <span className="text-xs text-gray-400 font-semibold mr-1">กรองตามวันที่:</span>
          <button
            onClick={() => setSelectedDate('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDate === 'all'
                ? 'bg-[#F58220] text-white shadow-md shadow-[#F58220]/20'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            ทั้งหมด ({deliveryItems.length} รายการ)
          </button>
          {uniqueDates.map((dStr) => {
            const countForDate = deliveryItems.filter((i) => i.dateStr === dStr).length;
            const dateLabelTh = new Date(dStr).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: '2-digit',
            });
            const isSelected = selectedDate === dStr;

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#F58220] text-white shadow-md shadow-[#F58220]/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                }`}
              >
                <span>📅 {dateLabelTh}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-gray-300 font-mono">
                  {countForDate}
                </span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/summary/day18-only"
              className="text-xs text-[#F58220] hover:underline flex items-center gap-1"
            >
              <span>🖨️ ใบส่งมอบ 18 ส.ค.</span>
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/summary/day15-only"
              className="text-xs text-[#F58220] hover:underline flex items-center gap-1"
            >
              <span>🖨️ ใบส่งมอบ 15 ก.ค.</span>
            </Link>
          </div>
        </div>

        {/* Search & List Controls */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-8 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F58220] transition-colors"
              placeholder="ค้นหาแผนก หรือรหัสรถ (A073, C085)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-3 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">
              พบ {filteredItems.length} รายการชุดส่งมอบ ({filteredItems.reduce((sum, it) => sum + it.totalCount, 0)} คัน)
            </span>
          </div>
        </div>

        {/* Itemized Delivery Manifest List - Showing Serial Numbers Directly */}
        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              return (
                <div
                  key={item.key}
                  className="border rounded-2xl bg-white/5 hover:bg-white/8 border-white/10 p-4 transition-all duration-200 shadow-lg shadow-black/20"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xs font-mono text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white text-base">
                            แผนก {item.deptNameTh}
                          </h3>
                          <span className="text-xs text-gray-400 font-normal">
                            ({item.deptNameEn})
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-black/40 text-[#F58220] border border-[#F58220]/30 text-xs font-mono font-semibold">
                            📅 {item.displayDateTh}
                          </span>
                        </div>

                        {/* Breakdown Badges */}
                        <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                          <span className="text-emerald-400 font-bold">
                            ยอดส่งมอบ {item.totalCount} คัน
                          </span>
                          <span className="text-gray-600">•</span>
                          {item.countA > 0 && <span className="text-blue-300 font-semibold">A: {item.countA}</span>}
                          {item.countB > 0 && <span className="text-emerald-300 font-semibold">B: {item.countB}</span>}
                          {item.countC > 0 && <span className="text-purple-300 font-semibold">C: {item.countC}</span>}
                          {item.countOther > 0 && <span className="text-gray-300 font-semibold">+{item.countOther}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Quick Card Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <Link
                        href={`/department/${encodeURIComponent(item.deptKey)}`}
                        className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#F58220] hover:bg-[#d9721a] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#F58220]/20"
                        title="พิมพ์ใบส่งมอบเฉพาะแผนกนี้"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        <span>พิมพ์ใบส่งมอบ A4</span>
                      </Link>

                      <Link
                        href={`/department/${encodeURIComponent(item.deptKey)}`}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                        title="ไปยังหน้ารายละเอียดแผนก"
                      >
                        <span>จัดการ</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  </div>

                  {/* Serial Numbers Section (โชว์ Serial Number ทันที) */}
                  <div className="mt-3 space-y-2">
                    {Object.entries(item.productSummary).map(([pName, serials]) => (
                      <div
                        key={pName}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <span className="w-2 h-2 rounded-full bg-[#F58220]" />
                          <span className="text-xs font-bold text-white">{pName}</span>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {serials.length} คัน
                          </span>
                        </div>

                        {/* List of Serial Numbers Badges */}
                        <div className="flex flex-wrap gap-1.5 flex-1 justify-start md:justify-end">
                          {serials.map((sn) => (
                            <span
                              key={sn}
                              className="px-2.5 py-1 rounded-lg bg-[#F58220]/20 text-[#F58220] border border-[#F58220]/30 font-mono font-black text-xs shadow-xs tracking-wide hover:scale-105 transition-transform"
                            >
                              {sn}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-white/10 rounded-2xl bg-white/5">
            <p className="text-gray-400 text-base">ไม่พบรายการเอกสารส่งมอบตามเงื่อนไขการค้นหา</p>
            <button
              onClick={() => { setSelectedDate('all'); setSearchQuery(''); }}
              className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-all"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Print Document Section (แสดงเฉพาะเวลาสั่งพิมพ์) */}
      <div className="hidden print:block">
        <AllDepartmentsSummaryNote records={records} />
      </div>
    </div>
  );
}
