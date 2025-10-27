/**
 * تنسيق اسم النائب ليكون ثلاثي (3 كلمات فقط)
 * @param fullName - الاسم الكامل
 * @param displayName - اسم العرض المخصص (اختياري)
 * @returns الاسم المنسق (ثلاثي)
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

  // تقسيم الاسم إلى كلمات وأخذ أول 3 كلمات فقط
  const words = fullName.trim().split(/\s+/);
  const threeWords = words.slice(0, 3);
  
  return threeWords.join(" ") || "غير محدد";
}

/**
 * الحصول على الاسم المختصر (ثلاثي)
 * @param fullName - الاسم الكامل
 * @param displayName - اسم العرض المخصص (اختياري)
 * @returns الاسم المختصر (ثلاثي)
 */
export function getShortDeputyName(
  fullName: string | null | undefined,
  displayName?: string | null
): string {
  return formatDeputyName(fullName, displayName);
}

