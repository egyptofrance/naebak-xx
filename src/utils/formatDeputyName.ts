/**
 * تنسيق اسم النائب ليكون: "النائب/ اسم العرض المخصص" أو "النائب/ الاسم الأول + اسم الأب"
 * @param fullName - الاسم الكامل (الرباعي)
 * @param displayName - اسم العرض المخصص (اختياري)
 * @returns الاسم المنسق
 * @example
 * formatDeputyName("أحمد محمد علي حسن", "أحمد محمد") // "النائب/ أحمد محمد"
 * formatDeputyName("أحمد محمد علي حسن", null) // "النائب/ أحمد محمد" (تلقائي)
 * formatDeputyName("أحمد محمد علي حسن", "د. أحمد محمد") // "النائب/ د. أحمد محمد"
 */
export function formatDeputyName(
  fullName: string | null | undefined,
  displayName?: string | null
): string {
  // إذا كان هناك اسم عرض مخصص، استخدمه
  if (displayName && displayName.trim()) {
    return `النائب/ ${displayName.trim()}`;
  }

  // وإلا استخدم التنسيق التلقائي
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
 * @param displayName - اسم العرض المخصص (اختياري)
 * @returns الاسم المختصر فقط
 */
export function getShortDeputyName(
  fullName: string | null | undefined,
  displayName?: string | null
): string {
  // إذا كان هناك اسم عرض مخصص، استخدمه
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }

  if (!fullName) {
    return "غير محدد";
  }

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const fatherName = nameParts[1] || "";
  
  return fatherName ? `${firstName} ${fatherName}` : firstName;
}

