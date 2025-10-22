/**
 * Complaint Types for Naebak Platform
 * أنواع الشكاوى لمنصة نائبك
 */

import type { Database } from "@/lib/database.types";

// ============================================================================
// Database Types
// ============================================================================

export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
export type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
export type ComplaintUpdate = Database["public"]["Tables"]["complaints"]["Update"];

export type ComplaintComment = Database["public"]["Tables"]["complaint_comments"]["Row"];
export type ComplaintCommentInsert = Database["public"]["Tables"]["complaint_comments"]["Insert"];
export type ComplaintCommentUpdate = Database["public"]["Tables"]["complaint_comments"]["Update"];

export type ComplaintHistory = Database["public"]["Tables"]["complaint_history"]["Row"];
export type ComplaintHistoryInsert = Database["public"]["Tables"]["complaint_history"]["Insert"];

export type DeputyScore = Database["public"]["Tables"]["deputy_scores"]["Row"];
export type DeputyScoreUpdate = Database["public"]["Tables"]["deputy_scores"]["Update"];

// ============================================================================
// Enum Types
// ============================================================================

export type ComplaintStatus = 
  | "new"
  | "under_review"
  | "assigned_to_deputy"
  | "accepted"
  | "on_hold"
  | "rejected"
  | "in_progress"
  | "resolved"
  | "closed"
  | "archived";

export type ComplaintPriority = 
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type ComplaintCategory = 
  | "health"
  | "education"
  | "infrastructure"
  | "security"
  | "economy"
  | "environment"
  | "transportation"
  | "housing"
  | "water"
  | "electricity"
  | "sanitation"
  | "social_services"
  | "other";

export type ComplaintActionType = 
  | "created"
  | "assigned"
  | "reassigned"
  | "status_changed"
  | "priority_changed"
  | "commented"
  | "accepted"
  | "rejected"
  | "resolved"
  | "closed"
  | "archived"
  | "points_awarded";

// ============================================================================
// Extended Types with Relations
// ============================================================================

export type ComplaintWithRelations = Complaint & {
  citizen?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  assigned_deputy?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  governorate?: {
    id: string;
    name_ar: string;
    name_en: string;
  };
  comments_count?: number;
  unread_comments_count?: number;
};

export type ComplaintCommentWithUser = ComplaintComment & {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
};

export type ComplaintHistoryWithUser = ComplaintHistory & {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
};

export type DeputyScoreWithProfile = DeputyScore & {
  deputy: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    governorate?: {
      name_ar: string;
      name_en: string;
    };
  };
};

// ============================================================================
// Form Types
// ============================================================================

export type CreateComplaintFormData = {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority?: ComplaintPriority;
  governorate_id?: string;
  location_details?: string;
  attachments?: File[];
};

export type UpdateComplaintFormData = Partial<{
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  governorate_id: string;
  location_details: string;
}>;

export type AssignComplaintFormData = {
  complaint_id: string;
  deputy_id: string;
  notes?: string;
};

export type RejectComplaintFormData = {
  complaint_id: string;
  rejection_reason: string;
};

export type ResolveComplaintFormData = {
  complaint_id: string;
  resolution_notes: string;
};

export type CreateCommentFormData = {
  complaint_id: string;
  content: string;
  is_internal?: boolean;
  attachments?: File[];
};

// ============================================================================
// Filter Types
// ============================================================================

export type ComplaintFilters = {
  status?: ComplaintStatus | ComplaintStatus[];
  priority?: ComplaintPriority | ComplaintPriority[];
  category?: ComplaintCategory | ComplaintCategory[];
  governorate_id?: string;
  citizen_id?: string;
  assigned_to_deputy_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
};

export type ComplaintSortField = 
  | "created_at"
  | "updated_at"
  | "priority"
  | "status"
  | "title";

export type ComplaintSortOrder = "asc" | "desc";

export type ComplaintSort = {
  field: ComplaintSortField;
  order: ComplaintSortOrder;
};

// ============================================================================
// Statistics Types
// ============================================================================

export type ComplaintStats = {
  total_complaints: number;
  new_complaints: number;
  under_review_complaints: number;
  assigned_complaints: number;
  resolved_complaints: number;
  rejected_complaints: number;
  average_resolution_days: number | null;
};

export type DeputyStats = {
  deputy_id: string;
  deputy_name: string;
  total_points: number;
  complaints_resolved: number;
  complaints_assigned: number;
  complaints_accepted: number;
  complaints_rejected: number;
  average_resolution_hours: number | null;
  rank: number | null;
};

export type CategoryStats = {
  category: ComplaintCategory;
  count: number;
  resolved_count: number;
  pending_count: number;
};

export type GovernorateStats = {
  governorate_id: string;
  governorate_name: string;
  count: number;
  resolved_count: number;
  pending_count: number;
};

// ============================================================================
// API Response Types
// ============================================================================

export type ComplaintsListResponse = {
  complaints: ComplaintWithRelations[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type ComplaintDetailsResponse = {
  complaint: ComplaintWithRelations;
  comments: ComplaintCommentWithUser[];
  history: ComplaintHistoryWithUser[];
};

export type DeputyScoresResponse = {
  scores: DeputyScoreWithProfile[];
  total: number;
};

// ============================================================================
// Constants
// ============================================================================

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, { ar: string; en: string }> = {
  new: { ar: "جديدة", en: "New" },
  under_review: { ar: "قيد المراجعة", en: "Under Review" },
  assigned_to_deputy: { ar: "موجهة لنائب", en: "Assigned to Deputy" },
  accepted: { ar: "مقبولة", en: "Accepted" },
  on_hold: { ar: "معلقة", en: "On Hold" },
  rejected: { ar: "مرفوضة", en: "Rejected" },
  in_progress: { ar: "قيد الحل", en: "In Progress" },
  resolved: { ar: "محلولة", en: "Resolved" },
  closed: { ar: "مغلقة", en: "Closed" },
  archived: { ar: "مؤرشفة", en: "Archived" },
};

export const COMPLAINT_PRIORITY_LABELS: Record<ComplaintPriority, { ar: string; en: string }> = {
  low: { ar: "منخفضة", en: "Low" },
  medium: { ar: "متوسطة", en: "Medium" },
  high: { ar: "عالية", en: "High" },
  urgent: { ar: "عاجلة", en: "Urgent" },
};

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, { ar: string; en: string }> = {
  health: { ar: "صحة", en: "Health" },
  education: { ar: "تعليم", en: "Education" },
  infrastructure: { ar: "بنية تحتية", en: "Infrastructure" },
  security: { ar: "أمن", en: "Security" },
  economy: { ar: "اقتصاد", en: "Economy" },
  environment: { ar: "بيئة", en: "Environment" },
  transportation: { ar: "مواصلات", en: "Transportation" },
  housing: { ar: "إسكان", en: "Housing" },
  water: { ar: "مياه", en: "Water" },
  electricity: { ar: "كهرباء", en: "Electricity" },
  sanitation: { ar: "صرف صحي", en: "Sanitation" },
  social_services: { ar: "خدمات اجتماعية", en: "Social Services" },
  other: { ar: "أخرى", en: "Other" },
};

export const COMPLAINT_ACTION_TYPE_LABELS: Record<ComplaintActionType, { ar: string; en: string }> = {
  created: { ar: "تم إنشاء الشكوى", en: "Complaint Created" },
  assigned: { ar: "تم توجيه الشكوى", en: "Complaint Assigned" },
  reassigned: { ar: "تم إعادة توجيه الشكوى", en: "Complaint Reassigned" },
  status_changed: { ar: "تم تغيير الحالة", en: "Status Changed" },
  priority_changed: { ar: "تم تغيير الأولوية", en: "Priority Changed" },
  commented: { ar: "تم إضافة تعليق", en: "Comment Added" },
  accepted: { ar: "تم قبول الشكوى", en: "Complaint Accepted" },
  rejected: { ar: "تم رفض الشكوى", en: "Complaint Rejected" },
  resolved: { ar: "تم حل الشكوى", en: "Complaint Resolved" },
  closed: { ar: "تم إغلاق الشكوى", en: "Complaint Closed" },
  archived: { ar: "تم أرشفة الشكوى", en: "Complaint Archived" },
  points_awarded: { ar: "تم إضافة نقاط", en: "Points Awarded" },
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getComplaintStatusLabel(status: ComplaintStatus, locale: "ar" | "en" = "ar"): string {
  return COMPLAINT_STATUS_LABELS[status][locale];
}

export function getComplaintPriorityLabel(priority: ComplaintPriority, locale: "ar" | "en" = "ar"): string {
  return COMPLAINT_PRIORITY_LABELS[priority][locale];
}

export function getComplaintCategoryLabel(category: ComplaintCategory, locale: "ar" | "en" = "ar"): string {
  return COMPLAINT_CATEGORY_LABELS[category][locale];
}

export function getComplaintActionTypeLabel(action: ComplaintActionType, locale: "ar" | "en" = "ar"): string {
  return COMPLAINT_ACTION_TYPE_LABELS[action][locale];
}

export function getComplaintStatusColor(status: ComplaintStatus): string {
  const colors: Record<ComplaintStatus, string> = {
    new: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    assigned_to_deputy: "bg-purple-100 text-purple-800",
    accepted: "bg-green-100 text-green-800",
    on_hold: "bg-orange-100 text-orange-800",
    rejected: "bg-red-100 text-red-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    resolved: "bg-emerald-100 text-emerald-800",
    closed: "bg-gray-100 text-gray-800",
    archived: "bg-slate-100 text-slate-800",
  };
  return colors[status];
}

export function getComplaintPriorityColor(priority: ComplaintPriority): string {
  const colors: Record<ComplaintPriority, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  return colors[priority];
}

