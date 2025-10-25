'use server';

import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';

export async function getContactMessages(filters?: {
  status?: string;
  message_type?: string;
}) {
  try {
    const supabase = await createSupabaseUserServerActionClient();

    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.message_type) {
      query = query.eq('message_type', filters.message_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contact messages:', error);
      return { success: false, error: 'فشل في جلب الرسائل' };
    }

    return { success: true, data: data as any };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

export async function updateContactMessageStatus(
  messageId: string,
  status: string,
  adminNotes?: string
) {
  try {
    const supabase = await createSupabaseUserServerActionClient();

    const updateData: any = { status };
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('contact_messages')
      .update(updateData)
      .eq('id', messageId);

    if (error) {
      console.error('Error updating message status:', error);
      return { success: false, error: 'فشل في تحديث حالة الرسالة' };
    }

    return { success: true, message: 'تم تحديث حالة الرسالة بنجاح' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

export async function deleteContactMessage(messageId: string) {
  try {
    const supabase = await createSupabaseUserServerActionClient();

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: 'فشل في حذف الرسالة' };
    }

    return { success: true, message: 'تم حذف الرسالة بنجاح' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

