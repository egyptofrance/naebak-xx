"use client";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDeputyAction } from "@/data/admin/deputies";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { getElectoralDistrictsByGovernorate } from "@/data/deputy/queries";

interface DeputyEditFormProps {
  deputy: any;
  councils: any[];
  governorates: any[];
}

export function DeputyEditForm({ deputy, councils, governorates }: DeputyEditFormProps) {
  const [formData, setFormData] = useState({
    bio: deputy.bio || "",
    officeAddress: deputy.office_address || "",
    officePhone: deputy.office_phone || "",
    officeHours: deputy.office_hours || "",
    electoralSymbol: deputy.electoral_symbol || "",
    electoralNumber: deputy.electoral_number || "",
    electoralProgram: deputy.electoral_program || "",
    achievements: deputy.achievements || "",
    events: deputy.events || "",
    websiteUrl: deputy.website_url || "",
    socialMediaFacebook: deputy.social_media_facebook || "",
    socialMediaTwitter: deputy.social_media_twitter || "",
    socialMediaInstagram: deputy.social_media_instagram || "",
    socialMediaYoutube: deputy.social_media_youtube || "",
    councilId: deputy.council_id || "",
    initialRatingAverage: deputy.initial_rating_average?.toString() || "0",
    initialRatingCount: deputy.initial_rating_count?.toString() || "0",
    candidateType: deputy.candidate_type || "",
    electoralDistrictId: deputy.electoral_district_id || "",
    governorateId: deputy.governorate_id || "",
  });

  const [electoralDistricts, setElectoralDistricts] = useState<any[]>([]);

  const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
    updateDeputyAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || "تم تحديث ملف النائب بنجاح");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "حدث خطأ أثناء تحديث ملف النائب");
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeUpdate({
      deputyId: deputy.id,
      ...formData,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Reset electoral district when governorate changes
    if (field === "governorateId") {
      setFormData((prev) => ({ ...prev, electoralDistrictId: "" }));
    }
  };

  // Load electoral districts when governorate changes
  useEffect(() => {
    const governorateId = formData.governorateId;
    if (governorateId && typeof governorateId === 'string') {
      async function loadDistricts() {
        try {
          const districts = await getElectoralDistrictsByGovernorate(governorateId);
          setElectoralDistricts(districts);
        } catch (error) {
          console.error("Error loading electoral districts:", error);
          setElectoralDistricts([]);
        }
      }
      loadDistricts();
    } else {
      setElectoralDistricts([]);
    }
  }, [formData.governorateId]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Electoral Information */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الانتخابية</CardTitle>
          <CardDescription>
            الرمز والرقم الانتخابي والبرنامج الانتخابي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="governorateId">المحافظة</Label>
              <Select
                value={formData.governorateId}
                onValueChange={(value) => handleChange("governorateId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((gov) => (
                    <SelectItem key={gov.id} value={gov.id}>
                      {gov.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="electoralDistrictId">الدائرة الانتخابية</Label>
              <Select
                value={formData.electoralDistrictId}
                onValueChange={(value) => handleChange("electoralDistrictId", value)}
                disabled={!formData.governorateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدائرة الانتخابية" />
                </SelectTrigger>
                <SelectContent>
                  {electoralDistricts.length === 0 ? (
                    <SelectItem value="no-districts" disabled>
                      {formData.governorateId ? "لا توجد دوائر انتخابية" : "اختر المحافظة أولاً"}
                    </SelectItem>
                  ) : (
                    electoralDistricts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name} ({district.district_type === "individual" ? "فردي" : "قائمة"})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateType">نوع الترشح</Label>
              <Select
                value={formData.candidateType}
                onValueChange={(value) => handleChange("candidateType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الترشح" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">فردي</SelectItem>
                  <SelectItem value="list">قائمة</SelectItem>
                  <SelectItem value="both">كلاهما</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="electoralNumber">الرقم الانتخابي</Label>
              <Input
                id="electoralNumber"
                value={formData.electoralNumber}
                onChange={(e) => handleChange("electoralNumber", e.target.value)}
                placeholder="أدخل الرقم الانتخابي"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="electoralSymbol">الرمز الانتخابي</Label>
              <Input
                id="electoralSymbol"
                value={formData.electoralSymbol}
                onChange={(e) => handleChange("electoralSymbol", e.target.value)}
                placeholder="أدخل الرمز الانتخابي"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="electoralProgram">البرنامج الانتخابي</Label>
            <Textarea
              id="electoralProgram"
              value={formData.electoralProgram}
              onChange={(e) => handleChange("electoralProgram", e.target.value)}
              placeholder="أدخل البرنامج الانتخابي"
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Biography */}
      <Card>
        <CardHeader>
          <CardTitle>السيرة الذاتية</CardTitle>
          <CardDescription>معلومات عن النائب وخلفيته</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">السيرة الذاتية</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="أدخل السيرة الذاتية للنائب"
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements and Events */}
      <Card>
        <CardHeader>
          <CardTitle>الإنجازات والفعاليات</CardTitle>
          <CardDescription>إنجازات النائب والفعاليات التي شارك فيها</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="achievements">الإنجازات</Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) => handleChange("achievements", e.target.value)}
              placeholder="أدخل إنجازات النائب"
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="events">الفعاليات</Label>
            <Textarea
              id="events"
              value={formData.events}
              onChange={(e) => handleChange("events", e.target.value)}
              placeholder="أدخل الفعاليات التي شارك فيها النائب"
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Office Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات المكتب</CardTitle>
          <CardDescription>عنوان المكتب وساعات العمل ورقم الهاتف</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="officeAddress">عنوان المكتب</Label>
            <Textarea
              id="officeAddress"
              value={formData.officeAddress}
              onChange={(e) => handleChange("officeAddress", e.target.value)}
              placeholder="أدخل عنوان المكتب"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="officePhone">هاتف المكتب</Label>
              <Input
                id="officePhone"
                value={formData.officePhone}
                onChange={(e) => handleChange("officePhone", e.target.value)}
                placeholder="أدخل رقم هاتف المكتب"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeHours">ساعات العمل</Label>
              <Input
                id="officeHours"
                value={formData.officeHours}
                onChange={(e) => handleChange("officeHours", e.target.value)}
                placeholder="مثال: من 9 صباحاً إلى 5 مساءً"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Council Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>المجلس</CardTitle>
          <CardDescription>تعيين النائب إلى مجلس معين</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="councilId">المجلس</Label>
            <Select
              value={formData.councilId}
              onValueChange={(value) => handleChange("councilId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المجلس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-council">بدون مجلس</SelectItem>
                {councils.map((council) => (
                  <SelectItem key={council.id} value={council.id}>
                    {council.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Initial Rating Values */}
      <Card>
        <CardHeader>
          <CardTitle>القيم الابتدائية للتقييم</CardTitle>
          <CardDescription>
            يمكنك ضبط قيم ابتدائية للتقييم (للتحكم في البداية الظاهرة للتقييم)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialRatingAverage">التقييم الابتدائي (0-5)</Label>
              <Input
                id="initialRatingAverage"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.initialRatingAverage}
                onChange={(e) => handleChange("initialRatingAverage", e.target.value)}
                placeholder="0.0"
              />
              <p className="text-sm text-muted-foreground">
                متوسط التقييم الابتدائي (من 0 إلى 5)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialRatingCount">عدد المقيّمين الابتدائي</Label>
              <Input
                id="initialRatingCount"
                type="number"
                min="0"
                value={formData.initialRatingCount}
                onChange={(e) => handleChange("initialRatingCount", e.target.value)}
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground">
                عدد التقييمات الابتدائية
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media and Website */}
      <Card>
        <CardHeader>
          <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
          <CardDescription>روابط حسابات التواصل الاجتماعي والموقع الإلكتروني</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">الموقع الإلكتروني</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleChange("websiteUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialMediaFacebook">فيسبوك</Label>
            <Input
              id="socialMediaFacebook"
              type="url"
              value={formData.socialMediaFacebook}
              onChange={(e) => handleChange("socialMediaFacebook", e.target.value)}
              placeholder="https://facebook.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialMediaTwitter">تويتر</Label>
            <Input
              id="socialMediaTwitter"
              type="url"
              value={formData.socialMediaTwitter}
              onChange={(e) => handleChange("socialMediaTwitter", e.target.value)}
              placeholder="https://twitter.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialMediaInstagram">إنستجرام</Label>
            <Input
              id="socialMediaInstagram"
              type="url"
              value={formData.socialMediaInstagram}
              onChange={(e) => handleChange("socialMediaInstagram", e.target.value)}
              placeholder="https://instagram.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialMediaYoutube">يوتيوب</Label>
            <Input
              id="socialMediaYoutube"
              type="url"
              value={formData.socialMediaYoutube}
              onChange={(e) => handleChange("socialMediaYoutube", e.target.value)}
              placeholder="https://youtube.com/@username"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating}>
          <Save className="h-4 w-4 mr-2" />
          {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </form>
  );
}

