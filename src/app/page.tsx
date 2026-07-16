'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { departments } from '@/lib/departments';
import { searchDepartmentsByProduct } from '@/lib/actions';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [productDeptMatches, setProductDeptMatches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // When search query changes, fetch matching product departments
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const matches = await searchDepartmentsByProduct(searchQuery.trim());
        setProductDeptMatches(matches);
        setIsSearching(false);
      } else {
        setProductDeptMatches([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter departments based on search query (name) or product match
  const filteredDepartments = departments.filter((dept) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const matchNameTh = dept.nameTh.toLowerCase().includes(query);
    const matchNameEn = dept.nameEn.toLowerCase().includes(query);
    const matchProduct = productDeptMatches.includes(dept.key);
    
    return matchNameTh || matchNameEn || matchProduct;
  });

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Inventory Handoff</h1>
        <p className="text-sm text-gray-400">เลือกแผนกเพื่อดูรายการสินค้าและจัดการข้อมูล</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl leading-5 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:border-[#F58220] sm:text-sm transition-colors"
          placeholder="ค้นหาชื่อแผนก (TH/EN) หรือรหัสสินค้า..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="animate-spin h-5 w-5 text-[#F58220]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Grid แผนก */}
      {filteredDepartments.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {filteredDepartments.map((dept) => (
            <Link
              key={dept.key}
              href={`/department/${encodeURIComponent(dept.key)}`}
              className="border border-white/10 rounded-2xl p-6 text-center bg-gradient-to-br from-[#F58220] to-[#d9721a] hover:from-[#ff9533] hover:to-[#F58220] text-white font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#F58220]/10 flex flex-col items-center justify-center min-h-[100px]"
            >
              {dept.nameTh}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-6 border border-white/10 rounded-2xl bg-white/5">
          <p className="text-gray-400">ไม่พบแผนกหรือสินค้าที่คุณค้นหา</p>
        </div>
      )}

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
