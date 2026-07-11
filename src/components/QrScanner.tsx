'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface QrScannerProps {
  active: boolean;
  onScanSuccess: (qrData: string, productName: string, productId: string) => void;
}

export default function QrScanner({ active, onScanSuccess }: QrScannerProps) {
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const hasScannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    // หยุด controls (zxing decoding loop)
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {
        // ignore
      }
      controlsRef.current = null;
    }

    // หยุด media stream ของกล้อง
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setStatus('idle');
  }, []);

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return;

    await stopScanner();

    setStatus('starting');
    setErrorMsg('');
    hasScannedRef.current = false;

    try {
      // Dynamic import เพื่อหลีกเลี่ยงปัญหา SSR
      const { BrowserMultiFormatReader } = await import('@zxing/browser');

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // เริ่ม decode จากกล้องหลัง (environment)
      const controls = await reader.decodeFromVideoDevice(
        undefined, // ใช้กล้อง default (จะเลือก environment ถ้ามี)
        videoRef.current,
        (result, error) => {
          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true;

            const decodedText = result.getText();
            console.log('Scanned:', decodedText);

            const parts = decodedText.split(' ');
            const productId = parts.length >= 2 ? parts.pop() || '' : '';
            const productName = parts.join(' ');

            onScanSuccess(decodedText, productName, productId);
          }
          // ไม่ต้อง handle error — zxing จะ throw NotFoundException ทุก frame ที่ไม่เจอ QR
        }
      );

      controlsRef.current = controls;
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
        Video element สำหรับ zxing-js 
        zxing จะ attach media stream เข้า video element โดยตรง
      */}
      <div className="w-full max-w-xs overflow-hidden rounded-xl bg-black border border-white/20 aspect-square relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        {/* Scan overlay */}
        {status === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-[#F58220] rounded-lg opacity-70 animate-pulse" />
          </div>
        )}
      </div>

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
