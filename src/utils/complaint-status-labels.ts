/**
 * نظام حالات الشكاوى مع صيغ مختلفة حسب دور المستخدم
 */

export type ComplaintStatus =
  | "new"
  | "accepted"
  | "pending_review"
  | "rejected"
  | "in_progress"
  | "resolved"
  | "unable_to_resolve";

/**
 * صيغ النائب - للاستخدام في واجهة النائب
 */
export const deputyStatusLabels: Record<ComplaintStatus, string> = {
  new: "شكوى جديدة",
  accepted: "تم القبول",
  pending_review: "قيد الدراسة",
  rejected: "تم الرفض",
  in_progress: "جاري العمل عليها",
  resolved: "تم الحل",
  unable_to_resolve: "لم يتم الحل",
};

/**
 * صيغ الإدارة - للاستخدام في واجهة الإدارة
 */
export const adminStatusLabels: Record<ComplaintStatus, string> = {
  new: "شكوى جديدة",
  accepted: "مقبولة",
  pending_review: "قيد المراجعة",
  rejected: "مرفوضة",
  in_progress: "قيد المعالجة",
  resolved: "محلولة",
  unable_to_resolve: "غير قابلة للحل",
};

/**
 * صيغ المواطن - للاستخدام في الإشعارات والواجهة العامة
 */
export const citizenStatusLabels: Record<ComplaintStatus, string> = {
  new: "تم استلام شكواك",
  accepted: "تم قبول شكواك",
  pending_review: "شكواك قيد الدراسة",
  rejected: "تم رفض شكواك",
  in_progress: "يتم العمل على حل شكواك",
  resolved: "تم حل شكواك",
  unable_to_resolve: "لم يتمكن النائب من حل شكواك",
};

/**
 * ألوان الحالات
 */
export const statusColors: Record<ComplaintStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  pending_review: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-emerald-100 text-emerald-800",
  unable_to_resolve: "bg-gray-100 text-gray-800",
};

/**
 * الحصول على عنوان الإشعار للمواطن
 */
export function getNotificationTitle(status: ComplaintStatus): string {
  const titles: Record<ComplaintStatus, string> = {
    new: "تم استلام شكواك",
    accepted: "تم قبول شكواك",
    pending_review: "شكواك قيد الدراسة",
    rejected: "تحديث على شكواك",
    in_progress: "تحديث على شكواك",
    resolved: "تم حل شكواك",
    unable_to_resolve: "تحديث على شكواك",
  };
  return titles[status];
}

/**
 * الحصول على رسالة الإشعار للمواطن
 */
export function getNotificationMessage(
  status: ComplaintStatus,
  deputyName: string,
  comment?: string
): string {
  const messages: Record<ComplaintStatus, string> = {
    new: `تم استلام شكواك وإسنادها إلى النائب ${deputyName}`,
    accepted: `قام النائب ${deputyName} بقبول شكواك`,
    pending_review: `النائب ${deputyName} يقوم بدراسة شكواك حالياً`,
    rejected: `قام النائب ${deputyName} برفض شكواك`,
    in_progress: `النائب ${deputyName} يعمل على حل شكواك`,
    resolved: `قام النائب ${deputyName} بحل شكواك بنجاح`,
    unable_to_resolve: `لم يتمكن النائب ${deputyName} من حل شكواك`,
  };

  let message = messages[status];
  if (comment) {
    message += `\n\nملاحظة: ${comment}`;
  }
  return message;
}

