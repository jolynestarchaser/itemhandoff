'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHandoffRecord } from '@/lib/actions';

interface HandoffFormProps {
  qrData: string;
  productName: string;
  productId: string;
  onCancel: () => void;
}

export default function HandoffForm({ qrData, productName, productId, onCancel }: HandoffFormProps) {
  const router = useRouter(); // นำเข้า useRouter สำหรับการเปลี่ยนหน้าเพจ
  const [department, setDepartment] = useState(''); // เก็บค่าแผนกที่ถูกเลือก
  const [isSubmitting, setIsSubmitting] = useState(false); // เช็คสถานะตอนกำลังบันทึกข้อมูล
  const [error, setError] = useState(''); // เก็บข้อความแจ้งเตือนข้อผิดพลาด

  const departments = ['HR', 'IT', 'Marketing', 'Sales', 'Finance', 'Operations'];

  // ฟังก์ชันทำงานเมื่อผู้ใช้กด Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันไม่ให้เบราว์เซอร์รีเฟรชหน้าเว็บ
    if (!department) {
      setError('Please select a department');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // เรียกใช้ Server Action เพื่อบันทึกข้อมูลลง Database
    const result = await createHandoffRecord({
      qrData,
      productName,
      productId,
      department
    });

    if (result.success && result.id) {
      // ถ้าสำเร็จ ให้เปลี่ยนหน้าไปยังหน้า Print (/print/[id])
      router.push(`/print/${result.id}`);
    } else {
      setError(result.error || 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-bold mb-6 text-white">Record Handoff</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ช่องแสดงชื่อสินค้า (อ่านได้อย่างเดียว) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Product Name</label>
          <input 
            type="text" 
            readOnly 
            value={productName} 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white opacity-80"
          />
        </div>

        {/* ช่องแสดงรหัสสินค้า (อ่านได้อย่างเดียว) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Product ID</label>
          <input 
            type="text" 
            readOnly 
            value={productId} 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white opacity-80"
          />
        </div>

        {/* ตัวเลือกแผนก */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Receiving Department</label>
          <select 
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            required
          >
            <option value="" disabled>Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* แสดงข้อผิดพลาด (ถ้ามี) */}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex gap-4 mt-8">
          {/* ปุ่มยกเลิก จะกลับไปหน้าสแกน */}
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {/* ปุ่มบันทึก */}
          <button 
            type="submit" 
            disabled={isSubmitting || !department}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
