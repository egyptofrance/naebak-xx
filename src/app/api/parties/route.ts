import { getParties } from "@/data/lookups/lookups";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const parties = await getParties();
    return NextResponse.json(parties);
  } catch (error) {
    console.error("Error in parties API:", error);
    return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 });
  }
}

