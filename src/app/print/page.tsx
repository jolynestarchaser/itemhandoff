import { getAllRecords } from '@/lib/actions';
import PrintHubManager from '@/components/PrintHubManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ศูนย์รวมการพิมพ์เอกสาร (Print Hub) | Inventory Handoff',
  description: 'ศูนย์รวมระบบการพิมพ์เอกสารส่งมอบ ใบสรุปภาพรวม สลิปรายคัน และเอกสารตามวันที่มาตรฐานโรงพยาบาล',
};

export const dynamic = 'force-dynamic';

export default async function PrintHubPage() {
  const records = await getAllRecords();

  return (
    <main className="w-full">
      <PrintHubManager records={records} />
    </main>
  );
}
