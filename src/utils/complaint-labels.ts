/**
 * ترجمة حالة وأهمية الشكوى للعربية
 */

/**
 * ترجمة حالة الشكوى
 */
export const statusLabelsAr: Record<string, string> = {
  new: "جديدة",
  accepted: "مقبولة",
  pending_review: "قيد الدراسة",
  rejected: "مرفوضة",
  in_progress: "قيد المعالجة",
  on_hold: "معلقة",
  resolved: "محلولة",
  closed: "مغلقة",
  unable_to_resolve: "غير قابلة للحل",
};

/**
 * ترجمة أهمية الشكوى
 */
export const priorityLabelsAr: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

/**
 * ألوان أهمية الشكوى
 */
export const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

/**
 * الحصول على ترجمة الحالة
 */
export function getStatusLabel(status: string): string {
  return statusLabelsAr[status] || status;
}

/**
 * الحصول على ترجمة الأهمية
 */
export function getPriorityLabel(priority: string): string {
  return priorityLabelsAr[priority] || priority;
}

/**
 * الحصول على لون الأهمية
 */
export function getPriorityColor(priority: string): string {
  return priorityColors[priority] || "bg-gray-100 text-gray-800";
}
