'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QrScanner from '@/components/QrScanner';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DepartmentDeliveryNote from '@/components/DepartmentDeliveryNote';
import InteractiveDatePicker from '@/components/InteractiveDatePicker';
import Icon from '@/components/Icon';
import { getRecordsByDepartment, deleteRecord, checkProductExistsGlobal, createHandoffRecord, moveRecordToDepartment, getDeletedRecordsByDepartment, restoreDeletedRecord } from '@/lib/actions';
import { HandoffRecord, DeletedHandoffRecord } from '@prisma/client';
import { departmentCategories, findDepartment, getDeptThaiName } from '@/lib/departments';
import { useUrlState } from '@/lib/useUrlState';

type SaveResult =
  | { productId: string; productName: string; status: 'saved' }
  | { productId: string; productName: string; status: 'duplicate'; department: string }
  | { productId: string; productName: string; status: 'failed'; error: string };

function normalizeScannedItem(productName: string, rawProductId: string): { productName: string; productId: string } {
  const match = rawProductId.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) {
    return { productName, productId: rawProductId.toUpperCase() };
  }
  const prefix = match[1].toUpperCase();
  const productId = `${prefix}${match[2].padStart(3, '0')}`;
  if (prefix === 'A') return { productName: 'APIX Round A', productId };
  if (prefix === 'B') return { productName: 'APIX RX B', productId };
  if (prefix === 'C') return { productName: 'APIX Flow C', productId };
  return { productName, productId };
}

export default function DepartmentPage() {
  const params = useParams();
  const department = decodeURIComponent(params.name as string);
  const departmentInfo = findDepartment(department);
  const departmentNameTh = departmentInfo ? departmentInfo.nameTh : department;
  const departmentNameEn = departmentInfo ? departmentInfo.nameEn : department;
  const categoryInfo = departmentCategories.find(c => c.id === departmentInfo?.category);

  const [records, setRecords] = useState<HandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useUrlState<'items' | 'add' | 'scan' | 'print'>('tab', 'items');
  const [selectedProduct, setSelectedProduct] = useState<string>('APIX Round A');
  const [customProduct, setCustomProduct] = useState('');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [manualItems, setManualItems] = useState<{ productName: string; productId: string }[]>([]);
  
  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HandoffRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Feedback Messages
  const [saveResults, setSaveResults] = useState<SaveResult[]>([]);
  const [movingId, setMovingId] = useState('');
  const [deletedRecords, setDeletedRecords] = useState<DeletedHandoffRecord[]>([]);
  const [restoringId, setRestoringId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchItemQuery, setSearchItemQuery] = useState('');
  
  // Date State
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);
  
  const [selectedDate, setSelectedDate] = useUrlState<string>('date', todayStr);

  const formatDateStr = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Fetch records from Database
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const [data, deleted] = await Promise.all([
        getRecordsByDepartment(department),
        getDeletedRecordsByDepartment(department),
      ]);
      setRecords(data);
      setDeletedRecords(deleted);
      
      // If no records for today, but there are existing records on other dates, pick latest date
      if (data.length > 0) {
        const dates = Array.from(new Set(data.map(r => formatDateStr(r.handoffDate || r.createdAt)))).sort((a, b) => b.localeCompare(a));
        const dateChosenInUrl = new URLSearchParams(window.location.search).has('date');
        if (dates.length > 0 && !dates.includes(todayStr) && !dateChosenInUrl) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setLoading(false);
    }
  }, [department, todayStr, setSelectedDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Unique dates with records for quick filtering
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(records.map(r => formatDateStr(r.handoffDate || r.createdAt)))).sort((a, b) => b.localeCompare(a));
    if (!dates.includes(todayStr)) {
      return [todayStr, ...dates];
    }
    return dates;
  }, [records, todayStr]);

  const dateCounts = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      const dStr = formatDateStr(r.handoffDate || r.createdAt);
      map[dStr] = (map[dStr] || 0) + 1;
    });
    return map;
  }, [records]);

  // Records for the currently selected date
  const dateFilteredRecords = useMemo(() => {
    return records.filter(r => formatDateStr(r.handoffDate || r.createdAt) === selectedDate);
  }, [records, selectedDate]);

  // Search filtered records
  const displayRecords = useMemo(() => {
    if (!searchItemQuery.trim()) return dateFilteredRecords;
    const q = searchItemQuery.toLowerCase();
    return dateFilteredRecords.filter(r => 
      r.productId.toLowerCase().includes(q) || 
      r.productName.toLowerCase().includes(q)
    );
  }, [dateFilteredRecords, searchItemQuery]);

  // Grouped summary of records on selected date
  const groupedSummary = useMemo(() => {
    const map: Record<string, { name: string; serials: string[]; count: number }> = {};
    let countA = 0, countB = 0, countC = 0, countOther = 0;

    dateFilteredRecords.forEach(r => {
      if (!map[r.productName]) {
        map[r.productName] = { name: r.productName, serials: [], count: 0 };
      }
      map[r.productName].serials.push(r.productId);
      map[r.productName].count++;

      const pid = r.productId.toUpperCase();
      if (pid.startsWith('A')) countA++;
      else if (pid.startsWith('B')) countB++;
      else if (pid.startsWith('C')) countC++;
      else countOther++;
    });

    return {
      byProduct: Object.values(map),
      total: dateFilteredRecords.length,
      countA,
      countB,
      countC,
      countOther
    };
  }, [dateFilteredRecords]);

  // Product Helper
  const getProductPrefix = (productType: string) => {
    if (productType === 'APIX Round A') return 'A';
    if (productType === 'APIX RX B') return 'B';
    if (productType === 'APIX Flow C') return 'C';
    return '';
  };

  const saveItem = useCallback(async (item: { productName: string; productId: string }): Promise<SaveResult> => {
    const check = await checkProductExistsGlobal(item.productId);
    if (check.exists) {
      return { ...item, status: 'duplicate', department: check.department! };
    }

    const result = await createHandoffRecord({
      qrData: `${item.productName} ${item.productId}`,
      productName: item.productName,
      productId: item.productId,
      department,
      handoffDate: selectedDate,
    });

    if (result.success) {
      return { ...item, status: 'saved' };
    }
    if (result.duplicateDepartment) {
      return { ...item, status: 'duplicate', department: result.duplicateDepartment };
    }
    return { ...item, status: 'failed', error: result.error || 'ไม่สามารถบันทึกข้อมูลได้' };
  }, [department, selectedDate]);

  // Handle QR Scan Success: กล้องเปิดค้างไว้ แต่ละคันที่สแกนจะเข้าคิวรอบันทึก
  const handleScanSuccess = useCallback((qrData: string, productName: string, rawProductId: string) => {
    setErrorMsg('');
    const item = normalizeScannedItem(productName, rawProductId || qrData);
    setManualItems(prev => {
      if (prev.some(i => i.productId === item.productId)) {
        setSuccessMsg(`${item.productId} อยู่ในคิวแล้ว`);
        return prev;
      }
      setSuccessMsg(`เพิ่ม ${item.productId} ลงคิวแล้ว`);
      return [...prev, item];
    });
  }, []);

  // Add items from input to queue (supports single or comma/space separated numbers)
  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim() || !selectedProduct) return;

    const prefix = getProductPrefix(selectedProduct);
    const finalProductName = selectedProduct === 'อื่นๆ' ? customProduct.trim() : selectedProduct;
    if (!finalProductName) {
      setErrorMsg('กรุณาระบุชื่อสินค้า');
      return;
    }

    // Split input by comma or whitespace for bulk adding
    const rawTokens = manualCodeInput.split(/[, \n]+/).map(s => s.trim()).filter(Boolean);
    const newItems: { productName: string; productId: string }[] = [];
    const duplicatesInQueue: string[] = [];

    rawTokens.forEach(token => {
      let productId = token;
      if (prefix) {
        const numOnly = token.replace(/\D/g, '');
        if (numOnly) {
          productId = `${prefix}${numOnly.padStart(3, '0')}`;
        } else {
          productId = `${prefix}${token.toUpperCase()}`;
        }
      } else {
        productId = token.toUpperCase();
      }

      // Check if already in queue
      if (manualItems.some(i => i.productId === productId) || newItems.some(i => i.productId === productId)) {
        duplicatesInQueue.push(productId);
      } else {
        newItems.push({ productName: finalProductName, productId });
      }
    });

    if (newItems.length > 0) {
      setManualItems(prev => [...prev, ...newItems]);
      setManualCodeInput('');
      setErrorMsg('');
      if (duplicatesInQueue.length > 0) {
        setSuccessMsg(`เพิ่ม ${newItems.length} รายการลงคิว (ข้าม ${duplicatesInQueue.join(', ')} ที่ซ้ำในคิว)`);
      }
    } else if (duplicatesInQueue.length > 0) {
      setErrorMsg(`รหัส ${duplicatesInQueue.join(', ')} มีอยู่ในคิวแล้ว`);
    }
  };

  // Submit all items in queue to DB
  const handleSubmitQueue = async () => {
    if (manualItems.length === 0) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    const results: SaveResult[] = [];
    for (const item of manualItems) {
      results.push(await saveItem(item));
    }

    await fetchRecords();
    setIsSubmitting(false);
    setSaveResults(results);

    const notSaved = results.filter(r => r.status !== 'saved').map(r => r.productId);
    setManualItems(prev => prev.filter(i => notSaved.includes(i.productId)));
    if (notSaved.length === 0) {
      setSuccessMsg(`บันทึกสำเร็จ ${results.length} รายการลงแผนก ${departmentNameTh} (วันที่ ${selectedDate})`);
      setSaveResults([]);
      setActiveTab('items');
    }
  };

  const handleMoveHere = async (productId: string) => {
    setMovingId(productId);
    const result = await moveRecordToDepartment(productId, department, selectedDate);
    setMovingId('');
    if (result.success) {
      setSaveResults(prev => prev.map(r => (r.productId === productId ? { productId: r.productId, productName: r.productName, status: 'saved' } : r)));
      setManualItems(prev => prev.filter(i => i.productId !== productId));
      fetchRecords();
    } else {
      setErrorMsg(result.error || 'ไม่สามารถย้ายแผนกได้');
    }
  };

  const handleRestore = async (record: DeletedHandoffRecord) => {
    setRestoringId(record.id);
    setSuccessMsg('');
    setErrorMsg('');
    const result = await restoreDeletedRecord(record.id);
    setRestoringId('');
    if (result.success) {
      setSuccessMsg('กู้คืน ' + record.productId + ' แล้ว');
      fetchRecords();
    } else {
      setErrorMsg(result.error || 'ไม่สามารถกู้คืนข้อมูลได้');
    }
  };

  // Delete Action Handlers
  const handleDeleteClick = (record: HandoffRecord) => {
    setDeleteTarget(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteRecord(deleteTarget.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeleteTarget(null);

    if (result.success) {
      setSuccessMsg(`ลบ "${deleteTarget.productName}" (${deleteTarget.productId}) สำเร็จ`);
      fetchRecords();
    } else {
      setErrorMsg(result.error || 'ไม่สามารถลบข้อมูลได้');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const queuePanel = manualItems.length > 0 && (
    <div className="border border-white/10 rounded-xl p-4 bg-black/40 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-300 inline-flex items-center gap-2">
          <Icon name="box" />
          รายการที่รอส่งมอบ ({manualItems.length} คัน)
        </span>
        <button
          type="button"
          onClick={() => setManualItems([])}
          className="min-h-11 px-3 text-sm text-red-400 hover:underline"
        >
          ล้างคิวทั้งหมด
        </button>
      </div>

      <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
        {manualItems.map((item, idx) => (
          <span key={item.productId} className="asset-tag inline-flex items-center gap-1 pr-0">
            <span>{item.productId}</span>
            <button
              type="button"
              onClick={() => setManualItems(manualItems.filter((_, i) => i !== idx))}
              aria-label={`นำรหัส ${item.productId} ออกจากคิว`}
              className="w-11 h-11 -my-2 inline-flex items-center justify-center text-gray-400 hover:text-red-400"
            >
              <Icon name="x" size={14} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className="min-h-11 px-4 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold rounded-xl"
        >
          กลับไปหน้ารายการ
        </button>
        <button
          type="button"
          onClick={handleSubmitQueue}
          disabled={isSubmitting}
          className="flex-1 min-h-11 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>กำลังบันทึก...</span>
          ) : (
            <>
              <Icon name="save" />
              <span>บันทึกส่งมอบทั้งหมด {manualItems.length} รายการ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 text-white pb-24">
      {/* On-Screen Navigation & Header */}
      <div className="no-print space-y-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 min-h-11 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Icon name="arrowLeft" size={14} />
          <span>กลับหน้าหลัก (รายชื่อแผนก)</span>
        </Link>

        {/* Department Banner Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-white/8 via-white/5 to-transparent border border-white/10 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {categoryInfo && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-gray-300 border border-white/10">
                  {categoryInfo.label}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F58220]/20 text-brand-ink border border-[#F58220]/30">
                Key: {department}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              แผนก {departmentNameTh}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              {departmentNameEn}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-black/40 p-3 rounded-xl border border-white/10">
            <div className="text-center px-2">
              <span className="block text-[10px] text-gray-400 uppercase font-medium">วันที่เลือก</span>
              <span className="text-base font-black text-emerald-400 font-mono">{groupedSummary.total} คัน</span>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div className="text-center px-2">
              <span className="block text-[10px] text-gray-400 uppercase font-medium">รวมทุกวัน</span>
              <span className="text-base font-black text-white font-mono">{records.length} คัน</span>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
              {groupedSummary.countA > 0 && <span className="text-blue-300">A:{groupedSummary.countA}</span>}
              {groupedSummary.countB > 0 && <span className="text-pink-300">B:{groupedSummary.countB}</span>}
              {groupedSummary.countC > 0 && <span className="text-purple-300">C:{groupedSummary.countC}</span>}
              {groupedSummary.total === 0 && <span className="text-gray-500 italic text-[11px]">ว่าง</span>}
            </div>
          </div>
        </div>

        {/* Date Selection Bar with Interactive Calendar */}
        <div className="relative z-30 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <InteractiveDatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              highlightedDates={dateCounts}
            />
          </div>

          {/* Quick Date Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            <span className="text-[11px] text-gray-400 hidden sm:inline font-semibold">เลือกเร็ว:</span>
            {availableDates.slice(0, 4).map(dStr => {
              const isSelected = selectedDate === dStr;
              const isToday = dStr === todayStr;
              const dLabel = isToday ? 'วันนี้' : new Date(dStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
              const countForDate = dateCounts[dStr] || 0;

              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => setSelectedDate(dStr)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 text-xs whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#F58220] text-white font-bold shadow-md shadow-[#F58220]/20'
                      : 'bg-black/30 hover:bg-white/10 text-gray-300 border border-white/10'
                  }`}
                >
                  <span>{dLabel}</span>
                  {countForDate > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-gray-300 font-mono">
                      {countForDate}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div role="status" className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-sm text-emerald-300 flex items-center justify-center gap-2">
            <Icon name="check" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div role="alert" className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-sm text-red-300 flex items-center justify-center gap-2">
            <Icon name="alert" />
            <span>{errorMsg}</span>
          </div>
        )}
        {saveResults.length > 0 && (
          <div className="p-4 bg-white/5 border border-white/15 rounded-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white">
                ผลการบันทึก: สำเร็จ {saveResults.filter(r => r.status === 'saved').length} จาก {saveResults.length} คัน
              </h2>
              <button
                type="button"
                onClick={() => setSaveResults([])}
                className="min-h-11 px-3 text-sm text-gray-300 hover:text-white"
              >
                ปิด
              </button>
            </div>
            <ul className="divide-y divide-white/10">
              {saveResults.map(result => (
                <li key={result.productId} className="py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="asset-tag">{result.productId}</span>
                  {result.status === 'saved' && (
                    <span className="inline-flex items-center gap-1 text-emerald-300"><Icon name="check" size={14} />บันทึกแล้ว</span>
                  )}
                  {result.status === 'failed' && (
                    <span className="inline-flex items-center gap-1 text-red-300"><Icon name="alert" size={14} />{result.error}</span>
                  )}
                  {result.status === 'duplicate' && (
                    <>
                      <span className="inline-flex items-center gap-1 text-amber-300">
                        <Icon name="alert" size={14} />
                        มีอยู่แล้วที่แผนก{' '}
                        <Link href={`/department/${encodeURIComponent(result.department)}`} className="underline font-semibold">
                          {getDeptThaiName(result.department)}
                        </Link>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveHere(result.productId)}
                        disabled={movingId === result.productId}
                        className="ml-auto min-h-11 px-3 inline-flex items-center gap-1.5 rounded-xl bg-[#F58220]/20 border border-[#F58220]/40 text-brand-ink font-semibold disabled:opacity-50"
                      >
                        <Icon name="move" size={14} />
                        {movingId === result.productId ? 'กำลังย้าย...' : `ย้ายมาแผนก ${departmentNameTh}`}
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'items'
                ? 'bg-[#F58220] text-white shadow-lg shadow-[#F58220]/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon name="list" />
            <span>รายการสินค้า ({dateFilteredRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-[#F58220] text-white shadow-lg shadow-[#F58220]/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon name="plus" />
            <span>เพิ่มสินค้า / กรอกรหัส</span>
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-[#F58220] text-white shadow-lg shadow-[#F58220]/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon name="camera" />
            <span>สแกน QR{manualItems.length > 0 ? ` (${manualItems.length})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'print'
                ? 'bg-[#F58220] text-white shadow-lg shadow-[#F58220]/20'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon name="file" />
            <span>ใบส่งมอบ A4 {dateFilteredRecords.length === 0 ? '(ฟอร์มเปล่า)' : ''}</span>
          </button>
        </div>

        {/* TAB CONTENT 1: ADD PRODUCT FORM (Simple, Visual, Itemized) */}
        {activeTab === 'add' && (
          <div className="p-5 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>เพิ่มสินค้าลงแผนก {departmentNameTh}</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                เลือกประเภทรถเข็นและระบุรหัส (สามารถพิมพ์รหัสหลายตัวคั่นด้วยลูกน้ำหรือเว้นวรรคได้ เช่น 73, 74, 75)
              </p>
            </div>

            {/* Step 1: Visual Product Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                1. เลือกประเภทสินค้า / รถเข็น:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'APIX Round A', code: 'A', name: 'APIX Round A', desc: 'ตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
                  { id: 'APIX RX B', code: 'B', name: 'APIX RX B', desc: 'ลิ้นชักจัดเก็บยา 20 ช่อง', color: 'border-pink-500/50 bg-pink-500/10 text-pink-300' },
                  { id: 'APIX Flow C', code: 'C', name: 'APIX Flow C', desc: 'งานเจาะเลือด / Treatment', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
                  { id: 'อื่นๆ', code: '?', name: 'อื่นๆ', desc: 'ระบุชื่อเอง', color: 'border-gray-500/50 bg-gray-500/10 text-gray-300' },
                ].map((item) => {
                  const isSelected = selectedProduct === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedProduct(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-[#F58220] bg-[#F58220]/20 shadow-md shadow-[#F58220]/20 scale-102'
                          : 'border-white/10 bg-black/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-black text-sm text-brand-ink">{item.code}</span>
                        {isSelected && <span className="text-brand-ink text-xs">✓</span>}
                      </div>
                      <div className="font-bold text-white text-xs truncate">{item.name}</div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Product Name if 'อื่นๆ' */}
            {selectedProduct === 'อื่นๆ' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  ระบุชื่อสินค้าอื่นๆ:
                </label>
                <input
                  type="text"
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F58220]"
                  placeholder="เช่น อุปกรณ์เสริม, คอมพิวเตอร์..."
                  required
                />
              </div>
            )}

            {/* Step 2: Code Input Form */}
            <form onSubmit={handleAddToQueue} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  2. ระบุหมายเลข / Serial Number:
                </label>
                <div className="flex bg-black/60 border border-white/20 rounded-xl focus-within:border-[#F58220] overflow-hidden transition-colors">
                  {getProductPrefix(selectedProduct) && (
                    <div className="flex items-center justify-center pl-4 pr-1 text-brand-ink font-mono font-black text-lg select-none">
                      {getProductPrefix(selectedProduct)}
                    </div>
                  )}
                  <input
                    type="text"
                    aria-label="ระบุหมายเลข หรือ Serial Number"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    className="w-full bg-transparent px-3 py-3 text-sm text-white focus:outline-none font-mono placeholder:text-gray-500"
                    placeholder={
                      getProductPrefix(selectedProduct)
                        ? "พิมพ์ตัวเลข เช่น 73 หรือหลายคัน เช่น 73, 74, 75"
                        : "พิมพ์รหัสสินค้า เช่น A073, C085"
                    }
                    autoFocus
                  />
                  <button
                    type="submit"
                    aria-label="เพิ่มลงคิว"
                    className="px-4 bg-[#F58220] hover:bg-[#d9721a] text-white text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0"
                  >
                    <span>+ เพิ่มลงคิว</span>
                  </button>
                </div>
              </div>
            </form>

            {queuePanel}
          </div>
        )}

        {/* TAB CONTENT 2: QR SCANNER */}
        {activeTab === 'scan' && (
          <div className="p-5 border border-white/10 rounded-2xl bg-white/5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Icon name="camera" />
                <span>สแกน QR Code รถเข็น</span>
              </h2>
              <p className="text-sm text-gray-400">สแกนต่อเนื่องได้หลายคัน แล้วกดบันทึกครั้งเดียวด้านล่าง</p>
            </div>

            <QrScanner active={activeTab === 'scan'} onScanSuccess={handleScanSuccess} onManualEntry={() => setActiveTab('add')} />
            {queuePanel}
          </div>
        )}

        {/* TAB CONTENT 3: ITEM LIST (Clean, Itemized & Searchable) */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  aria-label="ค้นหารหัสรถในแผนกนี้"
                  value={searchItemQuery}
                  onChange={(e) => setSearchItemQuery(e.target.value)}
                  placeholder="ค้นหารหัสรถในแผนกนี้ (เช่น A073)..."
                  className="w-full pl-8 pr-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F58220]"
                />
                <span className="absolute left-2.5 top-2.5 text-gray-400"><Icon name="search" size={14} /></span>
                {searchItemQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchItemQuery('')}
                    aria-label="ล้างการค้นหา"
                    className="absolute right-0 top-0 w-9 h-9 inline-flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-3.5 py-2 bg-[#F58220] hover:bg-[#d9721a] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-[#F58220]/20"
                >
                  <Icon name="plus" />
                  <span>เพิ่มสินค้า</span>
                </button>
                {dateFilteredRecords.length > 0 && (
                  <button
                    onClick={() => setActiveTab('print')}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Icon name="printer" />
                    <span>สั่งพิมพ์ A4</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grouped Product Model Cards */}
            {groupedSummary.byProduct.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {groupedSummary.byProduct.map((group) => (
                  <div key={group.name} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white truncate">{group.name}</span>
                      <span className="px-2 py-0.2 rounded-full bg-[#F58220]/20 text-brand-ink font-mono font-bold">
                        {group.count} คัน
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto mt-1.5">
                      {group.serials.map(sn => (
                        <span key={sn} className="px-1.5 py-0.2 rounded bg-black/40 text-[11px] font-mono text-gray-300 border border-white/10">
                          {sn}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Itemized Table of Delivered Records */}
            {loading ? (
              <div className="text-center py-12 text-gray-400 animate-pulse">
                กำลังโหลดรายการสินค้า...
              </div>
            ) : displayRecords.length === 0 ? (
              <div className="text-center py-16 border border-white/10 rounded-2xl bg-white/5">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Icon name="box" size={22} />
                </div>
                <p className="text-base text-gray-300 font-medium">ยังไม่มีสินค้าในแผนกนี้ สำหรับวันที่เลือก</p>
                <p className="text-xs text-gray-500 mt-1">กดปุ่ม "เพิ่มสินค้า" หรือ "สแกน QR" ด้านบนเพื่อบันทึกรายการ</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="mt-4 px-4 py-2 bg-[#F58220] hover:bg-[#d9721a] text-white text-xs font-bold rounded-xl transition-all shadow"
                >
                  เพิ่มสินค้ารายการแรก
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-black/50 text-[10px] text-gray-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3">ชื่อสินค้า / รุ่น</th>
                      <th className="px-4 py-3">Serial Number (รหัสรถ)</th>
                      <th className="px-4 py-3 text-center">เวลาบันทึก</th>
                      <th className="px-4 py-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayRecords.map((record, index) => (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-center font-mono text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {record.productName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="asset-tag">{record.productId}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400 font-mono text-[11px]">
                          {new Date(record.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteClick(record)}
                            aria-label={`ลบ ${record.productId}`}
                            className="min-h-11 min-w-11 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                          >
                            <Icon name="trash" size={14} />
                            <span>ลบ</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 4: PRINT PREVIEW */}
        {activeTab === 'print' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-sm text-gray-300">ตัวอย่างใบส่งมอบชั่วคราว (ขนาด A4 พร้อมต้นฉบับและสำเนา)</span>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'items' && deletedRecords.length > 0 && (
        <details className="no-print mb-6 rounded-2xl border border-white/10 bg-white/5">
          <summary className="min-h-11 px-4 flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-300">
            <Icon name="trash" size={14} />
            รายการที่ลบ ({deletedRecords.length})
          </summary>
          <ul className="divide-y divide-white/10 px-4 pb-2">
            {deletedRecords.map(record => (
              <li key={record.id} className="py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="asset-tag">{record.productId}</span>
                <span className="text-gray-300">{record.productName}</span>
                <span className="text-xs text-gray-500">
                  ลบเมื่อ {new Date(record.deletedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <button
                  type="button"
                  onClick={() => handleRestore(record)}
                  disabled={restoringId === record.id}
                  className="ml-auto min-h-11 px-3 inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold disabled:opacity-50"
                >
                  <Icon name="undo" size={14} />
                  {restoringId === record.id ? 'กำลังกู้คืน...' : 'กู้คืน'}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Print Delivery Note Document Section */}
      <div className={activeTab === 'print' ? 'block' : 'hidden print:block'}>
        <div className="bg-white overflow-hidden print-content border border-gray-200 print:border-none print:shadow-none">
          <DepartmentDeliveryNote
            department={departmentNameTh}
            records={dateFilteredRecords}
            date={selectedDate}
            isBlank={dateFilteredRecords.length === 0}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        productName={deleteTarget?.productName || ''}
        productId={deleteTarget?.productId || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  );
}
