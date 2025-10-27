"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDeputyDataAction } from "@/data/deputy/update-data";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { 
  User, 
  Vote, 
  FileText, 
  MapPin, 
  Phone, 
  Clock, 
  Share2, 
  Globe,
  Loader2,
  Save
} from "lucide-react";

type DeputyDataFormProps = {
  deputyProfile: any;
};

export function DeputyDataForm({ deputyProfile }: DeputyDataFormProps) {
  const [deputyStatus, setDeputyStatus] = useState(deputyProfile.deputy_status || "current");
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

  const { execute: updateData, isExecuting } = useAction(updateDeputyDataAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || "تم حفظ التغييرات بنجاح");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "فشل حفظ التغييرات");
    },
  });

  const handleSave = () => {
    updateData({
      deputyStatus,
      electoralSymbol,
      electoralNumber,
      bio,
      officeAddress,
      officePhone,
      officeHours,
      facebook,
      twitter,
      instagram,
      youtube,
      tiktok,
      website,
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>المعلومات الأساسية</CardTitle>
          </div>
          <CardDescription>
            حالة النائب والمعلومات الانتخابية الأساسية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Council Type - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="council_type">نوع المجلس</Label>
              <Input
                id="council_type"
                value={deputyProfile.councils?.name_ar || "غير محدد"}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                يتم تحديد نوع المجلس من قبل الإدارة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biography */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>السيرة الذاتية</CardTitle>
          </div>
          <CardDescription>
            نبذة عن خلفيتك ومسيرتك المهنية والسياسية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب نبذة عن سيرتك الذاتية، خلفيتك التعليمية، خبراتك المهنية، وإنجازاتك السياسية..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              ستظهر هذه المعلومات في صفحتك العامة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Office Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>معلومات المكتب</CardTitle>
          </div>
          <CardDescription>
            عنوان وتفاصيل الاتصال بمكتبك الانتخابي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Office Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="office_address">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  عنوان المكتب
                </div>
              </Label>
              <Input
                id="office_address"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="العنوان الكامل للمكتب الانتخابي"
              />
            </div>

            {/* Office Phone */}
            <div className="space-y-2">
              <Label htmlFor="office_phone">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  هاتف المكتب
                </div>
              </Label>
              <Input
                id="office_phone"
                value={officePhone}
                onChange={(e) => setOfficePhone(e.target.value)}
                placeholder="مثال: 01234567890"
                dir="ltr"
              />
            </div>

            {/* Office Hours */}
            <div className="space-y-2">
              <Label htmlFor="office_hours">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  ساعات العمل
                </div>
              </Label>
              <Input
                id="office_hours"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                placeholder="مثال: من 9 صباحاً إلى 5 مساءً"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
          </div>
          <CardDescription>
            روابط حساباتك على منصات التواصل الاجتماعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/username"
                dir="ltr"
              />
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/username"
                dir="ltr"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/username"
                dir="ltr"
              />
            </div>

            {/* YouTube */}
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@username"
                dir="ltr"
              />
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="https://tiktok.com/@username"
                dir="ltr"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  الموقع الإلكتروني
                </div>
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isExecuting}
          size="lg"
          className="gap-2"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

