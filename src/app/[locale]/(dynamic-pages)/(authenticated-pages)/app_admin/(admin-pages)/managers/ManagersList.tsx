"use server";

import { Link } from "@/components/intl-link";
import { T } from "@/components/ui/Typography";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Check, Mail, X } from "lucide-react";
import { AppAdminManagerFilters } from "./schema";

import { createClient } from "@supabase/supabase-js";

// Fetch managers data from database
async function getManagersData(filters: AppAdminManagerFilters) {
  // Use service role client to fetch managers
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

  // Get all users with manager role
  const { data: managerRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "manager");

  if (rolesError || !managerRoles || managerRoles.length === 0) {
    return [];
  }

  const managerIds = managerRoles.map(r => r.user_id);

  // Get user profiles for managers
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .in("id", managerIds)
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Error fetching manager profiles:", profilesError);
    return [];
  }

  // Apply search filter if provided
  let filteredProfiles = profiles || [];
  if (filters.query) {
    const queryLower = filters.query.toLowerCase();
    filteredProfiles = filteredProfiles.filter(profile => {
      const fullName = profile.full_name || "";
      const email = profile.email || "";
      return (
        fullName.toLowerCase().includes(queryLower) ||
        email.toLowerCase().includes(queryLower)
      );
    });
  }

  return filteredProfiles;
}

export async function ManagersList({
  filters,
}: {
  filters: AppAdminManagerFilters;
}) {
  const managers = await getManagersData(filters);
  
  if (managers.length === 0) {
    return (
      <div className="space-y-2 border p-8 text-center">
        <T.P className="text-muted-foreground">
          لا توجد بيانات للمديرين حالياً. سيتم عرض قائمة المديرين هنا عند إضافتهم.
        </T.P>
      </div>
    );
  }

  return (
    <div className="space-y-2 border overflow-x-auto">
      <ShadcnTable>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم الكامل</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>مدير</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead>التواصل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {managers.map((manager: any) => {
            const email = manager.email ?? "-";
            return (
              <TableRow key={manager.id}>
                <TableCell>{manager.full_name ?? "-"}</TableCell>
                <TableCell>
                  <Link href={`/app_admin/managers/${manager.id}`}>
                    {email}
                  </Link>
                </TableCell>
                <TableCell>
                  <Check className="text-green-500 dark:text-green-400" />
                </TableCell>
                <TableCell>
                  {format(new Date(manager.created_at), "PPpp")}
                </TableCell>
                <TableCell>
                  <span className="flex items-center space-x-4">
                    <a
                      title="التواصل عبر البريد الإلكتروني"
                      className="flex items-center"
                      href={`mailto:${email}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      <T.Small className="font-medium underline underline-offset-4">
                        إرسال بريد إلكتروني
                      </T.Small>
                    </a>
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}

