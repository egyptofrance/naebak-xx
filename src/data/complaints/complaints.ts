/**
 * Server Actions for Complaints System
 * إجراءات الخادم لنظام الشكاوى
 */

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { serverGetUserType } from "@/utils/server/serverGetUserType";
import {
  authActionClient,
  adminActionClient,
  managerOrAdminActionClient,
} from "@/lib/safe-action";
import {
  createComplaintSchema,
  updateComplaintSchema,
  assignComplaintSchema,
  acceptComplaintSchema,
  rejectComplaintSchema,
  resolveComplaintSchema,
  closeComplaintSchema,
  archiveComplaintSchema,
  awardPointsSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  filterComplaintsSchema,
  getComplaintDetailsSchema,
  getDeputyScoresSchema,
  bulkAssignComplaintsSchema,
  bulkUpdateStatusSchema,
  bulkUpdatePrioritySchema,
} from "@/utils/zod-schemas/complaints";
import type {
  ComplaintWithRelations,
  ComplaintDetailsResponse,
  ComplaintsListResponse,
  DeputyScoresResponse,
  ComplaintStats,
} from "@/types/complaintTypes";

// ============================================================================
// Citizen Actions - إجراءات المواطنين
// ============================================================================

/**
 * Create a new complaint
 * إنشاء شكوى جديدة
 */
export const createComplaintAction = authActionClient
  .schema(createComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Insert complaint
      const { data: complaint, error } = await supabase
        .from("complaints")
        .insert({
          citizen_id: userId,
          title: parsedInput.title,
          description: parsedInput.description,
          category: parsedInput.category,
          priority: parsedInput.priority || "medium",
          governorate_id: parsedInput.governorate_id,
          location_details: parsedInput.location_details,
          attachments: parsedInput.attachments || [],
          status: "new",
        })
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: complaint.id,
        user_id: userId,
        action: "created",
        notes: "تم إنشاء الشكوى",
      });

      revalidatePath("/[locale]/app/complaints", "page");
      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم تسجيل الشكوى بنجاح",
      };
    } catch (error: any) {
      console.error("Error creating complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في تسجيل الشكوى",
      };
    }
  });

/**
 * Update complaint (citizen can only update new complaints)
 * تحديث شكوى (المواطن يستطيع تحديث الشكاوى الجديدة فقط)
 */
export const updateComplaintAction = authActionClient
  .schema(updateComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Check if complaint exists and belongs to user
      const { data: existingComplaint, error: fetchError } = await supabase
        .from("complaints")
        .select("id, citizen_id, status")
        .eq("id", parsedInput.id)
        .eq("citizen_id", userId)
        .eq("status", "new")
        .is("deleted_at", null)
        .single();

      if (fetchError || !existingComplaint) {
        return {
          success: false,
          error: "الشكوى غير موجودة أو لا يمكن تعديلها",
        };
      }

      // Update complaint
      const updateData: any = {};
      if (parsedInput.title) updateData.title = parsedInput.title;
      if (parsedInput.description) updateData.description = parsedInput.description;
      if (parsedInput.category) updateData.category = parsedInput.category;
      if (parsedInput.priority) updateData.priority = parsedInput.priority;
      if (parsedInput.governorate_id !== undefined) updateData.governorate_id = parsedInput.governorate_id;
      if (parsedInput.location_details !== undefined) updateData.location_details = parsedInput.location_details;

      const { data: complaint, error } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", parsedInput.id)
        .select()
        .single();

      if (error) throw error;

      revalidatePath("/[locale]/app/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم تحديث الشكوى بنجاح",
      };
    } catch (error: any) {
      console.error("Error updating complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في تحديث الشكوى",
      };
    }
  });

/**
 * Get citizen's complaints
 * الحصول على شكاوى المواطن
 */
export const getMyComplaintsAction = authActionClient
  .schema(filterComplaintsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          citizen:user_profiles!complaints_citizen_id_fkey(id, full_name, email, avatar_url),
          assigned_deputy:user_profiles!complaints_assigned_to_deputy_id_fkey(id, full_name, email, avatar_url),
          governorate:governorates(id, name_ar, name_en)
        `, { count: "exact" })
        .eq("citizen_id", userId)
        .is("deleted_at", null);

      // Apply filters
      if (parsedInput.status) {
        if (Array.isArray(parsedInput.status)) {
          query = query.in("status", parsedInput.status);
        } else {
          query = query.eq("status", parsedInput.status);
        }
      }

      if (parsedInput.priority) {
        if (Array.isArray(parsedInput.priority)) {
          query = query.in("priority", parsedInput.priority);
        } else {
          query = query.eq("priority", parsedInput.priority);
        }
      }

      if (parsedInput.category) {
        if (Array.isArray(parsedInput.category)) {
          query = query.in("category", parsedInput.category);
        } else {
          query = query.eq("category", parsedInput.category);
        }
      }

      if (parsedInput.search) {
        query = query.or(`title.ilike.%${parsedInput.search}%,description.ilike.%${parsedInput.search}%`);
      }

      // Sorting
      const sortField = parsedInput.sort_field || "created_at";
      const sortOrder = parsedInput.sort_order || "desc";
      query = query.order(sortField, { ascending: sortOrder === "asc" });

      // Pagination
      const page = parsedInput.page || 1;
      const perPage = parsedInput.per_page || 20;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      query = query.range(from, to);

      const { data: complaints, error, count } = await query;

      if (error) throw error;

      const totalPages = count ? Math.ceil(count / perPage) : 0;

      const response: ComplaintsListResponse = {
        complaints: complaints as ComplaintWithRelations[],
        total: count || 0,
        page,
        per_page: perPage,
        total_pages: totalPages,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Error fetching complaints:", error);
      return {
        success: false,
        error: error.message || "فشل في جلب الشكاوى",
      };
    }
  });

// ============================================================================
// Admin/Manager Actions - إجراءات الأدمن والمدير
// ============================================================================

/**
 * Get all complaints (Admin/Manager)
 * الحصول على جميع الشكاوى
 */
export const getAllComplaintsAction = managerOrAdminActionClient
  .schema(filterComplaintsSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    try {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          citizen:user_profiles!complaints_citizen_id_fkey(id, full_name, email, avatar_url),
          assigned_deputy:user_profiles!complaints_assigned_to_deputy_id_fkey(id, full_name, email, avatar_url),
          governorate:governorates(id, name_ar, name_en)
        `, { count: "exact" })
        .is("deleted_at", null);

      // Apply filters
      if (parsedInput.status) {
        if (Array.isArray(parsedInput.status)) {
          query = query.in("status", parsedInput.status);
        } else {
          query = query.eq("status", parsedInput.status);
        }
      }

      if (parsedInput.priority) {
        if (Array.isArray(parsedInput.priority)) {
          query = query.in("priority", parsedInput.priority);
        } else {
          query = query.eq("priority", parsedInput.priority);
        }
      }

      if (parsedInput.category) {
        if (Array.isArray(parsedInput.category)) {
          query = query.in("category", parsedInput.category);
        } else {
          query = query.eq("category", parsedInput.category);
        }
      }

      if (parsedInput.governorate_id) {
        query = query.eq("governorate_id", parsedInput.governorate_id);
      }

      if (parsedInput.citizen_id) {
        query = query.eq("citizen_id", parsedInput.citizen_id);
      }

      if (parsedInput.assigned_to_deputy_id) {
        query = query.eq("assigned_to_deputy_id", parsedInput.assigned_to_deputy_id);
      }

      if (parsedInput.date_from) {
        query = query.gte("created_at", parsedInput.date_from);
      }

      if (parsedInput.date_to) {
        query = query.lte("created_at", parsedInput.date_to);
      }

      if (parsedInput.search) {
        query = query.or(`title.ilike.%${parsedInput.search}%,description.ilike.%${parsedInput.search}%`);
      }

      // Sorting
      const sortField = parsedInput.sort_field || "created_at";
      const sortOrder = parsedInput.sort_order || "desc";
      query = query.order(sortField, { ascending: sortOrder === "asc" });

      // Pagination
      const page = parsedInput.page || 1;
      const perPage = parsedInput.per_page || 20;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      query = query.range(from, to);

      const { data: complaints, error, count } = await query;

      if (error) throw error;

      const totalPages = count ? Math.ceil(count / perPage) : 0;

      const response: ComplaintsListResponse = {
        complaints: complaints as ComplaintWithRelations[],
        total: count || 0,
        page,
        per_page: perPage,
        total_pages: totalPages,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Error fetching all complaints:", error);
      return {
        success: false,
        error: error.message || "فشل في جلب الشكاوى",
      };
    }
  });

/**
 * Assign complaint to deputy (Admin/Manager)
 * توجيه شكوى لنائب
 */
export const assignComplaintAction = managerOrAdminActionClient
  .schema(assignComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Check if deputy exists
      const { data: deputy, error: deputyError } = await supabase
        .from("deputy_profiles")
        .select("user_id")
        .eq("user_id", parsedInput.deputy_id)
        .single();

      if (deputyError || !deputy) {
        return {
          success: false,
          error: "النائب غير موجود",
        };
      }

      // Update complaint
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          assigned_to_deputy_id: parsedInput.deputy_id,
          assigned_by_admin_id: userId,
          status: "assigned_to_deputy",
        })
        .eq("id", parsedInput.complaint_id)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "assigned",
        new_value: parsedInput.deputy_id,
        notes: parsedInput.notes,
      });

      revalidatePath("/[locale]/app_admin/complaints", "page");
      revalidatePath("/[locale]/app/deputy/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم توجيه الشكوى للنائب بنجاح",
      };
    } catch (error: any) {
      console.error("Error assigning complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في توجيه الشكوى",
      };
    }
  });

/**
 * Update complaint status (Admin/Manager)
 * تحديث حالة الشكوى
 */
export const updateComplaintStatusAction = managerOrAdminActionClient
  .schema(updateComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;
    const userType = await serverGetUserType();
    const userRole = userType;

    try {
      // Check if manager trying to archive
      if (userRole === "manager" && parsedInput.status === "archived") {
        return {
          success: false,
          error: "المدير لا يستطيع أرشفة الشكاوى",
        };
      }

      const updateData: any = {};
      if (parsedInput.status) updateData.status = parsedInput.status;
      if (parsedInput.priority) updateData.priority = parsedInput.priority;

      const { data: complaint, error } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", parsedInput.id)
        .select()
        .single();

      if (error) throw error;

      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم تحديث الشكوى بنجاح",
      };
    } catch (error: any) {
      console.error("Error updating complaint status:", error);
      return {
        success: false,
        error: error.message || "فشل في تحديث الشكوى",
      };
    }
  });

/**
 * Close complaint (Admin only)
 * إغلاق شكوى
 */
export const closeComplaintAction = adminActionClient
  .schema(closeComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
        })
        .eq("id", parsedInput.complaint_id)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "closed",
        notes: parsedInput.notes,
      });

      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم إغلاق الشكوى بنجاح",
      };
    } catch (error: any) {
      console.error("Error closing complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في إغلاق الشكوى",
      };
    }
  });

/**
 * Archive complaint (Admin only)
 * أرشفة شكوى
 */
export const archiveComplaintAction = adminActionClient
  .schema(archiveComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
        })
        .eq("id", parsedInput.complaint_id)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "archived",
      });

      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم أرشفة الشكوى بنجاح",
      };
    } catch (error: any) {
      console.error("Error archiving complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في أرشفة الشكوى",
      };
    }
  });

/**
 * Delete complaint (Admin only - soft delete)
 * حذف شكوى
 */
export const deleteComplaintAction = adminActionClient
  .schema(archiveComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq("id", parsedInput.complaint_id);

      if (error) throw error;

      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        message: "تم حذف الشكوى بنجاح",
      };
    } catch (error: any) {
      console.error("Error deleting complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في حذف الشكوى",
      };
    }
  });

/**
 * Award points to deputy (Admin only)
 * إضافة نقاط للنائب
 */
export const awardPointsAction = adminActionClient
  .schema(awardPointsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Check if complaint is resolved and points not awarded yet
      const { data: complaint, error: fetchError } = await supabase
        .from("complaints")
        .select("id, status, assigned_to_deputy_id, points_awarded")
        .eq("id", parsedInput.complaint_id)
        .eq("status", "resolved")
        .eq("points_awarded", false)
        .single();

      if (fetchError || !complaint) {
        return {
          success: false,
          error: "الشكوى غير محلولة أو تم إضافة النقاط مسبقاً",
        };
      }

      if (!complaint.assigned_to_deputy_id) {
        return {
          success: false,
          error: "الشكوى غير موجهة لنائب",
        };
      }

      // Update complaint
      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          points_awarded: true,
          points_awarded_at: new Date().toISOString(),
          points_awarded_by: userId,
        })
        .eq("id", parsedInput.complaint_id);

      if (updateError) throw updateError;

      revalidatePath("/[locale]/app_admin/complaints", "page");
      revalidatePath("/[locale]/app_admin/deputies/scores", "page");

      return {
        success: true,
        message: "تم إضافة 10 نقاط للنائب بنجاح",
      };
    } catch (error: any) {
      console.error("Error awarding points:", error);
      return {
        success: false,
        error: error.message || "فشل في إضافة النقاط",
      };
    }
  });

// ============================================================================
// Deputy Actions - إجراءات النائب
// ============================================================================

/**
 * Get deputy's assigned complaints
 * الحصول على الشكاوى الموجهة للنائب
 */
export const getMyAssignedComplaintsAction = actionClient
  .schema(filterComplaintsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          citizen:user_profiles!complaints_citizen_id_fkey(id, full_name, email, avatar_url),
          governorate:governorates(id, name_ar, name_en)
        `, { count: "exact" })
        .eq("assigned_to_deputy_id", userId)
        .is("deleted_at", null);

      // Apply filters (same as getMy ComplaintsAction)
      if (parsedInput.status) {
        if (Array.isArray(parsedInput.status)) {
          query = query.in("status", parsedInput.status);
        } else {
          query = query.eq("status", parsedInput.status);
        }
      }

      // ... other filters

      // Sorting
      const sortField = parsedInput.sort_field || "created_at";
      const sortOrder = parsedInput.sort_order || "desc";
      query = query.order(sortField, { ascending: sortOrder === "asc" });

      // Pagination
      const page = parsedInput.page || 1;
      const perPage = parsedInput.per_page || 20;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      query = query.range(from, to);

      const { data: complaints, error, count } = await query;

      if (error) throw error;

      const totalPages = count ? Math.ceil(count / perPage) : 0;

      const response: ComplaintsListResponse = {
        complaints: complaints as ComplaintWithRelations[],
        total: count || 0,
        page,
        per_page: perPage,
        total_pages: totalPages,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Error fetching assigned complaints:", error);
      return {
        success: false,
        error: error.message || "فشل في جلب الشكاوى",
      };
    }
  });

/**
 * Accept complaint (Deputy)
 * قبول شكوى
 */
export const acceptComplaintAction = actionClient
  .schema(acceptComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Check if complaint is assigned to this deputy
      const { data: existingComplaint, error: fetchError } = await supabase
        .from("complaints")
        .select("id, assigned_to_deputy_id, status")
        .eq("id", parsedInput.complaint_id)
        .eq("assigned_to_deputy_id", userId)
        .eq("status", "assigned_to_deputy")
        .single();

      if (fetchError || !existingComplaint) {
        return {
          success: false,
          error: "الشكوى غير موجودة أو لا يمكن قبولها",
        };
      }

      // Update complaint
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          status: "accepted",
        })
        .eq("id", parsedInput.complaint_id)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "accepted",
        notes: parsedInput.notes,
      });

      revalidatePath("/[locale]/app/deputy/complaints", "page");
      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم قبول الشكوى بنجاح",
      };
    } catch (error: any) {
      console.error("Error accepting complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في قبول الشكوى",
      };
    }
  });

/**
 * Reject complaint (Deputy)
 * رفض شكوى
 */
export const rejectComplaintAction = actionClient
  .schema(rejectComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Check if complaint is assigned to this deputy
      const { data: existingComplaint, error: fetchError } = await supabase
        .from("complaints")
        .select("id, assigned_to_deputy_id, status")
        .eq("id", parsedInput.complaint_id)
        .eq("assigned_to_deputy_id", userId)
        .in("status", ["assigned_to_deputy", "accepted", "on_hold"])
        .single();

      if (fetchError || !existingComplaint) {
        return {
          success: false,
          error: "الشكوى غير موجودة أو لا يمكن رفضها",
        };
      }

      // Update complaint
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          status: "rejected",
          rejection_reason: parsedInput.rejection_reason,
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
        })
        .eq("id", parsedInput.complaint_id)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "rejected",
        notes: parsedInput.rejection_reason,
      });

      revalidatePath("/[locale]/app/deputy/complaints", "page");
      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم رفض الشكوى",
      };
    } catch (error: any) {
      console.error("Error rejecting complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في رفض الشكوى",
      };
    }
  });

/**
 * Resolve complaint (Deputy)
 * حل شكوى
 */
export const resolveComplaintAction = actionClient
  .schema(resolveComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Check if complaint is assigned to this deputy
      const { data: existingComplaint, error: fetchError } = await supabase
        .from("complaints")
        .select("id, assigned_to_deputy_id, status")
        .eq("id", parsedInput.complaint_id)
        .eq("assigned_to_deputy_id", userId)
        .in("status", ["accepted", "in_progress"])
        .single();

      if (fetchError || !existingComplaint) {
        return {
          success: false,
          error: "الشكوى غير موجودة أو لا يمكن حلها",
        };
      }

      // Update complaint
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          status: "resolved",
          resolution_notes: parsedInput.resolution_notes,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
        })
        .eq("id", parsedInput.complaint_id)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "resolved",
        notes: parsedInput.resolution_notes,
      });

      revalidatePath("/[locale]/app/deputy/complaints", "page");
      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم حل الشكوى بنجاح! في انتظار إضافة النقاط من الأدمن",
      };
    } catch (error: any) {
      console.error("Error resolving complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في حل الشكوى",
      };
    }
  });

/**
 * Put complaint on hold (Deputy)
 * تعليق شكوى
 */
export const holdComplaintAction = actionClient
  .schema(acceptComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          status: "on_hold",
        })
        .eq("id", parsedInput.complaint_id)
        .eq("assigned_to_deputy_id", userId)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "status_changed",
        new_value: "on_hold",
        notes: parsedInput.notes,
      });

      revalidatePath("/[locale]/app/deputy/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم تعليق الشكوى للدراسة",
      };
    } catch (error: any) {
      console.error("Error holding complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في تعليق الشكوى",
      };
    }
  });

/**
 * Start working on complaint (Deputy)
 * بدء العمل على شكوى
 */
export const startWorkingOnComplaintAction = actionClient
  .schema(acceptComplaintSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      const { data: complaint, error } = await supabase
        .from("complaints")
        .update({
          status: "in_progress",
        })
        .eq("id", parsedInput.complaint_id)
        .eq("assigned_to_deputy_id", userId)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "status_changed",
        new_value: "in_progress",
        notes: parsedInput.notes,
      });

      revalidatePath("/[locale]/app/deputy/complaints", "page");

      return {
        success: true,
        data: complaint,
        message: "تم بدء العمل على الشكوى",
      };
    } catch (error: any) {
      console.error("Error starting work on complaint:", error);
      return {
        success: false,
        error: error.message || "فشل في بدء العمل على الشكوى",
      };
    }
  });

// ============================================================================
// Comment Actions - إجراءات التعليقات
// ============================================================================

/**
 * Create comment
 * إضافة تعليق
 */
export const createCommentAction = actionClient
  .schema(createCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Check if user has access to this complaint
      const { data: complaint, error: fetchError } = await supabase
        .from("complaints")
        .select("id, citizen_id, assigned_to_deputy_id")
        .eq("id", parsedInput.complaint_id)
        .is("deleted_at", null)
        .single();

      if (fetchError || !complaint) {
        return {
          success: false,
          error: "الشكوى غير موجودة",
        };
      }

      // Insert comment
      const { data: comment, error } = await supabase
        .from("complaint_comments")
        .insert({
          complaint_id: parsedInput.complaint_id,
          user_id: userId,
          content: parsedInput.content,
          is_internal: parsedInput.is_internal || false,
          attachments: parsedInput.attachments || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("complaint_history").insert({
        complaint_id: parsedInput.complaint_id,
        user_id: userId,
        action: "commented",
      });

      revalidatePath("/[locale]/app/complaints/[id]", "page");
      revalidatePath("/[locale]/app_admin/complaints/[id]", "page");
      revalidatePath("/[locale]/app/deputy/complaints/[id]", "page");

      return {
        success: true,
        data: comment,
        message: "تم إضافة التعليق بنجاح",
      };
    } catch (error: any) {
      console.error("Error creating comment:", error);
      return {
        success: false,
        error: error.message || "فشل في إضافة التعليق",
      };
    }
  });

/**
 * Update comment
 * تحديث تعليق
 */
export const updateCommentAction = actionClient
  .schema(updateCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      const { data: comment, error } = await supabase
        .from("complaint_comments")
        .update({
          content: parsedInput.content,
        })
        .eq("id", parsedInput.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      revalidatePath("/[locale]/app/complaints/[id]", "page");

      return {
        success: true,
        data: comment,
        message: "تم تحديث التعليق بنجاح",
      };
    } catch (error: any) {
      console.error("Error updating comment:", error);
      return {
        success: false,
        error: error.message || "فشل في تحديث التعليق",
      };
    }
  });

/**
 * Delete comment (soft delete)
 * حذف تعليق
 */
export const deleteCommentAction = actionClient
  .schema(deleteCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      const { error } = await supabase
        .from("complaint_comments")
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq("id", parsedInput.id)
        .eq("user_id", userId);

      if (error) throw error;

      revalidatePath("/[locale]/app/complaints/[id]", "page");

      return {
        success: true,
        message: "تم حذف التعليق بنجاح",
      };
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      return {
        success: false,
        error: error.message || "فشل في حذف التعليق",
      };
    }
  });

// ============================================================================
// Statistics & Reports - الإحصائيات والتقارير
// ============================================================================

/**
 * Get complaints statistics (Admin/Manager)
 * الحصول على إحصائيات الشكاوى
 */
export const getComplaintsStatsAction = managerOrAdminActionClient
  .action(async () => {
    const supabase = await createSupabaseUserServerComponentClient();

    try {
      const { data, error } = await supabase
        .rpc("get_complaints_stats");

      if (error) throw error;

      return {
        success: true,
        data: data as ComplaintStats,
      };
    } catch (error: any) {
      console.error("Error fetching complaints stats:", error);
      return {
        success: false,
        error: error.message || "فشل في جلب الإحصائيات",
      };
    }
  });

/**
 * Get deputy scores
 * الحصول على نقاط النواب
 */
export const getDeputyScoresAction = actionClient
  .schema(getDeputyScoresSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    try {
      let query = supabase
        .from("deputy_scores")
        .select(`
          *,
          deputy:user_profiles!deputy_scores_deputy_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `);

      // Sorting
      const sortBy = parsedInput.sort_by || "total_points";
      query = query.order(sortBy, { ascending: false });

      // Limit
      const limit = parsedInput.limit || 10;
      query = query.limit(limit);

      const { data: scores, error, count } = await query;

      if (error) throw error;

      const response: DeputyScoresResponse = {
        scores: scores as any,
        total: count || 0,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Error fetching deputy scores:", error);
      return {
        success: false,
        error: error.message || "فشل في جلب نقاط النواب",
      };
    }
  });

/**
 * Get complaint details with comments and history
 * الحصول على تفاصيل الشكوى مع التعليقات والسجل
 */
export const getComplaintDetailsAction = actionClient
  .schema(getComplaintDetailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Get complaint
      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .select(`
          *,
          citizen:user_profiles!complaints_citizen_id_fkey(id, full_name, email, avatar_url),
          assigned_deputy:user_profiles!complaints_assigned_to_deputy_id_fkey(id, full_name, email, avatar_url),
          governorate:governorates(id, name_ar, name_en)
        `)
        .eq("id", parsedInput.id)
        .is("deleted_at", null)
        .single();

      if (complaintError || !complaint) {
        return {
          success: false,
          error: "الشكوى غير موجودة",
        };
      }

      let comments: any[] = [];
      let history: any[] = [];

      // Get comments if requested
      if (parsedInput.include_comments) {
        const { data: commentsData } = await supabase
          .from("complaint_comments")
          .select(`
            *,
            user:user_profiles(id, full_name, email, avatar_url)
          `)
          .eq("complaint_id", parsedInput.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: true });

        comments = commentsData || [];
      }

      // Get history if requested
      if (parsedInput.include_history) {
        const { data: historyData } = await supabase
          .from("complaint_history")
          .select(`
            *,
            user:user_profiles(id, full_name, email, avatar_url)
          `)
          .eq("complaint_id", parsedInput.id)
          .order("created_at", { ascending: false });

        history = historyData || [];
      }

      const response: ComplaintDetailsResponse = {
        complaint: complaint as ComplaintWithRelations,
        comments,
        history,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Error fetching complaint details:", error);
      return {
        success: false,
        error: error.message || "فشل في جلب تفاصيل الشكوى",
      };
    }
  });

// ============================================================================
// Bulk Operations - العمليات الجماعية
// ============================================================================

/**
 * Bulk assign complaints (Admin/Manager)
 * توجيه شكاوى جماعي
 */
export const bulkAssignComplaintsAction = managerOrAdminActionClient
  .schema(bulkAssignComplaintsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    try {
      // Update all complaints
      const { error } = await supabase
        .from("complaints")
        .update({
          assigned_to_deputy_id: parsedInput.deputy_id,
          assigned_by_admin_id: userId,
          status: "assigned_to_deputy",
        })
        .in("id", parsedInput.complaint_ids);

      if (error) throw error;

      // Log history for each complaint
      const historyRecords = parsedInput.complaint_ids.map((id) => ({
        complaint_id: id,
        user_id: userId,
        action: "assigned" as const,
        new_value: parsedInput.deputy_id,
        notes: parsedInput.notes,
      }));

      await supabase.from("complaint_history").insert(historyRecords);

      revalidatePath("/[locale]/app_admin/complaints", "page");

      return {
        success: true,
        message: `تم توجيه ${parsedInput.complaint_ids.length} شكوى بنجاح`,
      };
    } catch (error: any) {
      console.error("Error bulk assigning complaints:", error);
      return {
        success: false,
        error: error.message || "فشل في التوجيه الجماعي",
      };
    }
  });

