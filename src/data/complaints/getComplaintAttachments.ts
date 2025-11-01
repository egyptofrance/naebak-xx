"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

/**
 * Get all attachments for a complaint
 */
export async function getComplaintAttachments(complaintId: string) {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data, error } = await supabase
    .from("complaint_attachments")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching complaint attachments:", error);
    return { data: [], error: error.message };
  }

  // Generate public URLs for each attachment
  const attachmentsWithUrls = (data || []).map((attachment) => {
    const { data: { publicUrl } } = supabase.storage
      .from('complaint_attachments')
      .getPublicUrl(attachment.file_path);

    return {
      ...attachment,
      publicUrl,
    };
  });

  return { data: attachmentsWithUrls, error: null };
}
