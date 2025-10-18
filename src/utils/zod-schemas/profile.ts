import { z } from "zod";

export const updateUserFullNameSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  governorateId: z.string().uuid().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  jobTitle: z.string().optional(),
  partyId: z.string().uuid().optional(),
  electoralDistrict: z.string().optional(),
  isOnboardingFlow: z.boolean().optional().default(false),
});

export type UpdateUserFullNameSchema = z.infer<typeof updateUserFullNameSchema>;

export const profileUpdateFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  governorateId: z.string().uuid().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  jobTitle: z.string().optional(),
  partyId: z.string().uuid().optional(),
  electoralDistrict: z.string().optional(),
});

export type ProfileUpdateFormSchema = z.infer<typeof profileUpdateFormSchema>;
