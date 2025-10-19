"use client";

import { Link } from "@/components/intl-link";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createDeputyAction, searchUsersForDeputyAction } from "@/data/admin/deputies";
import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddDeputyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();

  const { execute: executeSearch, isExecuting: isSearching } = useAction(
    searchUsersForDeputyAction,
    {
      onSuccess: ({ data }) => {
        setSearchResults(data?.users || []);
        if (data?.users?.length === 0) {
          toast.info("لم يتم العثور على نتائج");
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "حدث خطأ أثناء البحث");
      },
    }
  );

  const { execute: executeCreate, isExecuting: isCreating } = useAction(
    createDeputyAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || "تم إنشاء ملف النائب بنجاح");
        router.push("/app_admin/deputies");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "حدث خطأ أثناء إنشاء ملف النائب");
      },
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeSearch({ query: searchQuery });
    }
  };

  const handleCreateDeputy = (userId: string) => {
    executeCreate({ userId, deputyStatus: "active" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app_admin/deputies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-2">
          <Typography.H1 className="text-3xl font-bold tracking-tight">
            إضافة نائب جديد
          </Typography.H1>
          <Typography.P className="text-muted-foreground">
            ابحث عن مستخدم لتحويله إلى نائب
          </Typography.P>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البحث عن مستخدم</CardTitle>
          <CardDescription>
            ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  البحث
                </Label>
                <Input
                  id="search"
                  placeholder="اكتب الاسم أو البريد الإلكتروني أو رقم الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
              </div>
              <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                <Search className="h-4 w-4 mr-2" />
                بحث
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج البحث</CardTitle>
            <CardDescription>
              تم العثور على {searchResults.length} مستخدم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>المحافظة</TableHead>
                  <TableHead>الحزب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "غير محدد"}
                    </TableCell>
                    <TableCell>{user.email || "غير محدد"}</TableCell>
                    <TableCell>{user.phone || "غير محدد"}</TableCell>
                    <TableCell>
                      {user.governorates?.name_ar || "غير محدد"}
                    </TableCell>
                    <TableCell>{user.parties?.name_ar || "غير محدد"}</TableCell>
                    <TableCell>
                      {user.isDeputy ? (
                        <Badge variant="secondary">نائب بالفعل</Badge>
                      ) : (
                        <Badge variant="outline">مستخدم عادي</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!user.isDeputy ? (
                        <Button
                          size="sm"
                          onClick={() => handleCreateDeputy(user.id)}
                          disabled={isCreating}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          تحويل إلى نائب
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          نائب بالفعل
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

