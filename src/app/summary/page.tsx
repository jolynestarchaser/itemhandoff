import { getAllRecords } from '@/lib/actions';
import AllDepartmentsSummaryNote from '@/components/AllDepartmentsSummaryNote';
import ExportButton from '@/components/ExportButton';
import Link from 'next/link';
import { HandoffRecord } from '@prisma/client';
import { departments as deptDict } from '@/lib/departments';

// บังคับให้โหลดข้อมูลใหม่เสมอ (ไม่ cache) เพื่อให้แสดงรายการใหม่ล่าสุด
export const dynamic = 'force-dynamic';

export default async function SummaryPage() {
  // ดึงข้อมูลทั้งหมดจาก Database ผ่าน Server Action
  const records = await getAllRecords();

  const formatDateStr = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // จัดกลุ่มตามวันที่ จากนั้นตามแผนก
  const groupedByDate: Record<string, Record<string, HandoffRecord[]>> = {};
  
  records.forEach((record) => {
    const dStr = formatDateStr(record.createdAt);
    if (!groupedByDate[dStr]) groupedByDate[dStr] = {};
    if (!groupedByDate[dStr][record.department]) {
      groupedByDate[dStr][record.department] = [];
    }
    groupedByDate[dStr][record.department].push(record);
  });

  const uniqueDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-2xl mx-auto text-white">
      {/* Header — ซ่อนเมื่อพิมพ์ */}
      <div className="no-print">
        <Link href="/" className="text-sm text-[#A0A0A0] hover:text-white flex items-center gap-1 mb-4">
          &larr; กลับหน้าหลัก
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">สรุปเอกสารส่งมอบทั้งหมด</h1>
            <p className="text-slate-400 text-sm">
              {records.length} รายการ จาก {uniqueDates.length} วัน
            </p>
          </div>
          <ExportButton records={records} />
        </div>

        {/* ตารางแสดงข้อมูลแบ่งตามวันที่และแผนก */}
        {uniqueDates.length > 0 ? (
          uniqueDates.map((dateStr) => {
            const displayDate = new Date(dateStr).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const deptGroup = groupedByDate[dateStr];
            const departments = Object.keys(deptGroup).sort();
            
            return (
              <div key={dateStr} className="mb-8 border border-white/10 rounded-xl p-4 bg-white/5">
                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
                  ประจำวันที่ {displayDate}
                </h2>
                
                {departments.map((dept) => {
                  const thaiName = deptDict.find(d => d.key === dept)?.nameTh || dept;
                  return (
                    <div key={dept} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-md font-bold text-gray-200">แผนก {thaiName}</h3>
                        <span className="text-xs bg-[#F58220]/20 text-[#F58220] px-2 py-1 rounded-full font-semibold">
                          {deptGroup[dept].length} รายการ
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#A0A0A0]">
                          <thead className="text-xs uppercase bg-[#121212] border-b border-[#333333]">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg w-8">#</th>
                              <th className="px-4 py-3">ชื่อสินค้า</th>
                              <th className="px-4 py-3 rounded-tr-lg">รหัสสินค้า</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deptGroup[dept].map((record: HandoffRecord, index: number) => (
                              <tr key={record.id} className="border-b border-[#333333] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                <td className="px-4 py-3 text-center">{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-[#FFFFFF]">{record.productName}</td>
                                <td className="px-4 py-3 font-mono">{record.productId}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 italic border border-white/5 rounded-2xl bg-white/2">
            <p className="text-lg mb-2">ยังไม่มีข้อมูลการส่งมอบ</p>
            <p className="text-sm">กลับไปหน้าหลักเพื่อเพิ่มสินค้าในแต่ละแผนก</p>
          </div>
        )}
      </div>

      {/* Print section */}
      <AllDepartmentsSummaryNote records={records} />
    </div>
  );
}
