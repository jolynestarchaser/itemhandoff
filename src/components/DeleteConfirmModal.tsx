'use client';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  productName: string;
  productId: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  productName,
  productId,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white text-center mb-2">
          ยืนยันการลบสินค้า
        </h3>

        <p className="text-sm text-gray-400 text-center mb-1">
          คุณต้องการลบสินค้านี้ออกจากรายการหรือไม่?
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 my-4 text-center">
          <p className="text-white font-medium">{productName}</p>
          <p className="text-gray-400 text-sm font-mono">{productId}</p>
        </div>

        <p className="text-xs text-red-400 text-center mb-5">
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {isDeleting ? 'กำลังลบ...' : 'ลบสินค้า'}
          </button>
        </div>
      </div>
    </div>
  );
}
