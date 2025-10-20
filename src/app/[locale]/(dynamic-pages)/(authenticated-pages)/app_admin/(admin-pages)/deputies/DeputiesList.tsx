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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  searchDeputiesAction,
  getCouncilsAction,
} from "@/data/admin/deputies";
import {
  getGovernoratesAction,
  getPartiesAction,
} from "@/data/admin/user";
import { Edit, Search, X, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface Deputy {
  id: string;
  user_id: string;
  deputy_status: "current" | "candidate";
  electoral_symbol: string | null;
  electoral_number: string | null;
  created_at: string;
  council_id: string | null;
  user_profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    governorate_id: string | null;
    party_id: string | null;
    governorates: {
      id: string;
      name_ar: string;
      name_en: string;
    } | null;
    parties: {
      id: string;
      name_ar: string;
      name_en: string;
    } | null;
  };
  councils: {
    id: string;
    name_ar: string;
    name_en: string;
    code: string;
  } | null;
}

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string | null;
  code: string | null;
}

interface Party {
  id: string;
  name_ar: string;
  name_en: string | null;
  abbreviation: string | null;
}

interface Council {
  id: string;
  name_ar: string;
  name_en: string | null;
  code: string | null;
}

export default function DeputiesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [selectedCouncil, setSelectedCouncil] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deputies, setDeputies] = useState<Deputy[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [councils, setCouncils] = useState<Council[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [govResult, partiesResult, councilsResult] = await Promise.all([
          getGovernoratesAction(),
          getPartiesAction(),
          getCouncilsAction(),
        ]);

        if (govResult?.data?.governorates) {
          setGovernorates(govResult.data.governorates);
        }
        if (partiesResult?.data?.parties) {
          setParties(partiesResult.data.parties);
        }
        if (councilsResult?.data?.councils) {
          setCouncils(councilsResult.data.councils);
        }
      } catch (error) {
        console.error("Failed to load filter options:", error);
      }
    };

    loadFilterOptions();
  }, []);

  const { execute: executeSearch, isExecuting: isSearching } = useAction(
    searchDeputiesAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setDeputies(data.deputies as Deputy[]);
          setTotalPages(data.totalPages || 0);
          setTotal(data.total || 0);
          setCurrentPage(data.currentPage || 1);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "حدث خطأ أثناء البحث");
      },
    }
  );

  // Initial load and search
  useEffect(() => {
    handleSearch();
  }, [currentPage]);

  const handleSearch = () => {
    executeSearch({
      query: searchQuery || undefined,
      governorateId: selectedGovernorate || undefined,
      partyId: selectedParty || undefined,
      councilId: selectedCouncil || undefined,
      deputyStatus: selectedStatus
        ? (selectedStatus as "current" | "candidate")
        : undefined,
      page: currentPage,
      limit: 20,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedGovernorate("");
    setSelectedParty("");
    setSelectedCouncil("");
    setSelectedStatus("");
    setCurrentPage(1);
    setTimeout(() => {
      executeSearch({
        page: 1,
        limit: 20,
      });
    }, 100);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedGovernorate ||
    selectedParty ||
    selectedCouncil ||
    selectedStatus;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Typography.H1 className="text-3xl font-bold tracking-tight">
          قائمة النواب
        </Typography.H1>
        <Typography.P className="text-muted-foreground">
          استعراض وتعديل ملفات النواب والمعلومات الانتخابية. لإضافة نائب جديد، قم بترقية مستخدم من صفحة Users.
        </Typography.P>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>البحث والفلترة</CardTitle>
              <CardDescription>
                ابحث عن النواب وقم بتصفيتهم حسب المحافظة والحزب والمجلس
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="ابحث بالاسم، البريد الإلكتروني، الهاتف، أو الرقم الانتخابي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={() => { setCurrentPage(1); handleSearch(); }} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              بحث
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={isSearching}
              >
                <X className="h-4 w-4 mr-2" />
                مسح الفلاتر
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Governorate Filter */}
              <div className="space-y-2">
                <Label>المحافظة</Label>
                <Select
                  value={selectedGovernorate}
                  onValueChange={setSelectedGovernorate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المحافظات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المحافظات</SelectItem>
                    {governorates.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id}>
                        {gov.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Party Filter */}
              <div className="space-y-2">
                <Label>الحزب</Label>
                <Select value={selectedParty} onValueChange={setSelectedParty}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأحزاب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأحزاب</SelectItem>
                    {parties.map((party) => (
                      <SelectItem key={party.id} value={party.id}>
                        {party.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Council Filter */}
              <div className="space-y-2">
                <Label>المجلس</Label>
                <Select
                  value={selectedCouncil}
                  onValueChange={setSelectedCouncil}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المجالس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المجالس</SelectItem>
                    {councils.map((council) => (
                      <SelectItem key={council.id} value={council.id}>
                        {council.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة النواب</CardTitle>
          <CardDescription>
            {total > 0
              ? `إجمالي ${total} نائب مسجل${hasActiveFilters ? " (مفلتر)" : ""}`
              : "لا يوجد نواب مسجلين حالياً"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>جاري التحميل...</p>
            </div>
          ) : deputies && deputies.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>المحافظة</TableHead>
                    <TableHead>الحزب</TableHead>
                    <TableHead>المجلس</TableHead>
                    <TableHead>الرقم الانتخابي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deputies.map((deputy) => {
                    const userProfile = deputy.user_profiles;

                    return (
                      <TableRow key={deputy.id}>
                        <TableCell className="font-medium">
                          {userProfile?.full_name || "غير محدد"}
                        </TableCell>
                        <TableCell>{userProfile?.email || "غير محدد"}</TableCell>
                        <TableCell>{userProfile?.phone || "غير محدد"}</TableCell>
                        <TableCell>
                          {userProfile?.governorates?.name_ar || "غير محدد"}
                        </TableCell>
                        <TableCell>
                          {userProfile?.parties?.name_ar || "غير محدد"}
                        </TableCell>
                        <TableCell>
                          {deputy.councils?.name_ar || "غير محدد"}
                        </TableCell>
                        <TableCell>
                          {deputy.electoral_number || "غير محدد"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              deputy.deputy_status === "current"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {deputy.deputy_status === "current"
                              ? "نائب حالي"
                              : "مرشح"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/app_admin/deputies/${deputy.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              تعديل
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    صفحة {currentPage} من {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isSearching}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages || isSearching}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">
                {hasActiveFilters
                  ? "لا توجد نتائج تطابق معايير البحث"
                  : "لا يوجد نواب مسجلين حالياً"}
              </p>
              {!hasActiveFilters && (
                <p className="text-sm">
                  لإضافة نائب جديد، اذهب إلى صفحة <Link href="/app_admin/users" className="text-primary hover:underline">Users</Link> وقم بترقية مستخدم إلى نائب.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

