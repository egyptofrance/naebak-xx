"use client";
import { FormInputNoLabel } from "@/components/form-components/FormInputNoLabel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { updateUserFullNameAction } from "@/data/user/user";
import { Database } from "@/lib/database.types";
import { getUserAvatarUrl } from "@/utils/helpers";
import { profileUpdateFormSchema } from "@/utils/zod-schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getElectoralDistrictsByGovernorate } from "@/data/deputy/queries";

type Governorate = Database["public"]["Tables"]["governorates"]["Row"];
type Party = Database["public"]["Tables"]["parties"]["Row"];
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

interface ProfileUpdateFormProps {
  userProfile: UserProfile;
  governorates: Governorate[];
  parties: Party[];
}

export function ProfileUpdateForm({
  userProfile,
  governorates,
  parties,
}: ProfileUpdateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [electoralDistricts, setElectoralDistricts] = useState<any[]>([]);

  const form = useForm<z.infer<typeof profileUpdateFormSchema>>({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      fullName: userProfile.full_name || "",
      email: userProfile.email || "",
      phone: userProfile.phone || "",
      gender: (userProfile.gender as "male" | "female" | undefined) || undefined,
      jobTitle: userProfile.job_title || "",
      governorateId: userProfile.governorate_id || undefined,
      city: userProfile.city || "",
      district: userProfile.district || "",
      village: userProfile.village || "",
      address: userProfile.address || "",
      electoralDistrictId: userProfile.electoral_district_id || "",
      partyId: userProfile.party_id || undefined,
      avatarUrl: userProfile.avatar_url || "",
    },
  });

  const { control, handleSubmit } = form;

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

  // Remove duplicate parties and sort "مستقل" first
  const uniqueParties = Array.from(
    new Map(parties.map((p) => [p.name_ar, p])).values()
  );
  const sortedParties = uniqueParties.sort((a, b) => {
    if (a.name_ar === "مستقل") return -1;
    if (b.name_ar === "مستقل") return 1;
    return a.name_ar.localeCompare(b.name_ar, "ar");
  });

  const avatarUrlWithFallback = getUserAvatarUrl({
    profileAvatarUrl: userProfile.avatar_url,
    email: userProfile.email || "",
  });

  const onSubmit = async (data: z.infer<typeof profileUpdateFormSchema>) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateUserFullNameAction(data);
      setMessage({ type: "success", text: "تم حفظ التعديلات بنجاح!" });
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ. حاول مرة أخرى." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                <Image
                  fill
                  className="object-cover"
                  src={avatarUrlWithFallback}
                  alt="User avatar"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(userProfile.full_name || "User") +
                      "&background=random&size=200";
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium">الصورة الشخصية</p>
                <p className="text-xs text-muted-foreground">
                  يتم استخدام Gravatar بناءً على بريدك الإلكتروني
                </p>
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
              />

              <FormInputNoLabel
                id="email"
                control={control}
                name="email"
                inputProps={{
                  placeholder: "البريد الإلكتروني *",
                }}
              />

              <FormInputNoLabel
                id="phone"
                control={control}
                name="phone"
                inputProps={{
                  placeholder: "رقم الهاتف * (01xxxxxxxxx)",
                }}
              />

              <FormField
                control={control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر الجنس" />
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
                        <SelectTrigger className="w-full">
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
              />

              <FormInputNoLabel
                id="district"
                control={control}
                name="district"
                inputProps={{ placeholder: "الحي/المنطقة" }}
              />

              <FormInputNoLabel
                id="village"
                control={control}
                name="village"
                inputProps={{ placeholder: "القرية" }}
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
                        <SelectTrigger className="w-full">
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="الحزب السياسي (اختياري)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sortedParties.map((party) => (
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

            {message && (
              <div
                className={`text-center p-3 rounded ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

