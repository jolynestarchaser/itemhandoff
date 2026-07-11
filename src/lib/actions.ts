'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { HandoffRecord } from '@prisma/client';

export async function createHandoffRecord(data: { qrData: string; productName: string; productId: string; department: string }) {
  try {
    const record = await prisma.handoffRecord.create({
      data: {
        qrData: data.qrData,
        productName: data.productName,
        productId: data.productId,
        department: data.department,
      },
    });
    revalidatePath('/summary');
    revalidatePath(`/department/${data.department}`);
    return { success: true, id: record.id };
  } catch (error) {
    console.error('Failed to create record:', error);
    return { success: false, error: 'Failed to create record' };
  }
}

export async function getAllRecords(): Promise<HandoffRecord[]> {
  try {
    const records = await prisma.handoffRecord.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return records;
  } catch (error) {
    console.error('Failed to fetch records:', error);
    return [];
  }
}

export async function getRecordById(id: string): Promise<HandoffRecord | null> {
  try {
    const record = await prisma.handoffRecord.findUnique({
      where: { id },
    });
    return record;
  } catch (error) {
    console.error(`Failed to fetch record ${id}:`, error);
    return null;
  }
}

export async function checkProductExists(productId: string): Promise<HandoffRecord | null> {
  try {
    const record = await prisma.handoffRecord.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return record;
  } catch (error) {
    console.error('Failed to check product:', error);
    return null;
  }
}

// ดึง records ตามแผนก
export async function getRecordsByDepartment(department: string): Promise<HandoffRecord[]> {
  try {
    const records = await prisma.handoffRecord.findMany({
      where: { department },
      orderBy: { createdAt: 'desc' },
    });
    return records;
  } catch (error) {
    console.error(`Failed to fetch records for department ${department}:`, error);
    return [];
  }
}

// ลบ record ด้วย ID
export async function deleteRecord(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const record = await prisma.handoffRecord.findUnique({ where: { id } });
    if (!record) {
      return { success: false, error: 'ไม่พบข้อมูลที่ต้องการลบ' };
    }

    await prisma.handoffRecord.delete({ where: { id } });
    revalidatePath(`/department/${record.department}`);
    revalidatePath('/summary');
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete record ${id}:`, error);
    return { success: false, error: 'ไม่สามารถลบข้อมูลได้' };
  }
}

// ตรวจสอบว่า productId ซ้ำในระบบหรือไม่ (ทุกแผนก)
export async function checkProductExistsGlobal(productId: string): Promise<{ exists: boolean; department?: string; createdAt?: Date }> {
  try {
    const record = await prisma.handoffRecord.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    if (record) {
      return { exists: true, department: record.department, createdAt: record.createdAt };
    }
    return { exists: false };
  } catch (error) {
    console.error('Failed to check product globally:', error);
    return { exists: false };
  }
}
