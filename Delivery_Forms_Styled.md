<style>
    :root {
        font-size: 16px; /* Base size for rem calculations */
    }
    @page {
        size: A4;
        margin: 4.7rem 3.5rem; /* Adjusted from 20mm 15mm to rem */
        background-color: #fcfcfc;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
        font-family: 'Sarabun', 'Tahoma', 'Helvetica', sans-serif;
        color: #222;
        margin: 0;
        padding: 0;
        font-size: 0.9rem; /* Adjusted from 11pt */
        line-height: 1.6em; /* Using em for relative line height */
    }
    .document {
        width: 100%;
    }
    .header {
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .header h1 {
        font-size: 1.5rem; /* Adjusted from 18pt */
        margin: 0 0 0.3rem 0;
        color: #1a365d;
    }
    .header p {
        margin: 0;
        font-size: 1rem; /* Adjusted from 12pt */
        color: #4a5568;
    }
    .info-row {
        margin-bottom: 1rem;
        font-size: 1rem;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5rem;
        background-color: #fff;
    }
    th, td {
        border: 0.0625rem solid #cbd5e0; /* 1px converted to rem */
        padding: 0.6rem 0.75rem; /* 10px 12px converted to rem */
        vertical-align: middle;
    }
    th {
        background-color: #e2e8f0;
        color: #2d3748;
        text-align: center;
        font-weight: bold;
    }
    .text-center { text-align: center; }
    
    .signature-table {
        width: 100%;
        border: none;
        margin-top: 3rem;
        background-color: transparent;
    }
    .signature-table td {
        border: none;
        text-align: center;
        width: 50%;
        padding: 0.6rem;
        vertical-align: bottom;
    }
    .sig-line {
        display: inline-block;
        width: 13.75rem; /* 220px converted to rem */
        border-bottom: 0.0625rem dashed #718096;
        margin: 1.25rem 0 0.3rem 0;
        height: 1rem;
    }
    .sig-box {
        padding: 1rem;
        border: 0.0625rem solid #e2e8f0;
        border-radius: 0.5rem;
        background-color: #fff;
        display: inline-block;
        min-width: 18.75rem; /* 300px converted to rem */
    }
    
    .page-2 {
        page-break-before: always;
    }
</style>

<!-- เอกสารใบที่ 1: ใบสรุปรายการส่งมอบ -->
<div class="document">
    <div class="header">
        <h1>ใบสรุปรายการส่งมอบ</h1>
        <p><b>เลขที่สัญญา:</b> XXXXX</p>
    </div>
    <table>
        <thead>
            <tr>
                <th style="width: 8%;">ลำดับ</th>
                <th style="width: 52%;">รายการสินค้า</th>
                <th style="width: 20%;">หน่วยงาน</th>
                <th style="width: 20%;">จำนวน (คัน)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-center">1</td>
                <td>รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)</td>
                <td class="text-center">A</td>
                <td class="text-center">400</td>
            </tr>
            <tr>
                <td class="text-center">2</td>
                <td>รถเข็นคอมพิวเตอร์ All-in-one สำหรับงานเจาะเลือด (Phlebotomy Computer Cart)</td>
                <td class="text-center">B</td>
                <td class="text-center">200</td>
            </tr>
            <tr>
                <td class="text-center">3</td>
                <td>รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)</td>
                <td class="text-center">C</td>
                <td class="text-center">100</td>
            </tr>
        </tbody>
    </table>
</div>

<!-- เอกสารใบที่ 2: ใบส่งสินค้าชั่วคราว -->
<div class="document page-2">
    <div class="header">
        <h1>ใบส่งสินค้าชั่วคราว</h1>
    </div>
    <div class="info-row">
        <span style="display:inline-block; width: 50%;"><b>วันที่ส่ง:</b> ......................................................</span>
        <span style="display:inline-block; width: 49%;"><b>หน่วยงาน:</b> ......................................................</span>
    </div>
    <table>
        <thead>
            <tr>
                <th style="width: 8%;">ลำดับ</th>
                <th style="width: 52%;">ชื่อสินค้า</th>
                <th style="width: 40%;">Serial Number</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-center">1</td>
                <td>รถเข็นคอมพิวเตอร์แบบ Notebook Cart สำหรับใช้ในการตรวจเยี่ยมผู้ป่วยใน (Ward Rounds)</td>
                <td>A001, A002, A003</td>
            </tr>
            <tr>
                <td class="text-center">2</td>
                <td>รถเข็นคอมพิวเตอร์ All-in-one สำหรับงานเจาะเลือด (Phlebotomy Computer Cart)</td>
                <td></td>
            </tr>
            <tr>
                <td class="text-center">3</td>
                <td>รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)</td>
                <td></td>
            </tr>
        </tbody>
    </table>
    
    <table class="signature-table">
        <tr>
            <td>
                <div class="sig-box">
                    <p><b>ผู้รับสินค้า</b></p>
                    <p>โรงพยาบาลวชิระภูเก็ต</p>
                    <div class="sig-line"></div>
                    <p>( ........................................................ )</p>
                    <p style="margin-top: 1rem;">วันที่ ......../......../........</p>
                </div>
            </td>
            <td>
                <div class="sig-box">
                    <p><b>ผู้ส่งสินค้า</b></p>
                    <p>บริษัท จำกัด</p>
                    <div class="sig-line"></div>
                    <p>( ........................................................ )</p>
                    <p style="margin-top: 1rem;">วันที่ ......../......../........</p>
                </div>
            </td>
        </tr>
    </table>
</div>
