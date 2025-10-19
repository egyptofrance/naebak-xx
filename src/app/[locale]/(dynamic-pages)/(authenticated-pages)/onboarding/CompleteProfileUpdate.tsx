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
import { updateCompleteProfileSchema } from "@/utils/zod-schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import Image from "next/image";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useOnboardingExtended } from "./OnboardingContextExtended";

export function CompleteProfileUpdate() {
  const {
    userProfile,
    userEmail,
    governorates,
    parties,
    profileUpdateActionState,
    uploadAvatarMutation,
    avatarURLState,
  } = useOnboardingExtended();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrlWithFallback = getUserAvatarUrl({
    profileAvatarUrl: avatarURLState ?? userProfile.avatar_url,
    email: userEmail,
  });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof updateCompleteProfileSchema
  >(profileUpdateActionState.result.validationErrors, { joinBy: "\n" });

  const form = useForm<z.infer<typeof updateCompleteProfileSchema>>({
    resolver: zodResolver(updateCompleteProfileSchema),
    defaultValues: {
      fullName: userProfile.full_name ?? "",
      email: userProfile.email ?? userEmail ?? "",
      phone: userProfile.phone ?? "",
      governorateId: userProfile.governorate_id ?? "",
      city: userProfile.city ?? "",
      electoralDistrict: userProfile.electoral_district ?? "",
      gender: userProfile.gender ?? undefined,
      district: userProfile.district ?? "",
      village: userProfile.village ?? "",
      address: userProfile.address ?? "",
      jobTitle: userProfile.job_title ?? "",
      partyId: userProfile.party_id ?? undefined,
      avatarUrl: userProfile.avatar_url ?? "",
      isOnboardingFlow: true,
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

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((data) =>
          profileUpdateActionState.execute({
            ...data,
            isOnboardingFlow: true,
          }),
        )}
        className="space-y-6"
      >
        <CardHeader>
          <CardTitle data-testid="complete-profile-title">
            أكمل بياناتك الشخصية
          </CardTitle>
          <CardDescription>
            يرجى ملء جميع البيانات المطلوبة لإكمال التسجيل
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                <Image
                  fill
                  className="object-cover"
                  src={avatarUrlWithFallback}
                  alt="صورة المستخدم"
                  unoptimized
                  onError={(e) => {
                    // Fallback to a default avatar if image fails to load
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

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              البيانات الأساسية
            </h3>
            
            <FormInput
              id="full-name"
              control={control}
              name="fullName"
              placeholder="الاسم الكامل *"
              data-testid="full-name-input"
            />

            <FormInput
              id="email"
              control={control}
              name="email"
              type="email"
              placeholder="البريد الإلكتروني *"
              data-testid="email-input"
            />

            <FormInput
              id="phone"
              control={control}
              name="phone"
              placeholder="رقم الهاتف * (01xxxxxxxxx)"
              data-testid="phone-input"
            />

            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="gender-select">
                        <SelectValue placeholder="النوع" />
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
              control={control}
              name="jobTitle"
              placeholder="المهنة/الوظيفة"
              data-testid="job-title-input"
            />
          </div>

          {/* Geographic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              البيانات الجغرافية
            </h3>

            <FormField
              control={control}
              name="governorateId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="governorate-select">
                        <SelectValue placeholder="المحافظة *" />
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
              control={control}
              name="city"
              placeholder="المدينة *"
              data-testid="city-input"
            />

            <FormInput
              id="district"
              control={control}
              name="district"
              placeholder="الحي/المنطقة"
              data-testid="district-input"
            />

            <FormInput
              id="village"
              control={control}
              name="village"
              placeholder="القرية (إن وجدت)"
              data-testid="village-input"
            />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="العنوان التفصيلي"
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

          {/* Political/Electoral Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              البيانات الانتخابية
            </h3>

            <FormInput
              id="electoral-district"
              control={control}
              name="electoralDistrict"
              placeholder="الدائرة الانتخابية *"
              data-testid="electoral-district-input"
            />

            <FormField
              control={control}
              name="partyId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="party-select">
                        <SelectValue placeholder="الحزب السياسي (اختياري)" />
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
            data-testid="save-complete-profile-button"
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

