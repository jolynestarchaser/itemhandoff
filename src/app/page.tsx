import Link from 'next/link';

const departments = [
  { key: "Ros200Years", nameTh: "รส.200 ปี", nameEn: "Ros 200 Years" },
  { key: "Ros200YearsUnderwaterMed", nameTh: "รส.200 ปี บนเวชศาสตร์ใต้น้ำ", nameEn: "Ros 200 Years - Hyperbaric Medicine" },
  { key: "EntOutpatient", nameTh: "โสต ศอ นาสิก", nameEn: "ENT Outpatient Clinic" },
  { key: "EyeOutpatient", nameTh: "จักษุ", nameEn: "Ophthalmology Outpatient Clinic" },
  { key: "OperatingRoom", nameTh: "OR", nameEn: "Operating Room (OR)" },
  { key: "Anesthesia", nameTh: "วิสัญญี", nameEn: "Anesthesia" },
  { key: "LaborRoom", nameTh: "LR", nameEn: "Labor Room (LR)" },
  { key: "EmergencyRoom", nameTh: "ER", nameEn: "Emergency Room (ER)" },
  { key: "ObGynOutpatient", nameTh: "OPD นรีเวช", nameEn: "OB-GYN Outpatient Clinic" },
  { key: "PediatricOutpatient", nameTh: "OPD เด็ก", nameEn: "Pediatric Outpatient Clinic" },
  { key: "OrthoOutpatient", nameTh: "OPD Ortho", nameEn: "Orthopedic Outpatient Clinic" },
  { key: "SurgeryOutpatient", nameTh: "OPD Sx", nameEn: "General Surgery Outpatient Clinic" },
  { key: "InjectionRoom", nameTh: "ฉีดยา", nameEn: "Injection Room" },
  { key: "AriClinic", nameTh: "OPD ARI", nameEn: "ARI Clinic" },
  { key: "Chemotherapy", nameTh: "เคมีบำบัด", nameEn: "Chemotherapy Unit" },
  { key: "Hemodialysis", nameTh: "งานไตเทียม", nameEn: "Hemodialysis Unit" },
  { key: "CathLab", nameTh: "Cath Lab", nameEn: "Cardiac Catheterization Laboratory (Cath Lab)" },
  { key: "SurgicalIcu", nameTh: "ICU ศัลยกรรม", nameEn: "Surgical ICU (SICU)" },
  { key: "Ccu", nameTh: "CCU", nameEn: "Coronary Care Unit (CCU)" },
  { key: "IntermediateCcu", nameTh: "ICCUศัลยกรรมประสาท", nameEn: "Intermediate CCU (ICCU)" },
  { key: "NeurosurgicalIcu", nameTh: "ศัลยกรรมประสาท", nameEn: "Neurosurgical ICU" },
  { key: "OrthopedicWard", nameTh: "ศัลยกรรมกระดูก", nameEn: "Orthopedic Ward" },
  { key: "FemaleSurgicalWard", nameTh: "ศัลยกรรมหญิง", nameEn: "Female Surgical Ward" },
  { key: "MaleSurgicalWard", nameTh: "ศัลยกรรมชาย", nameEn: "Male Surgical Ward" },
  { key: "Nomklao2", nameTh: "น้อมเกล้า 2", nameEn: "Nomklao 2 Ward" },
  { key: "Nomklao3", nameTh: "น้อมเกล้า 3", nameEn: "Nomklao 3 Ward" },
  { key: "Nomklao4", nameTh: "น้อมเกล้า 4", nameEn: "Nomklao 4 Ward" },
  { key: "LuangPhorChaem2", nameTh: "หลวงพ่อแช่ม 2", nameEn: "Luang Phor Chaem 2 Ward" },
  { key: "LuangPhorChaem3", nameTh: "หลวงพ่อแช่ม 3", nameEn: "Luang Phor Chaem 3 Ward" },
  { key: "LuangPhorChaem4", nameTh: "หลวงพ่อแช่ม 4", nameEn: "Luang Phor Chaem 4 Ward" },
  { key: "MedicalWard2", nameTh: "อายุรกรรม 2", nameEn: "Medical Ward 2" },
  { key: "MedicalWard3", nameTh: "อายุรกรรม 3", nameEn: "Medical Ward 3" },
  { key: "MedicalWard4", nameTh: "อายุรกรรม 4", nameEn: "Medical Ward 4" },
  { key: "MedicalWard5", nameTh: "อายุรกรรม 5", nameEn: "Medical Ward 5" },
  { key: "PrivateMedicalWard5", nameTh: "พิเศษอายุรกรรม 5", nameEn: "Private Medical Ward 5" },
  { key: "MedicalWard6", nameTh: "อายุรกรรม 6", nameEn: "Medical Ward 6" },
  { key: "PrivateMedicalWard6", nameTh: "พิเศษอายุรกรรม 6", nameEn: "Private Medical Ward 6" },
  { key: "MedicalWard7", nameTh: "อายุรกรรม 7", nameEn: "Medical Ward 7" },
  { key: "PrivateMedicalWard7", nameTh: "พิเศษอายุรกรรม 7", nameEn: "Private Medical Ward 7" },
  { key: "MedicalWard8", nameTh: "อายุรกรรม 8", nameEn: "Medical Ward 8" },
  { key: "Rcui", nameTh: "RCUI", nameEn: "Respiratory Care Unit (RCU)" },
  { key: "MedicalIcu1", nameTh: "ICU อายุรกรรม 1", nameEn: "Medical ICU 1 (MICU 1)" },
  { key: "MedicalIcu2", nameTh: "ICU อายุรกรรม 2", nameEn: "Medical ICU 2 (MICU 2)" },
  { key: "StrokeUnit", nameTh: "Stroke unit", nameEn: "Stroke Unit" },
  { key: "GynecologyWard", nameTh: "นรีเวช", nameEn: "Gynecology Ward" },
  { key: "SickNewborn", nameTh: "Sick Newborn", nameEn: "Sick Newborn Ward" },
  { key: "PostpartumWard", nameTh: "สูติกรรมหลังคลอด", nameEn: "Postpartum Ward" },
  { key: "RatiphatWard", nameTh: "รติพัฒน์", nameEn: "Ratiphat Ward" },
  { key: "Picu", nameTh: "PICU", nameEn: "Pediatric ICU (PICU)" },
  { key: "Nicu", nameTh: "NICU", nameEn: "Neonatal ICU (NICU)" },
  { key: "PediatricWard1", nameTh: "กุมารเวชกรรม 1", nameEn: "Pediatric Ward 1" },
  { key: "PediatricWard2", nameTh: "กุมารเวชกรรม 2", nameEn: "Pediatric Ward 2" },
  { key: "IT", nameTh: "ไอที", nameEn: "IT" },
  { key: "Marketing", nameTh: "การตลาด", nameEn: "Marketing" },
  { key: "Sales", nameTh: "ฝ่ายขาย", nameEn: "Sales" },
  { key: "Finance", nameTh: "การเงิน", nameEn: "Finance" },
  { key: "Operations", nameTh: "ปฏิบัติการ", nameEn: "Operations" }
];

export default function Home() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Inventory Handoff</h1>
        <p className="text-sm text-gray-400">เลือกแผนกเพื่อดูรายการสินค้าและจัดการข้อมูล</p>
      </div>

      {/* Grid แผนก */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {departments.map((dept) => (
          <Link
            key={dept.key}
            href={`/department/${encodeURIComponent(dept.key)}`}
            className="border border-white/10 rounded-2xl p-6 text-center bg-gradient-to-br from-[#F58220] to-[#d9721a] hover:from-[#ff9533] hover:to-[#F58220] text-white font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#F58220]/10 flex flex-col items-center justify-center min-h-[100px]"
          >
            {dept.nameTh}
          </Link>
        ))}
      </div>

      {/* ปุ่มสรุปเอกสาร */}
      <Link
        href="/summary"
        className="block w-full py-4 text-center bg-white/5 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/10 transition-all"
      >
        <span className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          สรุปเอกสารส่งมอบทั้งหมด
        </span>
      </Link>
    </div>
  );
}
