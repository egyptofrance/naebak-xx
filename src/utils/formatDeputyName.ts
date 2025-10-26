/**
 * تنسيق اسم النائب ليكون: "النائب/ الاسم الأول + اسم الأب"
 * @param fullName - الاسم الكامل (الرباعي)
 * @returns الاسم المنسق
 * @example
 * formatDeputyName("أحمد محمد علي حسن") // "النائب/ أحمد محمد"
 * formatDeputyName("فاطمة") // "النائب/ فاطمة"
 */
export function formatDeputyName(fullName: string | null | undefined): string {
  if (!fullName) {
    return "النائب/ غير محدد";
  }

  // تقسيم الاسم إلى أجزاء
  const nameParts = fullName.trim().split(/\s+/);
  
  // أخذ أول اسمين فقط (الاسم الأول + اسم الأب)
  const firstName = nameParts[0] || "";
  const fatherName = nameParts[1] || "";
  
  // إذا كان هناك اسم أب، نضيفه، وإلا نكتفي بالاسم الأول
  const shortName = fatherName ? `${firstName} ${fatherName}` : firstName;
  
  return `النائب/ ${shortName}`;
}

/**
 * الحصول على الاسم المختصر بدون "النائب/"
 * @param fullName - الاسم الكامل (الرباعي)
 * @returns الاسم المختصر فقط
 */
export function getShortDeputyName(fullName: string | null | undefined): string {
  if (!fullName) {
    return "غير محدد";
  }

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const fatherName = nameParts[1] || "";
  
  return fatherName ? `${firstName} ${fatherName}` : firstName;
}

