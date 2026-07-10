'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface QrScannerProps {
  active: boolean;
  onScanSuccess: (qrData: string, productName: string, productId: string) => void;
}

export default function QrScanner({ active, onScanSuccess }: QrScannerProps) {
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const hasScannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      const state = scanner.getState();
      // State 2 = SCANNING, State 3 = PAUSED
      if (state === 2 || state === 3) {
        await scanner.stop();
      }
    } catch (err) {
      // ไม่สน error ตอน stop เพราะอาจจะหยุดไปแล้ว
    }

    try {
      scanner.clear();
    } catch (err) {
      // clear อาจ fail ถ้า DOM ถูก clean ไปแล้ว - ไม่เป็นไร
    }

    scannerRef.current = null;
  }, []);

  const startScanner = useCallback(async () => {
    // ต้องมี container DOM element ก่อน
    if (!containerRef.current) return;

    // ถ้ามี scanner เก่าอยู่ ให้หยุดก่อน
    await stopScanner();

    // สร้าง div ลูกสำหรับให้ library ใช้งาน (แยกออกจาก React DOM)
    // ทุกครั้งที่สร้างใหม่จะล้างข้อมูลเก่าออกก่อน
    const wrapper = containerRef.current;
    wrapper.innerHTML = '';
    const scannerDiv = document.createElement('div');
    scannerDiv.id = 'qr-reader-' + Date.now(); // ใช้ id ไม่ซ้ำกันทุกครั้ง
    scannerDiv.style.width = '100%';
    wrapper.appendChild(scannerDiv);

    setStatus('starting');
    setErrorMsg('');
    hasScannedRef.current = false;

    try {
      // Dynamic import เพื่อหลีกเลี่ยงปัญหา SSR
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode(scannerDiv.id);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // ป้องกันการ scan ซ้ำหลายครั้ง (กล้องอาจอ่านได้หลาย frame)
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          console.log('Scanned:', decodedText);

          const parts = decodedText.split(' ');
          const productId = parts.length >= 2 ? parts.pop() || '' : '';
          const productName = parts.join(' ');

          onScanSuccess(decodedText, productName, productId);
        },
        () => {
          // ข้ามเฟรมที่ไม่พบ QR
        }
      );

      setStatus('scanning');
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setStatus('error');
      setErrorMsg(
        err?.message?.includes('NotAllowedError') || err?.message?.includes('Permission')
          ? 'กรุณาอนุญาตการเข้าถึงกล้อง แล้วลองใหม่อีกครั้ง'
          : 'ไม่สามารถเปิดกล้องได้ โปรดตรวจสอบว่าเปิดเว็บผ่าน HTTPS'
      );
    }
  }, [onScanSuccess, stopScanner]);

  // ควบคุมกล้องตาม prop active
  useEffect(() => {
    if (active) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md max-w-md mx-auto w-full">
      <h2 className="text-xl font-bold text-white">สแกน QR Code</h2>

      {/* 
        Container สำหรับกล้อง: 
        ใช้ ref แทน id เพื่อให้ React ไม่ยุ่งกับ DOM ภายใน
        Library จะสร้าง <video> และ <canvas> ภายใน div นี้เอง
      */}
      <div
        ref={containerRef}
        className="w-full max-w-xs overflow-hidden rounded-xl bg-black border border-white/20 aspect-square"
      />

      {status === 'starting' && (
        <p className="text-gray-400 text-sm animate-pulse">กำลังเปิดกล้อง...</p>
      )}

      {status === 'error' && (
        <div className="w-full space-y-3 text-center">
          <p className="text-red-400 text-sm font-semibold">{errorMsg}</p>
          <button
            onClick={startScanner}
            className="w-full py-3 bg-[#F58220] hover:bg-[#d9721a] text-white font-semibold rounded-xl transition-all"
          >
            ลองเปิดกล้องใหม่อีกครั้ง
          </button>
        </div>
      )}

      {status === 'scanning' && (
        <button
          onClick={stopScanner}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
        >
          ปิดกล้อง
        </button>
      )}
    </div>
  );
}
