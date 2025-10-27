import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = supabaseAdminClient;
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "visitor_counter")
      .single();

    if (error) {
      console.error("Error fetching visitor counter settings:", error);
      // Return default values if not found
      return NextResponse.json({ min: 150, max: 450 });
    }

    return NextResponse.json(data.value);
  } catch (error) {
    console.error("Error in visitor counter API:", error);
    // Return default values on error
    return NextResponse.json({ min: 150, max: 450 });
  }
}

