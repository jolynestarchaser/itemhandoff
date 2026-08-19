import { getAllRecords } from '@/lib/actions';
import Day18DeliveryNotes from '@/components/Day18DeliveryNotes';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Day18OnlyPage() {
  const records = await getAllRecords();

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="no-print mb-4">
        <Link href="/summary" className="text-sm text-[#A0A0A0] hover:text-white flex items-center gap-1">
          &larr; กลับหน้าสรุปเอกสารทั้งหมด
        </Link>
      </div>

      <Day18DeliveryNotes records={records} />
    </div>
  );
}
