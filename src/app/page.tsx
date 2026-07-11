import Link from 'next/link';

const departments = ['HR', 'IT', 'Marketing', 'Sales', 'Finance', 'Operations'];

export default function Home() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Inventory Handoff</h1>
        <p className="text-sm text-gray-400">เลือกแผนกเพื่อดูรายการสินค้าและจัดการข้อมูล</p>
      </div>

      {/* Grid แผนก */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {departments.map((dept) => (
          <Link
            key={dept}
            href={`/department/${encodeURIComponent(dept)}`}
            className="border border-white/10 rounded-2xl p-6 text-center bg-gradient-to-br from-[#F58220] to-[#d9721a] hover:from-[#ff9533] hover:to-[#F58220] text-white font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#F58220]/10"
          >
            {dept}
          </Link>
        ))}
      </div>

      {/* ปุ่มสรุปเอกสาร */}
      <Link
        href="/summary"
        className="block w-full py-4 text-center bg-white/5 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/10 transition-all"
      >
        <span className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          สรุปเอกสารส่งมอบทั้งหมด
        </span>
      </Link>
    </div>
  );
}
