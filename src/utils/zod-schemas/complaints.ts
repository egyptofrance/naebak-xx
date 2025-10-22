import { z } from "zod";

// Zod schema for creating a new complaint
export const createComplaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must not exceed 5000 characters"),
  category: z.enum([
    "infrastructure",
    "education",
    "health",
    "security",
    "environment",
    "transportation",
    "water_sanitation",
    "electricity",
    "housing",
    "employment",
    "social_services",
    "corruption",
    "other"
  ]),
  governorate: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  citizen_phone: z.string().optional(),
  citizen_email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

