import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseUserServerComponentClient();
    
    const { data, error } = await supabase
      .from("governorates")
      .select("id, name_ar, name_en")
      .order("name_en", { ascending: true });

    if (error) {
      console.error("Error fetching governorates:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch governorates" },
      { status: 500 }
    );
  }
}

