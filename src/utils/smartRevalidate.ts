/**
 * Smart Revalidation Utility
 * 
 * بدلاً من استدعاء revalidatePath عدة مرات في كل action،
 * نستخدم هذه الدالة لتقليل الاستدعاءات وتحسين الأداء.
 * 
 * @example
 * // قبل:
 * revalidatePath("/complaints");
 * revalidatePath("/app_admin/complaints");
 * revalidatePath("/manager-complaints");
 * 
 * // بعد:
 * smartRevalidate("complaints");
 */

import { revalidatePath } from "next/cache";

type RevalidateScope = 
  | "complaints" 
  | "deputies" 
  | "feedback" 
  | "jobs" 
  | "news"
  | "banner"
  | "users"
  | "all";

/**
 * خريطة الصفحات المرتبطة بكل scope
 */
const scopePathsMap: Record<RevalidateScope, string[]> = {
  complaints: [
    "/complaints",
    "/app_admin/complaints",
    "/manager-complaints",
  ],
  deputies: [
    "/deputies",
    "/app_admin/deputies",
    "/deputy/[slug]",
  ],
  feedback: [
    "/feedback",
    "/app_admin/feedback",
  ],
  jobs: [
    "/jobs",
    "/app_admin/jobs",
  ],
  news: [
    "/",
    "/app_admin/breaking-news",
  ],
  banner: [
    "/",
    "/app_admin/banner",
  ],
  users: [
    "/app_admin/users",
    "/settings",
  ],
  all: ["/"],
};

/**
 * دالة ذكية لإعادة التحقق من الصفحات
 * 
 * @param scope - نطاق التحديث (complaints, deputies, etc.)
 * @param specificPath - مسار محدد إضافي (اختياري)
 * 
 * @example
 * smartRevalidate("complaints");
 * smartRevalidate("deputies", "/deputy/john-doe");
 */
export function smartRevalidate(
  scope: RevalidateScope,
  specificPath?: string
): void {
  // إذا كان scope هو "all"، نحدث الـ layout بالكامل
  if (scope === "all") {
    revalidatePath("/", "layout");
    return;
  }

  // الحصول على المسارات المرتبطة بالـ scope
  const paths = scopePathsMap[scope] || [];

  // إعادة التحقق من المسارات
  // نستخدم Set لتجنب التكرار
  const uniquePaths = new Set(paths);
  
  // إضافة المسار المحدد إذا وُجد
  if (specificPath) {
    uniquePaths.add(specificPath);
  }

  // إعادة التحقق من كل مسار
  uniquePaths.forEach((path) => {
    try {
      // نستخدم "page" type للمسارات المحددة
      if (path.includes("[")) {
        revalidatePath(path, "page");
      } else {
        revalidatePath(path);
      }
    } catch (error) {
      console.error(`Failed to revalidate ${path}:`, error);
    }
  });
}

/**
 * دالة لإعادة التحقق من مسار واحد فقط
 * تُستخدم عندما تحتاج لتحديث صفحة محددة فقط
 * 
 * @param path - المسار المراد تحديثه
 * 
 * @example
 * revalidateSinglePath("/deputy/john-doe");
 */
export function revalidateSinglePath(path: string): void {
  try {
    if (path.includes("[")) {
      revalidatePath(path, "page");
    } else {
      revalidatePath(path);
    }
  } catch (error) {
    console.error(`Failed to revalidate ${path}:`, error);
  }
}

/**
 * دالة لإعادة التحقق من الـ layout بالكامل
 * تُستخدم عند التحديثات الشاملة (مثل تغيير الإعدادات)
 * 
 * @example
 * revalidateLayout();
 */
export function revalidateLayout(): void {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to revalidate layout:", error);
  }
}

/**
 * دالة لإعادة التحقق من عدة scopes مرة واحدة
 * تُستخدم عند التحديثات التي تؤثر على عدة أقسام
 * 
 * @param scopes - قائمة الـ scopes المراد تحديثها
 * 
 * @example
 * revalidateMultiple(["complaints", "deputies"]);
 */
export function revalidateMultiple(scopes: RevalidateScope[]): void {
  scopes.forEach((scope) => smartRevalidate(scope));
}
