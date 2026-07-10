import { getAllRecords } from '@/lib/actions';
import ExportButton from '@/components/ExportButton';
import Link from 'next/link';

// บังคับให้โหลดข้อมูลใหม่เสมอ (ไม่ cache) เพื่อให้แสดงรายการใหม่ล่าสุด
export const dynamic = 'force-dynamic';

export default async function SummaryPage() {
  // ดึงข้อมูลทั้งหมดจาก Database ผ่าน Server Action
  const records = await getAllRecords();

  return (
    <div className="glass-panel p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Handoff Summary</h1>
          <p className="text-slate-400 text-sm">Overview of all scanned and recorded items.</p>
        </div>
        {/* ปุ่ม Export ไปยัง Excel พร้อมส่งข้อมูลทั้งหมดเข้าไป */}
        <ExportButton records={records} />
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#A0A0A0]">
          <thead className="text-xs uppercase bg-[#121212] border-b border-[#333333]">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Date</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Product ID</th>
              <th className="px-4 py-3">Dept</th>
              <th className="px-4 py-3 rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.id} className="border-b border-[#333333] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#FFFFFF]">{record.productName}</td>
                  <td className="px-4 py-3 font-mono">{record.productId}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[rgba(45,212,191,0.1)] text-[#2DD4BF] border border-[rgba(45,212,191,0.2)] px-2 py-1 rounded text-xs font-semibold">
                      {record.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/print/${record.id}`} className="text-[#F58220] hover:text-[#FFFFFF] underline transition-colors">
                      Print
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#666666] italic">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
