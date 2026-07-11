'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QrScanner from '@/components/QrScanner';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DepartmentDeliveryNote from '@/components/DepartmentDeliveryNote';
import { getRecordsByDepartment, deleteRecord, checkProductExistsGlobal, createHandoffRecord } from '@/lib/actions';
import { HandoffRecord } from '@prisma/client';

export default function DepartmentPage() {
  const params = useParams();
  const department = decodeURIComponent(params.name as string);

  const [records, setRecords] = useState<HandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
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

  // เมื่อสแกน QR สำเร็จ
  const handleScanSuccess = useCallback(async (qrData: string, productName: string, productId: string) => {
    setDuplicateInfo(null);
    setSuccessMsg('');
    setErrorMsg('');

    // ตรวจสอบซ้ำในระบบ (ทุกแผนก)
    const check = await checkProductExistsGlobal(productId);

    if (check.exists) {
      // มีของซ้ำ — แจ้งแผนกที่มีอยู่ + ไม่ให้เพิ่ม
      setDuplicateInfo({
        department: check.department!,
        createdAt: check.createdAt!,
      });
      setShowScanner(false);
      return;
    }

    // ไม่ซ้ำ → บันทึกลง DB
    const result = await createHandoffRecord({
      qrData,
      productName,
      productId,
      department,
    });

    setShowScanner(false);

    if (result.success) {
      setSuccessMsg(`เพิ่ม "${productName}" (${productId}) สำเร็จ`);
      fetchRecords();
    } else {
      setErrorMsg(result.error || 'ไม่สามารถบันทึกข้อมูลได้');
    }
  }, [department, fetchRecords]);

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
            <h1 className="text-2xl font-bold">แผนก {department}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? 'กำลังโหลด...' : `${records.length} รายการ`}
            </p>
          </div>

          <button
            onClick={() => {
              setShowScanner(true);
              setDuplicateInfo(null);
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className="py-3 px-5 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            เพิ่มสินค้า
          </button>
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

      {/* Product list */}
      {!showScanner && (
        <div className="no-print space-y-2 mb-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400 animate-pulse">กำลังโหลดข้อมูล...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic border border-white/5 rounded-2xl bg-white/2">
              <p className="text-lg mb-2">ยังไม่มีสินค้าในแผนกนี้</p>
              <p className="text-sm">กดปุ่ม "เพิ่มสินค้า" เพื่อเริ่มสแกน QR Code</p>
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
      {!showScanner && records.length > 0 && (
        <DepartmentDeliveryNote department={department} records={records} />
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
