'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '@/components/Icon';

interface QrScannerProps {
  active: boolean;
  onScanSuccess: (qrData: string, productName: string, productId: string) => void;
  onManualEntry?: () => void;
}

const REPEAT_SCAN_COOLDOWN_MS = 3000;

function signalScan() {
  navigator.vibrate?.(80);
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => ctx.close();
  } catch {
    // เบราว์เซอร์ที่ไม่รองรับเสียง ยังสแกนต่อได้
  }
}

export default function QrScanner({ active, onScanSuccess, onManualEntry }: QrScannerProps) {
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const lastScanRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });

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

    setTorchSupported(false);
    setTorchOn(false);
    setStatus('idle');
  }, []);

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return;

    await stopScanner();

    setStatus('starting');
    setErrorMsg('');
    lastScanRef.current = { text: '', at: 0 };

    try {
      // Dynamic import เพื่อหลีกเลี่ยงปัญหา SSR
      const { BrowserMultiFormatReader } = await import('@zxing/browser');

      const reader = new BrowserMultiFormatReader();

      // เริ่ม decode จากกล้องหลัง (environment)
      const controls = await reader.decodeFromVideoDevice(
        undefined, // ใช้กล้อง default (จะเลือก environment ถ้ามี)
        videoRef.current,
        (result) => {
          // zxing จะส่ง result ว่างทุก frame ที่ไม่เจอ QR
          if (!result) return;

          const decodedText = result.getText();
          const now = Date.now();
          // กล้องเปิดค้างไว้ จึงต้องกันการอ่าน QR เดิมซ้ำทุกเฟรม
          if (decodedText === lastScanRef.current.text && now - lastScanRef.current.at < REPEAT_SCAN_COOLDOWN_MS) {
            lastScanRef.current.at = now;
            return;
          }
          lastScanRef.current = { text: decodedText, at: now };

          const parts = decodedText.split(' ');
          const productId = parts.length >= 2 ? parts.pop() || '' : '';
          const productName = parts.join(' ');

          signalScan();
          setLastScanned(decodedText);
          onScanSuccess(decodedText, productName, productId);
        }
      );

      controlsRef.current = controls;
      const track = (videoRef.current.srcObject as MediaStream | null)?.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.() as { torch?: boolean } | undefined;
      setTorchSupported(!!capabilities?.torch);
      setStatus('scanning');
    } catch (err) {
      console.error('Failed to start scanner:', err);
      const message = err instanceof Error ? `${err.name} ${err.message}` : '';
      setStatus('error');
      setErrorMsg(
        message.includes('NotAllowedError') || message.includes('Permission')
          ? 'กรุณาอนุญาตการเข้าถึงกล้อง แล้วลองใหม่อีกครั้ง'
          : 'ไม่สามารถเปิดกล้องได้ โปรดตรวจสอบว่าเปิดเว็บผ่าน HTTPS'
      );
    }
  }, [onScanSuccess, stopScanner]);

  const toggleTorch = async () => {
    const track = (videoRef.current?.srcObject as MediaStream | null)?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch (err) {
      console.error('Failed to toggle torch:', err);
      setTorchSupported(false);
    }
  };

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
    <div className="flex flex-col items-center gap-4 p-6 border border-white/10 rounded-2xl bg-white/5 max-w-md mx-auto w-full">
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
            <div className="w-48 h-48 border-2 border-[#F58220] rounded-lg opacity-70" />
          </div>
        )}
        {status === 'scanning' && torchSupported && (
          <button
            type="button"
            onClick={toggleTorch}
            aria-pressed={torchOn}
            aria-label={torchOn ? 'ปิดไฟฉาย' : 'เปิดไฟฉาย'}
            className={`absolute bottom-2 right-2 w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
              torchOn ? 'bg-[#F58220] border-[#F58220] text-white' : 'bg-black/70 border-white/30 text-white'
            }`}
          >
            <Icon name="torch" size={20} />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-300 min-h-5 text-center" aria-live="polite">
        {status === 'starting' && 'กำลังเปิดกล้อง...'}
        {status === 'scanning' && (lastScanned ? `สแกนล่าสุด: ${lastScanned}` : 'กล้องเปิดค้างไว้ สแกนต่อได้ทีละคัน')}
      </p>

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

      {onManualEntry && (
        <button
          type="button"
          onClick={onManualEntry}
          className="min-h-11 px-3 inline-flex items-center gap-2 text-sm text-brand-ink hover:underline"
        >
          <Icon name="keyboard" />
          พิมพ์รหัสรถแทน
        </button>
      )}
    </div>
  );
}
