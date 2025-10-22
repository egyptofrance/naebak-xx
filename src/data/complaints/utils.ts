/**
 * Utility Functions for Complaints System
 * دوال مساعدة لنظام الشكاوى
 */

import type {
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  Complaint,
} from "@/types/complaintTypes";

// ============================================================================
// Status Utilities
// ============================================================================

/**
 * Check if complaint can be edited by citizen
 */
export function canCitizenEditComplaint(status: ComplaintStatus): boolean {
  return status === "new";
}

/**
 * Check if complaint can be assigned
 */
export function canAssignComplaint(status: ComplaintStatus): boolean {
  return ["new", "under_review"].includes(status);
}

/**
 * Check if complaint can be accepted by deputy
 */
export function canDeputyAcceptComplaint(status: ComplaintStatus): boolean {
  return status === "assigned_to_deputy";
}

/**
 * Check if complaint can be rejected by deputy
 */
export function canDeputyRejectComplaint(status: ComplaintStatus): boolean {
  return ["assigned_to_deputy", "accepted", "on_hold"].includes(status);
}

/**
 * Check if complaint can be resolved
 */
export function canResolveComplaint(status: ComplaintStatus): boolean {
  return ["accepted", "in_progress"].includes(status);
}

/**
 * Check if complaint can be closed
 */
export function canCloseComplaint(status: ComplaintStatus): boolean {
  return !["closed", "archived"].includes(status);
}

/**
 * Check if complaint can be archived
 */
export function canArchiveComplaint(status: ComplaintStatus): boolean {
  return ["resolved", "rejected", "closed"].includes(status);
}

/**
 * Check if points can be awarded
 */
export function canAwardPointsForComplaint(
  status: ComplaintStatus,
  pointsAwarded: boolean
): boolean {
  return status === "resolved" && !pointsAwarded;
}

/**
 * Get next possible statuses
 */
export function getNextPossibleStatuses(
  currentStatus: ComplaintStatus,
  userRole: "admin" | "manager" | "deputy" | "user"
): ComplaintStatus[] {
  const statusMap: Record<string, Record<ComplaintStatus, ComplaintStatus[]>> = {
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
      accepted: ["in_progress", "on_hold"],
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

  return statusMap[userRole]?.[currentStatus] || [];
}

// ============================================================================
// Priority Utilities
// ============================================================================

/**
 * Get priority weight for sorting
 */
export function getPriorityWeight(priority: ComplaintPriority): number {
  const weights: Record<ComplaintPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return weights[priority];
}

/**
 * Compare priorities
 */
export function comparePriorities(
  a: ComplaintPriority,
  b: ComplaintPriority
): number {
  return getPriorityWeight(b) - getPriorityWeight(a);
}

/**
 * Should escalate priority based on age
 */
export function shouldEscalatePriority(
  createdAt: string,
  currentPriority: ComplaintPriority
): boolean {
  const now = new Date();
  const created = new Date(createdAt);
  const daysSinceCreation = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Escalation rules
  if (currentPriority === "low" && daysSinceCreation > 30) return true;
  if (currentPriority === "medium" && daysSinceCreation > 14) return true;
  if (currentPriority === "high" && daysSinceCreation > 7) return true;

  return false;
}

/**
 * Get suggested priority based on category and keywords
 */
export function getSuggestedPriority(
  category: ComplaintCategory,
  description: string
): ComplaintPriority {
  const urgentKeywords = [
    "عاجل",
    "طارئ",
    "خطر",
    "كارثة",
    "حريق",
    "انفجار",
    "urgent",
    "emergency",
  ];
  const highKeywords = [
    "مهم",
    "سريع",
    "ضروري",
    "important",
    "critical",
  ];

  const lowerDescription = description.toLowerCase();

  // Check for urgent keywords
  if (urgentKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "urgent";
  }

  // Check for high keywords
  if (highKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "high";
  }

  // Category-based priority
  const highPriorityCategories: ComplaintCategory[] = [
    "health",
    "security",
    "water",
    "electricity",
  ];

  if (highPriorityCategories.includes(category)) {
    return "high";
  }

  return "medium";
}

// ============================================================================
// Time Utilities
// ============================================================================

/**
 * Calculate days since creation
 */
export function getDaysSinceCreation(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate hours since creation
 */
export function getHoursSinceCreation(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
}

/**
 * Calculate resolution time in hours
 */
export function getResolutionTimeHours(
  createdAt: string,
  resolvedAt: string
): number {
  const created = new Date(createdAt);
  const resolved = new Date(resolvedAt);
  return Math.floor((resolved.getTime() - created.getTime()) / (1000 * 60 * 60));
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: string, locale: "ar" | "en" = "ar"): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === "ar") {
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    return past.toLocaleDateString("ar-EG");
  } else {
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return past.toLocaleDateString("en-US");
  }
}

/**
 * Check if complaint is overdue
 */
export function isComplaintOverdue(
  createdAt: string,
  status: ComplaintStatus,
  priority: ComplaintPriority
): boolean {
  const daysSince = getDaysSinceCreation(createdAt);

  // Don't check for resolved/closed/archived
  if (["resolved", "closed", "archived"].includes(status)) {
    return false;
  }

  // SLA thresholds in days
  const slaThresholds: Record<ComplaintPriority, number> = {
    urgent: 1,
    high: 3,
    medium: 7,
    low: 14,
  };

  return daysSince > slaThresholds[priority];
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate complaint title
 */
export function isValidComplaintTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length >= 10 && trimmed.length <= 200;
}

/**
 * Validate complaint description
 */
export function isValidComplaintDescription(description: string): boolean {
  const trimmed = description.trim();
  return trimmed.length >= 50 && trimmed.length <= 5000;
}

/**
 * Validate rejection reason
 */
export function isValidRejectionReason(reason: string): boolean {
  const trimmed = reason.trim();
  return trimmed.length >= 20 && trimmed.length <= 1000;
}

/**
 * Validate resolution notes
 */
export function isValidResolutionNotes(notes: string): boolean {
  const trimmed = notes.trim();
  return trimmed.length >= 50 && trimmed.length <= 2000;
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format complaint ID for display
 */
export function formatComplaintId(id: string): string {
  return `#${id.substring(0, 8).toUpperCase()}`;
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Get complaint summary
 */
export function getComplaintSummary(
  title: string,
  description: string,
  maxLength: number = 150
): string {
  const summary = `${title} - ${description}`;
  return truncateText(summary, maxLength);
}

// ============================================================================
// Statistics Utilities
// ============================================================================

/**
 * Calculate resolution rate
 */
export function calculateResolutionRate(
  totalComplaints: number,
  resolvedComplaints: number
): number {
  if (totalComplaints === 0) return 0;
  return Math.round((resolvedComplaints / totalComplaints) * 100);
}

/**
 * Calculate average resolution time
 */
export function calculateAverageResolutionTime(
  complaints: Array<{ created_at: string; resolved_at: string | null }>
): number {
  const resolved = complaints.filter((c) => c.resolved_at);
  if (resolved.length === 0) return 0;

  const totalHours = resolved.reduce((sum, c) => {
    return sum + getResolutionTimeHours(c.created_at, c.resolved_at!);
  }, 0);

  return Math.round(totalHours / resolved.length);
}

/**
 * Calculate deputy performance score
 */
export function calculateDeputyPerformanceScore(
  totalPoints: number,
  complaintsResolved: number,
  averageResolutionHours: number | null
): number {
  let score = totalPoints * 10; // Base score from points

  // Bonus for number of resolved complaints
  score += complaintsResolved * 5;

  // Bonus for fast resolution
  if (averageResolutionHours !== null) {
    if (averageResolutionHours < 24) score += 50;
    else if (averageResolutionHours < 48) score += 30;
    else if (averageResolutionHours < 72) score += 10;
  }

  return score;
}

// ============================================================================
// Filtering Utilities
// ============================================================================

/**
 * Filter complaints by status
 */
export function filterByStatus(
  complaints: Complaint[],
  status: ComplaintStatus | ComplaintStatus[]
): Complaint[] {
  if (Array.isArray(status)) {
    return complaints.filter((c) => status.includes(c.status as ComplaintStatus));
  }
  return complaints.filter((c) => c.status === status);
}

/**
 * Filter complaints by priority
 */
export function filterByPriority(
  complaints: Complaint[],
  priority: ComplaintPriority | ComplaintPriority[]
): Complaint[] {
  if (Array.isArray(priority)) {
    return complaints.filter((c) => priority.includes(c.priority as ComplaintPriority));
  }
  return complaints.filter((c) => c.priority === priority);
}

/**
 * Filter overdue complaints
 */
export function filterOverdueComplaints(complaints: Complaint[]): Complaint[] {
  return complaints.filter((c) =>
    isComplaintOverdue(c.created_at, c.status as ComplaintStatus, c.priority as ComplaintPriority)
  );
}

/**
 * Sort complaints by priority
 */
export function sortByPriority(complaints: Complaint[]): Complaint[] {
  return [...complaints].sort((a, b) =>
    comparePriorities(a.priority as ComplaintPriority, b.priority as ComplaintPriority)
  );
}

/**
 * Sort complaints by date
 */
export function sortByDate(
  complaints: Complaint[],
  order: "asc" | "desc" = "desc"
): Complaint[] {
  return [...complaints].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
}

// ============================================================================
// Notification Utilities
// ============================================================================

/**
 * Get notification message for status change
 */
export function getStatusChangeNotification(
  oldStatus: ComplaintStatus,
  newStatus: ComplaintStatus,
  locale: "ar" | "en" = "ar"
): string {
  if (locale === "ar") {
    const messages: Record<string, string> = {
      "new->under_review": "شكواك قيد المراجعة من قبل الإدارة",
      "new->assigned_to_deputy": "تم توجيه شكواك إلى نائب",
      "under_review->assigned_to_deputy": "تم توجيه شكواك إلى نائب",
      "assigned_to_deputy->accepted": "النائب قبل شكواك وسيعمل على حلها",
      "assigned_to_deputy->rejected": "النائب رفض شكواك",
      "assigned_to_deputy->on_hold": "تم تعليق شكواك للدراسة",
      "accepted->in_progress": "النائب بدأ العمل على حل شكواك",
      "in_progress->resolved": "تم حل شكواك بنجاح!",
      "resolved->closed": "تم إغلاق شكواك",
    };
    return messages[`${oldStatus}->${newStatus}`] || "تم تحديث حالة شكواك";
  } else {
    const messages: Record<string, string> = {
      "new->under_review": "Your complaint is under review",
      "new->assigned_to_deputy": "Your complaint has been assigned to a deputy",
      "under_review->assigned_to_deputy": "Your complaint has been assigned to a deputy",
      "assigned_to_deputy->accepted": "The deputy accepted your complaint",
      "assigned_to_deputy->rejected": "The deputy rejected your complaint",
      "assigned_to_deputy->on_hold": "Your complaint is on hold for review",
      "accepted->in_progress": "The deputy started working on your complaint",
      "in_progress->resolved": "Your complaint has been resolved!",
      "resolved->closed": "Your complaint has been closed",
    };
    return messages[`${oldStatus}->${newStatus}`] || "Your complaint status has been updated";
  }
}

/**
 * Should send notification to citizen
 */
export function shouldNotifyCitizen(
  oldStatus: ComplaintStatus,
  newStatus: ComplaintStatus
): boolean {
  // Notify on major status changes
  const notifiableTransitions = [
    "new->under_review",
    "new->assigned_to_deputy",
    "under_review->assigned_to_deputy",
    "assigned_to_deputy->accepted",
    "assigned_to_deputy->rejected",
    "accepted->in_progress",
    "in_progress->resolved",
    "resolved->closed",
  ];

  return notifiableTransitions.includes(`${oldStatus}->${newStatus}`);
}

/**
 * Should send notification to deputy
 */
export function shouldNotifyDeputy(
  oldStatus: ComplaintStatus,
  newStatus: ComplaintStatus
): boolean {
  // Notify deputy when complaint is assigned
  return newStatus === "assigned_to_deputy";
}

// ============================================================================
// Export Utilities
// ============================================================================

/**
 * Convert complaint to CSV row
 */
export function complaintToCSVRow(complaint: Complaint): string[] {
  return [
    formatComplaintId(complaint.id),
    complaint.title,
    complaint.description,
    complaint.category,
    complaint.priority,
    complaint.status,
    complaint.created_at,
    complaint.updated_at,
    complaint.resolved_at || "",
  ];
}

/**
 * Get CSV headers
 */
export function getCSVHeaders(locale: "ar" | "en" = "ar"): string[] {
  if (locale === "ar") {
    return [
      "رقم الشكوى",
      "العنوان",
      "الوصف",
      "التصنيف",
      "الأولوية",
      "الحالة",
      "تاريخ الإنشاء",
      "تاريخ التحديث",
      "تاريخ الحل",
    ];
  } else {
    return [
      "Complaint ID",
      "Title",
      "Description",
      "Category",
      "Priority",
      "Status",
      "Created At",
      "Updated At",
      "Resolved At",
    ];
  }
}

