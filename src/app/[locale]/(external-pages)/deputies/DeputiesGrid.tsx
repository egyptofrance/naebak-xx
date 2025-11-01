"use client";

import { useState, useMemo, useEffect } from "react";
import { Link } from "@/components/intl-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DeputyCardRating } from "./DeputyCardRating";
import { Search, Users, MapPin, Building2, Landmark } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Use Awaited and ReturnType to infer types from getAllDeputies
import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";
import { getAllGovernorates } from "@/app/actions/governorate/getAllGovernorates";
import { getAllParties } from "@/app/actions/party/getAllParties";
import { getAllElectoralDistricts } from "@/app/actions/electoral-district/getAllElectoralDistricts";
import { getAllCouncils } from "@/app/actions/council/getAllCouncils";
import { formatDeputyName } from "@/utils/formatDeputyName";

type DeputiesData = Awaited<ReturnType<typeof getAllDeputies>>;
type DeputyData = DeputiesData[number];
type GovernoratesData = Awaited<ReturnType<typeof getAllGovernorates>>;
type PartiesData = Awaited<ReturnType<typeof getAllParties>>;
type ElectoralDistrictsData = Awaited<ReturnType<typeof getAllElectoralDistricts>>;
type CouncilsData = Awaited<ReturnType<typeof getAllCouncils>>;

const ITEMS_PER_PAGE = 20;

export default function DeputiesGrid({ 
  deputies,
  governorates,
  parties,
  electoralDistricts,
  councils,
  isAuthenticated = false,
  userGovernorateId = null,
  hideFilters = false
}: { 
  deputies: DeputiesData;
  governorates: GovernoratesData;
  parties: PartiesData;
  electoralDistricts: ElectoralDistrictsData;
  councils: CouncilsData;
  isAuthenticated?: boolean;
  userGovernorateId?: string | null;
  hideFilters?: boolean;
}) {
  // Default governorate: always show all deputies by default
  const defaultGovernorateId = "all";

  const [searchName, setSearchName] = useState<string>("");
  const [governorateFilter, setGovernorateFilter] = useState<string>(defaultGovernorateId);
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [electoralDistrictFilter, setElectoralDistrictFilter] = useState<string>("all");
  const [councilFilter, setCouncilFilter] = useState<string>("all");
  const [statusFilters, setStatusFilters] = useState<string[]>(["current", "former", "candidate"]);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Update governorate filter when userGovernorateId changes
  useEffect(() => {
    setGovernorateFilter(defaultGovernorateId);
  }, [defaultGovernorateId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, governorateFilter, partyFilter, electoralDistrictFilter, councilFilter, statusFilters, genderFilter]);

  // Filter electoral districts by selected governorate
  const filteredElectoralDistricts = useMemo(() => {
    if (governorateFilter === "all") {
      return electoralDistricts;
    }
    return electoralDistricts.filter(
      (district: any) => district.governorate?.id === governorateFilter
    );
  }, [electoralDistricts, governorateFilter]);

  // Handle status checkbox change
  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilters([...statusFilters, status]);
    } else {
      setStatusFilters(statusFilters.filter(s => s !== status));
    }
  };

  // Filter deputies
  const filteredDeputies = useMemo(() => {
    return deputies.filter((deputyData: DeputyData) => {
      // Name search filter
      if (searchName.trim() !== "") {
        const fullName = deputyData.user?.full_name?.toLowerCase() || "";
        const searchTerm = searchName.toLowerCase().trim();
        if (!fullName.includes(searchTerm)) {
          return false;
        }
      }
      
      // Governorate filter
      if (
        governorateFilter !== "all" &&
        deputyData.user?.governorate_id !== governorateFilter
      ) {
        return false;
      }
      
      // Party filter
      if (partyFilter !== "all" && deputyData.party?.id !== partyFilter) {
        return false;
      }
      
      // Electoral district filter
      if (
        electoralDistrictFilter !== "all" &&
        deputyData.electoral_district?.id !== electoralDistrictFilter
      ) {
        return false;
      }
      
      // Council filter
      if (
        councilFilter !== "all" &&
        deputyData.council?.id !== councilFilter
      ) {
        return false;
      }
      
      // Status filter (checkboxes)
      if (
        statusFilters.length > 0 &&
        !statusFilters.includes(deputyData.deputy.deputy_status)
      ) {
        return false;
      }
      
      // Gender filter (radio buttons)
      if (genderFilter !== "all" && deputyData.deputy.gender !== genderFilter) {
        return false;
      }
      
      return true;
    });
  }, [deputies, searchName, governorateFilter, partyFilter, electoralDistrictFilter, councilFilter, statusFilters, genderFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDeputies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDeputies = filteredDeputies.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "current":
        return "نائب حالي";
      case "former":
        return "نائب سابق";
      case "candidate":
        return "مرشح";
      default:
        return status;
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "outline" => {
    switch (status) {
      case "current":
        return "default";
      case "former":
        return "secondary";
      case "candidate":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      {!hideFilters && (
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="space-y-6">
          {/* Header with Title and Sorting Info */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">تصفية النتائج</h2>
            
            {/* Sorting Information */}
            <div className="bg-muted/50 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">ℹ️</span>
                <div className="flex-1 space-y-2 text-sm min-w-0">
                  <p className="font-semibold text-foreground">
                    معلومات الترتيب:
                  </p>
                  <ul className="space-y-1 text-muted-foreground break-words">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 flex-shrink-0">🏆</span>
                      <span className="break-words min-w-0"><strong className="text-foreground">أولاً:</strong> يتم الترتيب حسب النقاط المكتسبة من حل شكاوى المواطنين والاستجابة لها</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0">⭐</span>
                      <span className="break-words min-w-0"><strong className="text-foreground">ثانياً:</strong> في حالة تساوي النقاط، يتم الترتيب حسب التقييم بالنجوم من المواطنين</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-500 flex-shrink-0">✅</span>
                      <span className="break-words min-w-0"><strong className="text-foreground">كل شكوى محلولة = +10 نقاط</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 1: Search, Status, Gender - Desktop: Same Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search by Name */}
            <div className="lg:col-span-5">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                البحث بالاسم
              </label>
              <Input
                type="text"
                placeholder="ابحث عن نائب بالاسم..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full"
              />
              {searchName && (
                <p className="text-xs text-muted-foreground mt-1">
                  البحث عن: <span className="font-semibold">{searchName}</span>
                </p>
              )}
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-4">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                حالة العضوية
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="status-current"
                    checked={statusFilters.includes("current")}
                    onCheckedChange={(checked) => handleStatusChange("current", checked as boolean)}
                  />
                  <Label htmlFor="status-current" className="cursor-pointer font-normal text-sm">
                    نائب حالي
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="status-former"
                    checked={statusFilters.includes("former")}
                    onCheckedChange={(checked) => handleStatusChange("former", checked as boolean)}
                  />
                  <Label htmlFor="status-former" className="cursor-pointer font-normal text-sm">
                    نائب سابق
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="status-candidate"
                    checked={statusFilters.includes("candidate")}
                    onCheckedChange={(checked) => handleStatusChange("candidate", checked as boolean)}
                  />
                  <Label htmlFor="status-candidate" className="cursor-pointer font-normal text-sm">
                    مرشح
                  </Label>
                </div>
              </div>
            </div>

            {/* Gender Filter */}
            <div className="lg:col-span-3">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                الجنس
              </label>
              <RadioGroup value={genderFilter} onValueChange={setGenderFilter} className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="all" id="gender-all" />
                  <Label htmlFor="gender-all" className="cursor-pointer font-normal text-sm">
                    الكل
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="male" id="gender-male" />
                  <Label htmlFor="gender-male" className="cursor-pointer font-normal text-sm">
                    ذكر
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="female" id="gender-female" />
                  <Label htmlFor="gender-female" className="cursor-pointer font-normal text-sm">
                    أنثى
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Row 2: 4 Dropdowns - Desktop: Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                المحافظة
              </label>
              <Select
                value={governorateFilter}
                onValueChange={(value) => {
                  setGovernorateFilter(value);
                  setElectoralDistrictFilter("all");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المحافظات</SelectItem>
                  {governorates.map((gov: any) => (
                    <SelectItem key={gov.id} value={gov.id}>
                      {gov.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                الدائرة الانتخابية
              </label>
              <Select
                value={electoralDistrictFilter}
                onValueChange={setElectoralDistrictFilter}
                disabled={governorateFilter === "all"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={governorateFilter === "all" ? "اختر محافظة أولاً" : "اختر الدائرة"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الدوائر</SelectItem>
                  {filteredElectoralDistricts.map((district: any) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Party */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                الحزب أو التحالف
              </label>
              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الحزب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأحزاب</SelectItem>
                  {parties.map((party: any) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                المجلس
              </label>
              <Select value={councilFilter} onValueChange={setCouncilFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر المجلس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المجالس</SelectItem>
                  {councils.map((council: any) => (
                    <SelectItem key={council.id} value={council.id}>
                      {council.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>
            عرض <span className="font-semibold text-foreground">{startIndex + 1}</span> - <span className="font-semibold text-foreground">{Math.min(endIndex, filteredDeputies.length)}</span> من <span className="font-semibold text-foreground">{filteredDeputies.length}</span> نتيجة
          </div>
          {filteredDeputies.length < deputies.length && (
            <div className="text-xs">
              (تم تصفية {deputies.length - filteredDeputies.length} نتيجة)
            </div>
          )}
        </div>
      </div>
      )}

      {/* Deputies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedDeputies.map((deputyData: DeputyData) => (
          <div
            key={deputyData.deputy.id}
            className="bg-card rounded-lg shadow-md border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-0"
          >
            {/* Avatar */}
            <div className="flex justify-center pt-8 pb-4 bg-muted/20">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-border shadow-md">
                {deputyData.user?.avatar_url ? (
                  <img
                    src={deputyData.user.avatar_url}
                    alt={deputyData.user.full_name || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-muted-foreground">
                    {deputyData.user?.full_name?.charAt(0) || "؟"}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Name & Status */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold leading-tight">
                  {formatDeputyName(deputyData.user?.full_name, deputyData.deputy?.display_name)}
                </h3>
                <Badge
                  variant={getStatusVariant(deputyData.deputy.deputy_status)}
                  className="text-xs"
                >
                  {getStatusLabel(deputyData.deputy.deputy_status)}
                </Badge>
              </div>

              {/* Info Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t min-w-0">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium">المحافظة</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.governorate?.name_ar || "غير محدد"}
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium">الحزب</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.party?.name_ar || "غير محدد"}
                  </div>
                </div>
              </div>

              {/* Electoral District & Candidate Type */}
              <div className="grid grid-cols-2 gap-3 text-sm min-w-0">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium">الدائرة الانتخابية</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.electoral_district?.name || "غير محدد"}
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium">نوع الترشح</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.deputy.candidate_type === 'individual' ? 'فردي' : deputyData.deputy.candidate_type === 'list' ? 'قائمة' : deputyData.deputy.candidate_type === 'both' ? 'فردي وقائمة' : 'غير محدد'}
                  </div>
                </div>
              </div>

              {/* Council */}
              <div className="text-sm">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium">المجلس</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.council?.name_ar || "غير محدد"}
                  </div>
                </div>
              </div>

              {/* Points & Rating */}
              <div className="space-y-3">
                {/* Points */}
                <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
                  <span className="text-2xl">🏆</span>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-medium">النقاط</div>
                    <div className="text-lg font-bold text-foreground">
                      {deputyData.deputy.points || 0}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <DeputyCardRating
                  deputyId={deputyData.deputy.id}
                  rating={deputyData.deputy.rating_average || 0}
                  ratingCount={deputyData.deputy.rating_count || 0}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              {/* Visit Button */}
              {deputyData.slug ? (
                <Link href={`/deputy/${deputyData.slug}`}>
                  <Button className="w-full" variant="default" size="lg">
                    زيارة الصفحة
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" variant="outline" size="lg" disabled>
                  الصفحة غير متوفرة
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDeputies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            لا توجد نتائج تطابق الفلاتر المحددة
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchName("");
              setGovernorateFilter("all");
              setPartyFilter("all");
              setElectoralDistrictFilter("all");
              setCouncilFilter("all");
              setStatusFilters(["current", "former", "candidate"]);
              setGenderFilter("all");
            }}
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page as number)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

