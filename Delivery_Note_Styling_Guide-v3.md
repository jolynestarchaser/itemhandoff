# คู่มือการจัดหน้าเอกสาร (Styling Guide): ใบสรุปส่งมอบ และ ใบส่งมอบชั่วคราว

เอกสารฉบับนี้อธิบายวิธีการตั้งค่า Styling สำหรับเอกสารสำหรับการพิมพ์ (Print) โดยใช้เทคนิค `rem` และ `em` เพื่อป้องกันปัญหาการผิดเพี้ยนของสัดส่วนเมื่อพิมพ์ผ่าน Printer ที่ต่างกัน พร้อมเทคนิคการจัดแนวกึ่งกลางให้เท่ากันทุกด้านและป้องกันการตัดหน้าเอกสาร

## 1. หลักการ Styling (Core Concepts)

*   **การใช้ `rem` และ `em` เพื่อคุมสัดส่วน:** 
    *   กำหนด Base Font Size ที่ระดับ `html` หรือ `body` 
    *   ใช้ `rem` สำหรับ padding, margin และความกว้างต่างๆ ของตาราง เพื่อให้สเกลสัมพันธ์กับ Base Font Size เสมอ หาก Printer ย่อ/ขยาย สัดส่วนจะยังคงที่
    *   ใช้ `em` สำหรับขนาดฟอนต์ของ Heading (เช่น `h2`, `h3`) หรือ Element ย่อย เพื่อให้ขยาย/หดสัมพันธ์กับขนาดฟอนต์ของ parent element
*   **การจัดกึ่งกลาง (Equal Margins / Centering):**
    *   ใช้ `@page` กำหนด margin ทุกด้านให้เท่ากัน (เช่น `@page { size: A4; margin: 3rem; }`) ช่วยให้มั่นใจได้ว่าบน-ล่าง-ซ้าย-ขวา เท่ากันแน่นอน
    *   ใช้ Flexbox (`justify-content: center; align-items: center;`) กับ Container หลักควบคู่กับ `min-height: 100vh;` หากต้องการให้เนื้อหาอยู่กึ่งกลางหน้ากระดาษพอดี
*   **การป้องกันการตัดหน้า (Prevent Page Breaks):**
    *   การป้องกันข้อมูลขาดตอนระหว่างหน้า ให้ใช้คำสั่ง `page-break-inside: avoid;` หรือ `break-inside: avoid;` ในระดับแถวของตาราง (`tr`) หรือส่วนของลายเซ็น (`.signature`)

---

## 2. ใบส่งมอบชั่วคราว (Temporary Delivery Note)

**โครงสร้างข้อมูลที่กำหนด:**
*   ส่วนหัว: ชื่อเอกสารตรงกลาง, วันที่ส่งและหน่วยงานแยกบรรทัดและมีเส้นประ
*   ตารางประกอบด้วย: คอลัมน์ชื่อสินค้า, คอลัมน์ Serial Number, และ คอลัมน์จำนวน
*   ส่วนลงนาม: ผู้รับสินค้าและผู้ส่งสินค้า พร้อมพื้นที่ขีดเส้นประแยกบรรทัด

### ตัวอย่างโครงสร้าง HTML/CSS แบบอิง `rem`/`em`:

```html
<style>
  /* ตั้งค่าการพิมพ์ */
  @media print {
    @page {
      size: A4;
      margin: 3rem; /* จัดเอกสารให้อยู่ตรงกลาง ซ้าย-ขวา-บน-ล่าง เท่ากัน */
    }
    body {
      font-size: 16px; /* Base size สำหรับ 1rem */
      font-family: 'Sarabun', sans-serif;
      margin: 0;
      padding: 0;
    }
    .print-container {
      width: 100%;
    }
    
    /* ส่วนหัวเอกสาร */
    h1 {
      font-size: 1.5em; /* ใช้ em สำหรับ Heading */
      text-align: center;
      margin-bottom: 2rem;
    }
    .header-info {
      margin-bottom: 2rem;
    }
    .info-row {
      display: flex;
      align-items: flex-end;
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    .info-label {
      margin-right: 1rem;
      white-space: nowrap;
    }
    .info-dots {
      width: 40%; /* ปรับความยาวของเส้นประได้ตามต้องการ */
      border-bottom: 0.1rem dotted #000;
    }

    /* ส่วนตาราง */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }
    th, td {
      border: 0.1rem solid #000;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      page-break-inside: avoid;
    }
    
    /* ส่วนของลายเซ็น */
    .signature-area {
      display: flex;
      justify-content: space-around;
      margin-top: 4rem;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 40%;
      font-size: 1rem;
      line-height: 1.5;
    }
    .signature-title {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .signature-line {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      border-bottom: 0.1rem dotted #000;
      width: 100%;
    }
  }
</style>

<div class="print-container">
  <h1>ใบส่งสินค้าชั่วคราว</h1>
  
  <!-- ปรับปรุงส่วนหัวตามรูปแบบที่กำหนด -->
  <div class="header-info">
    <div class="info-row">
      <div class="info-label">วันที่ส่ง</div>
      <div class="info-dots"></div>
    </div>
    <div class="info-row">
      <div class="info-label">หน่วยงาน</div>
      <div class="info-dots"></div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>ชื่อสินค้า</th>
        <th>Serial Number</th>
        <th>จำนวน</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)</td>
        <td>A001, A002, A003</td>
        <td>3</td>
      </tr>
    </tbody>
  </table>

  <!-- พื้นที่ลายเซ็นตามรูปแบบที่กำหนด -->
  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-title">ผู้รับสินค้า</div>
      <div>โรงพยาบาลวชิระภูเก็ต</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ</div>
      <div class="signature-line"></div>
      <div>วันที่</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-title">ผู้ส่งสินค้า</div>
      <div>บริษัท จำกัด</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ</div>
      <div class="signature-line"></div>
      <div>วันที่</div>
      <div class="signature-line"></div>
    </div>
  </div>
</div>
```

---

## 3. ใบสรุปรายการส่งมอบ (Summary Delivery Note)

**โครงสร้างข้อมูลที่กำหนด:**
*   เลขที่สัญญา XXXXX
*   ตารางประกอบด้วย: คอลัมน์ชื่อแผนก, คอลัมน์ A, คอลัมน์ B, คอลัมน์ C 
*   **A** = สินค้าที่ชื่อว่า APIX Round A 
*   **B** = สินค้าที่ชื่อว่า APIX RX B 
*   **C** = สินค้าที่มีชื่อว่า APIX Flow C

### ตัวอย่างโครงสร้าง HTML/CSS แบบอิง `rem`/`em`:

```html
<!-- ใช้ Style @media print และโครงสร้างคล้ายคลึงกับเอกสารแรก -->
<div class="print-container">
  <h1>ใบสรุปรายการส่งมอบ</h1>
  <p style="font-size: 1rem;">เลขที่สัญญา XXXXX</p>
  
  <table>
    <thead>
      <tr>
        <th>ชื่อแผนก</th>
        <th>A<br><span style="font-size: 0.8em; font-weight: normal;">(APIX Round A)</span></th>
        <th>B<br><span style="font-size: 0.8em; font-weight: normal;">(APIX RX B)</span></th>
        <th>C<br><span style="font-size: 0.8em; font-weight: normal;">(APIX Flow C)</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>-</td>
        <td>400</td>
        <td>200</td>
        <td>100</td>
      </tr>
    </tbody>
  </table>
  
  <div style="font-size: 0.9rem; margin-top: 1.5rem; page-break-inside: avoid;">
    <strong>คำอธิบายรายละเอียดสินค้ารายการ A, B, C:</strong><br>
    <ul style="padding-left: 1.5rem;">
      <li><strong>A (APIX Round A):</strong> รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)</li>
      <li><strong>B (APIX RX B):</strong> รถเข็นคอมพิวเตอร์ All-in-one สำหรับงานเจาะเลือด (Phlebotomy Computer Cart)</li>
      <li><strong>C (APIX Flow C):</strong> รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)</li>
    </ul>
  </div>
</div>
```
