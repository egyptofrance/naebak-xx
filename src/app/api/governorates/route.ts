import { getGovernorates } from "@/data/lookups/lookups";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const governorates = await getGovernorates();
    return NextResponse.json(governorates);
  } catch (error) {
    console.error("Error in governorates API:", error);
    return NextResponse.json({ error: "Failed to fetch governorates" }, { status: 500 });
  }
}

