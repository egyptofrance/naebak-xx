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

// Temporary mock data - replace with actual data fetching
async function getManagersData(filters: AppAdminManagerFilters) {
  // This is a placeholder - you'll need to implement the actual data fetching
  return [];
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

