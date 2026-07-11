import { getAllRecords } from '@/lib/actions';
import AllDepartmentsSummaryNote from '@/components/AllDepartmentsSummaryNote';
import ExportButton from '@/components/ExportButton';
import Link from 'next/link';
import { HandoffRecord } from '@prisma/client';

// บังคับให้โหลดข้อมูลใหม่เสมอ (ไม่ cache) เพื่อให้แสดงรายการใหม่ล่าสุด
export const dynamic = 'force-dynamic';

export default async function SummaryPage() {
  // ดึงข้อมูลทั้งหมดจาก Database ผ่าน Server Action
  const records = await getAllRecords();

  // จัดกลุ่มตามแผนก
  const groupedByDept: Record<string, HandoffRecord[]> = {};
  records.forEach((record) => {
    if (!groupedByDept[record.department]) {
      groupedByDept[record.department] = [];
    }
    groupedByDept[record.department].push(record);
  });

  const departments = Object.keys(groupedByDept).sort();

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
              {records.length} รายการ จาก {departments.length} แผนก
            </p>
          </div>
          <ExportButton records={records} />
        </div>

        {/* ตารางแสดงข้อมูลแบ่งตามแผนก */}
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-white">แผนก {dept}</h2>
                <span className="text-xs bg-[#F58220]/20 text-[#F58220] px-2 py-1 rounded-full font-semibold">
                  {groupedByDept[dept].length} รายการ
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#A0A0A0] mb-2">
                  <thead className="text-xs uppercase bg-[#121212] border-b border-[#333333]">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg w-8">#</th>
                      <th className="px-4 py-3">ชื่อสินค้า</th>
                      <th className="px-4 py-3">รหัสสินค้า</th>
                      <th className="px-4 py-3 rounded-tr-lg">วันที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDept[dept].map((record: HandoffRecord, index: number) => (
                      <tr key={record.id} className="border-b border-[#333333] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-4 py-3 text-center">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#FFFFFF]">{record.productName}</td>
                        <td className="px-4 py-3 font-mono">{record.productId}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(record.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
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
