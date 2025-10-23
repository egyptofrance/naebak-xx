"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users } from "lucide-react";

// Egyptian governorates
const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحر الأحمر",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "الشرقية",
  "السويس",
  "أسوان",
  "أسيوط",
  "بني سويف",
  "بورسعيد",
  "دمياط",
  "الأقصر",
  "قنا",
  "كفر الشيخ",
  "مطروح",
  "سوهاج",
  "جنوب سيناء",
  "شمال سيناء",
];

interface Deputy {
  id: string;
  full_name: string;
  governorate: string;
  party?: string;
  council_type: string;
  deputy_status: string;
  gender?: string;
  points: number;
}

interface AdvancedDeputySelectorProps {
  deputies: Deputy[];
  onSelect: (selectedDeputyIds: string[]) => void;
  isLoading?: boolean;
}

export default function AdvancedDeputySelector({
  deputies,
  onSelect,
  isLoading = false,
}: AdvancedDeputySelectorProps) {
  const [searchName, setSearchName] = useState("");
  const [councilType, setCouncilType] = useState<string>("all");
  const [deputyStatus, setDeputyStatus] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");
  const [governorate, setGovernorate] = useState<string>("all");
  const [selectedDeputies, setSelectedDeputies] = useState<Set<string>>(
    new Set()
  );
  const [filteredDeputies, setFilteredDeputies] = useState<Deputy[]>(deputies);

  // Apply filters
  useEffect(() => {
    let filtered = [...deputies];

    // Search by name
    if (searchName) {
      const searchLower = searchName.toLowerCase();
      filtered = filtered.filter((deputy) =>
        deputy.full_name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by council type
    if (councilType !== "all") {
      filtered = filtered.filter((deputy) => deputy.council_type === councilType);
    }

    // Filter by deputy status
    if (deputyStatus !== "all") {
      filtered = filtered.filter(
        (deputy) => deputy.deputy_status === deputyStatus
      );
    }

    // Filter by gender
    if (gender !== "all") {
      filtered = filtered.filter((deputy) => deputy.gender === gender);
    }

    // Filter by governorate
    if (governorate !== "all") {
      filtered = filtered.filter((deputy) => deputy.governorate === governorate);
    }

    setFilteredDeputies(filtered);
  }, [searchName, councilType, deputyStatus, gender, governorate, deputies]);

  const handleToggleDeputy = (deputyId: string) => {
    const newSelected = new Set(selectedDeputies);
    if (newSelected.has(deputyId)) {
      newSelected.delete(deputyId);
    } else {
      newSelected.add(deputyId);
    }
    setSelectedDeputies(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDeputies.size === filteredDeputies.length) {
      setSelectedDeputies(new Set());
    } else {
      setSelectedDeputies(new Set(filteredDeputies.map((d) => d.id)));
    }
  };

  const handleClearFilters = () => {
    setSearchName("");
    setCouncilType("all");
    setDeputyStatus("all");
    setGender("all");
    setGovernorate("all");
    setSelectedDeputies(new Set());
  };

  const handleConfirmSelection = () => {
    onSelect(Array.from(selectedDeputies));
  };

  const getCouncilTypeLabel = (type: string) => {
    switch (type) {
      case "parliament":
        return "برلمان";
      case "senate":
        return "مجلس شيوخ";
      case "local_council":
        return "مجلس محلي";
      default:
        return type;
    }
  };

  const getDeputyStatusLabel = (status: string) => {
    switch (status) {
      case "current":
        return "حالي";
      case "candidate":
        return "مرشح";
      case "former":
        return "سابق";
      default:
        return status;
    }
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return "-";
    return gender === "male" ? "ذكر" : "أنثى";
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search by name */}
          <div className="space-y-2">
            <Label htmlFor="search-name">البحث بالاسم</Label>
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-name"
                placeholder="ابحث عن نائب..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Council Type */}
            <div className="space-y-2">
              <Label htmlFor="council-type">نوع المجلس</Label>
              <Select value={councilType} onValueChange={setCouncilType}>
                <SelectTrigger id="council-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="parliament">برلمان</SelectItem>
                  <SelectItem value="senate">مجلس شيوخ</SelectItem>
                  <SelectItem value="local_council">مجلس محلي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deputy Status */}
            <div className="space-y-2">
              <Label htmlFor="deputy-status">الحالة</Label>
              <Select value={deputyStatus} onValueChange={setDeputyStatus}>
                <SelectTrigger id="deputy-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="current">حالي</SelectItem>
                  <SelectItem value="candidate">مرشح</SelectItem>
                  <SelectItem value="former">سابق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">الجنس</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Governorate */}
            <div className="space-y-2">
              <Label htmlFor="governorate">المحافظة</Label>
              <Select value={governorate} onValueChange={setGovernorate}>
                <SelectTrigger id="governorate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {GOVERNORATES.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              مسح الفلاتر
            </Button>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="flex-1"
            >
              {selectedDeputies.size === filteredDeputies.length
                ? "إلغاء تحديد الكل"
                : "تحديد الكل"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              النواب المتاحون ({filteredDeputies.length})
            </div>
            <Badge variant="secondary">
              تم اختيار {selectedDeputies.size} نائب
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDeputies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد نتائج مطابقة للفلاتر المحددة
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredDeputies.map((deputy) => (
                <div
                  key={deputy.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDeputies.has(deputy.id)
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleToggleDeputy(deputy.id)}
                >
                  <Checkbox
                    checked={selectedDeputies.has(deputy.id)}
                    onCheckedChange={() => handleToggleDeputy(deputy.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{deputy.full_name}</div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline">
                        {getCouncilTypeLabel(deputy.council_type)}
                      </Badge>
                      <Badge variant="outline">
                        {getDeputyStatusLabel(deputy.deputy_status)}
                      </Badge>
                      <Badge variant="outline">{deputy.governorate}</Badge>
                      <Badge variant="outline">
                        {getGenderLabel(deputy.gender)}
                      </Badge>
                      <Badge variant="secondary">{deputy.points} نقطة</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleConfirmSelection}
          disabled={selectedDeputies.size === 0 || isLoading}
          className="flex-1"
        >
          {isLoading
            ? "جاري الإسناد..."
            : `إسناد الشكوى لـ ${selectedDeputies.size} نائب`}
        </Button>
      </div>
    </div>
  );
}

