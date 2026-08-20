'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { departments, DepartmentItem } from '@/lib/departments';
import { 
  documentPresets, 
  DocumentPreset, 
  availablePlaceholders, 
  replaceTemplatePlaceholders 
} from '@/lib/templatePresets';
import { createMultipleHandoffRecords } from '@/lib/actions';
import { printHtmlDocument } from '@/lib/printUtils';
import Link from 'next/link';

interface SavedTemplateItem {
  id: string;
  name: string;
  savedAt: string;
  templateHtml: string;
}

export default function TemplateBuilder() {
  // Preset & Editor State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(documentPresets[0].id);
  const [activeTab, setActiveTab] = useState<'form' | 'code'>('form');
  const [templateHtml, setTemplateHtml] = useState<string>(documentPresets[0].templateHtml);
  const [zoomScale, setZoomScale] = useState<number>(75);

  // Form Field State
  const [mounted, setMounted] = useState<boolean>(false);
  const [hospitalName, setHospitalName] = useState<string>('โรงพยาบาลวชิระภูเก็ต');
  const [departmentKey, setDepartmentKey] = useState<string>('SurgicalIcu');
  const [customDepartmentName, setCustomDepartmentName] = useState<string>('');
  const [contractNo, setContractNo] = useState<string>('วภ 104/2569');
  const [deliveryDate, setDeliveryDate] = useState<string>('2026-08-19');
  const [productCode, setProductCode] = useState<'A' | 'B' | 'C' | 'custom'>('B');
  const [customProductName, setCustomProductName] = useState<string>('');
  const [customProductOfficialName, setCustomProductOfficialName] = useState<string>('');
  const [serialsInput, setSerialsInput] = useState<string>('B010, B011');
  const [receiverName, setReceiverName] = useState<string>('พว.สุภาพร แก้วมณี');
  const [receiverPosition, setReceiverPosition] = useState<string>('พยาบาลวิชาชีพชำนาญการ (หัวหน้าหอผู้ป่วย)');
  const [senderName, setSenderName] = useState<string>('');
  const [senderCompany, setSenderCompany] = useState<string>('บริษัท อภิลักษณ์ เฮลท์แคร์ คอร์เปอร์เรชั่น');
  const [notes, setNotes] = useState<string>('ตรวจรับและทดสอบระบบเปิดเครื่อง หน้าจอ และระบบเครือข่ายเรียบร้อย');

  // DB vs Export Only Mode
  const [saveToDb, setSaveToDb] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // LocalStorage Saved Templates
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplateItem[]>([]);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setPresetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load saved templates from localStorage & set mounted
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('inventory_custom_templates');
      if (stored) {
        setSavedTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved templates', e);
    }
  }, []);

  // Compute Active Department Thai Name
  const currentDeptThaiName = useMemo(() => {
    if (departmentKey === 'custom') return customDepartmentName || 'หน่วยงานทั่วไป';
    const found = departments.find(d => d.key === departmentKey);
    return found ? found.nameTh : departmentKey;
  }, [departmentKey, customDepartmentName]);

  // Compute Product Details based on A/B/C/custom
  const currentProductDetails = useMemo(() => {
    if (productCode === 'A') {
      return {
        name: 'APIX Round A',
        officialName: 'รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)',
        code: 'A',
      };
    } else if (productCode === 'B') {
      return {
        name: 'APIX RX B',
        officialName: 'รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)',
        code: 'B',
      };
    } else if (productCode === 'C') {
      return {
        name: 'APIX Flow C',
        officialName: 'รถเข็นคอมพิวเตอร์ All-in-one สำหรับงานเจาะเลือด (Phlebotomy Computer Cart)',
        code: 'C',
      };
    } else {
      return {
        name: customProductName || 'อุปกรณ์ทั่วไป',
        officialName: customProductOfficialName || 'อุปกรณ์ครุภัณฑ์สารสนเทศทางการแพทย์',
        code: 'CUSTOM',
      };
    }
  }, [productCode, customProductName, customProductOfficialName]);

  // Parse serial numbers
  const parsedSerials = useMemo(() => {
    return serialsInput
      .split(/[\n,]+/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
  }, [serialsInput]);

  // Format Display Date Thai
  const formattedDateThai = useMemo(() => {
    try {
      const d = new Date(deliveryDate);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return deliveryDate;
    }
  }, [deliveryDate]);

  // Handle Preset Change
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = documentPresets.find(p => p.id === presetId);
    if (found) {
      setTemplateHtml(found.templateHtml);
      showToast(`โหลดแม่แบบ "${found.name}" เรียบร้อย`, 'info');
    }
  };

  // Replace Values
  const renderedHtml = useMemo(() => {
    const values: Record<string, string> = {
      hospitalName: hospitalName || 'โรงพยาบาลวชิระภูเก็ต',
      departmentName: currentDeptThaiName,
      departmentKey: departmentKey,
      contractNo: contractNo || '-',
      deliveryDate: formattedDateThai,
      productName: currentProductDetails.name,
      productOfficialName: currentProductDetails.officialName,
      productCode: currentProductDetails.code,
      serialList: parsedSerials.join(', ') || 'ไม่มีข้อมูล Serial Number',
      quantity: String(parsedSerials.length || 1),
      receiverName: receiverName || '....................................................',
      receiverPosition: receiverPosition || 'เจ้าหน้าที่ผู้รับมอบ',
      senderName: senderName || '....................................................',
      senderCompany: senderCompany || 'บริษัทผู้ส่งมอบ',
      notes: notes || '-',
      defaultTitle: 'เอกสารส่งมอบและตรวจรับ',
    };

    return replaceTemplatePlaceholders(templateHtml, values);
  }, [
    templateHtml,
    hospitalName,
    currentDeptThaiName,
    departmentKey,
    contractNo,
    formattedDateThai,
    currentProductDetails,
    parsedSerials,
    receiverName,
    receiverPosition,
    senderName,
    senderCompany,
    notes,
  ]);

  // Show Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Insert Placeholder tag into code editor
  const handleInsertTag = (tagKey: string) => {
    const tag = `{{${tagKey}}}`;
    setTemplateHtml(prev => prev + '\n' + tag);
    showToast(`แทรกตัวแปร ${tag} เรียบร้อย`, 'info');
  };

  // Save current template to LocalStorage
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      showToast('กรุณากรอกชื่อแม่แบบ', 'error');
      return;
    }
    const newItem: SavedTemplateItem = {
      id: 'custom-' + Date.now(),
      name: newTemplateName.trim(),
      savedAt: new Date().toLocaleDateString('th-TH'),
      templateHtml,
    };
    const updated = [newItem, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem('inventory_custom_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setShowSaveModal(false);
    showToast(`บันทึกแม่แบบ "${newItem.name}" เรียบร้อยแล้ว`, 'success');
  };

  // Load custom saved template
  const handleLoadSavedTemplate = (item: SavedTemplateItem) => {
    setTemplateHtml(item.templateHtml);
    setSelectedPresetId(item.id);
    showToast(`โหลดแม่แบบที่บันทึกไว้ "${item.name}" แล้ว`, 'info');
  };

  // Delete saved template
  const handleDeleteSavedTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('inventory_custom_templates', JSON.stringify(updated));
    showToast('ลบแม่แบบเรียบร้อยแล้ว', 'info');
  };

  // Handle Main Action Execution
  const handleExecute = async () => {
    if (saveToDb) {
      // Validate
      if (parsedSerials.length === 0) {
        showToast('กรุณาระบุ Serial Number อย่างน้อย 1 รายการเพื่อบันทึกลงฐานข้อมูล', 'error');
        return;
      }

      setIsSubmitting(true);
      try {
        const recordsToCreate = parsedSerials.map(serial => ({
          qrData: `${currentProductDetails.name} ${serial}`,
          productName: currentProductDetails.name,
          productId: serial,
          department: departmentKey === 'custom' ? (customDepartmentName || 'General') : departmentKey,
          handoffDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        }));

        const res = await createMultipleHandoffRecords(recordsToCreate);
        if (res.success) {
          showToast(`บันทึกข้อมูล ${res.count} คันลง Database สำเร็จ! พร้อมเปิดหน้าพิมพ์...`, 'success');
          setTimeout(() => {
            printHtmlDocument(renderedHtml, 'ใบส่งสินค้าชั่วคราว');
          }, 300);
        } else {
          showToast('เกิดข้อผิดพลาดในการบันทึกลง Database: ' + res.error, 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ Database', 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Export / Print only
      showToast('กำลังเตรียมพิมพ์เอกสาร A4 สีขาวล้วน...', 'info');
      printHtmlDocument(renderedHtml, 'ใบส่งสินค้าชั่วคราว');
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`no-print fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all animate-bounce flex items-center gap-3 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
            : toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' 
            : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
        }`}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Embedded CSS for Print & Document Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .document-style {
          font-size: 16px; /* Base size สำหรับ 1rem */
          font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
          color: #000;
          background: #fff;
          padding: 3rem;
          margin-bottom: 2rem;
          position: relative;
          width: 210mm;
          min-height: 297mm;
          max-width: 100%;
          box-sizing: border-box;
          border: 1px solid #e2e8f0;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        .copy-label {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        @media print {
          * {
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4;
            margin: 3rem; /* จัดเอกสารให้อยู่ตรงกลาง ซ้าย-ขวา-บน-ล่าง เท่ากัน */
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
            width: 100% !important;
            overflow: visible !important;
          }
          main,
          .min-h-screen,
          .max-w-7xl,
          .max-w-5xl,
          .grid,
          .lg\\:col-span-7,
          .print-area-wrapper,
          .print-area-wrapper > div,
          .print-transform-container {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: visible !important;
            transform: none !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          .document-style {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            margin-bottom: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            min-height: auto !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          .copy-label {
            top: 0 !important;
            right: 0 !important;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
        .document-style h1 {
          font-size: 1.5em; /* ใช้ em สำหรับ Heading */
          text-align: center;
          margin-bottom: 2rem;
          font-weight: bold;
        }
        .document-style .contract-no {
          text-align: center;
          font-size: 1rem;
          margin-bottom: 2rem;
        }
        .document-style .header-info {
          margin-bottom: 2rem;
        }
        .document-style .info-row {
          display: flex;
          align-items: flex-end;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        .document-style .info-label {
          margin-right: 1rem;
          white-space: nowrap;
        }
        .document-style .info-dots {
          width: 40%;
          border-bottom: 0.1rem dotted #000;
          min-width: 200px;
        }
        .document-style table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }
        .document-style th, .document-style td {
          border: 0.1rem solid #000;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          page-break-inside: avoid;
        }
        .document-style th {
          background-color: #f9f9f9;
          text-align: left;
        }
        .document-style .signature-area {
          display: flex;
          justify-content: space-around;
          margin-top: 4rem;
          page-break-inside: avoid;
        }
        .document-style .signature-box {
          width: 40%;
          font-size: 1rem;
          line-height: 1.5;
        }
        .document-style .signature-title {
          text-align: center;
          margin-bottom: 1.5rem;
          font-weight: bold;
        }
        .document-style .signature-line {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 0.1rem dotted #000;
          width: 100%;
        }
      `}} />

      {/* Header Bar */}
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#F58220]/20 text-[#F58220] border border-[#F58220]/30 text-xs font-semibold flex items-center gap-1">
                <span>✨</span>
                <span>Document & PDF Generator</span>
              </span>
              <span className="text-xs text-gray-400">สร้างเอกสารแบบกำหนดเอง</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              สร้าง <span className="text-[#F58220]">Template เอกสาร PDF</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              ปรับแต่งเอกสารส่งมอบ/ตรวจรับได้อิสระ เลือกลง Database หรือ Export เฉยๆ ได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/print"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs sm:text-sm font-medium rounded-xl border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>ศูนย์รวมการพิมพ์</span>
            </Link>
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>💾</span>
              <span>บันทึก Template นี้</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Builder Layout: Split Screen */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Editor & Control Panel (5 Cols) */}
        <div className="no-print lg:col-span-5 space-y-6">
          
          {/* Preset Selector Card */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                1. เลือกแม่แบบเอกสาร (Presets):
              </label>
              <span className="text-[11px] text-[#F58220] font-medium">
                {documentPresets.length} แม่แบบมาตรฐาน
              </span>
            </div>

            {/* Custom Preset Dropdown */}
            <div className="relative" ref={presetDropdownRef}>
              <button
                type="button"
                onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                className="w-full bg-[#18181b] border border-white/20 hover:border-[#F58220] rounded-xl px-4 py-3 text-sm text-white focus:outline-none flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-black/40"
              >
                <div className="flex items-center gap-2.5 text-left truncate">
                  <span className="text-[#F58220]">📄</span>
                  <span className="font-bold truncate">
                    {documentPresets.find(p => p.id === selectedPresetId)?.name || savedTemplates.find(t => t.id === selectedPresetId)?.name || 'เลือกแม่แบบเอกสาร'}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-gray-400 transition-transform duration-200 ${presetDropdownOpen ? 'rotate-180 text-[#F58220]' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Floating Dropdown Menu */}
              {presetDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#18181b] border border-white/20 rounded-2xl p-2.5 shadow-2xl shadow-black/90 space-y-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div>
                    <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      แม่แบบทางการแพทย์ (มาตรฐาน รพ.)
                    </div>
                    <div className="space-y-1 mt-1">
                      {documentPresets.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              handlePresetSelect(preset.id);
                              setPresetDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#F58220]/20 border border-[#F58220] text-white'
                                : 'hover:bg-white/10 text-gray-200 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                                <span className="text-[#F58220]">📄</span>
                                <span className="truncate">{preset.name}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 mt-1 font-normal line-clamp-2">
                                {preset.description}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-emerald-400 text-xs font-bold shrink-0 ml-1">
                                ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {savedTemplates.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        แม่แบบส่วนตัวที่คุณบันทึกไว้
                      </div>
                      <div className="space-y-1 mt-1">
                        {savedTemplates.map((t) => {
                          const isSelected = selectedPresetId === t.id;
                          return (
                            <div
                              key={t.id}
                              onClick={() => {
                                handleLoadSavedTemplate(t);
                                setPresetDropdownOpen(false);
                              }}
                              className={`p-2 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-amber-500/20 border border-amber-500 text-white'
                                  : 'hover:bg-white/10 text-gray-200 border border-transparent'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs truncate">⭐ {t.name}</div>
                                <div className="text-[10px] text-gray-400">{t.savedAt}</div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSavedTemplate(t.id, e)}
                                className="text-gray-400 hover:text-rose-400 p-1 text-xs shrink-0"
                                title="ลบแม่แบบ"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-gray-400">
                สถานะ: {documentPresets.find(p => p.id === selectedPresetId)?.name || 'กำหนดเอง'}
              </span>
              <button
                type="button"
                onClick={() => handlePresetSelect(documentPresets[0].id)}
                className="text-[11px] text-[#F58220] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>🔄</span>
                <span>คืนค่ามาตรฐาน (A4 2 หน้า)</span>
              </button>
            </div>

            {/* Saved Templates Quick Bar */}
            {savedTemplates.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-[11px] text-gray-400 font-medium block mb-2">แม่แบบส่วนตัวที่บันทึกไว้:</span>
                <div className="flex flex-wrap gap-1.5">
                  {savedTemplates.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSavedTemplate(item)}
                      className={`group px-2.5 py-1 rounded-lg text-xs border cursor-pointer flex items-center gap-1.5 transition-all ${
                        selectedPresetId === item.id 
                          ? 'bg-[#F58220]/20 border-[#F58220] text-[#F58220]' 
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{item.name}</span>
                      <button
                        onClick={(e) => handleDeleteSavedTemplate(item.id, e)}
                        className="text-gray-500 hover:text-rose-400 text-xs px-1"
                        title="ลบแม่แบบนี้"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher Tab (Visual Form vs Code Editor) */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'form' 
                    ? 'bg-[#F58220] text-white shadow-md shadow-[#F58220]/30' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>📝 กรอกฟอร์มข้อมูล</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'code' 
                    ? 'bg-[#F58220] text-white shadow-md shadow-[#F58220]/30' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>💻 โค้ด HTML / Markdown</span>
              </button>
            </div>

            {/* TAB 1: Visual Form Builder */}
            {activeTab === 'form' && (
              <div className="space-y-4 text-xs">
                
                {/* Hospital & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">ชื่อโรงพยาบาล:</label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                      placeholder="โรงพยาบาลวชิระภูเก็ต"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">หน่วยงาน / แผนก:</label>
                    <select
                      value={departmentKey}
                      onChange={(e) => setDepartmentKey(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                    >
                      {departments.map(d => (
                        <option key={d.key} value={d.key} className="bg-[#18181b] text-white py-1.5">{d.nameTh}</option>
                      ))}
                      <option value="custom" className="bg-[#18181b] text-[#F58220] py-1.5">✏️ ระบุชื่อแผนกเอง...</option>
                    </select>
                  </div>
                </div>

                {departmentKey === 'custom' && (
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">ระบุชื่อแผนกเอง:</label>
                    <input
                      type="text"
                      value={customDepartmentName}
                      onChange={(e) => setCustomDepartmentName(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                      placeholder="เช่น แผนกผู้ป่วยพิเศษ อาคาร 5"
                    />
                  </div>
                )}

                {/* Contract No & Delivery Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">เลขที่สัญญา:</label>
                    <input
                      type="text"
                      value={contractNo}
                      onChange={(e) => setContractNo(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                      placeholder="วภ 104/2569"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">วันที่ส่งมอบ:</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                    />
                  </div>
                </div>

                {/* Product Type (A / B / C / Custom) */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-1.5">ประเภทรถเข็น / สินค้า:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { code: 'A', label: 'A (Notebook)' },
                      { code: 'B', label: 'B (จัดยา 20 ช่อง)' },
                      { code: 'C', label: 'C (Treatment)' },
                      { code: 'custom', label: 'อื่นๆ' },
                    ].map(p => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => setProductCode(p.code as any)}
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                          productCode === p.code
                            ? 'bg-[#F58220]/20 border-[#F58220] text-[#F58220] font-bold shadow-md shadow-[#F58220]/20'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {productCode === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">ชื่อรุ่นสินค้า:</label>
                      <input
                        type="text"
                        value={customProductName}
                        onChange={(e) => setCustomProductName(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                        placeholder="เช่น Smart Medical Cart X1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">ชื่อทางการสินค้า:</label>
                      <input
                        type="text"
                        value={customProductOfficialName}
                        onChange={(e) => setCustomProductOfficialName(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                        placeholder="รถเข็นคอมพิวเตอร์พร้อมอุปกรณ์..."
                      />
                    </div>
                  </div>
                )}

                {/* Serial Numbers Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-300 font-semibold">
                      รายการ Serial Number (คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่):
                    </label>
                    <span className="text-xs text-[#F58220] font-bold">
                      {parsedSerials.length} คัน
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={serialsInput}
                    onChange={(e) => setSerialsInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220] font-mono text-xs"
                    placeholder="เช่น B001, B002, B003"
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setSerialsInput(prev => prev ? `${prev}, ${productCode === 'A' ? 'A099' : productCode === 'B' ? 'B099' : 'C099'}` : 'A001')}
                      className="text-[11px] text-gray-400 hover:text-white px-2 py-0.5 bg-white/5 rounded border border-white/10"
                    >
                      + เพิ่มตัวอย่าง
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerialsInput('')}
                      className="text-[11px] text-gray-400 hover:text-rose-300 px-2 py-0.5 bg-white/5 rounded border border-white/10"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>
                </div>

                {/* Signers: Receiver & Sender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="block text-[#F58220] font-semibold">ผู้รับมอบ:</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#F58220]"
                      placeholder="ชื่อผู้รับ"
                    />
                    <input
                      type="text"
                      value={receiverPosition}
                      onChange={(e) => setReceiverPosition(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-[#F58220] text-[11px]"
                      placeholder="ตำแหน่งผู้รับ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[#F58220] font-semibold">ผู้ส่งมอบ:</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#F58220]"
                      placeholder="ชื่อผู้ส่ง"
                    />
                    <input
                      type="text"
                      value={senderCompany}
                      onChange={(e) => setSenderCompany(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-[#F58220] text-[11px]"
                      placeholder="ชื่อบริษัท/สังกัด"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">หมายเหตุเพิ่มเติม:</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F58220]"
                    placeholder="ระบุข้อความหมายเหตุในเอกสาร"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: HTML / Code Template Editor */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    คลิกเพื่อแทรกตัวแปรอัตโนมัติ (Placeholder Tags):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/10">
                    {availablePlaceholders.map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleInsertTag(p.key)}
                        className="px-2 py-1 bg-white/10 hover:bg-[#F58220] hover:text-white rounded text-[11px] font-mono text-gray-200 border border-white/10 transition-all flex items-center gap-1"
                        title={`${p.label} (เช่น ${p.example})`}
                      >
                        <span>{`{{${p.key}}}`}</span>
                        <span className="text-[10px] opacity-60">({p.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    โครงสร้าง HTML ของ Template:
                  </label>
                  <textarea
                    rows={14}
                    value={templateHtml}
                    onChange={(e) => setTemplateHtml(e.target.value)}
                    className="w-full bg-black/90 border border-white/20 rounded-xl p-3 text-xs font-mono text-gray-100 focus:outline-none focus:border-[#F58220] leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Database Target Selector & Action Button */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-black/80 to-zinc-950 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                2. เลือกเป้าหมายการประมวลผล (Processing Destination):
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Mode 1: Export Only */}
                <div
                  onClick={() => setSaveToDb(false)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    !saveToDb 
                      ? 'bg-blue-500/15 border-blue-500 text-white shadow-lg shadow-blue-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">📄</span>
                    <span className="font-bold text-xs">Export PDF เฉยๆ</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    ไม่บันทึกลง Database เหมาะสำหรับออกเอกสารด่วน/เอกสารชั่วคราว
                  </p>
                  <div className="mt-2 text-right">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${!saveToDb ? 'bg-blue-400' : 'bg-gray-600'}`} />
                  </div>
                </div>

                {/* Mode 2: Save to DB + Export */}
                <div
                  onClick={() => setSaveToDb(true)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    saveToDb 
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">💾</span>
                    <span className="font-bold text-xs">บันทึก DB + Export</span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    บันทึก {parsedSerials.length} คันเข้า Database จริง พร้อมอัปเดตยอด
                  </p>
                  <div className="mt-2 text-right">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${saveToDb ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleExecute}
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-white transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer ${
                saveToDb 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30' 
                  : 'bg-gradient-to-r from-[#F58220] to-[#ff9d42] hover:from-[#d9721a] hover:to-[#f58220] shadow-[#F58220]/30'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกข้อมูลและจัดเตรียมเอกสาร...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
                  </svg>
                  <span>
                    {saveToDb ? `บันทึก DB (${parsedSerials.length} คัน) & สั่งพิมพ์ PDF` : '🖨️ สั่งพิมพ์ / บันทึกเป็น PDF (ไม่ลง DB)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live A4 Preview Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Zoom & Preview Controls */}
          <div className="no-print w-full flex flex-wrap items-center justify-between gap-3 p-3 bg-black/60 rounded-xl border border-white/10 backdrop-blur-xl mb-4 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">ตัวอย่างเอกสาร A4 (WYSIWYG Live Preview)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] ${saveToDb ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                {saveToDb ? '💾 โหมด: บันทึกลง Database' : '📄 โหมด: Export อย่างเดียว'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>ซูม:</span>
              <button
                type="button"
                onClick={() => setZoomScale(Math.max(50, zoomScale - 10))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white cursor-pointer"
                title="ย่อขนาด"
              >
                -
              </button>
              <span className="w-10 text-center font-mono font-bold text-white">{zoomScale}%</span>
              <button
                type="button"
                onClick={() => setZoomScale(Math.min(130, zoomScale + 10))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white cursor-pointer"
                title="ขยายขนาด"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(75)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                  zoomScale === 75 ? 'bg-[#F58220] text-white font-bold' : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                พอดีจอ (75%)
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(100)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                  zoomScale === 100 ? 'bg-[#F58220] text-white font-bold' : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                100% (ขนาดจริง)
              </button>
            </div>
          </div>

          {/* A4 Preview Container with Zoom Transform */}
          <div className="w-full overflow-x-auto pb-8 print-area-wrapper flex justify-center">
            <div 
              style={{ 
                width: `${210 * (zoomScale / 100)}mm`,
                minWidth: `${210 * (zoomScale / 100)}mm`,
                transition: 'width 0.15s ease-out',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'visible'
              }}
            >
              <div 
                className="print-transform-container"
                style={{ 
                  transform: `scale(${zoomScale / 100})`, 
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                  width: '210mm',
                  minWidth: '210mm',
                  flexShrink: 0
                }}
              >
                <div 
                  ref={printAreaRef}
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">💾 บันทึกแม่แบบเอกสารส่วนตัว</h3>
            <p className="text-xs text-gray-400">
              ตั้งชื่อแม่แบบเพื่อบันทึกเก็บไว้ใน Browser และนำกลับมาใช้ซ้ำได้ตลอดเวลา
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">ชื่อแม่แบบ:</label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="เช่น ใบส่งมอบพิเศษ - ตึก 5"
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F58220]"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 text-xs rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-[#F58220] hover:bg-[#d9721a] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#F58220]/20"
              >
                บันทึกแม่แบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
