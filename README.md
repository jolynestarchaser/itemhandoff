# Inventory Handoff QR Scanner (Micro-SaaS MVP)

ระบบแอปพลิเคชันบนเว็บสำหรับสแกน QR Code และบันทึกการส่งมอบอุปกรณ์/สินค้าไปยังแผนกต่างๆ ถูกออกแบบมาในรูปแบบ Mobile-First โดยมีหน้าตา UI สไตล์ Glassmorphism ที่ดูทันสมัยและใช้งานง่าย

## 🚀 ฟีเจอร์หลัก (Key Features)

- **QR Code Scanner**: ระบบสแกน QR Code ผ่านกล้องมือถือ (เน้นกล้องหลัง) โดยทำงานผ่านเบราว์เซอร์อัตโนมัติ (ใช้ `html5-qrcode`)
- **Handoff Record Form**: ฟอร์มบันทึกการส่งมอบสินค้า ระบบจะดึงชื่อและรหัสสินค้าจาก QR Code มาเติมให้ทันที พร้อมให้ผู้ใช้เลือก "แผนกที่รับมอบ" (Receiving Department)
- **Printable Delivery Note**: หน้าจอสร้างใบส่งมอบ (Delivery Note) ที่ปรับแต่งด้วย `@media print` สำหรับพิมพ์ลงกระดาษ A4 ซึ่งจะแบ่งเป็นสำเนาผู้ส่ง (Sender Copy) และผู้รับ (Receiver Copy) ภายในกระดาษแผ่นเดียว
- **Summary Dashboard**: หน้าแดชบอร์ดสำหรับดูสรุปรายการประวัติการส่งมอบทั้งหมด และมีปุ่ม Export ข้อมูลทั้งหมดออกมาเป็นไฟล์ Excel (`.xlsx`)

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend / Framework**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS 4 (Custom Glassmorphism Theme)
- **Backend (API)**: Next.js Server Actions สำหรับการจัดการข้อมูลโดยไม่ต้องสร้าง API Routes แยก
- **Database**: PostgreSQL (โฮสต์บน Vercel Postgres)
- **ORM**: Prisma (v7.8) ใช้งานร่วมกับ `@prisma/adapter-pg` สำหรับเชื่อมต่อฐานข้อมูลโดยตรง
- **Libraries**: `html5-qrcode` (สำหรับการสแกนผ่านกล้อง), `xlsx` (สำหรับการสร้างไฟล์ Excel)

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

- `src/app/page.tsx` - หน้า Home Page (ประกอบด้วยคอมโพเนนต์ QrScanner และ HandoffForm)
- `src/app/print/[id]/page.tsx` - หน้าสำหรับการพิมพ์ใบส่งมอบ (Delivery Note)
- `src/app/summary/page.tsx` - หน้าตารางสรุปรายการและปุ่ม Export Excel
- `src/lib/actions.ts` - ไฟล์รวม Server Actions (เช่น `createHandoffRecord`, `getAllRecords`)
- `src/lib/prisma.ts` - Prisma Client Singleton สำหรับการจัดการ Connection Pool ของฐานข้อมูล
- `prisma/schema.prisma` - โครงสร้างตารางฐานข้อมูล (`HandoffRecord`)
- `prisma.config.ts` - การตั้งค่า Prisma สำหรับดึง Connection String (รองรับ Prisma v7+)

## ⚙️ วิธีการรันโปรเจกต์บนเครื่องตัวเอง (How to run locally)

1. ติดตั้ง Dependencies ในกรณีที่เพิ่งโคลนโปรเจกต์มาใหม่:
   ```bash
   npm install
   ```
2. ตั้งค่าการเชื่อมต่อฐานข้อมูล:
   ตรวจสอบให้แน่ใจว่าในไฟล์ `.env` มีค่าของตัวแปร `POSTGRES_URL` หรือ `PRISMA_DATABASE_URL` อย่างถูกต้อง
3. ซิงค์ตารางฐานข้อมูลเข้ากับโค้ดล่าสุด:
   ```bash
   npx prisma db push
   ```
4. รันเซิร์ฟเวอร์แบบ Development:
   ```bash
   npm run dev
   ```
5. เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000) เพื่อใช้งานแอปพลิเคชัน
