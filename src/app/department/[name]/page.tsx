'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QrScanner from '@/components/QrScanner';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DepartmentDeliveryNote from '@/components/DepartmentDeliveryNote';
import { getRecordsByDepartment, deleteRecord, checkProductExistsGlobal, createHandoffRecord } from '@/lib/actions';
import { HandoffRecord } from '@prisma/client';
import { departments } from '@/lib/departments';

export default function DepartmentPage() {
  const params = useParams();
  const department = decodeURIComponent(params.name as string);
  const departmentInfo = departments.find(d => d.key === department);
  const departmentNameTh = departmentInfo ? departmentInfo.nameTh : department;

  const [records, setRecords] = useState<HandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HandoffRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ department: string; createdAt: Date } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ดึงข้อมูลจาก DB
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const data = await getRecordsByDepartment(department);
    setRecords(data);
    setLoading(false);
  }, [department]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const processScan = useCallback(async (qrData: string, productName: string, productId: string) => {
    // ตรวจสอบซ้ำในระบบ (ทุกแผนก)
    const check = await checkProductExistsGlobal(productId);

    if (check.exists) {
      // มีของซ้ำ — แจ้งแผนกที่มีอยู่ + ไม่ให้เพิ่ม
      setDuplicateInfo({
        department: check.department!,
        createdAt: check.createdAt!,
      });
      return;
    }

    // ไม่ซ้ำ → บันทึกลง DB
    const result = await createHandoffRecord({
      qrData,
      productName,
      productId,
      department,
    });

    if (result.success) {
      setSuccessMsg(`เพิ่ม "${productName}" (${productId}) สำเร็จ`);
      fetchRecords();
    } else {
      setErrorMsg(result.error || 'ไม่สามารถบันทึกข้อมูลได้');
    }
  }, [department, fetchRecords]);

  // เมื่อสแกน QR สำเร็จ ให้เด้งหน้าต่างกรอก Manual แทน
  const handleScanSuccess = useCallback((qrData: string, productName: string, rawProductId: string) => {
    setDuplicateInfo(null);
    setSuccessMsg('');
    setErrorMsg('');
    setShowScanner(false);
    
    // Parse the scanned rawProductId
    let prefix = '';
    let numericPart = rawProductId;
    const match = rawProductId.match(/^([a-zA-Z]+)(.*)$/);
    if (match) {
      prefix = match[1].toUpperCase();
      numericPart = match[2];
      if (numericPart && !isNaN(Number(numericPart))) {
        numericPart = numericPart.padStart(3, '0');
      }
    }
    
    // Map prefix to selectedProduct
    let productType = '';
    if (prefix === 'A') productType = 'APIX Round A';
    else if (prefix === 'B') productType = 'APIX RX B';
    else if (prefix === 'C') productType = 'APIX Flow C';
    else productType = 'อื่นๆ';
    
    setSelectedProduct(productType);
    if (productType === 'อื่นๆ') {
      setCustomProduct(productName || '');
    }
    
    setManualCode(numericPart);
    
    // Open the manual entry form
    setShowManualEntry(true);
  }, []);

  const getPrefix = () => {
    if (selectedProduct === 'APIX Round A') return 'A';
    if (selectedProduct === 'APIX RX B') return 'B';
    if (selectedProduct === 'APIX Flow C') return 'C';
    return '';
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || !selectedProduct) return;
    
    const prefix = getPrefix();
    const rawProductId = manualCode.trim();
    // ถ้ามี prefix อยู่แล้วในสิ่งที่ user พิมพ์มา (เผื่อหลุดมา) ให้ตัดออกก่อนแล้วค่อยต่อใหม่
    // แต่ด้วย UI ที่บังคับกรอกเฉพาะตัวเลข โอกาสเกิดจะน้อยลง
    const numericPart = prefix ? rawProductId.replace(/\D/g, '').padStart(3, '0') : rawProductId;
    const productId = prefix ? prefix + numericPart : rawProductId;
    
    const finalProductName = selectedProduct === 'อื่นๆ' ? customProduct.trim() : selectedProduct;
    const productName = finalProductName || 'Unknown Product';
    const qrData = `${productName} ${productId}`;
    
    handleScanSuccess(qrData, productName, productId);
    setManualCode('');
    setSelectedProduct('');
    setCustomProduct('');
  };

  // เริ่มกระบวนการลบ
  const handleDeleteClick = (record: HandoffRecord) => {
    setDeleteTarget(record);
    setShowDeleteModal(true);
  };

  // ยืนยันการลบ
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const result = await deleteRecord(deleteTarget.id);

    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeleteTarget(null);

    if (result.success) {
      setSuccessMsg(`ลบ "${deleteTarget.productName}" สำเร็จ`);
      fetchRecords();
    } else {
      setErrorMsg(result.error || 'ไม่สามารถลบข้อมูลได้');
    }
  };

  // ปิด modal
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-2xl mx-auto text-white">
      {/* Header — ซ่อนเมื่อพิมพ์ */}
      <div className="no-print mb-6">
        <Link href="/" className="text-sm text-[#A0A0A0] hover:text-white flex items-center gap-1 mb-4">
          &larr; กลับหน้าหลัก
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">แผนก {departmentNameTh}</h1>
            <p className="text-gray-400 text-sm">จัดการรายการสินค้าที่ส่งมอบ</p>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? 'กำลังโหลด...' : `${records.length} รายการ`}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowScanner(true);
                setShowManualEntry(false);
                setDuplicateInfo(null);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className="py-3 px-4 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" />
              </svg>
              สแกน QR
            </button>
            <button
              onClick={() => {
                setShowManualEntry(!showManualEntry);
                setShowScanner(false);
                setDuplicateInfo(null);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              กรอกเอง
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error messages */}
      {successMsg && (
        <div className="no-print mb-4 p-3 bg-green-500/20 border border-green-500 rounded-xl text-sm text-green-400 text-center">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="no-print mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl text-sm text-red-400 text-center">
          ❌ {errorMsg}
        </div>
      )}

      {/* Duplicate warning */}
      {duplicateInfo && (
        <div className="no-print mb-4 p-4 bg-[#F58220]/20 border border-[#F58220] rounded-xl text-sm space-y-2">
          <p className="font-bold text-[#F58220]">⚠️ สินค้านี้มีอยู่ในระบบแล้ว!</p>
          <p>แผนกที่มีสินค้านี้: <strong className="text-white underline">{duplicateInfo.department}</strong></p>
          <p>บันทึกเมื่อ: <span className="text-gray-300">{new Date(duplicateInfo.createdAt).toLocaleString('th-TH')}</span></p>
          <p className="text-xs text-gray-400">ไม่สามารถเพิ่มสินค้าซ้ำได้ กรุณาลบจากแผนก "{duplicateInfo.department}" ก่อน</p>
          <button
            onClick={() => setDuplicateInfo(null)}
            className="mt-2 text-xs text-[#F58220] underline"
          >
            ปิดข้อความนี้
          </button>
        </div>
      )}

      {/* Scanner overlay */}
      {showScanner && (
        <div className="no-print mb-6 space-y-4">
          <QrScanner active={showScanner} onScanSuccess={handleScanSuccess} />
          <button
            onClick={() => setShowScanner(false)}
            className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ยกเลิกการสแกน
          </button>
        </div>
      )}

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="no-print mb-6 p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-4">กรอกรหัสสินค้าเอง</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ประเภทสินค้า</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F58220] appearance-none"
                required
              >
                <option value="" disabled>เลือกประเภทสินค้า...</option>
                <option value="APIX Round A">APIX Round A (รถเข็นสำหรับตรวจเยี่ยมผู้ป่วยใน)</option>
                <option value="APIX RX B">APIX RX B (รถเข็นสำหรับงานเจาะเลือด)</option>
                <option value="APIX Flow C">APIX Flow C (รถเข็นพร้อมลิ้นชักจัดเก็บยา)</option>
                <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
              </select>
            </div>
            {selectedProduct === 'อื่นๆ' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">ระบุชื่อสินค้า</label>
                <input
                  type="text"
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F58220]"
                  placeholder="พิมพ์ชื่อสินค้า..."
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-1">รหัสสินค้า (Serial / Code)</label>
              <div className="flex bg-black/50 border border-white/20 rounded-xl focus-within:border-[#F58220] overflow-hidden transition-colors">
                {getPrefix() && (
                  <div className="flex items-center justify-center pl-4 pr-1 text-[#F58220] font-bold text-lg select-none">
                    {getPrefix()}
                  </div>
                )}
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (getPrefix()) {
                      setManualCode(val.replace(/\D/g, ''));
                    } else {
                      setManualCode(val);
                    }
                  }}
                  className={`w-full bg-transparent py-3 text-white focus:outline-none ${getPrefix() ? 'pl-1 pr-4' : 'px-4'}`}
                  placeholder={getPrefix() ? "ระบุเฉพาะตัวเลข..." : "เช่น A123456"}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowManualEntry(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product list */}
      {!showScanner && !showManualEntry && (
        <div className="no-print space-y-2 mb-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400 animate-pulse">กำลังโหลดข้อมูล...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic border border-white/5 rounded-2xl bg-white/2">
              <p className="text-lg mb-2">ยังไม่มีสินค้าในแผนกนี้</p>
              <p className="text-sm">กดปุ่ม "สแกน QR" หรือ "กรอกเอง" เพื่อเพิ่มสินค้า</p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{record.productName}</p>
                  <p className="text-sm text-gray-400 font-mono">{record.productId}</p>
                </div>
                <button
                  onClick={() => handleDeleteClick(record)}
                  className="ml-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
                  title="ลบสินค้า"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Print delivery note section */}
      {!showScanner && !showManualEntry && records.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden print-content border border-gray-200">
          <DepartmentDeliveryNote department={departmentNameTh} records={records} />
        </div>
      )}

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
