'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { HandoffRecord } from '@prisma/client';

export async function createHandoffRecord(data: { qrData: string; productName: string; productId: string; department: string; handoffDate?: string }) {
  try {
    const record = await prisma.handoffRecord.create({
      data: {
        qrData: data.qrData,
        productName: data.productName,
        productId: data.productId,
        department: data.department,
        handoffDate: data.handoffDate ? new Date(data.handoffDate) : undefined,
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

export async function createMultipleHandoffRecords(items: { qrData: string; productName: string; productId: string; department: string; handoffDate?: string }[]) {
  try {
    const records = await prisma.$transaction(
      items.map(item => 
        prisma.handoffRecord.create({
          data: {
            qrData: item.qrData,
            productName: item.productName,
            productId: item.productId,
            department: item.department,
            handoffDate: item.handoffDate ? new Date(item.handoffDate) : undefined,
          }
        })
      )
    );
    
    // Revalidate paths once for all items
    if (items.length > 0) {
      revalidatePath('/summary');
      revalidatePath(`/department/${items[0].department}`);
    }
    
    return { success: true, count: records.length };
  } catch (error) {
    console.error('Failed to create multiple records:', error);
    return { success: false, error: 'Failed to create records' };
  }
}

export async function getAllRecords(): Promise<HandoffRecord[]> {
  unstable_noStore();
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
  unstable_noStore();
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

// ค้นหา department ที่มีสินค้านี้อยู่
export async function searchDepartmentsByProduct(query: string): Promise<string[]> {
  try {
    const records = await prisma.handoffRecord.findMany({
      where: {
        OR: [
          { productId: { contains: query, mode: 'insensitive' } },
          { productName: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        department: true
      }
    });
    
    // กรองเอาเฉพาะแผนกที่ไม่ซ้ำกัน
    const uniqueDepartments = Array.from(new Set(records.map(r => r.department)));
    return uniqueDepartments;
  } catch (error) {
    console.error('Failed to search departments by product:', error);
    return [];
  }
}
