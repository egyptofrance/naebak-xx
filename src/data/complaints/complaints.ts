"use server";

import { authActionClient } from "@/lib/safe-action";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { createComplaintSchema } from "@/utils/zod-schemas/complaints";
import { revalidatePath } from "next/cache";

/**
 * Server action to create a new complaint
 * Only authenticated users can create complaints
 */
export const createComplaintAction = authActionClient
  .schema(createComplaintSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const supabase = await createSupabaseUserServerActionClient();

    // Insert the complaint into the database
    const { data, error } = await supabase
      .from("complaints")
      .insert({
        citizen_id: userId,
        title: parsedInput.title,
        description: parsedInput.description,
        category: parsedInput.category,
        governorate: parsedInput.governorate || null,
        district: parsedInput.district || null,
        address: parsedInput.address || null,
        location_lat: parsedInput.location_lat || null,
        location_lng: parsedInput.location_lng || null,
        citizen_phone: parsedInput.citizen_phone || null,
        citizen_email: parsedInput.citizen_email || null,
        status: "new", // Default status for new complaints
        priority: "medium", // Default priority
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating complaint:", error);
      throw new Error(`Failed to create complaint: ${error.message}`);
    }

    // Revalidate relevant paths
    revalidatePath("/[locale]/(dynamic-pages)/(authenticated-pages)/(application-pages)", "layout");

    return {
      success: true,
      complaint: data,
      message: "Complaint submitted successfully",
    };
  });

