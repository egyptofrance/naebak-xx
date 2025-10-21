"use server";
import { adminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { sendEmail } from "@/utils/api-routes/utils";
import {
  serverGetLoggedInUserVerified
} from "@/utils/server/serverGetLoggedInUser";
import { renderAsync } from "@react-email/render";
import SignInEmail from "emails/SignInEmail";
import slugify from "slugify";
import urlJoin from "url-join";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { revalidatePath } from "next/cache";

const appAdminGetUserProfileSchema = z.object({
  userId: z.string(),
});

export const appAdminGetUserProfileAction = adminActionClient
  .schema(appAdminGetUserProfileSchema)
  .action(async ({ parsedInput: { userId } }) => {
    const { data, error } = await supabaseAdminClient
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  });

const uploadImageSchema = z.object({
  formData: zfd.formData({
    file: zfd.file(),
  }),
  fileName: z.string(),
  fileOptions: z.object({}).optional(),
});

export const uploadImageAction = adminActionClient
  .schema(uploadImageSchema)
  .action(async ({ parsedInput: { formData, fileName, fileOptions } }) => {
    const file = formData.file;
    if (!file) {
      return { status: "error", message: "File is empty" };
    }
    const slugifiedFilename = slugify(fileName, {
      lower: true,
      strict: true,
      replacement: "-",
    });

    const user = await serverGetLoggedInUserVerified();
    const userId = user.id;
    const userImagesPath = `${userId}/images/${slugifiedFilename}`;

    const { data, error } = await supabaseAdminClient.storage
      .from("changelog-assets")
      .upload(userImagesPath, file, fileOptions);

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    const { path } = data;

    const filePath = path.split(",")[0];
    const supabaseFileUrl = urlJoin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "/storage/v1/object/public/changelog-assets",
      filePath,
    );

    return {
      status: "success",
      data: supabaseFileUrl,
    };
  });

const appAdminGetUserImpersonationUrlSchema = z.object({
  userId: z.string(),
});

export const appAdminGetUserImpersonationUrlAction = adminActionClient
  .schema(appAdminGetUserImpersonationUrlSchema)
  .action(async ({ parsedInput: { userId } }) => {
    const response = await supabaseAdminClient.auth.admin.getUserById(userId);

    const { data: user, error: userError } = response;

    if (userError) {
      throw userError;
    }

    if (!user?.user) {
      throw new Error("User does not exist");
    }

    if (!user.user.email) {
      throw new Error("User does not have an email");
    }

    const generateLinkResponse =
      await supabaseAdminClient.auth.admin.generateLink({
        email: user.user.email,
        type: "magiclink",
      });

    const { data: generateLinkData, error: generateLinkError } =
      generateLinkResponse;

    if (generateLinkError) {
      throw generateLinkError;
    }

    if (process.env.NEXT_PUBLIC_SITE_URL !== undefined) {
      // change the origin of the link to the site url
      const {
        properties: { hashed_token },
      } = generateLinkData;

      const tokenHash = hashed_token;
      const searchParams = new URLSearchParams({
        token_hash: tokenHash,
        next: "/dashboard",
      });

      const checkAuthUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL);
      checkAuthUrl.pathname = `/auth/confirm`;
      checkAuthUrl.search = searchParams.toString();

      return checkAuthUrl.toString();
    }

    throw new Error("Failed to generate login link");
  });

const createUserSchema = z.object({
  email: z.string().email(),
});

export const createUserAction = adminActionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput: { email } }) => {
    const response = await supabaseAdminClient.auth.admin.createUser({
      email,
    });

    if (response.error) {
      return {
        status: "error",
        message: response.error.message,
      };
    }

    const { user } = response.data;

    if (user) {
      // revalidatePath('/app_admin');
      return {
        status: "success",
        data: user,
      };
    }

    throw new Error("User not created");
  });

const sendLoginLinkSchema = z.object({
  email: z.string().email(),
});

export const sendLoginLinkAction = adminActionClient
  .schema(sendLoginLinkSchema)
  .action(async ({ parsedInput: { email } }) => {
    const response = await supabaseAdminClient.auth.admin.generateLink({
      email,
      type: "magiclink",
    });

    if (response.error) {
      return {
        status: "error",
        message: response.error.message,
      };
    }

    const generateLinkData = response.data;

    if (generateLinkData) {
      const {
        properties: { hashed_token },
      } = generateLinkData;

      if (process.env.NEXT_PUBLIC_SITE_URL !== undefined) {
        // change the origin of the link to the site url

        const tokenHash = hashed_token;
        const searchParams = new URLSearchParams({
          token_hash: tokenHash,
          next: "/dashboard",
        });

        const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
        url.pathname = `/auth/confirm`;
        url.search = searchParams.toString();

        // Find user by email from user_application_settings
        const { data: userSettings, error: userSettingsError } =
          await supabaseAdminClient
            .from("user_application_settings")
            .select("id, email_readonly")
            .eq("email_readonly", email)
            .single();

        if (userSettingsError) {
          throw new Error("User not found with this email");
        }

        // Get user profile
        const { data: userProfile, error: userProfileError } =
          await supabaseAdminClient
            .from("user_profiles")
            .select("id, full_name")
            .eq("id", userSettings.id)
            .single();

        if (userProfileError) {
          throw userProfileError;
        }

        const userEmail = email;
        const userName = userProfile.full_name;

        // send email
        const signInEmailHTML = await renderAsync(
          <SignInEmail
            signInUrl={url.toString()}
            companyName="نائبك"
            userName={userName ?? "User"}
            logoUrl={urlJoin(
              process.env.NEXT_PUBLIC_SUPABASE_URL,
              "/storage/v1/object/public/marketing-assets",
              "nextbase-logo.png",
            )}
          />,
        );

        if (process.env.NODE_ENV === "development") {
          // In development, we log the email to the console instead of sending it.
          console.log({
            link: url.toString(),
          });
        } else {
          await sendEmail({
            to: email,
            subject: `Here is your login link `,
            html: signInEmailHTML,
            //TODO: Modify this to your app's admin email
            // Make sure you have verified this email in your Sendgrid (mail provider) account
            from: process.env.ADMIN_EMAIL,
          });
        }
      }
      return {
        status: "success",
      };
    }
    return {
      status: "success",
    };
  });

const getPaginatedUserListSchema = z.object({
  query: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  governorateId: z.string().uuid().optional(),
  partyId: z.string().uuid().optional(),
  role: z.string().optional(),
  gender: z.string().optional(),
});

export const getPaginatedUserListAction = adminActionClient
  .schema(getPaginatedUserListSchema)
  .action(async ({ parsedInput: { query = "", page = 1, limit = 10, governorateId, partyId, role, gender } }) => {
    console.log("query", query);
    
    // First, get ALL users with their roles (we'll filter and paginate in memory)
    let supabaseQuery = supabaseAdminClient
      .from("user_profiles")
      .select(`
        *, 
        user_application_settings(*), 
        user_roles(*),
        governorates (
          id,
          name_ar,
          name_en,
          code
        ),
        parties (
          id,
          name_ar,
          name_en,
          abbreviation
        )
      `);
    
    console.log(query);
    
    // Text search across multiple fields
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,city.ilike.%${query}%,district.ilike.%${query}%,electoral_district.ilike.%${query}%`
      );
    }
    
    // Filter by governorate
    if (governorateId) {
      supabaseQuery = supabaseQuery.eq("governorate_id", governorateId);
    }
    
    // Filter by party
    if (partyId) {
      supabaseQuery = supabaseQuery.eq("party_id", partyId);
    }
    
    // Filter by role
    if (role) {
      supabaseQuery = supabaseQuery.eq("role", role);
    }
    
    // Filter by gender
    if (gender) {
      supabaseQuery = supabaseQuery.eq("gender", gender);
    }
    
    // Fetch all matching users
    const { data, error } = await supabaseQuery;

    if (error) {
      throw error;
    }
    
    // Filter out users who have the "deputy" or "manager" role
    const filteredData = data?.filter(user => {
      const hasDeputyRole = user.user_roles?.some((role: any) => role.role === "deputy");
      const hasManagerRole = user.user_roles?.some((role: any) => role.role === "manager");
      return !hasDeputyRole && !hasManagerRole;
    }) || [];
    
    // Now apply pagination on the filtered citizens only
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    console.log("Total citizens:", filteredData.length, "Page:", page, "Showing:", paginatedData.length);
    return paginatedData;
  });

const getUsersTotalPagesSchema = z.object({
  query: z.string().optional(),
  limit: z.number().optional(),
  governorateId: z.string().uuid().optional(),
  partyId: z.string().uuid().optional(),
  role: z.string().optional(),
  gender: z.string().optional(),
});

export const getUsersTotalPagesAction = adminActionClient
  .schema(getUsersTotalPagesSchema)
  .action(async ({ parsedInput: { query = "", limit = 10, governorateId, partyId, role, gender } }) => {
    console.log("query", query);
    
    // Get all users with their roles to filter out deputies
    let supabaseQuery = supabaseAdminClient
      .from("user_profiles")
      .select("*, user_application_settings(*), user_roles(*)");
    
    // Text search across multiple fields
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,city.ilike.%${query}%,district.ilike.%${query}%,electoral_district.ilike.%${query}%`
      );
    }
    
    // Filter by governorate
    if (governorateId) {
      supabaseQuery = supabaseQuery.eq("governorate_id", governorateId);
    }
    
    // Filter by party
    if (partyId) {
      supabaseQuery = supabaseQuery.eq("party_id", partyId);
    }
    
    // Filter by role
    if (role) {
      supabaseQuery = supabaseQuery.eq("role", role);
    }
    
    // Filter by gender
    if (gender) {
      supabaseQuery = supabaseQuery.eq("gender", gender);
    }
    
    const { data, error } = await supabaseQuery;

    if (error) {
      console.log("supabase***************");
      console.error(error);
      throw error;
    }
    
    // Filter out users who have the "deputy" or "manager" role
    const filteredData = data?.filter(user => {
      const hasDeputyRole = user.user_roles?.some((role: any) => role.role === "deputy");
      const hasManagerRole = user.user_roles?.some((role: any) => role.role === "manager");
      return !hasDeputyRole && !hasManagerRole;
    }) || [];
    
    const count = filteredData.length;
    console.log("Total users (excluding deputies and managers):", count);
    
    return Math.ceil(count / limit);
  });

const uploadBlogImageSchema = z.object({
  formData: zfd.formData({
    file: zfd.file(),
  }),
  fileName: z.string(),
  fileOptions: z.object({}).optional(),
});

export const uploadBlogImageAction = adminActionClient
  .schema(uploadBlogImageSchema)
  .action(async ({ parsedInput: { formData, fileName, fileOptions } }) => {
    const file = formData.file;
    if (!file) {
      return { status: "error", message: "File is empty" };
    }
    const slugifiedFilename = slugify(fileName, {
      lower: true,
      strict: true,
      replacement: "-",
    });

    const userImagesPath = `blog/images/${slugifiedFilename}`;

    const { data, error } = await supabaseAdminClient.storage
      .from("marketing-assets")
      .upload(userImagesPath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return { status: "error", message: error.message };
    }

    const { path } = data;

    const filePath = path.split(",")[0];
    const supabaseFileUrl = urlJoin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "/storage/v1/object/public/marketing-assets",
      filePath,
    );

    return { status: "success", data: supabaseFileUrl };
  });

/**
 * Get all governorates for filter dropdown
 */
export const getGovernoratesAction = adminActionClient.action(async () => {
  const { data: governorates, error } = await supabaseAdminClient
    .from("governorates")
    .select("id, name_ar, name_en, code")
    .order("name_ar", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch governorates: ${error.message}`);
  }

  return { governorates: governorates || [] };
});

/**
 * Get all parties for filter dropdown
 */
export const getPartiesAction = adminActionClient.action(async () => {
  const { data: parties, error } = await supabaseAdminClient
    .from("parties")
    .select("id, name_ar, name_en, abbreviation")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch parties: ${error.message}`);
  }

  return { parties: parties || [] };
});


/**
 * Delete a single user
 */
const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

export const deleteUserAction = adminActionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput: { userId } }) => {
    // Delete user from auth.users (cascade will delete related records)
    const { error } = await supabaseAdminClient.auth.admin.deleteUser(userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    // Revalidate the users page to refresh the UI
    revalidatePath('/app_admin/users');

    return { status: "success", message: "User deleted successfully" };
  });

/**
 * Delete multiple users
 */
const deleteMultipleUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, "At least one user must be selected"),
});

export const deleteMultipleUsersAction = adminActionClient
  .schema(deleteMultipleUsersSchema)
  .action(async ({ parsedInput: { userIds } }) => {
    const errors: string[] = [];
    let successCount = 0;

    // Delete users one by one
    for (const userId of userIds) {
      const { error } = await supabaseAdminClient.auth.admin.deleteUser(userId);
      
      if (error) {
        errors.push(`Failed to delete user ${userId}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    if (errors.length > 0) {
      // Revalidate even on partial success
      revalidatePath('/app_admin/users');
      return {
        status: "partial",
        message: `Deleted ${successCount} users, ${errors.length} failed`,
        errors,
      };
    }

    // Revalidate the users page to refresh the UI
    revalidatePath('/app_admin/users');

    return {
      status: "success",
      message: `Successfully deleted ${successCount} users`,
    };
  });


/**
 * Update user profile data
 */
const updateUserProfileSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  fullName: z.string().nullable(),
  phone: z.string().nullable(),
});

export const updateUserProfileAction = adminActionClient
  .schema(updateUserProfileSchema)
  .action(async ({ parsedInput: { userId, fullName, phone } }) => {
    const { error } = await supabaseAdminClient
      .from("user_profiles")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return { message: "تم تحديث بيانات المستخدم بنجاح" };
  });

