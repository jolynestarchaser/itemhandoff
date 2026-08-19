import { getAllRecords } from '@/lib/actions';
import SummaryDocManager from '@/components/SummaryDocManager';

export const dynamic = 'force-dynamic';

export default async function SummaryPage() {
  const records = await getAllRecords();

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <SummaryDocManager records={records} />
    </div>
  );
}
