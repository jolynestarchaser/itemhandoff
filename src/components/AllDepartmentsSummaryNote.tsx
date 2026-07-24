'use client';

import { useState } from 'react';
import { HandoffRecord } from '@prisma/client';
import { departments as deptDict } from '@/lib/departments';

interface AllDepartmentsSummaryNoteProps {
  records: HandoffRecord[];
}

export default function AllDepartmentsSummaryNote({ records }: AllDepartmentsSummaryNoteProps) {
  const [viewMode, setViewMode] = useState<string>('all'); // 'all' หรือ 'YYYY-MM-DD'

  const handlePrint = () => {
    window.print();
  };

  // กำหนดรายการสินค้าหลัก (A, B, C) ตามโครงสร้าง
  const uniqueProducts = [
    { label: 'A', name: 'รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)', shortName: 'APIX Round A' },
    { label: 'B', name: 'รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)', shortName: 'APIX RX B' },
    { label: 'C', name: 'รถเข็นคอมพิวเตอร์ All-in-one สำหรับงานเจาะเลือด (Phlebotomy Computer Cart)', shortName: 'APIX Flow C' },  ];

  const formatDateStr = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Group records by Date
  const recordsByDate: Record<string, HandoffRecord[]> = {};
  records.forEach((r) => {
    const dStr = formatDateStr(r.handoffDate || r.createdAt);
    if (!recordsByDate[dStr]) recordsByDate[dStr] = [];
    recordsByDate[dStr].push(r);
  });

  const uniqueDates = Object.keys(recordsByDate).sort((a, b) => b.localeCompare(a)); // Descending

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
          .page-break {
            page-break-after: always;
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

      {/* ควบคุมการแสดงผล (ซ่อนเมื่อพิมพ์) */}
      <div className="no-print mb-6 border border-white/10 rounded-xl p-4 bg-white/5">
        <h3 className="text-white font-bold mb-3">เลือกเอกสารที่ต้องการพิมพ์</h3>
        <div className="flex items-center gap-4 mb-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F58220] appearance-none"
          >
            <option value="all">รวมทั้งหมด (ยอดสะสม)</option>
            {uniqueDates.map(dateStr => {
              const displayDate = new Date(dateStr).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              return (
                <option key={dateStr} value={dateStr}>
                  วันที่ {displayDate}
                </option>
              );
            })}
          </select>
        </div>

        <button
          onClick={handlePrint}
          disabled={uniqueDates.length === 0}
          className="w-full py-3 bg-[#F58220] hover:bg-[#d9721a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
          </svg>
          {viewMode === 'all' ? 'พิมพ์ใบสรุปรวมสะสมทั้งหมด' : 'พิมพ์ใบสรุปเฉพาะวันที่เลือก'}
        </button>
      </div>

      <div className="print-only-wrapper">
        {uniqueDates.length === 0 ? (
          <div className="document-style">
            <h1>ใบสรุปรายการส่งมอบ</h1>
            <p className="contract-no">ไม่มีรายการจัดส่ง</p>
          </div>
        ) : (
          <>
            {/* 1. Grand Total Block (รวมทั้งหมดทุกวัน) */}
            {viewMode === 'all' && (() => {
              const allDepartmentsSet = new Set<string>();
              records.forEach((r) => allDepartmentsSet.add(r.department));
              const allDepartments = Array.from(allDepartmentsSet).sort();

              const allMatrix: Record<string, Record<string, number>> = {};
              allDepartments.forEach((dept) => {
                allMatrix[dept] = {};
                uniqueProducts.forEach((p) => {
                  allMatrix[dept][p.label] = 0;
                });
              });

              records.forEach((r) => {
                const dbName = r.productName.toLowerCase().replace(/\s+/g, '');
                const matchedProduct = uniqueProducts.find(p => {
                  const nameL = p.name.toLowerCase().replace(/\s+/g, '');
                  const shortL = p.shortName.toLowerCase().replace(/\s+/g, '');
                  return nameL === dbName || shortL === dbName || dbName.includes(shortL) || shortL.includes(dbName);
                });
                if (matchedProduct && allMatrix[r.department]) {
                  allMatrix[r.department][matchedProduct.label]++;
                }
              });

              const allTotals: Record<string, number> = {};
              uniqueProducts.forEach((p) => {
                allTotals[p.label] = 0;
                allDepartments.forEach((dept) => {
                  allTotals[p.label] += allMatrix[dept][p.label];
                });
              });

              return (
                <div className="document-style">
                  <h1>ใบสรุปรายการส่งมอบ<br/>(รวมยอดสะสมทั้งหมด)</h1>
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
                      {allDepartments.map((dept) => {
                        const thaiName = deptDict.find(d => d.key === dept)?.nameTh || dept;
                        return (
                          <tr key={dept}>
                            <td>{thaiName}</td>
                            {uniqueProducts.map((p) => (
                              <td key={p.label} style={{ textAlign: 'center' }}>
                                {allMatrix[dept][p.label] > 0 ? allMatrix[dept][p.label] : '-'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      {allDepartments.length > 0 && (
                        <tr>
                          <td style={{ fontWeight: 'bold', textAlign: 'right' }}>รวมทั้งหมด</td>
                          {uniqueProducts.map((p) => (
                            <td key={p.label} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                              {allTotals[p.label] > 0 ? allTotals[p.label] : '-'}
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  <div className="legend-area">
                    <strong>คำอธิบายรายละเอียดสินค้ารายการ </strong>
                    <ul>
                      {uniqueProducts.map((p) => (
                        <li key={p.label}>
                          <strong>{p.label} </strong> {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* 2. Daily Blocks (แยกตามวัน) */}
            {uniqueDates
              .filter(dateStr => viewMode === 'all' ? false : viewMode === dateStr)
              .map((dateStr) => {
              const dateRecords = recordsByDate[dateStr];
              
              // รวบรวม departments ที่ไม่ซ้ำของวันนี้
              const departmentSet = new Set<string>();
              dateRecords.forEach((r) => departmentSet.add(r.department));
              const departments = Array.from(departmentSet).sort();
  
              // สร้าง cross-reference matrix: dept → label → count
              const matrix: Record<string, Record<string, number>> = {};
              departments.forEach((dept) => {
                matrix[dept] = {};
                uniqueProducts.forEach((p) => {
                  matrix[dept][p.label] = 0;
                });
              });
  
              dateRecords.forEach((r) => {
                const dbName = r.productName.toLowerCase().replace(/\s+/g, '');
                const matchedProduct = uniqueProducts.find(p => {
                  const nameL = p.name.toLowerCase().replace(/\s+/g, '');
                  const shortL = p.shortName.toLowerCase().replace(/\s+/g, '');
                  return nameL === dbName || shortL === dbName || dbName.includes(shortL) || shortL.includes(dbName);
                });
                if (matchedProduct && matrix[r.department]) {
                  matrix[r.department][matchedProduct.label]++;
                }
              });
  
              // คำนวณผลรวมต่อ product สำหรับวันนี้
              const totals: Record<string, number> = {};
              uniqueProducts.forEach((p) => {
                totals[p.label] = 0;
                departments.forEach((dept) => {
                  totals[p.label] += matrix[dept][p.label];
                });
              });
  
              const displayDate = new Date(dateStr).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
  
              return (
                <div key={dateStr} className="document-style">
                  <h1>ใบสรุปรายการส่งมอบ<br/>ประจำวันที่ {displayDate}</h1>
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
                      {departments.map((dept) => {
                        const thaiName = deptDict.find(d => d.key === dept)?.nameTh || dept;
                        return (
                          <tr key={dept}>
                            <td>{thaiName}</td>
                            {uniqueProducts.map((p) => (
                              <td key={p.label} style={{ textAlign: 'center' }}>
                                {matrix[dept][p.label] > 0 ? matrix[dept][p.label] : '-'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
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
                    <strong>คำอธิบายรายละเอียดสินค้ารายการ </strong>
                    <ul>
                      {uniqueProducts.map((p) => (
                        <li key={p.label}>
                          <strong>{p.label} </strong> {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
