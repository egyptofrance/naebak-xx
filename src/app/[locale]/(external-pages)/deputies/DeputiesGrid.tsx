"use client";

import { useState, useMemo, useEffect } from "react";
import { Link } from "@/components/intl-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DeputyCardRating } from "./DeputyCardRating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Use Awaited and ReturnType to infer types from getAllDeputies
import { getAllDeputies } from "@/app/actions/deputy/getAllDeputies";
import { getAllGovernorates } from "@/app/actions/governorate/getAllGovernorates";
import { getAllParties } from "@/app/actions/party/getAllParties";
import { getAllElectoralDistricts } from "@/app/actions/electoral-district/getAllElectoralDistricts";
import { getAllCouncils } from "@/app/actions/council/getAllCouncils";

type DeputiesData = Awaited<ReturnType<typeof getAllDeputies>>;
type DeputyData = DeputiesData[number];
type GovernoratesData = Awaited<ReturnType<typeof getAllGovernorates>>;
type PartiesData = Awaited<ReturnType<typeof getAllParties>>;
type ElectoralDistrictsData = Awaited<ReturnType<typeof getAllElectoralDistricts>>;
type CouncilsData = Awaited<ReturnType<typeof getAllCouncils>>;

export default function DeputiesGrid({ 
  deputies,
  governorates,
  parties,
  electoralDistricts,
  councils,
  isAuthenticated = false,
  userGovernorateId = null
}: { 
  deputies: DeputiesData;
  governorates: GovernoratesData;
  parties: PartiesData;
  electoralDistricts: ElectoralDistrictsData;
  councils: CouncilsData;
  isAuthenticated?: boolean;
  userGovernorateId?: string | null;
}) {
  // Find Cairo governorate ID for default
  const cairoGov = governorates.find(g => g.name_ar === "القاهرة");
  const defaultGovernorateId = userGovernorateId || cairoGov?.id || "all";

  const [governorateFilter, setGovernorateFilter] = useState<string>(defaultGovernorateId);
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [electoralDistrictFilter, setElectoralDistrictFilter] = useState<string>("all");
  const [councilFilter, setCouncilFilter] = useState<string>("all");
  const [statusFilters, setStatusFilters] = useState<string[]>(["current", "former", "candidate"]);
  const [genderFilter, setGenderFilter] = useState<string>("all");

  // Update governorate filter when userGovernorateId changes
  useEffect(() => {
    setGovernorateFilter(defaultGovernorateId);
  }, [defaultGovernorateId]);

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
      // Governorate filter
      if (
        governorateFilter !== "all" &&
        deputyData.governorate?.id !== governorateFilter
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
      if (genderFilter !== "all") {
        // Assuming gender is stored in user_profiles
        // You may need to add gender field to the query
        // For now, we'll skip this filter until gender field is confirmed
      }
      
      return true;
    });
  }, [deputies, governorateFilter, partyFilter, electoralDistrictFilter, councilFilter, statusFilters, genderFilter]);

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
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold mb-4">تصفية النتائج</h2>
        
        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Governorate Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">المحافظة</label>
            <Select
              value={governorateFilter}
              onValueChange={(value) => {
                setGovernorateFilter(value);
                setElectoralDistrictFilter("all"); // Reset electoral district when governorate changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {governorates.map((gov: any) => (
                  <SelectItem key={gov.id} value={gov.id}>
                    {gov.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Electoral District Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">الدائرة الانتخابية</label>
            <Select
              value={electoralDistrictFilter}
              onValueChange={setElectoralDistrictFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {filteredElectoralDistricts.map((district: any) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Party Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">الحزب</label>
            <Select value={partyFilter} onValueChange={setPartyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {parties.map((party: any) => (
                  <SelectItem key={party.id} value={party.id}>
                    {party.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Council Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">المجلس</label>
            <Select value={councilFilter} onValueChange={setCouncilFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {councils.map((council: any) => (
                  <SelectItem key={council.id} value={council.id}>
                    {council.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Checkboxes and Gender Radio Buttons Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          {/* Status Filter (Checkboxes) */}
          <div>
            <label className="text-sm font-medium mb-3 block">الحالة</label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="status-current"
                  checked={statusFilters.includes("current")}
                  onCheckedChange={(checked) => handleStatusChange("current", checked as boolean)}
                />
                <Label htmlFor="status-current" className="cursor-pointer">
                  نائب حالي
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="status-former"
                  checked={statusFilters.includes("former")}
                  onCheckedChange={(checked) => handleStatusChange("former", checked as boolean)}
                />
                <Label htmlFor="status-former" className="cursor-pointer">
                  نائب سابق
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="status-candidate"
                  checked={statusFilters.includes("candidate")}
                  onCheckedChange={(checked) => handleStatusChange("candidate", checked as boolean)}
                />
                <Label htmlFor="status-candidate" className="cursor-pointer">
                  مرشح
                </Label>
              </div>
            </div>
          </div>

          {/* Gender Filter (Radio Buttons) */}
          <div>
            <label className="text-sm font-medium mb-3 block">الجنس</label>
            <RadioGroup value={genderFilter} onValueChange={setGenderFilter}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="all" id="gender-all" />
                <Label htmlFor="gender-all" className="cursor-pointer">
                  الكل
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="male" id="gender-male" />
                <Label htmlFor="gender-male" className="cursor-pointer">
                  ذكر
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="female" id="gender-female" />
                <Label htmlFor="gender-female" className="cursor-pointer">
                  أنثى
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          عرض {filteredDeputies.length} من {deputies.length} نائب
        </div>
      </div>

      {/* Deputies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDeputies.map((deputyData: DeputyData) => (
          <div
            key={deputyData.deputy.id}
            className="bg-card rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Avatar */}
            <div className="flex justify-center pt-8 pb-4 bg-gradient-to-b from-muted/30 to-transparent">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-4 ring-background shadow-lg">
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
                  {deputyData.user?.full_name || "غير محدد"}
                </h3>
                <Badge
                  variant={getStatusVariant(deputyData.deputy.deputy_status)}
                  className="text-xs"
                >
                  {getStatusLabel(deputyData.deputy.deputy_status)}
                </Badge>
              </div>

              {/* Info Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">المحافظة</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.governorate?.name_ar || "غير محدد"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">الحزب</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.party?.name_ar || "غير محدد"}
                  </div>
                </div>
              </div>

              {/* Electoral District & Candidate Type */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">الدائرة الانتخابية</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.electoral_district?.name || "غير محدد"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">نوع الترشح</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.deputy.candidate_type === 'individual' ? 'فردي' : deputyData.deputy.candidate_type === 'list' ? 'قائمة' : deputyData.deputy.candidate_type === 'both' ? 'فردي وقائمة' : 'غير محدد'}
                  </div>
                </div>
              </div>

              {/* Council */}
              <div className="text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">المجلس</div>
                  <div className="font-semibold text-foreground truncate">
                    {deputyData.council?.name_ar || "غير محدد"}
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

              {/* Visit Button */}
              <Link href={`/deputy/${deputyData.slug}`}>
                <Button className="w-full" variant="default" size="lg">
                  زيارة الصفحة
                </Button>
              </Link>
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
        </div>
      )}
    </div>
  );
}

