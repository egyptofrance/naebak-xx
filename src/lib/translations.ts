/**
 * Translation mappings for complaint statuses, priorities, and categories
 */

export const statusLabels: Record<string, string> = {
  new: "جديدة",
  accepted: "مقبولة",
  rejected: "مرفوضة",
  in_progress: "قيد المعالجة",
  on_hold: "معلقة",
  resolved: "محلولة",
  closed: "مغلقة",
};

export const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

export const categoryLabels: Record<string, string> = {
  infrastructure: "البنية التحتية",
  education: "التعليم",
  health: "الصحة",
  security: "الأمن",
  environment: "البيئة",
  transportation: "النقل",
  utilities: "المرافق",
  housing: "الإسكان",
  employment: "التوظيف",
  social_services: "الخدمات الاجتماعية",
  legal: "قانونية",
  corruption: "فساد",
  other: "أخرى",
};
