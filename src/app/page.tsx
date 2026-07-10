'use client';

import { useState } from 'react';
import QrScanner from '@/components/QrScanner';
import HandoffForm from '@/components/HandoffForm';
import Link from 'next/dist/client/link';

interface ScannedData {
  qrData: string;
  productName: string;
  productId: string;
}

export default function Home() {
  // State สำหรับเก็บข้อมูลที่สแกนได้ หากยังไม่มีข้อมูล (null) จะแสดงหน้าสแกน
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);

  // ฟังก์ชันนี้จะถูกเรียกเมื่อสแกน QR สำเร็จ โดยรับค่าที่ส่งมาจากกล้อง
  const handleScanSuccess = (qrData: string, productName: string, productId: string) => {
    setScannedData({ qrData, productName, productId });
  };

  // ฟังก์ชันนี้จะถูกเรียกเมื่อผู้ใช้กด Cancel ในหน้าฟอร์ม จะกลับไปหน้าสแกน
  const handleCancel = () => {
    setScannedData(null);
  };

  return (
    <div className='grid grid-cols-2  gap-2'>
      <Link href="/handoff" className="border border-r rounded-3xl border-white p-10 text-center bg-[#F58220]">
        ส่งมอบสินค้า
      </Link>
      <button className='border border-r rounded-3xl border-white p-10 bg-[#F58220]'>Recent</button>
      <button className='border border-r rounded-3xl border-white p-10 bg-[#F58220]'>Summary</button>
      <button className='border border-r rounded-3xl border-white p-10 bg-[#F58220]'>Excel</button>
    </div>
  );
}
