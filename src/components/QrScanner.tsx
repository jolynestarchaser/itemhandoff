'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  active: boolean;
  onScanSuccess: (qrData: string, productName: string, productId: string) => void;
}

export default function QrScanner({ active, onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      setErrorMsg('');
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // ใช้กล้องหลังมือถือ
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          console.log('Scanned Text:', decodedText);
          
          const parts = decodedText.split(' ');
          const productId = parts.length >= 2 ? parts.pop() || '' : '';
          const productName = parts.join(' ');

          // ส่งค่ากลับไปที่ Parent โดยตรง (การปิดกล้องจะทำโดยอัตโนมัติผ่าน prop active ที่เปลี่ยนไป)
          onScanSuccess(decodedText, productName, productId);
        },
        () => {
          // ข้ามเฟรมเมื่อไม่เจอ QR Code
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setIsScanning(false);
      setErrorMsg(
        'ไม่สามารถเปิดกล้องได้: โปรดเปิดใช้งานผ่าน HTTPS (สำหรับทดสอบในมือถือ) หรือกดยอมรับสิทธิ์การเข้าถึงกล้อง'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.warn('Failed to stop scanner:', err);
        }
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // ควบคุมการเปิด/ปิดกล้องตามสถานะ active ของ Component
  useEffect(() => {
    if (active) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(err => console.warn('Cleanup stop:', err));
        }
        scannerRef.current = null;
      }
    };
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md max-w-md mx-auto w-full">
      <h2 className="text-xl font-bold text-white">สแกน QR Code</h2>
      
      {/* หน้าจอกล้อง */}
      <div 
        id="qr-reader" 
        className="w-full max-w-xs overflow-hidden rounded-xl bg-black border border-white/20 aspect-square flex items-center justify-center text-center p-4 text-sm text-gray-400"
      >
        {!isScanning && !errorMsg && 'กำลังเปิดกล้อง...'}
        {errorMsg && <span className="text-red-400 font-semibold">{errorMsg}</span>}
      </div>

      {isScanning && (
        <button 
          onClick={stopScanner} 
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
        >
          ปิดกล้อง
        </button>
      )}

      {errorMsg && (
        <button 
          onClick={startScanner} 
          className="w-full py-3 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all"
        >
          ลองเปิดกล้องใหม่อีกครั้ง
        </button>
      )}
    </div>
  );
}
