'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { HandoffRecord } from '@prisma/client';
import { departments, getDeptThaiName } from '@/lib/departments';

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
    revalidatePath('/pending-vehicles');
    revalidatePath('/');
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
      revalidatePath('/pending-vehicles');
      revalidatePath('/');
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
    revalidatePath('/pending-vehicles');
    revalidatePath('/');
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

export interface DepartmentStatItem {
  departmentKey: string;
  departmentNameTh: string;
  total: number;
  countA: number;
  countB: number;
  countC: number;
  countOther: number;
  lastHandoff?: string;
}

// ดึงสถิติของทุกแผนก เพื่อแสดง Badge และสรุปในหน้าแรก
export async function getDepartmentStatsMap(): Promise<Record<string, DepartmentStatItem>> {
  unstable_noStore();
  try {
    const records = await prisma.handoffRecord.findMany({
      select: {
        department: true,
        productId: true,
        productName: true,
        handoffDate: true,
        createdAt: true,
      }
    });

    const statsMap: Record<string, DepartmentStatItem> = {};

    // Initialize with all known departments
    departments.forEach(dept => {
      statsMap[dept.key] = {
        departmentKey: dept.key,
        departmentNameTh: dept.nameTh,
        total: 0,
        countA: 0,
        countB: 0,
        countC: 0,
        countOther: 0,
      };
    });

    records.forEach(r => {
      const deptKey = r.department;
      if (!statsMap[deptKey]) {
        statsMap[deptKey] = {
          departmentKey: deptKey,
          departmentNameTh: getDeptThaiName(deptKey),
          total: 0,
          countA: 0,
          countB: 0,
          countC: 0,
          countOther: 0,
        };
      }

      statsMap[deptKey].total += 1;
      const pid = (r.productId || '').toUpperCase();
      if (pid.startsWith('A')) {
        statsMap[deptKey].countA += 1;
      } else if (pid.startsWith('B')) {
        statsMap[deptKey].countB += 1;
      } else if (pid.startsWith('C')) {
        statsMap[deptKey].countC += 1;
      } else {
        statsMap[deptKey].countOther += 1;
      }

      const dateStr = (r.handoffDate || r.createdAt)?.toISOString();
      if (dateStr && (!statsMap[deptKey].lastHandoff || dateStr > statsMap[deptKey].lastHandoff!)) {
        statsMap[deptKey].lastHandoff = dateStr;
      }
    });

    return statsMap;
  } catch (error) {
    console.error('Failed to get department stats map:', error);
    return {};
  }
}

export interface InventoryStockStats {
  spareA: number;
  spareB: number;
  spareC: number;
  totalSpare: number;
  unassembledA: number;
  unassembledB: number;
  unassembledC: number;
  totalUnassembled: number;
}

export interface VehicleHandoffStats {
  totalDelivered: number;
  totalTarget: number;
  countA: number;
  targetA: number;
  countB: number;
  targetB: number;
  countC: number;
  targetC: number;
  countOther: number;
  activeDepartmentsCount: number;
  totalDepartmentsCount: number;
  stock: InventoryStockStats;
  recentRecords: {
    id: string;
    productId: string;
    productName: string;
    department: string;
    departmentNameTh: string;
    date: string;
  }[];
}

// Default Spare & Unassembled stock configuration
const DEFAULT_INVENTORY_STOCK: InventoryStockStats = {
  spareA: 10,
  spareB: 5,
  spareC: 5,
  totalSpare: 20,
  unassembledA: 100,
  unassembledB: 0,
  unassembledC: 0,
  totalUnassembled: 100,
};

// ดึงภาพรวมสถิติสำหรับหน้าแรกและสรุปสถานะ
export async function getVehicleHandoffStats(targets: { A?: number; B?: number; C?: number } = {}): Promise<VehicleHandoffStats> {
  unstable_noStore();
  try {
    const records = await prisma.handoffRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let countA = 0;
    let countB = 0;
    let countC = 0;
    let countOther = 0;
    let maxA = 0;
    let maxB = 0;
    let maxC = 0;

    const deptSet = new Set<string>();

    records.forEach(r => {
      deptSet.add(r.department);
      const pid = (r.productId || '').toUpperCase();
      const num = parseInt(pid.replace(/\D/g, '')) || 0;

      if (pid.startsWith('A')) {
        countA++;
        if (num > maxA) maxA = num;
      } else if (pid.startsWith('B')) {
        countB++;
        if (num > maxB) maxB = num;
      } else if (pid.startsWith('C')) {
        countC++;
        if (num > maxC) maxC = num;
      } else {
        countOther++;
      }
    });

    // Default targets: 200 for A, 100 for B, 100 for C (Total: 400)
    const targetA = targets.A ?? Math.max(200, maxA);
    const targetB = targets.B ?? Math.max(100, maxB);
    const targetC = targets.C ?? Math.max(100, maxC);
    const totalTarget = targetA + targetB + targetC;

    const recentRecords = records.slice(0, 6).map(r => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      department: r.department,
      departmentNameTh: getDeptThaiName(r.department),
      date: (r.handoffDate || r.createdAt).toISOString(),
    }));

    return {
      totalDelivered: records.length,
      totalTarget,
      countA,
      targetA,
      countB,
      targetB,
      countC,
      targetC,
      countOther,
      activeDepartmentsCount: deptSet.size,
      totalDepartmentsCount: departments.length,
      stock: DEFAULT_INVENTORY_STOCK,
      recentRecords,
    };
  } catch (error) {
    console.error('Failed to get vehicle stats:', error);
    return {
      totalDelivered: 0,
      totalTarget: 400,
      countA: 0,
      targetA: 200,
      countB: 0,
      targetB: 100,
      countC: 0,
      targetC: 100,
      countOther: 0,
      activeDepartmentsCount: 0,
      totalDepartmentsCount: departments.length,
      stock: DEFAULT_INVENTORY_STOCK,
      recentRecords: [],
    };
  }
}

export interface VehicleStatusItem {
  code: string;
  type: 'A' | 'B' | 'C' | 'other';
  productName: string;
  isDelivered: boolean;
  departmentKey?: string;
  departmentNameTh?: string;
  handoffDate?: string;
  recordId?: string;
}

export interface VehicleTrackerData {
  items: VehicleStatusItem[];
  stock: InventoryStockStats;
  summary: {
    totalFleet: number;
    deliveredCount: number;
    pendingCount: number;
    typeA: { delivered: number; target: number; pending: number; maxDeliveredNum: number; gaps: string[] };
    typeB: { delivered: number; target: number; pending: number; maxDeliveredNum: number; gaps: string[] };
    typeC: { delivered: number; target: number; pending: number; maxDeliveredNum: number; gaps: string[] };
  };
}

// คำนวณสถานะรถเข็นทุกคัน (ส่งมอบแล้ว / ยังไม่ได้ส่งมอบ)
export async function getAllVehicleStatuses(customTargets: { A?: number; B?: number; C?: number } = {}): Promise<VehicleTrackerData> {
  unstable_noStore();
  try {
    const records = await prisma.handoffRecord.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const recordMap = new Map<string, HandoffRecord>();
    records.forEach(r => {
      recordMap.set(r.productId.toUpperCase(), r);
    });

    // Detect maximum numbers in records
    let maxA = 0;
    let maxB = 0;
    let maxC = 0;

    const deliveredANums = new Set<number>();
    const deliveredBNums = new Set<number>();
    const deliveredCNums = new Set<number>();

    records.forEach(r => {
      const pid = r.productId.toUpperCase();
      const num = parseInt(pid.replace(/\D/g, '')) || 0;
      if (pid.startsWith('A') && num > 0) {
        deliveredANums.add(num);
        if (num > maxA) maxA = num;
      } else if (pid.startsWith('B') && num > 0) {
        deliveredBNums.add(num);
        if (num > maxB) maxB = num;
      } else if (pid.startsWith('C') && num > 0) {
        deliveredCNums.add(num);
        if (num > maxC) maxC = num;
      }
    });

    const targetA = customTargets.A ?? Math.max(200, maxA);
    const targetB = customTargets.B ?? Math.max(100, maxB);
    const targetC = customTargets.C ?? Math.max(100, maxC);

    const items: VehicleStatusItem[] = [];

    // Build A vehicles
    for (let i = 1; i <= targetA; i++) {
      const code = `A${String(i).padStart(3, '0')}`;
      const rec = recordMap.get(code);
      items.push({
        code,
        type: 'A',
        productName: rec?.productName || 'APIX Round A',
        isDelivered: !!rec,
        departmentKey: rec?.department,
        departmentNameTh: rec ? getDeptThaiName(rec.department) : undefined,
        handoffDate: rec ? (rec.handoffDate || rec.createdAt).toISOString() : undefined,
        recordId: rec?.id,
      });
    }

    // Build B vehicles
    for (let i = 1; i <= targetB; i++) {
      const code = `B${String(i).padStart(3, '0')}`;
      const rec = recordMap.get(code);
      items.push({
        code,
        type: 'B',
        productName: rec?.productName || 'APIX RX B',
        isDelivered: !!rec,
        departmentKey: rec?.department,
        departmentNameTh: rec ? getDeptThaiName(rec.department) : undefined,
        handoffDate: rec ? (rec.handoffDate || rec.createdAt).toISOString() : undefined,
        recordId: rec?.id,
      });
    }

    // Build C vehicles
    for (let i = 1; i <= targetC; i++) {
      const code = `C${String(i).padStart(3, '0')}`;
      const rec = recordMap.get(code);
      items.push({
        code,
        type: 'C',
        productName: rec?.productName || 'APIX Flow C',
        isDelivered: !!rec,
        departmentKey: rec?.department,
        departmentNameTh: rec ? getDeptThaiName(rec.department) : undefined,
        handoffDate: rec ? (rec.handoffDate || rec.createdAt).toISOString() : undefined,
        recordId: rec?.id,
      });
    }

    // Add other items in DB that don't match A/B/C or exceed target
    records.forEach(r => {
      const pid = r.productId.toUpperCase();
      if (!items.some(it => it.code === pid)) {
        items.push({
          code: pid,
          type: 'other',
          productName: r.productName,
          isDelivered: true,
          departmentKey: r.department,
          departmentNameTh: getDeptThaiName(r.department),
          handoffDate: (r.handoffDate || r.createdAt).toISOString(),
          recordId: r.id,
        });
      }
    });

    // Compute sequence gaps up to max delivered number
    const gapsA: string[] = [];
    for (let i = 1; i <= maxA; i++) {
      if (!deliveredANums.has(i)) gapsA.push(`A${String(i).padStart(3, '0')}`);
    }

    const gapsB: string[] = [];
    for (let i = 1; i <= maxB; i++) {
      if (!deliveredBNums.has(i)) gapsB.push(`B${String(i).padStart(3, '0')}`);
    }

    const gapsC: string[] = [];
    for (let i = 1; i <= maxC; i++) {
      if (!deliveredCNums.has(i)) gapsC.push(`C${String(i).padStart(3, '0')}`);
    }

    const deliveredCount = records.length;
    const totalFleet = items.length;
    const pendingCount = totalFleet - deliveredCount;

    return {
      items,
      stock: DEFAULT_INVENTORY_STOCK,
      summary: {
        totalFleet,
        deliveredCount,
        pendingCount,
        typeA: {
          delivered: deliveredANums.size,
          target: targetA,
          pending: targetA - deliveredANums.size,
          maxDeliveredNum: maxA,
          gaps: gapsA,
        },
        typeB: {
          delivered: deliveredBNums.size,
          target: targetB,
          pending: targetB - deliveredBNums.size,
          maxDeliveredNum: maxB,
          gaps: gapsB,
        },
        typeC: {
          delivered: deliveredCNums.size,
          target: targetC,
          pending: targetC - deliveredCNums.size,
          maxDeliveredNum: maxC,
          gaps: gapsC,
        },
      }
    };
  } catch (error) {
    console.error('Failed to get vehicle statuses:', error);
    return {
      items: [],
      stock: DEFAULT_INVENTORY_STOCK,
      summary: {
        totalFleet: 0,
        deliveredCount: 0,
        pendingCount: 0,
        typeA: { delivered: 0, target: 200, pending: 200, maxDeliveredNum: 0, gaps: [] },
        typeB: { delivered: 0, target: 100, pending: 100, maxDeliveredNum: 0, gaps: [] },
        typeC: { delivered: 0, target: 100, pending: 100, maxDeliveredNum: 0, gaps: [] },
      }
    };
  }
}
