import { Enum } from "@/types";
import { z } from "zod";

// Define complaint status enum for Zod validation
export const complaintStatusEnum = z.enum([
  "new",
  "under_review",
  "assigned_to_deputy",
  "accepted",
  "in_progress",
  "on_hold",
  "rejected",
  "resolved",
  "closed",
  "archived",
]);

export type ComplaintStatusEnum = z.infer<typeof complaintStatusEnum>;
type DBComplaintStatusEnum = Enum<"complaint_status">;

// Type check to ensure enum equivalence
type StatusEnumEquivalence = ComplaintStatusEnum extends DBComplaintStatusEnum
  ? DBComplaintStatusEnum extends ComplaintStatusEnum
    ? true
    : false
  : false;

type AssertStatusEnumEquivalence = StatusEnumEquivalence extends true
  ? true
  : never;

const _assertStatusEnumEquivalence: AssertStatusEnumEquivalence = true;

// Define complaint priority enum for Zod validation
export const complaintPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export type ComplaintPriorityEnum = z.infer<typeof complaintPriorityEnum>;
type DBComplaintPriorityEnum = Enum<"complaint_priority">;

// Type check to ensure enum equivalence
type PriorityEnumEquivalence =
  ComplaintPriorityEnum extends DBComplaintPriorityEnum
    ? DBComplaintPriorityEnum extends ComplaintPriorityEnum
      ? true
      : false
    : false;

type AssertPriorityEnumEquivalence = PriorityEnumEquivalence extends true
  ? true
  : never;

const _assertPriorityEnumEquivalence: AssertPriorityEnumEquivalence = true;

// Define complaint category enum for Zod validation
export const complaintCategoryEnum = z.enum([
  "infrastructure",
  "education",
  "health",
  "security",
  "environment",
  "transportation",
  "utilities",
  "housing",
  "employment",
  "social_services",
  "legal",
  "corruption",
  "other",
]);

export type ComplaintCategoryEnum = z.infer<typeof complaintCategoryEnum>;
type DBComplaintCategoryEnum = Enum<"complaint_category">;

// Type check to ensure enum equivalence
type CategoryEnumEquivalence =
  ComplaintCategoryEnum extends DBComplaintCategoryEnum
    ? DBComplaintCategoryEnum extends ComplaintCategoryEnum
      ? true
      : false
    : false;

type AssertCategoryEnumEquivalence = CategoryEnumEquivalence extends true
  ? true
  : never;

const _assertCategoryEnumEquivalence: AssertCategoryEnumEquivalence = true;

// Schema for creating a new complaint
export const createComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must be less than 5000 characters"),
  category: complaintCategoryEnum,
  governorate: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  location_lat: z.number().min(-90).max(90).optional().nullable(),
  location_lng: z.number().min(-180).max(180).optional().nullable(),
  citizen_phone: z.string().optional().nullable(),
  citizen_email: z.string().email("Invalid email address").optional().nullable(),
});

export type CreateComplaintSchema = z.infer<typeof createComplaintSchema>;

// Helper functions to convert enums to labels
export const complaintStatusToLabel = (status: ComplaintStatusEnum) => {
  switch (status) {
    case "new":
      return "New";
    case "under_review":
      return "Under Review";
    case "assigned_to_deputy":
      return "Assigned to Deputy";
    case "accepted":
      return "Accepted";
    case "in_progress":
      return "In Progress";
    case "on_hold":
      return "On Hold";
    case "rejected":
      return "Rejected";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    case "archived":
      return "Archived";
  }
};

export const complaintPriorityToLabel = (priority: ComplaintPriorityEnum) => {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "urgent":
      return "Urgent";
  }
};

export const complaintCategoryToLabel = (category: ComplaintCategoryEnum) => {
  switch (category) {
    case "infrastructure":
      return "Infrastructure";
    case "education":
      return "Education";
    case "health":
      return "Health";
    case "security":
      return "Security";
    case "environment":
      return "Environment";
    case "transportation":
      return "Transportation";
    case "utilities":
      return "Utilities";
    case "housing":
      return "Housing";
    case "employment":
      return "Employment";
    case "social_services":
      return "Social Services";
    case "legal":
      return "Legal";
    case "corruption":
      return "Corruption";
    case "other":
      return "Other";
  }
};

