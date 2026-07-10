import { notFound } from 'next/navigation';
import { getRecordById } from '@/lib/actions';
import DeliveryNote from '@/components/DeliveryNote';

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  // ใน Next.js 15 `params` จะถูกส่งมาเป็น Promise จึงต้องทำการ await ก่อนใช้งาน
  const resolvedParams = await params;
  
  // เรียกใช้ Server Action เพื่อดึงข้อมูล record จาก Database ตาม ID
  const record = await getRecordById(resolvedParams.id);

  // ถ้าไม่พบข้อมูล ให้แสดงหน้า 404 Not Found
  if (!record) {
    notFound();
  }

  // ส่งข้อมูลที่ดึงได้ไปให้ Client Component จัดการแสดงผลและพิมพ์
  return <DeliveryNote record={record} />;
}
