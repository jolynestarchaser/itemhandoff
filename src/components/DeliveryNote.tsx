'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { HandoffRecord } from '@prisma/client';

interface DeliveryNoteProps {
  record: HandoffRecord;
}

export default function DeliveryNote({ record }: DeliveryNoteProps) {
  // สั่งให้เบราว์เซอร์เปิดหน้าต่าง Print อัตโนมัติเมื่อโหลดหน้านี้เสร็จ (หน่วงเวลา 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // จัดรูปแบบวันที่ให้อ่านง่าย
  const formattedDate = new Date(record.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // สร้าง Component ย่อยสำหรับแสดงใบส่งของ 1 สำเนา (จะถูกเรียกใช้ 2 ครั้งสำหรับ 2 ส่วน)
  const NoteCopy = ({ title }: { title: string }) => (
    <div className="print-half flex flex-col p-8 border-b-2 border-dashed border-gray-400 last:border-b-0 bg-white text-black h-[50vh]">
      
      {/* ส่วนหัวของใบส่งของ */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">Inventory Handoff System</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-600">Record ID: {record.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
      </div>

      {/* ส่วนแสดงรายละเอียดข้อมูลสินค้า */}
      <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8 my-4">
        <div className="col-span-2 bg-gray-50 p-4 border border-gray-200 rounded">
          <p className="text-xs text-gray-500 uppercase font-semibold">QR Data</p>
          <p className="font-mono text-lg">{record.qrData}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Product Name</p>
          <p className="font-medium text-lg border-b border-gray-300 pb-1">{record.productName}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Product ID</p>
          <p className="font-medium text-lg border-b border-gray-300 pb-1">{record.productId}</p>
        </div>

        <div className="col-span-2 mt-2">
          <p className="text-xs text-gray-500 uppercase font-semibold">Receiving Department</p>
          <p className="font-medium text-xl border-b border-gray-300 pb-1 text-[#6d28d9]">{record.department}</p>
        </div>
      </div>

      {/* ส่วนสำหรับเซ็นชื่อรับมอบ */}
      <div className="mt-auto flex justify-between gap-12 pt-12">
        <div className="flex-1 text-center">
          <div className="border-b border-black w-full mb-2"></div>
          <p className="text-sm font-semibold">Handed over by</p>
          <p className="text-xs text-gray-500 mt-1">Date: ___/___/20__</p>
        </div>
        <div className="flex-1 text-center">
          <div className="border-b border-black w-full mb-2"></div>
          <p className="text-sm font-semibold">Received by</p>
          <p className="text-xs text-gray-500 mt-1">Date: ___/___/20__</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="print-container bg-white min-h-screen font-sans">
      {/* ส่วนควบคุมบนหน้าจอ จะถูกซ่อนเมื่อพิมพ์ (no-print) */}
      <div className="no-print p-4 flex gap-4 bg-slate-100 border-b border-slate-200">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium cursor-pointer">
          Print Now
        </button>
        <Link href="/" className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 font-medium">
          Back to Scanner
        </Link>
      </div>

      {/* แสดง 2 สำเนา ต้นฉบับและสำเนาผู้รับ */}
      <NoteCopy title="Sender Copy" />
      <NoteCopy title="Receiver Copy" />
    </div>
  );
}
