import { getAllRecords } from '@/lib/actions';
import Day15SingleDateDeliveryNotes from '@/components/Day15SingleDateDeliveryNotes';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Day15OnlyPage() {
  const records = await getAllRecords();

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="no-print mb-4">
        <Link href="/summary" className="text-sm text-[#A0A0A0] hover:text-white flex items-center gap-1">
          &larr; กลับหน้าสรุปเอกสารทั้งหมด
        </Link>
      </div>

      <Day15SingleDateDeliveryNotes records={records} />
    </div>
  );
}
