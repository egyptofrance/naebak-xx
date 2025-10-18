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
import { Form } from "@/components/ui/form";
import { getUserAvatarUrl } from "@/utils/helpers";
import { profileUpdateFormSchema } from "@/utils/zod-schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import Image from "next/image";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useOnboarding } from "./OnboardingContext";

export function ProfileUpdate() {
  const {
    userProfile,
    userEmail,
    profileUpdateActionState,
    uploadAvatarMutation,
    avatarURLState,
  } = useOnboarding();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrlWithFallback = getUserAvatarUrl({
    profileAvatarUrl: avatarURLState ?? userProfile.avatar_url,
    email: userEmail,
  });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof profileUpdateFormSchema
  >(profileUpdateActionState.result.validationErrors, { joinBy: "\n" });

  const form = useForm({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      fullName: userProfile.full_name ?? "",
      phone: userProfile.phone ?? "",
      city: userProfile.city ?? "",
      district: userProfile.district ?? "",
      village: userProfile.village ?? "",
      electoralDistrict: userProfile.electoral_district ?? "",
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
      >
        <CardHeader>
          <CardTitle data-testid="profile-update-title">
            إنشاء ملفك الشخصي
          </CardTitle>
          <CardDescription>
            دعنا نقوم بإعداد بياناتك الشخصية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="relative w-20 h-20 shrink-0">
                <Image
                  fill
                  className="rounded-full object-cover"
                  src={avatarUrlWithFallback}
                  alt="صورة المستخدم"
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

          {/* Personal Information */}
          <FormInput
            id="full-name"
            label="الاسم الكامل"
            control={control}
            name="fullName"
            hideLabel={true}
            data-testid="full-name-input"
          />

          <FormInput
            id="phone"
            label="رقم الهاتف"
            control={control}
            name="phone"
            type="tel"
            hideLabel={true}
            data-testid="phone-input"
          />

          {/* Location Information */}
          <FormInput
            id="city"
            label="المدينة / المركز"
            control={control}
            name="city"
            hideLabel={true}
            data-testid="city-input"
          />

          <FormInput
            id="district"
            label="الحي / القسم"
            control={control}
            name="district"
            hideLabel={true}
            data-testid="district-input"
          />

          <FormInput
            id="village"
            label="القرية"
            control={control}
            name="village"
            hideLabel={true}
            data-testid="village-input"
          />

          {/* Political Information */}
          <FormInput
            id="electoral-district"
            label="الدائرة الانتخابية"
            control={control}
            name="electoralDistrict"
            hideLabel={true}
            data-testid="electoral-district-input"
          />
        </CardContent>
        <CardFooter>
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

