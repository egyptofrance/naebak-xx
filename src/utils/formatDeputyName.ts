/**
 * تنسيق اسم النائب ليكون: "اسم العرض المخصص" أو "الاسم الثلاثي (3 مقاطع حقيقية)"
 * Updated: 2025-10-27 - Force rebuild
 * @param fullName - الاسم الكامل (الرباعي)
 * @param displayName - اسم العرض المخصص (اختياري)
 * @returns الاسم المنسق
 * @example
 * formatDeputyName("محمد عبد الحميد علي حسن", null) // "محمد عبدالحميد علي" (3 مقاطع)
 * formatDeputyName("أحمد أبو بكر محمد علي", null) // "أحمد أبوبكر محمد" (3 مقاطع)
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
  const words = fullName.trim().split(/\s+/);
  
  // دمج الأسماء المركبة (عبد، أبو، أبي، بن، ابن)
  const compoundPrefixes = ["عبد", "أبو", "أبي", "بن", "ابن"];
  const nameParts: string[] = [];
  
  let i = 0;
  while (i < words.length) {
    const currentWord = words[i];
    
    // تحقق إذا كانت الكلمة الحالية بادئة مركبة والكلمة التالية موجودة
    if (compoundPrefixes.includes(currentWord) && i + 1 < words.length) {
      // دمج الكلمة الحالية مع التالية
      nameParts.push(currentWord + words[i + 1]);
      i += 2; // تخطي الكلمتين
    } else {
      // إضافة الكلمة كما هي
      nameParts.push(currentWord);
      i += 1;
    }
  }
  
  // أخذ أول 3 مقاطع حقيقية
  const result = nameParts.slice(0, 3).filter(Boolean);
  
  return result.join(" ") || "غير محدد";
}

/**
 * الحصول على الاسم المختصر (3 مقاطع حقيقية)
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

  // استخدام نفس المنطق من formatDeputyName
  const words = fullName.trim().split(/\s+/);
  const compoundPrefixes = ["عبد", "أبو", "أبي", "بن", "ابن"];
  const nameParts: string[] = [];
  
  let i = 0;
  while (i < words.length) {
    const currentWord = words[i];
    
    if (compoundPrefixes.includes(currentWord) && i + 1 < words.length) {
      nameParts.push(currentWord + words[i + 1]);
      i += 2;
    } else {
      nameParts.push(currentWord);
      i += 1;
    }
  }
  
  const result = nameParts.slice(0, 3).filter(Boolean);
  return result.join(" ") || "غير محدد";
}

