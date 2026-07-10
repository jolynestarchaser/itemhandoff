'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (qrData: string, productName: string, productId: string) => void;
}

export default function QrScanner({ onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  const startScanner = async () => {
    try {
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // ใช้กล้องหลังมือถือ
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // รูปแบบข้อมูลจาก QR: "Apix Round A001"
          const parts = decodedText.split(' ');
          if (parts.length >= 2) {
            const productId = parts.pop() || '';
            const productName = parts.join(' ');
            
            // เมื่อแสกนสำเร็จ ให้หยุดกล้องก่อนส่งค่ากลับ
            html5QrCode.stop().then(() => {
              setIsScanning(false);
              onScanSuccess(decodedText, productName, productId);
            }).catch(console.error);
          }
        },
        (errorMessage) => {
          // ข้าม error ไป เพราะกล้องจะแจ้งเตือนตลอดเวลาที่หา QR ไม่เจอ
        }
      );
    } catch (err) {
      console.error('Error starting scanner', err);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch(console.error);
    }
  };

  // จัดการล้างข้อมูลและปิดกล้องเมื่อผู้ใช้เปลี่ยนหน้า (Component Unmount)
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  return (
    <div className="glass-panel p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Scan Product QR</h2>
      
      {/* ส่วนสำหรับแสดงภาพจากกล้อง */}
      <div 
        id={containerId} 
        className={`w-full max-w-sm rounded-lg overflow-hidden bg-slate-800 border-2 ${isScanning ? 'border-primary' : 'border-slate-700'}`}
        style={{ minHeight: isScanning ? '300px' : '0' }}
      ></div>

      <div className="mt-6 w-full flex gap-4">
        {!isScanning ? (
          <button onClick={startScanner} className="btn-primary w-full flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
            Start Camera
          </button>
        ) : (
          <button onClick={stopScanner} className="btn-primary w-full bg-red-500 hover:bg-red-600">
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
