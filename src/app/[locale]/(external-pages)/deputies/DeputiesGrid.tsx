"use client";

import { useState, useMemo } from "react";
import { Link } from "@/components/intl-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Deputy = {
  id: string;
  slug: string;
  deputy_status: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
  governorate: {
    id: string;
    name_ar: string;
    name_en: string;
  } | null;
  party: {
    id: string;
    name_ar: string;
    name_en: string;
  } | null;
  council: {
    id: string;
    name_ar: string;
    name_en: string;
  } | null;
};

export default function DeputiesGrid({ deputies }: { deputies: Deputy[] }) {
  const [governorateFilter, setGovernorateFilter] = useState<string>("all");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [councilFilter, setCouncilFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get unique values for filters
  const governorates = useMemo(() => {
    const unique = new Map();
    deputies.forEach((d) => {
      if (d.governorate) {
        unique.set(d.governorate.id, d.governorate);
      }
    });
    return Array.from(unique.values());
  }, [deputies]);

  const parties = useMemo(() => {
    const unique = new Map();
    deputies.forEach((d) => {
      if (d.party) {
        unique.set(d.party.id, d.party);
      }
    });
    return Array.from(unique.values());
  }, [deputies]);

  const councils = useMemo(() => {
    const unique = new Map();
    deputies.forEach((d) => {
      if (d.council) {
        unique.set(d.council.id, d.council);
      }
    });
    return Array.from(unique.values());
  }, [deputies]);

  // Filter deputies
  const filteredDeputies = useMemo(() => {
    return deputies.filter((deputy) => {
      if (governorateFilter !== "all" && deputy.governorate?.id !== governorateFilter) {
        return false;
      }
      if (partyFilter !== "all" && deputy.party?.id !== partyFilter) {
        return false;
      }
      if (councilFilter !== "all" && deputy.council?.id !== councilFilter) {
        return false;
      }
      if (statusFilter !== "all" && deputy.deputy_status !== statusFilter) {
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

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Governorate Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">المحافظة</label>
            <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {governorates.map((gov) => (
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
                {parties.map((party) => (
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
                {councils.map((council) => (
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
        {filteredDeputies.map((deputy) => (
          <div
            key={deputy.id}
            className="bg-card rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Avatar */}
            <div className="flex justify-center pt-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {deputy.user.avatar_url ? (
                  <img
                    src={deputy.user.avatar_url}
                    alt={deputy.user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-muted-foreground">
                    {deputy.user.full_name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Name */}
              <h3 className="text-lg font-bold text-center">{deputy.user.full_name}</h3>

              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge variant={getStatusVariant(deputy.deputy_status)}>
                  {getStatusLabel(deputy.deputy_status)}
                </Badge>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">المحافظة:</span>
                  <span>{deputy.governorate?.name_ar || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">الحزب:</span>
                  <span>{deputy.party?.name_ar || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">المجلس:</span>
                  <span>{deputy.council?.name_ar || "غير محدد"}</span>
                </div>
              </div>

              {/* Visit Button */}
              <Link href={`/deputy/${deputy.slug}`}>
                <Button className="w-full" variant="default">
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
          <p className="text-lg text-muted-foreground">لا توجد نتائج تطابق الفلاتر المحددة</p>
        </div>
      )}
    </div>
  );
}

