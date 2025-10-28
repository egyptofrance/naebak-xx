"use server";

import { revalidatePath } from "next/cache";

/**
 * Server Action لتحديث الصفحة فوراً (On-Demand Revalidation)
 * يستخدم عند الضغط على زر التحديث في الهيدر
 */
export async function revalidateCurrentPage(path: string) {
  try {
    revalidatePath(path);
    return { success: true, message: "تم تحديث الصفحة بنجاح" };
  } catch (error) {
    console.error("Error revalidating page:", error);
    return { success: false, message: "حدث خطأ أثناء التحديث" };
  }
}
