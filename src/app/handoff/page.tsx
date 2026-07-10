'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import QrScanner from '@/components/QrScanner';
import { checkProductExists, createHandoffRecord } from '@/lib/actions';
import Link from 'next/link';

// กำหนดประเภทข้อมูลที่ฟอร์มจะรองรับ
type HandoffFormInputs = {
  qrData: string;
  productName: string;
  productId: string;
  department: string;
};

export default function HandoffPage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(true);
  const [existingRecord, setExistingRecord] = useState<{ department: string; createdAt: Date } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 1. เรียกใช้ React Hook Form และระบุค่าตั้งต้น (defaultValues)
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<HandoffFormInputs>({
    defaultValues: {
      qrData: '',
      productName: '',
      productId: '',
      department: '',
    }
  });

  const departments = ['HR', 'IT', 'Marketing', 'Sales', 'Finance', 'Operations'];

  // 2. ฟังก์ชันนี้จะทำหน้าที่รับข้อมูลเมื่อ Scan สำเร็จ
  const handleScanSuccess = async (qrData: string, productName: string, productId: string) => {
    // ดึงข้อมูล Prisma Server Action เพื่อตรวจสอบรหัสสินค้าในระบบก่อน
    const existing = await checkProductExists(productId);

    if (existing) {
      // หากพบข้อมูลเดิม ให้แสดงกล่องแจ้งเตือนด้วย state
      setExistingRecord({
        department: existing.department,
        createdAt: existing.createdAt
      });
    } else {
      // หากไม่พบ ให้เคลียร์สถานะประวัติเดิม
      setExistingRecord(null);
    }

    // 3. ใช้ฟังก์ชัน `setValue` ของ React Hook Form ในการหยอดค่าใส่ Input อัตโนมัติ
    setValue('qrData', qrData);
    setValue('productName', productName);
    setValue('productId', productId);
    
    // ปิดตัวสแกนแล้วเปิดหน้าฟอร์มแสดงผล
    setShowScanner(false);
  };

  // 4. ฟังก์ชัน onSubmit เมื่อผู้ใช้ยืนยันการกรอกฟอร์มสำเร็จ (ส่งข้อมูลลง DB)
  const onSubmit = async (data: HandoffFormInputs) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    const result = await createHandoffRecord(data);
    
    if (result.success && result.id) {
      // บันทึกสำเร็จ ส่งไปหน้าพิมพ์เอกสาร
      router.push(`/print/${result.id}`);
    } else {
      setSubmitError(result.error || 'ไม่สามารถบันทึกข้อมูลได้');
      setIsSubmitting(false);
    }
  };

  // 5. ล้างค่าฟอร์มกลับสู่ค่าตั้งต้นและกลับไปหน้าสแกนใหม่
  const handleReset = () => {
    reset(); // สั่งรีเซ็ตค่าในฟอร์มของ React Hook Form
    setExistingRecord(null);
    setSubmitError('');
    setShowScanner(true);
  };

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <div className="mb-6 flex justify-between items-center no-print">
        <Link href="/" className="text-sm text-[#A0A0A0] hover:text-white flex items-center gap-1">
          &larr; กลับหน้าหลัก
        </Link>
      </div>

      {showScanner ? (
        <div className="space-y-4">
          <QrScanner onScanSuccess={handleScanSuccess} />
          <div className="text-center mt-4">
            <button 
              onClick={() => setShowScanner(false)}
              className="text-sm text-[#F58220] underline"
            >
              หรือกรอกข้อมูลเองโดยไม่สแกน
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 space-y-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white text-center">บันทึกการส่งมอบสินค้า</h2>

          {/* แสดงกล่องเตือนสีส้มกรณีที่สินค้านี้เคยลงทะเบียนส่งมอบไปแล้ว */}
          {existingRecord && (
            <div className="p-4 bg-[#F58220]/20 border border-[#F58220] rounded-xl text-sm space-y-2">
              <p className="font-bold text-[#F58220]">⚠️ สินค้านี้เคยสแกนส่งมอบไปแล้ว!</p>
              <p>แผนกที่ได้รับล่าสุด: <strong className="text-white underline">{existingRecord.department}</strong></p>
              <p>ส่งมอบเมื่อ: <span className="text-gray-300">{new Date(existingRecord.createdAt).toLocaleString('th-TH')}</span></p>
              <p className="text-xs text-gray-400">คุณสามารถส่งมอบไปยังแผนกอื่นซ้ำได้ หรือกดปุ่ม "สแกนใหม่" เพื่อสแกนสินค้าชิ้นถัดไป</p>
            </div>
          )}

          {/* 6. ผูกฟอร์มเข้ากับ handleSubmit ของ React Hook Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            {/* ข้อมูล QR Code */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">ข้อมูล QR Code</label>
              <input
                type="text"
                {...register('qrData', { required: 'กรุณากรอกข้อมูล QR' })}
                placeholder="เช่น Apix Round A001"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-[#F58220]"
              />
              {errors.qrData && <p className="text-red-400 text-xs mt-1">{errors.qrData.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ชื่อสินค้า */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">ชื่อสินค้า</label>
                <input
                  type="text"
                  {...register('productName', { required: 'ระบุชื่อสินค้า' })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-[#F58220]"
                />
                {errors.productName && <p className="text-red-400 text-xs mt-1">{errors.productName.message}</p>}
              </div>

              {/* รหัสสินค้า */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">รหัสสินค้า (ID)</label>
                <input
                  type="text"
                  {...register('productId', { required: 'ระบุรหัสสินค้า' })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-[#F58220]"
                />
                {errors.productId && <p className="text-red-400 text-xs mt-1">{errors.productId.message}</p>}
              </div>
            </div>

            {/* ตัวเลือกแผนก */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">แผนกผู้รับมอบ</label>
              <select
                {...register('department', { required: 'กรุณาเลือกแผนก' })}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-[#F58220] focus:border-transparent transition-all"
              >
                <option value="">เลือกแผนก...</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
            </div>

            {submitError && (
              <p className="text-red-400 text-sm text-center font-semibold">{submitError}</p>
            )}

            {/* ปุ่มทำรายการ */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
              >
                สแกนใหม่
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันส่งมอบ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}