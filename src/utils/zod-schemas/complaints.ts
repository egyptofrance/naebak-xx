/**
 * Zod Schemas for Complaints System
 * مخططات التحقق من البيانات لنظام الشكاوى
 */

import { z } from "zod";

// ============================================================================
// Enum Schemas
// ============================================================================

export const complaintStatusEnum = z.enum([
  "new",
  "under_review",
  "assigned_to_deputy",
  "accepted",
  "on_hold",
  "rejected",
  "in_progress",
  "resolved",
  "closed",
  "archived",
]);

export type ComplaintStatusEnum = z.infer<typeof complaintStatusEnum>;

export const complaintPriorityEnum = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
]);

export type ComplaintPriorityEnum = z.infer<typeof complaintPriorityEnum>;

export const complaintCategoryEnum = z.enum([
  "health",
  "education",
  "infrastructure",
  "security",
  "economy",
  "environment",
  "transportation",
  "housing",
  "water",
  "electricity",
  "sanitation",
  "social_services",
  "other",
]);

export type ComplaintCategoryEnum = z.infer<typeof complaintCategoryEnum>;

export const complaintActionTypeEnum = z.enum([
  "created",
  "assigned",
  "reassigned",
  "status_changed",
  "priority_changed",
  "commented",
  "accepted",
  "rejected",
  "resolved",
  "closed",
  "archived",
  "points_awarded",
]);

export type ComplaintActionTypeEnum = z.infer<typeof complaintActionTypeEnum>;

// ============================================================================
// Base Schemas
// ============================================================================

export const complaintIdSchema = z.string().uuid({
  message: "معرف الشكوى غير صالح",
});

export const userIdSchema = z.string().uuid({
  message: "معرف المستخدم غير صالح",
});

export const governorateIdSchema = z.string().uuid({
  message: "معرف المحافظة غير صالح",
});

// ============================================================================
// Create Complaint Schema
// ============================================================================

export const createComplaintSchema = z.object({
  title: z
    .string()
    .min(10, { message: "عنوان الشكوى يجب أن يكون 10 أحرف على الأقل" })
    .max(200, { message: "عنوان الشكوى يجب ألا يتجاوز 200 حرف" })
    .trim(),
  
  description: z
    .string()
    .min(50, { message: "وصف الشكوى يجب أن يكون 50 حرف على الأقل" })
    .max(5000, { message: "وصف الشكوى يجب ألا يتجاوز 5000 حرف" })
    .trim(),
  
  category: complaintCategoryEnum,
  
  priority: complaintPriorityEnum.optional().default("medium"),
  
  governorate_id: governorateIdSchema.optional(),
  
  location_details: z
    .string()
    .max(500, { message: "تفاصيل الموقع يجب ألا تتجاوز 500 حرف" })
    .trim()
    .optional(),
  
  attachments: z
    .array(z.string().url({ message: "رابط المرفق غير صالح" }))
    .max(5, { message: "الحد الأقصى 5 مرفقات" })
    .optional()
    .default([]),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

// ============================================================================
// Update Complaint Schema
// ============================================================================

export const updateComplaintSchema = z.object({
  id: complaintIdSchema,
  
  title: z
    .string()
    .min(10, { message: "عنوان الشكوى يجب أن يكون 10 أحرف على الأقل" })
    .max(200, { message: "عنوان الشكوى يجب ألا يتجاوز 200 حرف" })
    .trim()
    .optional(),
  
  description: z
    .string()
    .min(50, { message: "وصف الشكوى يجب أن يكون 50 حرف على الأقل" })
    .max(5000, { message: "وصف الشكوى يجب ألا يتجاوز 5000 حرف" })
    .trim()
    .optional(),
  
  category: complaintCategoryEnum.optional(),
  
  priority: complaintPriorityEnum.optional(),
  
  status: complaintStatusEnum.optional(),
  
  governorate_id: governorateIdSchema.optional().nullable(),
  
  location_details: z
    .string()
    .max(500, { message: "تفاصيل الموقع يجب ألا تتجاوز 500 حرف" })
    .trim()
    .optional()
    .nullable(),
});

export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;

// ============================================================================
// Assign Complaint Schema
// ============================================================================

export const assignComplaintSchema = z.object({
  complaint_id: complaintIdSchema,
  
  deputy_id: userIdSchema,
  
  notes: z
    .string()
    .max(1000, { message: "الملاحظات يجب ألا تتجاوز 1000 حرف" })
    .trim()
    .optional(),
});

export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;

// ============================================================================
// Accept Complaint Schema
// ============================================================================

export const acceptComplaintSchema = z.object({
  complaint_id: complaintIdSchema,
  
  notes: z
    .string()
    .max(1000, { message: "الملاحظات يجب ألا تتجاوز 1000 حرف" })
    .trim()
    .optional(),
});

export type AcceptComplaintInput = z.infer<typeof acceptComplaintSchema>;

// ============================================================================
// Reject Complaint Schema
// ============================================================================

export const rejectComplaintSchema = z.object({
  complaint_id: complaintIdSchema,
  
  rejection_reason: z
    .string()
    .min(20, { message: "سبب الرفض يجب أن يكون 20 حرف على الأقل" })
    .max(1000, { message: "سبب الرفض يجب ألا يتجاوز 1000 حرف" })
    .trim(),
});

export type RejectComplaintInput = z.infer<typeof rejectComplaintSchema>;

// ============================================================================
// Resolve Complaint Schema
// ============================================================================

export const resolveComplaintSchema = z.object({
  complaint_id: complaintIdSchema,
  
  resolution_notes: z
    .string()
    .min(50, { message: "ملاحظات الحل يجب أن تكون 50 حرف على الأقل" })
    .max(2000, { message: "ملاحظات الحل يجب ألا تتجاوز 2000 حرف" })
    .trim(),
});

export type ResolveComplaintInput = z.infer<typeof resolveComplaintSchema>;

// ============================================================================
// Close Complaint Schema
// ============================================================================

export const closeComplaintSchema = z.object({
  complaint_id: complaintIdSchema,
  
  notes: z
    .string()
    .max(1000, { message: "الملاحظات يجب ألا تتجاوز 1000 حرف" })
    .trim()
    .optional(),
});

export type CloseComplaintInput = z.infer<typeof closeComplaintSchema>;

// ============================================================================
// Archive Complaint Schema
// ============================================================================

export const archiveComplaintSchema = z.object({
  complaint_id: complaintIdSchema,
});

export type ArchiveComplaintInput = z.infer<typeof archiveComplaintSchema>;

// ============================================================================
// Award Points Schema
// ============================================================================

export const awardPointsSchema = z.object({
  complaint_id: complaintIdSchema,
});

export type AwardPointsInput = z.infer<typeof awardPointsSchema>;

// ============================================================================
// Create Comment Schema
// ============================================================================

export const createCommentSchema = z.object({
  complaint_id: complaintIdSchema,
  
  content: z
    .string()
    .min(5, { message: "التعليق يجب أن يكون 5 أحرف على الأقل" })
    .max(2000, { message: "التعليق يجب ألا يتجاوز 2000 حرف" })
    .trim(),
  
  is_internal: z.boolean().optional().default(false),
  
  attachments: z
    .array(z.string().url({ message: "رابط المرفق غير صالح" }))
    .max(3, { message: "الحد الأقصى 3 مرفقات" })
    .optional()
    .default([]),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ============================================================================
// Update Comment Schema
// ============================================================================

export const updateCommentSchema = z.object({
  id: complaintIdSchema,
  
  content: z
    .string()
    .min(5, { message: "التعليق يجب أن يكون 5 أحرف على الأقل" })
    .max(2000, { message: "التعليق يجب ألا يتجاوز 2000 حرف" })
    .trim(),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// ============================================================================
// Delete Comment Schema
// ============================================================================

export const deleteCommentSchema = z.object({
  id: complaintIdSchema,
});

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;

// ============================================================================
// Filter Complaints Schema
// ============================================================================

export const filterComplaintsSchema = z.object({
  status: z.union([
    complaintStatusEnum,
    z.array(complaintStatusEnum),
  ]).optional(),
  
  priority: z.union([
    complaintPriorityEnum,
    z.array(complaintPriorityEnum),
  ]).optional(),
  
  category: z.union([
    complaintCategoryEnum,
    z.array(complaintCategoryEnum),
  ]).optional(),
  
  governorate_id: governorateIdSchema.optional(),
  
  citizen_id: userIdSchema.optional(),
  
  assigned_to_deputy_id: userIdSchema.optional(),
  
  date_from: z.string().datetime().optional(),
  
  date_to: z.string().datetime().optional(),
  
  search: z
    .string()
    .max(200, { message: "نص البحث يجب ألا يتجاوز 200 حرف" })
    .trim()
    .optional(),
  
  page: z.number().int().positive().optional().default(1),
  
  per_page: z.number().int().positive().max(100).optional().default(20),
  
  sort_field: z.enum([
    "created_at",
    "updated_at",
    "priority",
    "status",
    "title",
  ]).optional().default("created_at"),
  
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type FilterComplaintsInput = z.infer<typeof filterComplaintsSchema>;

// ============================================================================
// Get Complaint Details Schema
// ============================================================================

export const getComplaintDetailsSchema = z.object({
  id: complaintIdSchema,
  
  include_comments: z.boolean().optional().default(true),
  
  include_history: z.boolean().optional().default(true),
});

export type GetComplaintDetailsInput = z.infer<typeof getComplaintDetailsSchema>;

// ============================================================================
// Get Deputy Scores Schema
// ============================================================================

export const getDeputyScoresSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(10),
  
  sort_by: z.enum([
    "total_points",
    "complaints_resolved",
    "rank",
  ]).optional().default("total_points"),
});

export type GetDeputyScoresInput = z.infer<typeof getDeputyScoresSchema>;

// ============================================================================
// Bulk Operations Schemas
// ============================================================================

export const bulkAssignComplaintsSchema = z.object({
  complaint_ids: z.array(complaintIdSchema).min(1).max(50),
  deputy_id: userIdSchema,
  notes: z.string().max(1000).trim().optional(),
});

export type BulkAssignComplaintsInput = z.infer<typeof bulkAssignComplaintsSchema>;

export const bulkUpdateStatusSchema = z.object({
  complaint_ids: z.array(complaintIdSchema).min(1).max(50),
  status: complaintStatusEnum,
  notes: z.string().max(1000).trim().optional(),
});

export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;

export const bulkUpdatePrioritySchema = z.object({
  complaint_ids: z.array(complaintIdSchema).min(1).max(50),
  priority: complaintPriorityEnum,
});

export type BulkUpdatePriorityInput = z.infer<typeof bulkUpdatePrioritySchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate complaint title
 */
export function validateComplaintTitle(title: string): boolean {
  return title.trim().length >= 10 && title.trim().length <= 200;
}

/**
 * Validate complaint description
 */
export function validateComplaintDescription(description: string): boolean {
  return description.trim().length >= 50 && description.trim().length <= 5000;
}

/**
 * Validate rejection reason
 */
export function validateRejectionReason(reason: string): boolean {
  return reason.trim().length >= 20 && reason.trim().length <= 1000;
}

/**
 * Validate resolution notes
 */
export function validateResolutionNotes(notes: string): boolean {
  return notes.trim().length >= 50 && notes.trim().length <= 2000;
}

/**
 * Check if user can update complaint
 */
export function canUpdateComplaint(
  complaint: { status: ComplaintStatusEnum; citizen_id: string },
  userId: string,
  userRole: string
): boolean {
  // Admin can always update
  if (userRole === "admin") return true;
  
  // Manager can update non-archived complaints
  if (userRole === "manager" && complaint.status !== "archived") return true;
  
  // Citizen can only update new complaints
  if (userRole === "user" && complaint.citizen_id === userId && complaint.status === "new") {
    return true;
  }
  
  return false;
}

/**
 * Check if user can delete complaint
 */
export function canDeleteComplaint(userRole: string): boolean {
  return userRole === "admin";
}

/**
 * Check if user can archive complaint
 */
export function canArchiveComplaint(userRole: string): boolean {
  return userRole === "admin";
}

/**
 * Check if user can assign complaint
 */
export function canAssignComplaint(userRole: string): boolean {
  return userRole === "admin" || userRole === "manager";
}

/**
 * Check if user can award points
 */
export function canAwardPoints(userRole: string): boolean {
  return userRole === "admin";
}

/**
 * Get allowed status transitions
 */
export function getAllowedStatusTransitions(
  currentStatus: ComplaintStatusEnum,
  userRole: string
): ComplaintStatusEnum[] {
  const transitions: Record<string, Record<ComplaintStatusEnum, ComplaintStatusEnum[]>> = {
    admin: {
      new: ["under_review", "assigned_to_deputy", "closed"],
      under_review: ["assigned_to_deputy", "closed"],
      assigned_to_deputy: ["under_review", "closed"],
      accepted: ["in_progress", "closed"],
      on_hold: ["in_progress", "closed"],
      rejected: ["closed", "archived"],
      in_progress: ["resolved", "on_hold", "closed"],
      resolved: ["closed", "archived"],
      closed: ["archived"],
      archived: [],
    },
    manager: {
      new: ["under_review", "assigned_to_deputy"],
      under_review: ["assigned_to_deputy"],
      assigned_to_deputy: ["under_review"],
      accepted: [],
      on_hold: [],
      rejected: [],
      in_progress: [],
      resolved: [],
      closed: [],
      archived: [],
    },
    deputy: {
      new: [],
      under_review: [],
      assigned_to_deputy: ["accepted", "rejected", "on_hold"],
      accepted: ["in_progress"],
      on_hold: ["in_progress"],
      rejected: [],
      in_progress: ["resolved", "on_hold"],
      resolved: [],
      closed: [],
      archived: [],
    },
    user: {
      new: [],
      under_review: [],
      assigned_to_deputy: [],
      accepted: [],
      on_hold: [],
      rejected: [],
      in_progress: [],
      resolved: [],
      closed: [],
      archived: [],
    },
  };
  
  return transitions[userRole]?.[currentStatus] || [];
}

