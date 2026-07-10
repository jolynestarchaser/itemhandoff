'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
    return { success: true, id: record.id };
  } catch (error) {
    console.error('Failed to create record:', error);
    return { success: false, error: 'Failed to create record' };
  }
}

export async function getAllRecords() {
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

export async function getRecordById(id: string) {
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

export async function checkProductExists(productId: string) {
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
