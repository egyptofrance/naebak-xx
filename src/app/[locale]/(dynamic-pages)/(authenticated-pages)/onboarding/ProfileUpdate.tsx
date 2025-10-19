"use client";
import { FormInput } from "@/components/form-components/FormInput";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getUserAvatarUrl } from "@/utils/helpers";
import { profileUpdateFormSchema } from "@/utils/zod-schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useOnboarding } from "./OnboardingContext";
import { getGovernorates, getParties } from "@/data/user/complete-profile";

export function ProfileUpdate() {
  const {
    userProfile,
    userEmail,
    profileUpdateActionState,
    uploadAvatarMutation,
    avatarURLState,
  } = useOnboarding();

  const [governorates, setGovernorates] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrlWithFallback = getUserAvatarUrl({
    profileAvatarUrl: avatarURLState ?? userProfile.avatar_url,
    email: userEmail,
  });

  // Load governorates and parties
  useEffect(() => {
    async function loadData() {
      try {
        const [govData, partiesData] = await Promise.all([
          getGovernorates(),
          getParties(),
        ]);
        setGovernorates(govData);
        setParties(partiesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof profileUpdateFormSchema
  >(profileUpdateActionState.result.validationErrors, { joinBy: "\n" });

  const form = useForm({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      fullName: userProfile.full_name ?? "",
      email: (userProfile as any).email ?? userEmail ?? "",
      phone: (userProfile as any).phone ?? "",
      governorateId: (userProfile as any).governorate_id ?? "",
      city: (userProfile as any).city ?? "",
      electoralDistrict: (userProfile as any).electoral_district ?? "",
      gender: (userProfile as any).gender ?? undefined,
      district: (userProfile as any).district ?? "",
      village: (userProfile as any).village ?? "",
      address: (userProfile as any).address ?? "",
      jobTitle: (userProfile as any).job_title ?? "",
      partyId: (userProfile as any).party_id ?? undefined,
      avatarUrl: userProfile.avatar_url ?? "",
    },
    errors: hookFormValidationErrors,
  });

  const { handleSubmit, control } = form;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      uploadAvatarMutation.execute({
        formData,
        fileName: file.name,
        fileOptions: {
          upsert: true,
        },
      });
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((data) =>
          profileUpdateActionState.execute({
            ...data,
            isOnboardingFlow: true,
          }),
        )}
      >
        <CardHeader>
          <CardTitle data-testid="profile-update-title">
            أكمل بياناتك الشخصية
          </CardTitle>
          <CardDescription>
            يرجى ملء جميع البيانات المطلوبة لإكمال التسجيل
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <label htmlFor="avatar" className="text-sm font-medium">
              الصورة الشخصية
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                <Image
                  fill
                  className="object-cover"
                  src={avatarUrlWithFallback}
                  alt="User avatar"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userProfile.full_name || "User") + "&background=random&size=200";
                  }}
                />
              </div>
              <input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                disabled={uploadAvatarMutation.status === "executing"}
              />
              <Button
                type="button"
                variant="outline"
                data-testid="change-avatar-button"
                size="sm"
                onClick={handleAvatarButtonClick}
                disabled={uploadAvatarMutation.status === "executing"}
              >
                {uploadAvatarMutation.status === "executing"
                  ? "جاري الرفع..."
                  : "تغيير الصورة"}
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold border-b pb-2">
              البيانات الأساسية
            </h3>
            
            <FormInput
              id="full-name"
              label="الاسم الكامل *"
              control={control}
              name="fullName"
              data-testid="full-name-input"
            />

            <FormInput
              id="email"
              label="البريد الإلكتروني *"
              control={control}
              name="email"
              type="email"
              data-testid="email-input"
            />

            <FormInput
              id="phone"
              label="رقم الهاتف *"
              control={control}
              name="phone"
              inputProps={{ placeholder: "01xxxxxxxxx" }}
              data-testid="phone-input"
            />

            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>النوع</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="gender-select">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormInput
              id="job-title"
              label="المهنة/الوظيفة"
              control={control}
              name="jobTitle"
              data-testid="job-title-input"
            />
          </div>

          {/* Geographic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold border-b pb-2">
              البيانات الجغرافية
            </h3>

            <FormField
              control={control}
              name="governorateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المحافظة *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="governorate-select">
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {governorates.map((gov) => (
                        <SelectItem key={gov.id} value={gov.id}>
                          {gov.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormInput
              id="city"
              label="المدينة *"
              control={control}
              name="city"
              data-testid="city-input"
            />

            <FormInput
              id="district"
              label="الحي/المنطقة"
              control={control}
              name="district"
              data-testid="district-input"
            />

            <FormInput
              id="village"
              label="القرية"
              control={control}
              name="village"
              data-testid="village-input"
            />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان التفصيلي</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل عنوانك بالتفصيل"
                      className="resize-none min-h-[80px]"
                      {...field}
                      data-testid="address-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Electoral Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold border-b pb-2">
              البيانات الانتخابية
            </h3>

            <FormInput
              id="electoral-district"
              label="الدائرة الانتخابية *"
              control={control}
              name="electoralDistrict"
              data-testid="electoral-district-input"
            />

            <FormField
              control={control}
              name="partyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحزب السياسي (اختياري)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="party-select">
                        <SelectValue placeholder="اختر الحزب السياسي" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">بدون حزب</SelectItem>
                      {parties.map((party) => (
                        <SelectItem key={party.id} value={party.id}>
                          {party.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="pt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={profileUpdateActionState.status === "executing"}
            data-testid="save-profile-button"
          >
            {profileUpdateActionState.status === "executing"
              ? "جاري الحفظ..."
              : "حفظ البيانات"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

