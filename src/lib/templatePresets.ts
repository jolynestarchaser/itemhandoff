export interface TemplatePlaceholder {
  key: string;
  label: string;
  example: string;
}

export const availablePlaceholders: TemplatePlaceholder[] = [
  { key: 'hospitalName', label: 'ชื่อโรงพยาบาล / หน่วยงาน', example: 'โรงพยาบาลวชิระภูเก็ต' },
  { key: 'departmentName', label: 'ชื่อแผนก (ภาษาไทย)', example: 'ICU ศัลยกรรม' },
  { key: 'contractNo', label: 'เลขที่สัญญา', example: '123/2569' },
  { key: 'deliveryDate', label: 'วันที่ส่งมอบ', example: '19 สิงหาคม 2569' },
  { key: 'productName', label: 'ชื่อรุ่นสินค้า (ภาษาอังกฤษ)', example: 'APIX RX B' },
  { key: 'productOfficialName', label: 'ชื่อทางการสินค้า', example: 'รถเข็นคอมพิวเตอร์ All-in-one พร้อมลิ้นชักจัดเก็บยา ๒๐ ช่อง (Drug Administration Cart)' },
  { key: 'productCode', label: 'รหัสประเภทรถ (A/B/C)', example: 'B' },
  { key: 'serialList', label: 'รายการรหัส Serial Number', example: 'B001, B002, B003' },
  { key: 'quantity', label: 'จำนวน (คัน)', example: '3' },
  { key: 'receiverName', label: 'ชื่อผู้รับมอบ', example: 'พว.สมใจ ใจดี' },
  { key: 'receiverCompany', label: 'หน่วยงานผู้รับมอบ', example: 'โรงพยาบาลวชิระภูเก็ต' },
  { key: 'senderName', label: 'ชื่อผู้ส่งมอบ', example: 'นายช่างเทคนิค นำส่ง' },
  { key: 'senderCompany', label: 'บริษัทผู้ส่งมอบ', example: 'บริษัท แอพพิกซ์ อินโนเวชั่น จำกัด' },
  { key: 'notes', label: 'หมายเหตุเพิ่มเติม', example: 'อุปกรณ์ครบถ้วน พร้อมใช้งานและทดสอบระบบเรียบร้อย' },
];

export interface DocumentPreset {
  id: string;
  name: string;
  description: string;
  category: 'delivery' | 'summary' | 'inspection' | 'return' | 'custom';
  defaultTitle: string;
  templateHtml: string;
}

export const documentPresets: DocumentPreset[] = [
  {
    id: 'hospital-delivery-note',
    name: 'ใบส่งสินค้าชั่วคราว (มาตรฐานโรงพยาบาล)',
    description: 'เอกสารส่งมอบสินค้าแยกรายแผนก แสดงชื่อรุ่นสินค้าภาษาอังกฤษ และมีวันที่ส่วนหัว',
    category: 'delivery',
    defaultTitle: 'ใบส่งสินค้าชั่วคราว',
    templateHtml: `
<div class="document-style">
  <div class="copy-label">ต้นฉบับ</div>
  <h1>ใบส่งสินค้าชั่วคราว</h1>
  
  <div class="header-info">
    <div class="info-row">
      <div class="info-label">วันที่ส่ง</div>
      <div class="info-dots">{{deliveryDate}}</div>
    </div>
    <div class="info-row">
      <div class="info-label">หน่วยงาน</div>
      <div class="info-dots">{{departmentName}}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 55%;">ชื่อสินค้า</th>
        <th style="width: 30%;">Serial Number</th>
        <th style="width: 15%; text-align: center;">จำนวน</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{productName}}</td>
        <td>{{serialList}}</td>
        <td style="text-align: center;">{{quantity}}</td>
      </tr>
    </tbody>
  </table>

  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-title">ผู้รับสินค้า</div>
      <div>{{hospitalName}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{receiverName}} )</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-title">ผู้ส่งสินค้า</div>
      <div>{{senderCompany}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{senderName}} )</div>
      <div class="signature-line"></div>
    </div>
  </div>
</div>
`.trim(),
  },
  {
    id: 'inspection-certificate',
    name: 'ใบตรวจรับพัสดุ / ครุภัณฑ์ทางการแพทย์',
    description: 'เอกสารตรวจรับความสมบูรณ์ของอุปกรณ์ และลงชื่อคณะกรรมการตรวจรับ',
    category: 'inspection',
    defaultTitle: 'ใบตรวจรับและส่งมอบอุปกรณ์ทางการแพทย์',
    templateHtml: `
<div class="document-style">
  <div class="copy-label">เอกสารตรวจรับ</div>
  <h1>ใบตรวจรับและส่งมอบอุปกรณ์ทางการแพทย์</h1>
  <p class="contract-no">สัญญาเลขที่ {{contractNo}} | {{hospitalName}}</p>

  <div class="header-info">
    <div class="info-row">
      <div class="info-label">หน่วยงานที่ตรวจรับ</div>
      <div class="info-dots">{{departmentName}}</div>
    </div>
    <div class="info-row">
      <div class="info-label">วันที่ตรวจรับ</div>
      <div class="info-dots">{{deliveryDate}}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 8%; text-align: center;">ลำดับ</th>
        <th>รายการสินค้า</th>
        <th style="width: 30%;">Serial Number</th>
        <th style="width: 15%; text-align: center;">จำนวน</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>{{productName}}</td>
        <td>{{serialList}}</td>
        <td style="text-align: center;">{{quantity}}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 1.5rem; margin-bottom: 2rem; font-size: 1rem; line-height: 1.6;">
    <strong>ผลการทดสอบการใช้งาน:</strong> [ / ] ผ่านเกณฑ์การตรวจรับตามมาตรฐานอุปกรณ์<br/>
    <strong>หมายเหตุ:</strong> {{notes}}
  </div>

  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-title">ผู้ตรวจรับพัสดุ</div>
      <div>{{hospitalName}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{receiverName}} )</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-title">ผู้ส่งมอบอุปกรณ์</div>
      <div>{{senderCompany}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{senderName}} )</div>
      <div class="signature-line"></div>
    </div>
  </div>
</div>
`.trim(),
  },
  {
    id: 'equipment-transfer-return',
    name: 'ใบบันทึกการรับคืน / โอนย้ายอุปกรณ์',
    description: 'เอกสารสำหรับการเปลี่ยน ย้ายแผนก หรือนำอุปกรณ์กลับ',
    category: 'return',
    defaultTitle: 'ใบบันทึกการรับคืน / ย้ายอุปกรณ์',
    templateHtml: `
<div class="document-style">
  <div class="copy-label">เอกสารภายใน</div>
  <h1>ใบบันทึกการรับคืน / ย้ายอุปกรณ์</h1>
  <p class="contract-no">เลขที่อ้างอิง {{contractNo}} | {{hospitalName}}</p>

  <div class="header-info">
    <div class="info-row">
      <div class="info-label">แผนกต้นทาง</div>
      <div class="info-dots">{{departmentName}}</div>
    </div>
    <div class="info-row">
      <div class="info-label">วันที่ดำเนินการ</div>
      <div class="info-dots">{{deliveryDate}}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 8%; text-align: center;">ลำดับ</th>
        <th>รายการอุปกรณ์</th>
        <th style="width: 30%;">Serial Number</th>
        <th style="width: 15%; text-align: center;">จำนวน</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>{{productName}}</td>
        <td>{{serialList}}</td>
        <td style="text-align: center;">{{quantity}}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 1.5rem; margin-bottom: 2rem; font-size: 1rem; line-height: 1.6;">
    <strong>เหตุผลและรายละเอียด:</strong> {{notes}}
  </div>

  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-title">ผู้ส่งคืน / ผู้ยินยอมย้าย</div>
      <div>{{departmentName}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{receiverName}} )</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-title">ผู้รับมอบอุปกรณ์</div>
      <div>{{senderCompany}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{senderName}} )</div>
      <div class="signature-line"></div>
    </div>
  </div>
</div>
`.trim(),
  },
  {
    id: 'blank-custom',
    name: 'แม่แบบเอกสารว่าง (สร้างเองอิสระ)',
    description: 'เอกสารเค้าโครงมาตรฐานพร้อมหัวเรื่องและตารางสำหรับแก้ไขเองทั้งหมด',
    category: 'custom',
    defaultTitle: 'เอกสารส่งมอบและรับรอง',
    templateHtml: `
<div class="document-style">
  <h1>{{defaultTitle}}</h1>
  <p class="contract-no">สัญญาเลขที่ {{contractNo}} | {{hospitalName}}</p>

  <div class="header-info">
    <div class="info-row">
      <div class="info-label">หน่วยงาน</div>
      <div class="info-dots">{{departmentName}}</div>
    </div>
    <div class="info-row">
      <div class="info-label">วันที่</div>
      <div class="info-dots">{{deliveryDate}}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 8%; text-align: center;">ลำดับ</th>
        <th>รายการ</th>
        <th style="width: 30%;">หมายเลข Serial Number</th>
        <th style="width: 15%; text-align: center;">จำนวน</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td>{{productName}}</td>
        <td>{{serialList}}</td>
        <td style="text-align: center;">{{quantity}}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 1.5rem; margin-bottom: 2rem; font-size: 1rem;">
    <strong>บันทึกข้อความ:</strong> {{notes}}
  </div>

  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-title">ผู้รับมอบ</div>
      <div>{{hospitalName}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{receiverName}} )</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-title">ผู้ส่งมอบ</div>
      <div>{{senderCompany}}</div>
      <div style="margin-top: 1rem;">ลายมือชื่อ</div>
      <div class="signature-line"></div>
      <div>ชื่อ ( {{senderName}} )</div>
      <div class="signature-line"></div>
    </div>
  </div>
</div>
`.trim(),
  },
];

export function replaceTemplatePlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(values)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, val || '');
  }
  return result;
}
