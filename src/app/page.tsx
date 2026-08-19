'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { departments, departmentCategories, DepartmentCategory } from '@/lib/departments';
import { searchDepartmentsByProduct, getDepartmentStatsMap, getVehicleHandoffStats, DepartmentStatItem, VehicleHandoffStats } from '@/lib/actions';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DepartmentCategory | 'all' | 'delivered' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productDeptMatches, setProductDeptMatches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [deptStats, setDeptStats] = useState<Record<string, DepartmentStatItem>>({});
  const [overallStats, setOverallStats] = useState<VehicleHandoffStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial statistics
  useEffect(() => {
    async function loadStats() {
      try {
        const [statsMap, vStats] = await Promise.all([
          getDepartmentStatsMap(),
          getVehicleHandoffStats({ A: 200, B: 100, C: 100 }),
        ]);
        setDeptStats(statsMap);
        setOverallStats(vStats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

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
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter departments based on category, search query, or product match
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const stat = deptStats[dept.key];
      const hasDelivered = (stat?.total || 0) > 0;

      // Category filter
      if (activeCategory === 'delivered' && !hasDelivered) return false;
      if (activeCategory === 'pending' && hasDelivered) return false;
      if (activeCategory !== 'all' && activeCategory !== 'delivered' && activeCategory !== 'pending') {
        if (dept.category !== activeCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNameTh = dept.nameTh.toLowerCase().includes(query);
        const matchNameEn = dept.nameEn.toLowerCase().includes(query);
        const matchProduct = productDeptMatches.includes(dept.key);
        return matchNameTh || matchNameEn || matchProduct;
      }

      return true;
    });
  }, [activeCategory, searchQuery, productDeptMatches, deptStats]);

  // Counts for category badges
  const categoryCounts = useMemo<Record<string, number>>(() => {
    let delivered = 0;
    let pending = 0;
    const catMap: Record<string, number> = { all: departments.length };

    departments.forEach((dept) => {
      const stat = deptStats[dept.key];
      const hasDelivered = (stat?.total || 0) > 0;
      if (hasDelivered) delivered++;
      else pending++;

      catMap[dept.category] = (catMap[dept.category] || 0) + 1;
    });

    return {
      ...catMap,
      delivered,
      pending,
    };
  }, [deptStats]);

  const getCategoryLabel = (catId: string) => {
    const found = departmentCategories.find(c => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 text-white pb-16">
      {/* Hero / Header Section */}
      <div className="mb-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F58220]/15 border border-[#F58220]/30 text-[#F58220] text-xs font-semibold mb-2">
            <span>✨</span>
            <span>Hospital Cart Inventory System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ระบบส่งมอบรถเข็นโรงพยาบาล
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            เลือกแผนกเพื่อบันทึกการส่งมอบ ดูประวัติ ออกใบส่งมอบ หรือตรวจสอบรหัสรถที่ยังค้างส่ง
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="mt-4 sm:mt-0 flex items-center gap-2.5 flex-wrap">
          <Link
            href="/print"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-semibold text-white transition-all hover:scale-102 shadow-md shadow-black/20"
          >
            <span>🖨️</span>
            <span>ศูนย์พิมพ์เอกสาร</span>
          </Link>

          <Link
            href="/template-builder"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#F58220]/15 hover:bg-[#F58220]/25 border border-[#F58220]/30 rounded-2xl text-xs font-semibold text-[#F58220] transition-all hover:scale-102 shadow-md shadow-[#F58220]/10"
          >
            <span>✨</span>
            <span>สร้าง Template PDF</span>
          </Link>

          <Link
            href="/pending-vehicles"
            className="inline-flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r from-[#F58220]/20 via-[#F58220]/10 to-transparent hover:from-[#F58220]/30 hover:to-[#F58220]/10 border border-[#F58220]/40 rounded-2xl transition-all hover:scale-102 group shadow-lg shadow-[#F58220]/10 text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-[#F58220] flex items-center justify-center text-white text-xs shadow-md shadow-[#F58220]/30 flex-shrink-0 group-hover:rotate-6 transition-transform">
              ⚡
            </div>
            <div className="text-xs">
              <span className="font-extrabold text-white">
                {overallStats ? `ค้างส่ง ${overallStats.totalTarget - overallStats.totalDelivered} คัน` : 'ดูรถค้างส่ง'} &rarr;
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar (Fleet Target: A: 200, B: 100, C: 100 -> Total: 400) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Card 1: Total Delivered */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
          <span className="text-xs text-gray-400 font-medium">ส่งมอบแล้วรวม</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-emerald-400">{overallStats?.totalDelivered ?? '...'}</span>
            <span className="text-xs text-gray-500">/ {overallStats?.totalTarget ?? 400} คัน</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-1 rounded-full"
              style={{ width: `${overallStats ? (overallStats.totalDelivered / overallStats.totalTarget) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 2: Active Departments */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-xs text-gray-400 font-medium">แผนกที่รับมอบแล้ว</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-blue-400">{overallStats?.activeDepartmentsCount ?? '...'}</span>
            <span className="text-xs text-gray-500">/ {departments.length} แผนก</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-blue-400 h-1 rounded-full"
              style={{ width: `${(categoryCounts.delivered / departments.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Breakdown A/B/C with targets */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-xs text-gray-400 font-medium">สัดส่วนตามประเภทรถ</span>
          <div className="flex items-center gap-2 mt-1 text-xs font-mono font-bold">
            <span className="text-blue-300">A:{overallStats?.countA ?? 0}/{overallStats?.targetA ?? 200}</span>
            <span className="text-gray-500">•</span>
            <span className="text-emerald-300">B:{overallStats?.countB ?? 0}/{overallStats?.targetB ?? 100}</span>
            <span className="text-gray-500">•</span>
            <span className="text-purple-300">C:{overallStats?.countC ?? 0}/{overallStats?.targetC ?? 100}</span>
          </div>
          <div className="flex gap-1 h-1 rounded-full bg-white/10 overflow-hidden mt-2">
            <div className="bg-blue-400" style={{ width: `${overallStats && overallStats.totalDelivered ? (overallStats.countA / overallStats.totalDelivered) * 100 : 33}%` }} />
            <div className="bg-emerald-400" style={{ width: `${overallStats && overallStats.totalDelivered ? (overallStats.countB / overallStats.totalDelivered) * 100 : 33}%` }} />
            <div className="bg-purple-400" style={{ width: `${overallStats && overallStats.totalDelivered ? (overallStats.countC / overallStats.totalDelivered) * 100 : 33}%` }} />
          </div>
        </div>

        {/* Card 4: Action Shortcuts */}
        <Link
          href="/summary"
          className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">เอกสารส่งมอบ</span>
            <span className="text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </div>
          <p className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            สรุปและพิมพ์ทั้งหมด
          </p>
        </Link>
      </div>

      {/* Search & Category Filter Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            aria-label="ค้นหาชื่อแผนก หรือรหัสรถ"
            className="block w-full pl-11 pr-10 py-3 border border-white/15 rounded-xl leading-5 bg-black/60 text-white placeholder-gray-400 focus:outline-none focus:border-[#F58220] text-sm transition-colors"
            placeholder="ค้นหาชื่อแผนก (เช่น Intervention, ICU, นรีเวช) หรือรหัสรถ (เช่น A001, C032)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <svg className="animate-spin h-4 w-4 text-[#F58220]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {searchQuery && !isSearching && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="ล้างข้อความค้นหา"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-white"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Product Search Match Alert */}
        {productDeptMatches.length > 0 && searchQuery.trim() && (
          <div className="p-3 bg-[#F58220]/15 border border-[#F58220]/40 rounded-xl text-xs text-gray-200 flex items-center gap-2">
            <span>🎯</span>
            <span>พบรายการสินค้า/รหัสตรงกันใน <strong>{productDeptMatches.length} แผนก</strong></span>
          </div>
        )}

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {departmentCategories.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                aria-label={`กรองตามหมวดหมู่ ${cat.label} มี ${count} แผนก`}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#F58220] text-white shadow-md shadow-[#F58220]/25 font-semibold'
                    : 'bg-black/30 hover:bg-white/10 text-gray-300 border border-white/5'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header: Department Count & View Mode Toggle */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            รายชื่อแผนกทั้งหมด ({filteredDepartments.length} แผนก)
          </span>
          {activeCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="text-xs text-[#F58220] hover:underline"
            >
              แสดงทั้งหมด
            </button>
          )}
        </div>

        {/* View Mode Switcher (Grid vs List) */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="แสดงแบบการ์ด"
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewMode === 'grid' ? 'bg-[#F58220] text-white font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="แสดงแบบการ์ด"
          >
            <span>🔲</span>
            <span className="hidden sm:inline">แบบการ์ด</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="แสดงแบบตารางรายการ"
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-[#F58220] text-white font-semibold shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="แสดงแบบตารางรายการ"
          >
            <span>📋</span>
            <span className="hidden sm:inline">แบบรายการ</span>
          </button>
        </div>
      </div>

      {/* Department Cards Grid or Table List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredDepartments.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {filteredDepartments.map((dept) => {
              const stat = deptStats[dept.key];
              const total = stat?.total || 0;
              const hasDelivered = total > 0;
              const isMatch = productDeptMatches.includes(dept.key);

              return (
                <Link
                  key={dept.key}
                  href={`/department/${encodeURIComponent(dept.key)}`}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                    isMatch
                      ? 'bg-gradient-to-br from-[#F58220]/25 to-black/60 border-[#F58220] shadow-lg shadow-[#F58220]/20'
                      : hasDelivered
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#F58220]/60 hover:shadow-lg hover:shadow-black/40'
                      : 'bg-black/30 hover:bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-white text-base group-hover:text-[#F58220] transition-colors line-clamp-1">
                        {dept.nameTh}
                      </h3>
                      <span className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all text-sm">
                        &rarr;
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mb-3">
                      {dept.nameEn}
                    </p>
                  </div>

                  {/* Card Footer: Delivery Badge & Item Count */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    {hasDelivered ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 font-semibold font-mono">{total} คัน</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                          {stat.countA > 0 && <span className="text-blue-300">A:{stat.countA}</span>}
                          {stat.countB > 0 && <span className="text-emerald-300">B:{stat.countB}</span>}
                          {stat.countC > 0 && <span className="text-purple-300">C:{stat.countC}</span>}
                          {stat.countOther > 0 && <span className="text-gray-300">+{stat.countOther}</span>}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500 text-[11px] italic">
                        ยังไม่มีรายการส่งมอบ
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List / Table View (แสดงรายชื่อแผนกเป็นรายการๆ อย่างเป็นระเบียบ) */
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black/50 text-xs text-gray-400 uppercase border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">ชื่อแผนก</th>
                    <th className="px-4 py-3 hidden sm:table-cell">หมวดหมู่</th>
                    <th className="px-4 py-3 text-center">สถานะส่งมอบ</th>
                    <th className="px-4 py-3 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDepartments.map((dept, index) => {
                    const stat = deptStats[dept.key];
                    const total = stat?.total || 0;
                    const hasDelivered = total > 0;
                    const isMatch = productDeptMatches.includes(dept.key);

                    return (
                      <tr
                        key={dept.key}
                        className={`hover:bg-white/5 transition-colors ${
                          isMatch ? 'bg-[#F58220]/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center text-xs text-gray-500 font-mono">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/department/${encodeURIComponent(dept.key)}`} className="group block">
                            <span className="font-bold text-white group-hover:text-[#F58220] transition-colors">
                              {dept.nameTh}
                            </span>
                            <span className="block text-xs text-gray-400">
                              {dept.nameEn}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5">
                            {getCategoryLabel(dept.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasDelivered ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                                ✅ {total} คัน
                              </span>
                              <div className="flex items-center gap-1 font-mono text-[10px] text-gray-400 mt-0.5">
                                {stat.countA > 0 && <span className="text-blue-300">A:{stat.countA}</span>}
                                {stat.countB > 0 && <span className="text-emerald-300">B:{stat.countB}</span>}
                                {stat.countC > 0 && <span className="text-purple-300">C:{stat.countC}</span>}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              ยังไม่มีรายการ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/department/${encodeURIComponent(dept.key)}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F58220]/20 hover:bg-[#F58220] text-[#F58220] hover:text-white border border-[#F58220]/30 rounded-xl text-xs font-semibold transition-all"
                          >
                            <span>จัดการ</span>
                            <span>&rarr;</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-16 border border-white/10 rounded-2xl bg-white/5 mb-8">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <p className="text-gray-300 font-medium mb-1">ไม่พบแผนกหรือรหัสสินค้าที่คุณค้นหา</p>
          <p className="text-xs text-gray-500 mb-4">ลองค้นหาด้วยคำอื่น หรือกดรีเซ็ตตัวกรอง</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all"
          >
            ล้างการค้นหาและตัวกรอง
          </button>
        </div>
      )}

      {/* Bottom Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/pending-vehicles"
          className="p-4 rounded-2xl bg-gradient-to-br from-[#F58220]/20 to-[#F58220]/5 border border-[#F58220]/30 hover:border-[#F58220]/60 transition-all flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-[#F58220]/30 text-[#F58220] group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-[#F58220] transition-colors">
              ดูเลขรถรหัสที่ยังไม่ได้ส่งมอบ
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              ตรวจรายการค้างส่งมอบ A, B, C (เป้าหมาย 400 คัน) และส่งมอบด่วน
            </p>
          </div>
        </Link>

        <Link
          href="/summary"
          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-4 group"
        >
          <div className="p-3 rounded-xl bg-white/10 text-white group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
              สรุปเอกสารส่งมอบทั้งหมด
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              ดูรายการแยกแผนกและวันที่ พิมพ์ใบส่งมอบ และส่งออก Excel
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
