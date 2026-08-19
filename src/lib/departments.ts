export type DepartmentCategory = 'ward' | 'opd' | 'icu' | 'or_procedure' | 'specialized' | 'support';

export interface DepartmentItem {
  key: string;
  nameTh: string;
  nameEn: string;
  category: DepartmentCategory;
}

export const departmentCategories: { id: DepartmentCategory | 'all' | 'delivered' | 'pending'; label: string; icon?: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'ward', label: 'หอผู้ป่วยใน (IPD)' },
  { id: 'opd', label: 'ผู้ป่วยนอก (OPD)' },
  { id: 'icu', label: 'หอวิกฤต (ICU / CCU)' },
  { id: 'or_procedure', label: 'ผ่าตัด / หัตถการ' },
  { id: 'specialized', label: 'เฉพาะทาง / แม่และเด็ก' },
  { id: 'support', label: 'สนับสนุน / สำนักงาน' },
  { id: 'delivered', label: '✅ ส่งมอบแล้ว' },
  { id: 'pending', label: '⏳ ยังไม่มีรายการ' },
];

export const departments: DepartmentItem[] = [
  // ผ่าตัด / หัตถการ / เวชศาสตร์
  { key: "Ros200Years1", nameTh: "รส.200 ปี 1", nameEn: "Ros 200 Years 1", category: "or_procedure" },
  { key: "Ros200Years2", nameTh: "รส.200 ปี 2", nameEn: "Ros 200 Years 2", category: "or_procedure" },
  { key: "UnderwaterMed", nameTh: "เวชศาสตร์ใต้น้ำ", nameEn: "UnderwaterMed", category: "or_procedure" },
  { key: "OperatingRoom", nameTh: "OR", nameEn: "Operating Room (OR)", category: "or_procedure" },
  { key: "Anesthesia", nameTh: "วิสัญญี", nameEn: "Anesthesia", category: "or_procedure" },
  { key: "LaborRoom", nameTh: "LR", nameEn: "Labor Room (LR)", category: "or_procedure" },
  { key: "EmergencyRoom", nameTh: "ER", nameEn: "Emergency Room (ER)", category: "or_procedure" },
  { key: "CathLab", nameTh: "Cath Lab", nameEn: "Cardiac Catheterization Laboratory (Cath Lab)", category: "or_procedure" },
  { key: "InjectionRoom", nameTh: "ฉีดยา", nameEn: "Injection Room", category: "or_procedure" },

  // OPD / ผู้ป่วยนอก
  { key: "EntOutpatient", nameTh: "โสต ศอ นาสิก", nameEn: "ENT Outpatient Clinic", category: "opd" },
  { key: "EyeOutpatient", nameTh: "จักษุ", nameEn: "Ophthalmology Outpatient Clinic", category: "opd" },
  { key: "ObGynOutpatient", nameTh: "OPD นรีเวช", nameEn: "OB-GYN Outpatient Clinic", category: "opd" },
  { key: "PediatricOutpatient", nameTh: "OPD เด็ก", nameEn: "Pediatric Outpatient Clinic", category: "opd" },
  { key: "OrthoOutpatient", nameTh: "OPD Ortho", nameEn: "Orthopedic Outpatient Clinic", category: "opd" },
  { key: "SurgeryOutpatient", nameTh: "OPD Sx", nameEn: "General Surgery Outpatient Clinic", category: "opd" },
  { key: "AriClinic", nameTh: "OPD ARI", nameEn: "ARI Clinic", category: "opd" },
  { key: "Chemotherapy", nameTh: "เคมีบำบัด", nameEn: "Chemotherapy Unit", category: "opd" },
  { key: "Hemodialysis", nameTh: "งานไตเทียม", nameEn: "Hemodialysis Unit", category: "opd" },

  // หอวิกฤต (ICU / CCU / RCU)
  { key: "SurgicalIcu", nameTh: "ICU ศัลยกรรม", nameEn: "Surgical ICU (SICU)", category: "icu" },
  { key: "Ccu", nameTh: "CCU", nameEn: "Coronary Care Unit (CCU)", category: "icu" },
  { key: "IntermediateCcu", nameTh: "ICCU", nameEn: "Intensive Cardiac Care Unit", category: "icu" },
  { key: "NeurosurgicalIcu", nameTh: "ศัลยกรรมประสาท", nameEn: "Neurosurgical ICU", category: "icu" },
  { key: "Rcu", nameTh: "RCU", nameEn: "Respiratory Care Unit (RCU)", category: "icu" },
  { key: "MedicalIcu1", nameTh: "ICU อายุรกรรม 1", nameEn: "Medical ICU 1 (MICU 1)", category: "icu" },
  { key: "MedicalIcu2", nameTh: "ICU อายุรกรรม 2", nameEn: "Medical ICU 2 (MICU 2)", category: "icu" },
  { key: "StrokeUnit", nameTh: "Stroke unit", nameEn: "Stroke Unit", category: "icu" },
  { key: "Picu", nameTh: "PICU", nameEn: "Pediatric ICU (PICU)", category: "icu" },
  { key: "Nicu", nameTh: "NICU", nameEn: "Neonatal ICU (NICU)", category: "icu" },

  // หอผู้ป่วยใน (IPD / Ward)
  { key: "OrthopedicWard", nameTh: "ศัลยกรรมกระดูก", nameEn: "Orthopedic Ward", category: "ward" },
  { key: "FemaleSurgicalWard", nameTh: "ศัลยกรรมหญิง", nameEn: "Female Surgical Ward", category: "ward" },
  { key: "MaleSurgicalWard", nameTh: "ศัลยกรรมชาย", nameEn: "Male Surgical Ward", category: "ward" },
  { key: "Nomklao2", nameTh: "น้อมเกล้า 2", nameEn: "Nomklao 2 Ward", category: "ward" },
  { key: "Nomklao3", nameTh: "น้อมเกล้า 3", nameEn: "Nomklao 3 Ward", category: "ward" },
  { key: "Nomklao4", nameTh: "น้อมเกล้า 4", nameEn: "Nomklao 4 Ward", category: "ward" },
  { key: "LuangPhorChaem2", nameTh: "หลวงพ่อแช่ม 2", nameEn: "Luang Phor Chaem 2 Ward", category: "ward" },
  { key: "LuangPhorChaem3", nameTh: "หลวงพ่อแช่ม 3", nameEn: "Luang Phor Chaem 3 Ward", category: "ward" },
  { key: "LuangPhorChaem4", nameTh: "หลวงพ่อแช่ม 4", nameEn: "Luang Phor Chaem 4 Ward", category: "ward" },
  { key: "MedicalWard2", nameTh: "อายุรกรรม 2", nameEn: "Medical Ward 2", category: "ward" },
  { key: "MedicalWard3", nameTh: "อายุรกรรม 3", nameEn: "Medical Ward 3", category: "ward" },
  { key: "MedicalWard4", nameTh: "อายุรกรรม 4", nameEn: "Medical Ward 4", category: "ward" },
  { key: "MedicalWard5", nameTh: "อายุรกรรม 5", nameEn: "Medical Ward 5", category: "ward" },
  { key: "PrivateMedicalWard5", nameTh: "พิเศษอายุรกรรม 5", nameEn: "Private Medical Ward 5", category: "ward" },
  { key: "MedicalWard6", nameTh: "อายุรกรรม 6", nameEn: "Medical Ward 6", category: "ward" },
  { key: "PrivateMedicalWard6", nameTh: "พิเศษอายุรกรรม 6", nameEn: "Private Medical Ward 6", category: "ward" },
  { key: "MedicalWard7", nameTh: "อายุรกรรม 7", nameEn: "Medical Ward 7", category: "ward" },
  { key: "PrivateMedicalWard7", nameTh: "พิเศษอายุรกรรม 7", nameEn: "Private Medical Ward 7", category: "ward" },
  { key: "MedicalWard8", nameTh: "อายุรกรรม 8", nameEn: "Medical Ward 8", category: "ward" },
  { key: "RatiphatWard", nameTh: "รติพัฒน์", nameEn: "Ratiphat Ward", category: "ward" },

  // เฉพาะทาง / แม่และเด็ก
  { key: "GynecologyWard", nameTh: "นรีเวช", nameEn: "Gynecology Ward", category: "specialized" },
  { key: "SickNewborn", nameTh: "Sick Newborn", nameEn: "Sick Newborn Ward", category: "specialized" },
  { key: "PostpartumWard", nameTh: "สูติกรรมหลังคลอด", nameEn: "Postpartum Ward", category: "specialized" },
  { key: "PediatricWard1", nameTh: "กุมารเวชกรรม 1", nameEn: "Pediatric Ward 1", category: "specialized" },
  { key: "PediatricWard2", nameTh: "กุมารเวชกรรม 2", nameEn: "Pediatric Ward 2", category: "specialized" },

  // สนับสนุน / สำนักงาน
  { key: "IT", nameTh: "ไอที", nameEn: "IT", category: "support" },
  { key: "Intervention", nameTh: "Intervention", nameEn: "Intervention", category: "support" },
  { key: "Marketing", nameTh: "การตลาด", nameEn: "Marketing", category: "support" },
  { key: "Sales", nameTh: "ฝ่ายขาย", nameEn: "Sales", category: "support" },
  { key: "Finance", nameTh: "การเงิน", nameEn: "Finance", category: "support" },
  { key: "Operations", nameTh: "ปฏิบัติการ", nameEn: "Operations", category: "support" }
];

export function getDeptThaiName(key: string): string {
  const match = departments.find(d => d.key === key);
  return match ? match.nameTh : key;
}

export function getDeptEnName(key: string): string {
  const match = departments.find(d => d.key === key);
  return match ? match.nameEn : key;
}
