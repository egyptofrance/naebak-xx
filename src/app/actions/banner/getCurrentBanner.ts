"use server";

import { createClient } from "@supabase/supabase-js";

export async function getCurrentBanner() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { data, error } = await supabase
    .from("site_banner")
    .select("image_url")
    .single();

  if (error || !data) {
    // Return default banner if no record exists
    return "/images/sisi-banner.jpg";
  }

  return data.image_url;
}
