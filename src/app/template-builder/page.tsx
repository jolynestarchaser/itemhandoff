import TemplateBuilder from '@/components/TemplateBuilder';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'สร้าง Template เอกสาร PDF | Inventory Handoff',
  description: 'ออกแบบและสร้าง Template เอกสารส่งมอบ/ตรวจรับทางการแพทย์ เลือกบันทึกเข้า Database หรือ Export PDF ได้ทันที',
};

export default function TemplateBuilderPage() {
  return (
    <main className="w-full">
      <TemplateBuilder />
    </main>
  );
}
