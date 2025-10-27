"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { 
  ComplaintStatus, 
  getNotificationMessage, 
  getNotificationTitle 
} from "@/utils/complaint-status-labels";

/**
 * إرسال إشعار للمواطن عند تحديث حالة الشكوى
 */
export async function sendComplaintNotificationToCitizen(
  complaintId: string,
  citizenId: string,
  status: ComplaintStatus,
  deputyName: string,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseUserServerComponentClient();

    // إنشاء payload الإشعار
    const payload = {
      type: "complaint_status_update",
      complaint_id: complaintId,
      status: status,
      title: getNotificationTitle(status),
      message: getNotificationMessage(status, deputyName, comment),
      deputy_name: deputyName,
      comment: comment || null,
      timestamp: new Date().toISOString(),
    };

    // إدراج الإشعار في قاعدة البيانات
    const { error: notificationError } = await supabase
      .from("user_notifications")
      .insert({
        user_id: citizenId,
        payload: payload,
        is_read: false,
        is_seen: false,
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      return {
        success: false,
        error: "فشل إنشاء الإشعار",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendComplaintNotificationToCitizen:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء إرسال الإشعار",
    };
  }
}

/**
 * إرسال إشعار للمواطن مع جلب معلومات الشكوى تلقائياً
 */
export async function notifyCitizenAboutComplaintUpdate(
  complaintId: string,
  status: ComplaintStatus,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseUserServerComponentClient();

    // جلب معلومات الشكوى والنائب
    const { data: complaint, error: complaintError } = await supabase
      .from("complaints")
      .select(`
        id,
        citizen_id,
        assigned_deputy_id,
        deputy_profiles!complaints_assigned_deputy_id_fkey (
          full_name
        )
      `)
      .eq("id", complaintId)
      .single();

    if (complaintError || !complaint) {
      return {
        success: false,
        error: "فشل جلب معلومات الشكوى",
      };
    }

    // التأكد من وجود نائب مسند
    if (!complaint.assigned_deputy_id || !complaint.deputy_profiles) {
      return {
        success: false,
        error: "لا يوجد نائب مسند لهذه الشكوى",
      };
    }

    const deputyName = (complaint.deputy_profiles as any).full_name || "النائب";

    // إرسال الإشعار
    return await sendComplaintNotificationToCitizen(
      complaintId,
      complaint.citizen_id,
      status,
      deputyName,
      comment
    );
  } catch (error) {
    console.error("Error in notifyCitizenAboutComplaintUpdate:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء إرسال الإشعار",
    };
  }
}

