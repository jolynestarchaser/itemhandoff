'use client';

import { useState } from 'react';
import QrScanner from '@/components/QrScanner';
import HandoffForm from '@/components/HandoffForm';

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
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Inventory System</h1>
        <p className="text-slate-400">Scan product QR codes to record department handoffs.</p>
      </div>

      {/* ถ้ายังไม่ได้สแกน (scannedData เป็น null) จะแสดง QrScanner */}
      {!scannedData ? (
        <QrScanner onScanSuccess={handleScanSuccess} />
      ) : (
        // ถ้าสแกนแล้ว จะแสดง HandoffForm และส่งข้อมูลที่สแกนได้ไปให้
        <HandoffForm 
          qrData={scannedData.qrData}
          productName={scannedData.productName}
          productId={scannedData.productId}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
