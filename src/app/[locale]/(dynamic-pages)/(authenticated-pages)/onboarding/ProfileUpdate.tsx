"use client";
import { FormInput } from "@/components/form-components/FormInput";
import { FormInputNoLabel } from "@/components/form-components/FormInputNoLabel";
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
import { getElectoralDistrictsByGovernorate } from "@/data/deputy/queries";

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
  const [electoralDistricts, setElectoralDistricts] = useState<any[]>([]);
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
        
        // Remove duplicates and sort: "مستقل" first, then others
        const uniqueParties = partiesData.filter((party, index, self) =>
          index === self.findIndex((p) => p.name_ar === party.name_ar)
        );
        
        const sortedParties = uniqueParties.sort((a, b) => {
          if (a.name_ar === "مستقل") return -1;
          if (b.name_ar === "مستقل") return 1;
          return a.name_ar.localeCompare(b.name_ar, 'ar');
        });
        
        setParties(sortedParties);
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
      email: userProfile.email ?? userEmail ?? "",
      phone: userProfile.phone ?? "",
      governorateId: userProfile.governorate_id ?? "",
      city: userProfile.city ?? "",
      electoralDistrictId: userProfile.electoral_district_id ?? "",
      gender: userProfile.gender as "male" | "female" | undefined,
      district: userProfile.district ?? "",
      village: userProfile.village ?? "",
      address: userProfile.address ?? "",
      jobTitle: userProfile.job_title ?? "",
      partyId: userProfile.party_id ?? undefined,
      avatarUrl: userProfile.avatar_url ?? "",
    },
    errors: hookFormValidationErrors,
  });

  const { handleSubmit, control } = form;

  // Load electoral districts when governorate changes
  useEffect(() => {
    const governorateId = form.watch("governorateId");
    if (governorateId && typeof governorateId === 'string') {
      const selectedGovernorateId: string = governorateId;
      async function loadDistricts() {
        try {
          const districts = await getElectoralDistrictsByGovernorate(selectedGovernorateId);
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
  }, [form.watch("governorateId")]);

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
            
            <FormInputNoLabel
              id="full-name"
              control={control}
              name="fullName"
              inputProps={{ placeholder: "الاسم الكامل *" }}
              data-testid="full-name-input"
            />

            <FormInputNoLabel
              id="email"
              control={control}
              name="email"
              type="email"
              inputProps={{ placeholder: "البريد الإلكتروني *" }}
              data-testid="email-input"
            />

            <FormInputNoLabel
              id="phone"
              control={control}
              name="phone"
              inputProps={{ placeholder: "رقم الهاتف * (01xxxxxxxxx)" }}
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
                      <SelectTrigger data-testid="gender-select" className="w-full">
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

            <FormInputNoLabel
              id="job-title"
              control={control}
              name="jobTitle"
              inputProps={{ placeholder: "المهنة/الوظيفة" }}
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="governorate-select" className="w-full">
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

            <FormInputNoLabel
              id="city"
              control={control}
              name="city"
              inputProps={{ placeholder: "المدينة *" }}
              data-testid="city-input"
            />

            <FormInputNoLabel
              id="district"
              control={control}
              name="district"
              inputProps={{ placeholder: "الحي/المنطقة" }}
              data-testid="district-input"
            />

            <FormInputNoLabel
              id="village"
              control={control}
              name="village"
              inputProps={{ placeholder: "القرية" }}
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
                      className="resize-none min-h-[80px] w-full"
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

            <FormField
              control={control}
              name="electoralDistrictId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("governorateId")}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="electoral-district-select" className="w-full">
                        <SelectValue placeholder="الدائرة الانتخابية *" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {electoralDistricts.length === 0 ? (
                        <SelectItem value="no-districts" disabled>
                          {form.watch("governorateId") ? "لا توجد دوائر انتخابية" : "اختر المحافظة أولاً"}
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
                  <FormMessage />
                </FormItem>
              )}
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
                      <SelectTrigger data-testid="party-select" className="w-full">
                        <SelectValue placeholder="الحزب السياسي (اختياري)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

