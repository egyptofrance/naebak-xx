"use server";

import { adminActionClient } from "@/lib/safe-action";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Get all breaking news (admin)
export const getBreakingNewsAdminAction = adminActionClient
  .schema(z.object({}))
  .action(async () => {
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
      .from("breaking_news")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });

// Create breaking news
export const createBreakingNewsAction = adminActionClient
  .schema(
    z.object({
      content: z.string().min(1, "المحتوى مطلوب"),
      displayOrder: z.number().int().min(0),
      isActive: z.boolean().default(true),
    })
  )
  .action(async ({ parsedInput: input, ctx }) => {
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

    const { error } = await supabase.from("breaking_news").insert({
      content: input.content,
      display_order: input.displayOrder,
      is_active: input.isActive,
      created_by: ctx.userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/app_admin/breaking-news");

    return { message: "تم إضافة الخبر بنجاح" };
  });

// Update breaking news
export const updateBreakingNewsAction = adminActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
      content: z.string().min(1, "المحتوى مطلوب").optional(),
      displayOrder: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    })
  )
  .action(async ({ parsedInput: input }) => {
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

    const updateData: any = {};
    if (input.content !== undefined) updateData.content = input.content;
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("breaking_news")
      .update(updateData)
      .eq("id", input.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/app_admin/breaking-news");

    return { message: "تم تحديث الخبر بنجاح" };
  });

// Delete breaking news
export const deleteBreakingNewsAction = adminActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    })
  )
  .action(async ({ parsedInput: input }) => {
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

    const { error } = await supabase
      .from("breaking_news")
      .delete()
      .eq("id", input.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/app_admin/breaking-news");

    return { message: "تم حذف الخبر بنجاح" };
  });
