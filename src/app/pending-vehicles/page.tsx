'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getAllVehicleStatuses, createHandoffRecord, VehicleStatusItem, VehicleTrackerData } from '@/lib/actions';
import { departments } from '@/lib/departments';
import InteractiveDatePicker from '@/components/InteractiveDatePicker';

export default function PendingVehiclesPage() {
  const [data, setData] = useState<VehicleTrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Targets
  const [targetA, setTargetA] = useState(200);
  const [targetB, setTargetB] = useState(100);
  const [targetC, setTargetC] = useState(100);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Quick Handoff Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStatusItem | null>(null);
  const [handoffDept, setHandoffDept] = useState('');
  const [handoffDate, setHandoffDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [isSubmittingHandoff, setIsSubmittingHandoff] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getAllVehicleStatuses({ A: targetA, B: targetB, C: targetC });
    setData(res);
    setLoading(false);
  }, [targetA, targetB, targetC]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toast timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter(item => {
      // Status filter
      if (statusFilter === 'pending' && item.isDelivered) return false;
      if (statusFilter === 'delivered' && !item.isDelivered) return false;

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchProd = item.productName.toLowerCase().includes(q);
        const matchDept = item.departmentNameTh?.toLowerCase().includes(q) || item.departmentKey?.toLowerCase().includes(q);
        if (!matchCode && !matchProd && !matchDept) return false;
      }

      return true;
    });
  }, [data, statusFilter, typeFilter, searchQuery]);

  // Pending vehicles count by type
  const pendingByType = useMemo(() => {
    if (!data) return { A: [], B: [], C: [], total: [] };
    const pA = data.items.filter(i => !i.isDelivered && i.type === 'A').map(i => i.code);
    const pB = data.items.filter(i => !i.isDelivered && i.type === 'B').map(i => i.code);
    const pC = data.items.filter(i => !i.isDelivered && i.type === 'C').map(i => i.code);
    return {
      A: pA,
      B: pB,
      C: pC,
      total: [...pA, ...pB, ...pC],
    };
  }, [data]);

  const handleCopyPending = (type: 'all' | 'A' | 'B' | 'C') => {
    let listToCopy: string[] = [];
    let label = '';
    if (type === 'all') {
      listToCopy = pendingByType.total;
      label = `รหัสที่ยังไม่ส่งมอบทั้งหมด (${listToCopy.length} คัน)`;
    } else if (type === 'A') {
      listToCopy = pendingByType.A;
      label = `รหัส APIX Round A (${listToCopy.length} คัน)`;
    } else if (type === 'B') {
      listToCopy = pendingByType.B;
      label = `รหัส APIX RX B (${listToCopy.length} คัน)`;
    } else if (type === 'C') {
      listToCopy = pendingByType.C;
      label = `รหัส APIX Flow C (${listToCopy.length} คัน)`;
    }

    if (listToCopy.length === 0) {
      setToastMessage({ type: 'info', text: 'ไม่มีรายการค้างส่งมอบในกลุ่มนี้' });
      return;
    }

    navigator.clipboard.writeText(listToCopy.join(', '));
    setToastMessage({ type: 'success', text: `คัดลอก ${label} เรียบร้อยแล้ว!` });
  };

  const handleQuickHandoffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !handoffDept) return;

    setIsSubmittingHandoff(true);
    const res = await createHandoffRecord({
      productId: selectedVehicle.code,
      productName: selectedVehicle.productName,
      department: handoffDept,
      handoffDate,
      qrData: `${selectedVehicle.productName} ${selectedVehicle.code}`,
    });

    setIsSubmittingHandoff(false);
    if (res.success) {
      setToastMessage({ type: 'success', text: `บันทึกส่งมอบ ${selectedVehicle.code} เรียบร้อยแล้ว!` });
      setSelectedVehicle(null);
      setHandoffDept('');
      fetchData();
    } else {
      setToastMessage({ type: 'info', text: res.error || 'เกิดข้อผิดพลาดในการบันทึก' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 text-white pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all animate-bounce ${
          toastMessage.type === 'success' ? 'bg-emerald-500/90 text-white border border-emerald-400' : 'bg-[#F58220]/90 text-white border border-orange-400'
        }`}>
          <span>{toastMessage.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span className="font-medium text-sm">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="no-print mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          กลับหน้าหลัก
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-gradient-to-br from-[#F58220]/30 to-[#F58220]/10 border border-[#F58220]/30 text-[#F58220]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  สถานะเลขรถ & รายการที่ยังไม่ได้ส่งมอบ
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  ตรวจสอบลำดับรหัสรถเข็นทั้งหมด ตรวจหาเลขที่ยังค้างส่ง และบันทึกส่งมอบทันที
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              aria-label="ตั้งค่าเป้าหมายจำนวนรถ"
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center gap-2"
              title="ตั้งค่าเป้าหมายจำนวนรถ (Target Fleet)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              ตั้งค่าเป้าหมาย ({targetA + targetB + targetC} คัน)
            </button>
            <button
              type="button"
              onClick={() => handleCopyPending(typeFilter === 'all' ? 'all' : typeFilter)}
              aria-label="คัดลอกเลขค้างส่ง"
              className="px-3.5 py-2 bg-[#F58220]/20 hover:bg-[#F58220]/30 border border-[#F58220]/40 text-[#F58220] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              คัดลอกเลขค้างส่ง
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {/* Total Delivered */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <span className="text-xs text-gray-400 font-medium">ส่งมอบแล้วรวม</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-emerald-400">{data?.summary.deliveredCount ?? '...'}</span>
            <span className="text-xs text-gray-500">/ {data?.summary.totalFleet ?? 400} คัน</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-1 rounded-full transition-all duration-500"
              style={{ width: `${data?.summary.totalFleet ? (data.summary.deliveredCount / data.summary.totalFleet) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Total Pending */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-[#F58220]">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <span className="text-xs text-gray-400 font-medium">ยังไม่ส่งมอบ</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-[#F58220]">{data?.summary.pendingCount ?? '...'}</span>
            <span className="text-xs text-gray-500">คัน ({data?.summary.totalFleet ? Math.round((data.summary.pendingCount / data.summary.totalFleet) * 100) : 0}%)</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-[#F58220] h-1 rounded-full transition-all duration-500"
              style={{ width: `${data?.summary.totalFleet ? (data.summary.pendingCount / data.summary.totalFleet) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Type A Stat */}
        <div
          onClick={() => setTypeFilter(typeFilter === 'A' ? 'all' : 'A')}
          className={`p-3.5 rounded-2xl border backdrop-blur-md cursor-pointer transition-all ${
            typeFilter === 'A' ? 'bg-[#F58220]/20 border-[#F58220]' : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-blue-300">A (Round A)</span>
            <span className="text-[10px] px-1 rounded bg-blue-500/20 text-blue-300 font-mono">200</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{data?.summary.typeA.delivered ?? 0}</span>
            <span className="text-xs text-gray-400">/{data?.summary.typeA.target ?? 200}</span>
            <span className="text-[11px] text-blue-400 font-medium ml-auto">ค้าง {data?.summary.typeA.pending ?? 0}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-blue-400 h-1 rounded-full"
              style={{ width: `${data?.summary.typeA.target ? (data.summary.typeA.delivered / data.summary.typeA.target) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Type B Stat */}
        <div
          onClick={() => setTypeFilter(typeFilter === 'B' ? 'all' : 'B')}
          className={`p-3.5 rounded-2xl border backdrop-blur-md cursor-pointer transition-all ${
            typeFilter === 'B' ? 'bg-[#F58220]/20 border-[#F58220]' : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-300">B (RX B)</span>
            <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">100</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{data?.summary.typeB.delivered ?? 0}</span>
            <span className="text-xs text-gray-400">/{data?.summary.typeB.target ?? 100}</span>
            <span className="text-[11px] text-emerald-400 font-medium ml-auto">ค้าง {data?.summary.typeB.pending ?? 0}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-1 rounded-full"
              style={{ width: `${data?.summary.typeB.target ? (data.summary.typeB.delivered / data.summary.typeB.target) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Type C Stat */}
        <div
          onClick={() => setTypeFilter(typeFilter === 'C' ? 'all' : 'C')}
          className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border backdrop-blur-md cursor-pointer transition-all ${
            typeFilter === 'C' ? 'bg-[#F58220]/20 border-[#F58220]' : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-purple-300">C (Flow C)</span>
            <span className="text-[10px] px-1 rounded bg-purple-500/20 text-purple-300 font-mono">100</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{data?.summary.typeC.delivered ?? 0}</span>
            <span className="text-xs text-gray-400">/{data?.summary.typeC.target ?? 100}</span>
            <span className="text-[11px] text-orange-400 font-medium ml-auto">ค้าง {data?.summary.typeC.pending ?? 0}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="bg-purple-400 h-1 rounded-full"
              style={{ width: `${data?.summary.typeC.target ? (data.summary.typeC.delivered / data.summary.typeC.target) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Spare & Unassembled Inventory Stock Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-black/40 to-blue-500/15 border border-amber-500/30 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <div>
              <h2 className="text-sm font-bold text-white">คลังรถสำรอง (Spare) และรอประกอบ (Unassembled)</h2>
              <p className="text-[11px] text-gray-400">ข้อมูลรถเข็นสำรองหน้างาน และชิ้นส่วนที่พร้อมประกอบเพิ่มเติม</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Spare รวม: {data?.stock?.totalSpare ?? 20} คัน
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              รอประกอบ: {data?.stock?.totalUnassembled ?? 100} คัน
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400">รถสำรอง Type A</span>
              <div className="text-sm font-bold text-blue-300">APIX Round A</div>
            </div>
            <span className="text-base font-black font-mono text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
              {data?.stock?.spareA ?? 10} คัน
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400">รถสำรอง Type B</span>
              <div className="text-sm font-bold text-emerald-300">APIX RX B</div>
            </div>
            <span className="text-base font-black font-mono text-white bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              {data?.stock?.spareB ?? 5} คัน
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400">รถสำรอง Type C</span>
              <div className="text-sm font-bold text-purple-300">APIX Flow C</div>
            </div>
            <span className="text-base font-black font-mono text-white bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
              {data?.stock?.spareC ?? 5} คัน
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-300">Type A ที่ยังไม่ประกอบ</span>
              <div className="text-sm font-bold text-white">พร้อมประกอบ</div>
            </div>
            <span className="text-base font-black font-mono text-blue-300 bg-blue-500/30 px-2 py-0.5 rounded border border-blue-500/40">
              {data?.stock?.unassembledA ?? 100} คัน
            </span>
          </div>
        </div>
      </div>

      {/* Sequence Gap Alert (if any gap or complete) */}
      {data && (
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">
              {data.summary.typeA.gaps.length === 0 && data.summary.typeB.gaps.length === 0 && data.summary.typeC.gaps.length === 0 ? '✨' : '⚠️'}
            </span>
            <div>
              <span className="font-semibold text-white">การตรวจสอบความต่อเนื่องของลำดับรหัส: </span>
              {data.summary.typeA.gaps.length === 0 && data.summary.typeB.gaps.length === 0 && data.summary.typeC.gaps.length === 0 ? (
                <span className="text-emerald-400">รหัส A (A001-A{String(data.summary.typeA.maxDeliveredNum).padStart(3, '0')}), B (B001-B{String(data.summary.typeB.maxDeliveredNum).padStart(3, '0')}), C (C001-C{String(data.summary.typeC.maxDeliveredNum).padStart(3, '0')}) ส่งมอบต่อเนื่องสมบูรณ์ ไม่มีรหัสตกหล่น</span>
              ) : (
                <span className="text-amber-400">
                  พบรหัสที่ข้ามลำดับ: {[
                    data.summary.typeA.gaps.length > 0 ? `A: [${data.summary.typeA.gaps.join(', ')}]` : null,
                    data.summary.typeB.gaps.length > 0 ? `B: [${data.summary.typeB.gaps.join(', ')}]` : null,
                    data.summary.typeC.gaps.length > 0 ? `C: [${data.summary.typeC.gaps.join(', ')}]` : null,
                  ].filter(Boolean).join(' | ')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              aria-label={`ยังไม่ส่งมอบ ${data?.summary.pendingCount ?? 0} คัน`}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-[#F58220] text-white shadow-lg shadow-[#F58220]/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>⏳</span>
              <span>ยังไม่ส่งมอบ ({data?.summary.pendingCount ?? 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              aria-label={`ส่งมอบแล้ว ${data?.summary.deliveredCount ?? 0} คัน`}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>✅</span>
              <span>ส่งมอบแล้ว ({data?.summary.deliveredCount ?? 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              aria-label={`ทั้งหมด ${data?.summary.totalFleet ?? 0} คัน`}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>ทั้งหมด ({data?.summary.totalFleet ?? 0})</span>
            </button>
          </div>

          {/* Product Type Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              aria-label="แสดงทุกประเภท"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === 'all' ? 'bg-white/20 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              ทุกประเภท
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('A')}
              aria-label={`APIX Round A ค้าง ${pendingByType.A.length} คัน`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === 'A' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              APIX Round A ({pendingByType.A.length} ค้าง)
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('B')}
              aria-label={`APIX RX B ค้าง ${pendingByType.B.length} คัน`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === 'B' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              APIX RX B ({pendingByType.B.length} ค้าง)
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('C')}
              aria-label={`APIX Flow C ค้าง ${pendingByType.C.length} คัน`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === 'C' ? 'bg-purple-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              APIX Flow C ({pendingByType.C.length} ค้าง)
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            aria-label="ค้นหารหัสรถ หรือชื่อแผนก"
            className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F58220] transition-colors"
            placeholder="ค้นหารหัสรถ (เช่น A001, B015, C040) หรือชื่อแผนก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-white"
            >
              ล้างคำค้น
            </button>
          )}
        </div>
      </div>

      {/* Undelivered Tag Cloud Box (for fast copy & quick overview) */}
      {statusFilter !== 'delivered' && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#F58220]/10 via-white/5 to-transparent border border-[#F58220]/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F58220] animate-ping" />
              <h3 className="text-sm font-bold text-white">
                รหัสที่ยังไม่ได้ส่งมอบ ({filteredItems.filter(i => !i.isDelivered).length} คัน)
              </h3>
            </div>
            <button
              onClick={() => {
                const list = filteredItems.filter(i => !i.isDelivered).map(i => i.code);
                if (list.length > 0) {
                  navigator.clipboard.writeText(list.join(', '));
                  setToastMessage({ type: 'success', text: `คัดลอก ${list.length} รหัสเรียบร้อยแล้ว!` });
                }
              }}
              className="text-xs text-[#F58220] hover:underline self-start sm:self-auto flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              คัดลอกรายการด้านล่างนี้
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {filteredItems.filter(i => !i.isDelivered).length > 0 ? (
              filteredItems.filter(i => !i.isDelivered).map((item) => (
                <button
                  key={item.code}
                  onClick={() => setSelectedVehicle(item)}
                  className="px-2.5 py-1 rounded-lg bg-[#F58220]/20 hover:bg-[#F58220] text-[#F58220] hover:text-white border border-[#F58220]/40 font-mono text-xs font-bold transition-all hover:scale-105"
                  title="คลิกเพื่อบันทึกส่งมอบรหัสนี้ทันที"
                >
                  {item.code} +
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">ไม่มีรายการค้างส่งมอบตามเงื่อนไขที่เลือก</span>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Grid Matrix */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">
          <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-3">
            <svg className="animate-spin h-8 w-8 text-[#F58220]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p>กำลังคำนวณและดึงสถานะเลขรถ...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 border border-white/10 rounded-2xl bg-white/5">
          <p className="text-gray-400 text-base">ไม่พบเลขรถตามเงื่อนไขการค้นหา</p>
          <button
            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
            className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-all"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredItems.map((item) => {
            const isA = item.type === 'A';
            const isB = item.type === 'B';
            const isC = item.type === 'C';

            return (
              <div
                key={item.code}
                className={`p-3.5 rounded-2xl border transition-all relative group flex flex-col justify-between ${
                  item.isDelivered
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/30'
                    : 'bg-orange-950/20 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-950/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-base font-extrabold font-mono ${
                      item.isDelivered ? 'text-emerald-300' : 'text-[#F58220]'
                    }`}>
                      {item.code}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isA ? 'bg-blue-500/20 text-blue-300' :
                      isB ? 'bg-emerald-500/20 text-emerald-300' :
                      isC ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {item.type}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-1 mb-2 font-medium" title={item.productName}>
                    {item.productName}
                  </p>
                </div>

                {item.isDelivered ? (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold mb-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span className="truncate">{item.departmentNameTh}</span>
                    </div>
                    {item.handoffDate && (
                      <p className="text-[10px] text-gray-400 font-mono">
                        {new Date(item.handoffDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                    {item.departmentKey && (
                      <Link
                        href={`/department/${encodeURIComponent(item.departmentKey)}`}
                        className="mt-2 block w-full py-1 text-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        ดูแผนกนี้ &rarr;
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-orange-500/20">
                    <div className="flex items-center justify-between text-xs text-orange-400 font-medium mb-2">
                      <span>⏳ ยังไม่ส่งมอบ</span>
                    </div>
                    <button
                      onClick={() => setSelectedVehicle(item)}
                      className="w-full py-1.5 bg-[#F58220] hover:bg-[#d9721a] text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-[#F58220]/20 flex items-center justify-center gap-1"
                    >
                      <span>+</span>
                      <span>ส่งมอบทันที</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Handoff Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#F58220]/20 text-[#F58220]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </span>
                <h3 className="text-lg font-bold">บันทึกส่งมอบด่วน</h3>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickHandoffSubmit} className="space-y-4">
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">รหัสรถ:</span>
                  <span className="text-base font-bold font-mono text-[#F58220]">{selectedVehicle.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">ชื่อสินค้า:</span>
                  <span className="text-xs text-white font-medium">{selectedVehicle.productName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">แผนกที่รับมอบ *</label>
                <select
                  value={handoffDept}
                  onChange={(e) => setHandoffDept(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#F58220]"
                  required
                >
                  <option value="" disabled>-- เลือกแผนกที่รับมอบ --</option>
                  {departments.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.nameTh} ({d.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">วันที่ส่งมอบ *</label>
                <div className="w-full">
                  <InteractiveDatePicker
                    selectedDate={handoffDate}
                    onDateChange={setHandoffDate}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHandoff || !handoffDept}
                  className="flex-1 py-2.5 bg-[#F58220] hover:bg-[#d9721a] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#F58220]/20"
                >
                  {isSubmittingHandoff ? 'กำลังบันทึก...' : 'ยืนยันการส่งมอบ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Fleet Settings Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">ตั้งค่าเป้าหมายจำนวนรถ (Target Fleet)</h3>
              <button onClick={() => setShowTargetModal(false)} className="text-gray-400 hover:text-white p-1">✕</button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              ปรับจำนวนเป้าหมายของรถแต่ละรหัสเพื่อคำนวณและแสดงเลขที่ยังไม่ได้ส่งมอบตามสัญญาหรือล็อตการผลิต
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">เป้าหมายรหัส A (APIX Round A)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={targetA}
                  onChange={(e) => setTargetA(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#F58220]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">เป้าหมายรหัส B (APIX RX B)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={targetB}
                  onChange={(e) => setTargetB(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#F58220]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">เป้าหมายรหัส C (APIX Flow C)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={targetC}
                  onChange={(e) => setTargetC(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#F58220]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setTargetA(200); setTargetB(100); setTargetC(100); }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-xl"
              >
                คืนค่าเริ่มต้น (200/100/100)
              </button>
              <button
                type="button"
                onClick={() => { setShowTargetModal(false); fetchData(); }}
                className="flex-1 py-2.5 bg-[#F58220] hover:bg-[#d9721a] text-white rounded-xl text-sm font-semibold transition-all"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
