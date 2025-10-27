/**
 * تنسيق اسم النائب ليكون: "اسم العرض المخصص" أو "الاسم الثلاثي (الأول + الأب + الجد)"
 * @param fullName - الاسم الكامل (الرباعي)
 * @param displayName - اسم العرض المخصص (اختياري)
 * @returns الاسم المنسق
 * @example
 * formatDeputyName("أحمد محمد علي حسن", "أحمد محمد") // "أحمد محمد"
 * formatDeputyName("أحمد محمد علي حسن", null) // "أحمد محمد علي" (تلقائي - ثلاثي)
 * formatDeputyName("أحمد محمد علي حسن", "د. أحمد محمد") // "د. أحمد محمد"
 */
export function formatDeputyName(
  fullName: string | null | undefined,
  displayName?: string | null
): string {
  // إذا كان هناك اسم عرض مخصص، استخدمه
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }

  // وإلا استخدم التنسيق التلقائي (ثلاثي)
  if (!fullName) {
    return "غير محدد";
  }

  // تقسيم الاسم إلى أجزاء
  const nameParts = fullName.trim().split(/\s+/);
  
  // أخذ أول ثلاثة أسماء (الاسم الأول + اسم الأب + اسم الجد)
  const firstName = nameParts[0] || "";
  const fatherName = nameParts[1] || "";
  const grandFatherName = nameParts[2] || "";
  
  // بناء الاسم الثلاثي
  const parts = [firstName, fatherName, grandFatherName].filter(Boolean);
  
  return parts.join(" ") || "غير محدد";
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
  const grandFatherName = nameParts[2] || "";
  
  const parts = [firstName, fatherName, grandFatherName].filter(Boolean);
  return parts.join(" ") || "غير محدد";
}

