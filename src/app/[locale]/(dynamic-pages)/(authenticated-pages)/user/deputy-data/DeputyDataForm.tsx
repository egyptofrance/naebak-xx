"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateDeputyDataAction } from "@/data/user/deputy-self-management";
import { useState } from "react";
import { toast } from "sonner";

type DeputyDataFormProps = {
  deputyProfile: any;
};

export function DeputyDataForm({ deputyProfile }: DeputyDataFormProps) {
  const [deputyStatus, setDeputyStatus] = useState(deputyProfile.deputy_status || "");
  const [electoralSymbol, setElectoralSymbol] = useState(deputyProfile.electoral_symbol || "");
  const [electoralNumber, setElectoralNumber] = useState(deputyProfile.electoral_number || "");
  const [bio, setBio] = useState(deputyProfile.bio || "");
  const [officeAddress, setOfficeAddress] = useState(deputyProfile.office_address || "");
  const [officePhone, setOfficePhone] = useState(deputyProfile.office_phone || "");
  const [officeHours, setOfficeHours] = useState(deputyProfile.office_hours || "");
  const [facebook, setFacebook] = useState(deputyProfile.social_media_facebook || "");
  const [twitter, setTwitter] = useState(deputyProfile.social_media_twitter || "");
  const [instagram, setInstagram] = useState(deputyProfile.social_media_instagram || "");
  const [youtube, setYoutube] = useState(deputyProfile.social_media_youtube || "");
  const [tiktok, setTiktok] = useState(deputyProfile.social_media_tiktok || "");
  const [website, setWebsite] = useState(deputyProfile.website || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const result = await updateDeputyDataAction({
        deputy_status: deputyStatus as "current" | "candidate" | "former",
        electoral_symbol: electoralSymbol,
        electoral_number: electoralNumber,
        bio,
        office_address: officeAddress,
        office_phone: officePhone,
        office_hours: officeHours,
        social_media_facebook: facebook,
        social_media_twitter: twitter,
        social_media_instagram: instagram,
        social_media_youtube: youtube,
        social_media_tiktok: tiktok,
        website,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("فشل حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deputy Status */}
      <div className="space-y-2">
        <Label htmlFor="deputy_status">حالة النائب *</Label>
        <Select value={deputyStatus} onValueChange={setDeputyStatus}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">نائب حالي</SelectItem>
            <SelectItem value="candidate">مرشح</SelectItem>
            <SelectItem value="former">نائب سابق</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Council */}
      <div className="space-y-2">
        <Label htmlFor="council">المجلس</Label>
        <p className="text-sm text-muted-foreground">
          سيتم إضافة قائمة المجالس قريباً
        </p>
      </div>

      {/* Electoral Symbol */}
      <div className="space-y-2">
        <Label htmlFor="electoral_symbol">الرمز الانتخابي</Label>
        <Input
          id="electoral_symbol"
          value={electoralSymbol}
          onChange={(e) => setElectoralSymbol(e.target.value)}
          placeholder="مثال: الأسد"
        />
      </div>

      {/* Electoral Number */}
      <div className="space-y-2">
        <Label htmlFor="electoral_number">الرقم الانتخابي</Label>
        <Input
          id="electoral_number"
          value={electoralNumber}
          onChange={(e) => setElectoralNumber(e.target.value)}
          placeholder="مثال: 123"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">السيرة الذاتية</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="نبذة عن السيرة الذاتية"
          rows={4}
        />
      </div>

      {/* Office Address */}
      <div className="space-y-2">
        <Label htmlFor="office_address">عنوان المكتب</Label>
        <Input
          id="office_address"
          value={officeAddress}
          onChange={(e) => setOfficeAddress(e.target.value)}
          placeholder="العنوان الكامل للمكتب"
        />
      </div>

      {/* Office Phone */}
      <div className="space-y-2">
        <Label htmlFor="office_phone">هاتف المكتب</Label>
        <Input
          id="office_phone"
          value={officePhone}
          onChange={(e) => setOfficePhone(e.target.value)}
          placeholder="رقم هاتف المكتب"
        />
      </div>

      {/* Office Hours */}
      <div className="space-y-2">
        <Label htmlFor="office_hours">ساعات العمل</Label>
        <Input
          id="office_hours"
          value={officeHours}
          onChange={(e) => setOfficeHours(e.target.value)}
          placeholder="مثال: من 9 صباحاً إلى 5 مساءً"
        />
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">وسائل التواصل الاجتماعي</h3>
        
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="رابط صفحة Facebook"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input
            id="twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="رابط حساب Twitter"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="رابط حساب Instagram"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube</Label>
          <Input
            id="youtube"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="رابط قناة YouTube"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktok">TikTok</Label>
          <Input
            id="tiktok"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="رابط حساب TikTok"
          />
        </div>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">الموقع الإلكتروني</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="رابط الموقع الشخصي"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  );
}

