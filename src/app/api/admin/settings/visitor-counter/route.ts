import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { min, max } = body;

    // Validation
    if (typeof min !== "number" || typeof max !== "number") {
      return NextResponse.json(
        { error: "Min and max must be numbers" },
        { status: 400 }
      );
    }

    if (min >= max) {
      return NextResponse.json(
        { error: "Min must be less than max" },
        { status: 400 }
      );
    }

    if (min < 0 || max < 0) {
      return NextResponse.json(
        { error: "Min and max must be positive numbers" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdminClient;

    // Update settings
    const { data, error } = await supabase
      .from("site_settings")
      .update({ value: { min, max }, updated_at: new Date().toISOString() })
      .eq("key", "visitor_counter")
      .select()
      .single();

    if (error) {
      console.error("Error updating visitor counter settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in visitor counter update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

