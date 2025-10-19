import { z } from "zod";

export const updateUserFullNameSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  isOnboardingFlow: z.boolean().optional().default(false),
});

export type UpdateUserFullNameSchema = z.infer<typeof updateUserFullNameSchema>;

export const profileUpdateFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  governorateId: z.string().optional(),
  city: z.string().optional(),
  electoralDistrict: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  jobTitle: z.string().optional(),
  partyId: z.string().optional().nullable(),
  avatarUrl: z.string().optional(),
});

export type ProfileUpdateFormSchema = z.infer<typeof profileUpdateFormSchema>;

// Extended Profile Schema for Complete Registration
export const completeProfileSchema = z.object({
  // Basic Information
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح").min(1, "البريد الإلكتروني مطلوب"),
  phone: z.string()
    .regex(/^01[0-2,5]{1}[0-9]{8}$/, "رقم الهاتف يجب أن يكون رقم مصري صحيح (01xxxxxxxxx)")
    .min(1, "رقم الهاتف مطلوب"),
  
  // Geographic Information
  governorateId: z.string().uuid("المحافظة غير صحيحة").min(1, "المحافظة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  electoralDistrict: z.string().min(1, "الدائرة الانتخابية مطلوبة"),
  
  // Optional Fields
  gender: z.enum(["male", "female"]).optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  jobTitle: z.string().optional(),
  partyId: z.string().uuid().optional(),
  avatarUrl: z.string().url().optional(),
  
  isOnboardingFlow: z.boolean().optional().default(false),
});

export type CompleteProfileSchema = z.infer<typeof completeProfileSchema>;

// Schema for updating complete profile
export const updateCompleteProfileSchema = z.object({
  // Basic Information
  fullName: z.string().min(1, "الاسم الكامل مطلوب").optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  phone: z.string()
    .regex(/^01[0-2,5]{1}[0-9]{8}$/, "رقم الهاتف يجب أن يكون رقم مصري صحيح (01xxxxxxxxx)")
    .optional(),
  
  // Geographic Information
  governorateId: z.string().uuid("المحافظة غير صحيحة").optional(),
  city: z.string().optional(),
  electoralDistrict: z.string().optional(),
  
  // Optional Fields
  gender: z.enum(["male", "female"]).optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  jobTitle: z.string().optional(),
  partyId: z.string().uuid().optional().nullable(),
  avatarUrl: z.string().url().optional(),
  
  isOnboardingFlow: z.boolean().optional().default(false),
});

export type UpdateCompleteProfileSchema = z.infer<typeof updateCompleteProfileSchema>;

