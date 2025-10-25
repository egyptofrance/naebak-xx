'use server';

import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';

export interface ContactMessageData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  message_type?: 'general' | 'sponsorship' | 'support' | 'suggestion';
}

export async function submitContactMessage(data: ContactMessageData) {
  try {
    const supabase = await createSupabaseUserServerActionClient();

    const { error } = await (supabase as any)
      .from('contact_messages')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        message_type: data.message_type || 'general',
        status: 'new'
      });

    if (error) {
      console.error('Error submitting contact message:', error);
      return { success: false, error: 'فشل في إرسال الرسالة. حاول مرة أخرى.' };
    }

    return { success: true, message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'حدث خطأ غير متوقع. حاول مرة أخرى.' };
  }
}

