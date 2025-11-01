"use server";

import { searchDeputies } from "./searchDeputies";
import { searchComplaints } from "./searchComplaints";

export async function globalSearch(query: string) {
  if (!query || query.trim().length < 2) {
    return {
      deputies: [],
      complaints: [],
      totalDeputies: 0,
      totalComplaints: 0,
    };
  }

  try {
    // Run both searches in parallel
    const [deputies, complaints] = await Promise.all([
      searchDeputies(query),
      searchComplaints(query),
    ]);

    return {
      deputies: deputies.slice(0, 5), // Show only first 5 in autocomplete
      complaints: complaints.slice(0, 5), // Show only first 5 in autocomplete
      totalDeputies: deputies.length,
      totalComplaints: complaints.length,
    };
  } catch (error) {
    console.error("[globalSearch] Exception:", error);
    return {
      deputies: [],
      complaints: [],
      totalDeputies: 0,
      totalComplaints: 0,
    };
  }
}
