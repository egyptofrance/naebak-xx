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
import { Checkbox } from "@/components/ui/checkbox";
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
  deleteDeputyAction,
  bulkDeleteDeputiesAction,
} from "@/data/admin/deputies";
import {
  getGovernoratesAction,
  getPartiesAction,
} from "@/data/admin/user";
import { Edit, Search, X, Filter, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { EditDeputyDialog } from "./EditDeputyDialog";
import { GetLoginLinkDialog } from "../users/GetLoginLinkDialog";
import { SetInitialRatingDialog } from "./SetInitialRatingDialog";

interface Deputy {
  id: string;
  user_id: string;
  deputy_status: "current" | "candidate" | "former";
  electoral_symbol: string | null;
  electoral_number: string | null;
  electoral_program: string | null;
  achievements: string | null;
  events: string | null;
  created_at: string;
  council_id: string | null;
  slug: string | null;
  initial_rating_average: number | null;
  initial_rating_count: number | null;
  user_profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    electoral_district: string | null;
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
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deputies, setDeputies] = useState<Deputy[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [councils, setCouncils] = useState<Council[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeputies, setSelectedDeputies] = useState<Set<string>>(new Set());

  // Delete actions
  const { execute: executeDeleteDeputy, isExecuting: isDeletingDeputy } = useAction(deleteDeputyAction);
  const { execute: executeBulkDelete, isExecuting: isBulkDeleting } = useAction(bulkDeleteDeputiesAction);

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
        ? (selectedStatus as "current" | "candidate" | "former")
        : undefined,
      gender: selectedGender ? (selectedGender as "male" | "female") : undefined,
      electoralDistrict: selectedDistrict || undefined,
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
    setSelectedGender("");
    setSelectedDistrict("");
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
    selectedStatus ||
    selectedGender ||
    selectedDistrict;

  // Selection handlers
  const toggleDeputy = (deputyId: string) => {
    const newSelected = new Set(selectedDeputies);
    if (newSelected.has(deputyId)) {
      newSelected.delete(deputyId);
    } else {
      newSelected.add(deputyId);
    }
    setSelectedDeputies(newSelected);
  };

  const toggleAll = () => {
    if (selectedDeputies.size === deputies.length) {
      setSelectedDeputies(new Set());
    } else {
      setSelectedDeputies(new Set(deputies.map((d) => d.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedDeputies.size === 0) return;
    
    if (!confirm(`هل أنت متأكد من حذف ${selectedDeputies.size} نائب؟`)) {
      return;
    }

    executeBulkDelete({ deputyIds: Array.from(selectedDeputies) });
  };

  const handleDeleteDeputy = (deputyId: string, deputyName: string) => {
    if (!confirm(`هل أنت متأكد من حذف النائب "${deputyName}"؟`)) {
      return;
    }

    executeDeleteDeputy({ deputyId });
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
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
                <Label>حالة العضوية</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="current">نائب حالي</SelectItem>
                    <SelectItem value="candidate">مرشح للعضوية</SelectItem>
                    <SelectItem value="former">نائب سابق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <Label>الجنس</Label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Electoral District Filter */}
              <div className="space-y-2">
                <Label>الدائرة الانتخابية</Label>
                <Input
                  placeholder="ابحث باسم الدائرة..."
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                />
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
          {selectedDeputies.size > 0 && (
            <div className="mb-4 flex items-center justify-between bg-muted p-4 rounded-lg">
              <span className="text-sm font-medium">
                تم تحديد {selectedDeputies.size} نائب
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                حذف المحدد
              </Button>
            </div>
          )}
          {isSearching ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>جاري التحميل...</p>
            </div>
          ) : deputies && deputies.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          deputies.length > 0 && selectedDeputies.size === deputies.length
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>المحافظة</TableHead>
                    <TableHead>الحزب</TableHead>
                    <TableHead>المجلس</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الملف العام</TableHead>
                    <TableHead>Get Link</TableHead>
                    <TableHead>تقييم مبدئي</TableHead>
                    <TableHead>تعديل</TableHead>
                    <TableHead>حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deputies.map((deputy) => {
                    const userProfile = deputy.user_profiles;

                    return (
                      <TableRow key={deputy.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDeputies.has(deputy.id)}
                            onCheckedChange={() => toggleDeputy(deputy.id)}
                          />
                        </TableCell>
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
                          <Badge
                            variant={
                              deputy.deputy_status === "current"
                                ? "default"
                                : deputy.deputy_status === "candidate"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {deputy.deputy_status === "current"
                              ? "نائب حالي"
                              : deputy.deputy_status === "candidate"
                              ? "مرشح"
                              : "نائب سابق"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {deputy.slug ? (
                            <Link href={`/deputy/${deputy.slug}`} target="_blank">
                              <Button variant="outline" size="sm">
                                عرض
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">لا يوجد</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <GetLoginLinkDialog userId={deputy.user_id} />
                        </TableCell>
                        <TableCell>
                          <SetInitialRatingDialog
                            deputyId={deputy.id}
                            deputyName={userProfile?.full_name || "غير محدد"}
                            currentRating={deputy.initial_rating_average || 0}
                            currentCount={deputy.initial_rating_count || 0}
                          />
                        </TableCell>
                        <TableCell>
                          <EditDeputyDialog
                            deputyId={deputy.id}
                            currentData={{
                              deputyStatus: deputy.deputy_status,
                              electoralProgram: deputy.electoral_program,
                              achievements: deputy.achievements,
                              events: deputy.events,
                              councilId: deputy.council_id,
                              electoralSymbol: deputy.electoral_symbol,
                              electoralNumber: deputy.electoral_number,
                              partyId: userProfile?.party_id,
                              userId: deputy.user_id,
                              slug: deputy.slug,
                            }}
                            councils={councils}
                            parties={parties}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteDeputy(
                                deputy.id,
                                userProfile?.full_name || "غير محدد"
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    عرض {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, total)} من {total} نائب
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1 || isSearching}
                    >
                      الأولى
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isSearching}
                    >
                      السابق
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-10"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isSearching}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || isSearching}
                    >
                      الأخيرة
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

