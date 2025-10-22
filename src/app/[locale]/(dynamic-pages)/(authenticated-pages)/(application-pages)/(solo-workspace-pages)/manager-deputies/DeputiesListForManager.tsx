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
import { EditDeputyDialog } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/deputies/EditDeputyDialog";
import { GetLoginLinkDialog } from "@/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/GetLoginLinkDialog";

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

export default function DeputiesListForManager() {
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Typography.H1 className="text-3xl font-bold tracking-tight">
          قائمة النواب
        </Typography.H1>
        <Typography.P className="text-muted-foreground">
          استعراض وتعديل ملفات النواب والمعلومات الانتخابية.
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
                <Select
                  value={selectedParty}
                  onValueChange={setSelectedParty}
                >
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
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="current">نائب حالي</SelectItem>
                    <SelectItem value="candidate">مرشح</SelectItem>
                    <SelectItem value="former">نائب سابق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select
                  value={selectedGender}
                  onValueChange={setSelectedGender}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الجميع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Electoral District Filter */}
              <div className="space-y-2">
                <Label>الدائرة الانتخابية</Label>
                <Input
                  placeholder="أدخل اسم الدائرة..."
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            النتائج ({total} نائب)
          </CardTitle>
          <CardDescription>
            الصفحة {currentPage} من {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المحافظة</TableHead>
                  <TableHead>الحزب</TableHead>
                  <TableHead>المجلس</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الرمز الانتخابي</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deputies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isSearching ? "جاري البحث..." : "لا توجد نتائج"}
                    </TableCell>
                  </TableRow>
                ) : (
                  deputies.map((deputy) => (
                    <TableRow key={deputy.id}>
                      <TableCell className="font-medium">
                        {deputy.user_profiles.full_name || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        {deputy.user_profiles.governorates?.name_ar || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        {deputy.user_profiles.parties?.name_ar || "غير محدد"}
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
                        {deputy.electoral_symbol || "غير محدد"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <GetLoginLinkDialog userId={deputy.user_id} />
                          <EditDeputyDialog deputy={deputy} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || isSearching}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                السابق
              </Button>
              <span className="flex items-center px-4">
                الصفحة {currentPage} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || isSearching}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

