'use client';

import { useState, useRef, useEffect } from 'react';

interface InteractiveDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (dateStr: string) => void;
  highlightedDates?: Record<string, number>; // dateStr -> record count
}

export default function InteractiveDatePicker({
  selectedDate,
  onDateChange,
  highlightedDates = {},
}: InteractiveDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Parse initial selected date for calendar view navigation
  const parsedDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth() || new Date().getMonth()); // 0-indexed

  // Sync view when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const thaiWeekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  // Calculate days in current view month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateChange(dStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onDateChange(todayStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Format display date in Thai
  const displayFormattedDate = () => {
    if (!selectedDate) return 'เลือกวันที่';
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return selectedDate;
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const todayDateObj = new Date();
  const todayStr = `${todayDateObj.getFullYear()}-${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;

  return (
    <div className={`relative inline-block w-full sm:w-auto ${isOpen ? 'z-50' : 'z-10'}`} ref={containerRef}>
      {/* Trigger Button - Full width on mobile, auto on desktop */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="คลิกเพื่อเปิดปฏิทินเลือกวันที่"
        aria-expanded={isOpen}
        className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 px-3.5 sm:px-4 py-2.5 bg-black/60 hover:bg-white/10 border border-[#F58220]/50 hover:border-[#F58220] rounded-xl text-white transition-all shadow-md shadow-black/40 group cursor-pointer"
        title="คลิกเพื่อเปิดปฏิทินเลือกวันที่"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F58220] text-white flex items-center justify-center text-sm shadow-md shadow-[#F58220]/30 group-hover:scale-105 transition-transform flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">วันที่ส่งมอบ (เลือกปฏิทิน)</span>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F58220] transition-colors">
              {displayFormattedDate()}
            </span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 group-hover:text-white transition-transform ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Hidden Native Input */}
      <input
        ref={nativeInputRef}
        type="date"
        aria-label="เลือกวันที่"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
      />

      {/* Backdrop for Mobile & Click Outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Calendar Popover - Solid Background & High Z-Index */}
      {isOpen && (
        <div className="fixed sm:absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 top-24 sm:top-full mt-2 z-[100] w-[92vw] max-w-xs sm:w-80 p-4 bg-[#1c1c21] border border-white/20 rounded-2xl shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="เดือนก่อนหน้า"
              className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="เดือนก่อนหน้า"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center font-bold text-white text-sm">
              <span>{thaiMonths[viewMonth]}</span>{' '}
              <span className="text-[#F58220]">{viewYear + 543}</span>
              <span className="text-xs text-gray-400 font-normal ml-1">({viewYear})</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="เดือนถัดไป"
              className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="เดือนถัดไป"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {thaiWeekDays.map((wd, i) => (
              <span key={wd} className={`text-[11px] font-semibold ${i === 0 ? 'text-rose-400' : 'text-gray-400'}`}>
                {wd}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {/* Empty slots from previous month */}
            {[...Array(firstDayOfWeek)].map((_, i) => {
              const prevDayNum = prevMonthDays - firstDayOfWeek + i + 1;
              return (
                <div key={`prev-${i}`} className="p-1.5 text-xs text-gray-600 select-none flex items-center justify-center h-9">
                  {prevDayNum}
                </div>
              );
            })}

            {/* Current Month Days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = todayStr === dateStr;
              const recordsCount = highlightedDates[dateStr] || 0;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`relative p-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center h-9 touch-manipulation ${
                    isSelected
                      ? 'bg-[#F58220] text-white shadow-md shadow-[#F58220]/40 font-bold scale-105'
                      : isToday
                      ? 'bg-white/15 text-white border border-[#F58220]/50 hover:bg-white/20'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{day}</span>
                  {recordsCount > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-emerald-400'
                      }`}
                      title={`มีรายการส่งมอบ ${recordsCount} คัน`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Popover Footer: Quick Jump Actions */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              📅 ไปที่วันนี้
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs sm:hidden"
            >
              ปิด
            </button>

            <button
              type="button"
              onClick={() => {
                if (nativeInputRef.current?.showPicker) {
                  nativeInputRef.current.showPicker();
                }
              }}
              className="hidden sm:inline text-[#F58220] hover:underline text-[11px]"
            >
              ปฏิทินระบบ &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
