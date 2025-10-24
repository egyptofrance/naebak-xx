"use client";

import { useState, useMemo } from "react";
import { Link } from "@/components/intl-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type DeputiesData = Awaited<ReturnType<typeof getAllDeputies>>;
type DeputyData = DeputiesData[number];

export default function DeputiesGrid({ 
  deputies,
  isAuthenticated = false 
}: { 
  deputies: DeputiesData;
  isAuthenticated?: boolean;
}) {
  const [governorateFilter, setGovernorateFilter] = useState<string>("all");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [councilFilter, setCouncilFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get unique values for filters
  const governorates = useMemo(() => {
    const unique = new Map();
    deputies.forEach((d: DeputyData) => {
      if (d.governorate) {
        unique.set(d.governorate.id, d.governorate);
      }
    });
    return Array.from(unique.values());
  }, [deputies]);

  const parties = useMemo(() => {
    const unique = new Map();
    deputies.forEach((d: DeputyData) => {
      if (d.party) {
        unique.set(d.party.id, d.party);
      }
    });
    return Array.from(unique.values());
  }, [deputies]);

  const councils = useMemo(() => {
    const unique = new Map();
    deputies.forEach((d: DeputyData) => {
      if (d.council) {
        unique.set(d.council.id, d.council);
      }
    });
    return Array.from(unique.values());
  }, [deputies]);

  // Filter deputies
  const filteredDeputies = useMemo(() => {
    return deputies.filter((deputyData: DeputyData) => {
      if (
        governorateFilter !== "all" &&
        deputyData.governorate?.id !== governorateFilter
      ) {
        return false;
      }
      if (partyFilter !== "all" && deputyData.party?.id !== partyFilter) {
        return false;
      }
      if (
        councilFilter !== "all" &&
        deputyData.council?.id !== councilFilter
      ) {
        return false;
      }
      if (
        statusFilter !== "all" &&
        deputyData.deputy.deputy_status !== statusFilter
      ) {
        return false;
      }
      return true;
    });
  }, [deputies, governorateFilter, partyFilter, councilFilter, statusFilter]);

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Governorate Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">المحافظة</label>
            <Select
              value={governorateFilter}
              onValueChange={setGovernorateFilter}
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

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">الحالة</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="current">نائب حالي</SelectItem>
                <SelectItem value="former">نائب سابق</SelectItem>
                <SelectItem value="candidate">مرشح</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          عرض {filteredDeputies.length} من {deputies.length} نائب
        </div>
      </div>

      {/* Deputies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDeputies.map((deputyData) => (
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

              {/* Council - Full Width */}
              <div className="space-y-1 text-sm pb-2">
                <div className="text-xs text-muted-foreground font-medium">المجلس</div>
                <div className="font-semibold text-foreground">
                  {deputyData.council?.name_ar || "غير محدد"}
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

