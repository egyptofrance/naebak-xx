"use client";
import { FormInput } from "@/components/form-components/FormInput";
import { FormSelect } from "@/components/form-components/FormSelect";
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
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useOnboarding } from "./OnboardingContext";

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
}

interface Party {
  id: string;
  name_ar: string;
  name_en: string;
}

export function ProfileUpdate() {
  const {
    userProfile,
    userEmail,
    profileUpdateActionState,
    uploadAvatarMutation,
    avatarURLState,
  } = useOnboarding();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch governorates and parties
  useEffect(() => {
    async function fetchData() {
      try {
        const [govResponse, partiesResponse] = await Promise.all([
          fetch('/api/governorates'),
          fetch('/api/parties')
        ]);
        
        if (govResponse.ok) {
          const govData = await govResponse.json();
          setGovernorates(govData);
        }
        
        if (partiesResponse.ok) {
          const partiesData = await partiesResponse.json();
          setParties(partiesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

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
      phone: (userProfile as any).phone ?? "",
      governorateId: (userProfile as any).governorate_id ?? "",
      city: (userProfile as any).city ?? "",
      district: (userProfile as any).district ?? "",
      village: (userProfile as any).village ?? "",
      address: (userProfile as any).address ?? "",
      jobTitle: (userProfile as any).job_title ?? "",
      partyId: (userProfile as any).party_id ?? "",
      electoralDistrict: (userProfile as any).electoral_district ?? "",
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

  const governorateOptions = governorates.map(gov => ({
    value: gov.id,
    label: gov.name_en,
  }));

  const partyOptions = parties.map(party => ({
    value: party.id,
    label: party.name_en,
  }));

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
            Create Your Profile
          </CardTitle>
          <CardDescription>
            Let&apos;s set up your personal details. Only your name is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Section */}
          <div className="space-y-2">
            <label htmlFor="avatar" className="text-sm font-medium">
              Avatar
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  fill
                  className="rounded-full object-cover"
                  src={avatarUrlWithFallback}
                  alt="User avatar"
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
                  ? "Uploading..."
                  : "Change Avatar"}
              </Button>
            </div>
          </div>

          {/* Required Field */}
          <FormInput
            id="full-name"
            label="Full Name *"
            control={control}
            name="fullName"
            inputProps={{ "data-testid": "full-name-input", placeholder: "Enter your full name" }}
          />

          {/* Optional Fields */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Optional information (you can fill this later)
            </p>
            
            <div className="space-y-4">
              <FormInput
                id="phone"
                label="Phone Number"
                control={control}
                name="phone"
                inputProps={{ placeholder: "Enter your phone number" }}
              />

              <FormSelect
                id="governorate"
                label="Governorate"
                control={control}
                name="governorateId"
                options={governorateOptions}
                placeholder="Select your governorate"
                disabled={loading}
              />

              <FormInput
                id="city"
                label="City / Center"
                control={control}
                name="city"
                inputProps={{ placeholder: "Enter your city or center" }}
              />

              <FormInput
                id="district"
                label="District / Neighborhood"
                control={control}
                name="district"
                inputProps={{ placeholder: "Enter your district" }}
              />

              <FormInput
                id="village"
                label="Village (if applicable)"
                control={control}
                name="village"
                inputProps={{ placeholder: "Enter your village" }}
              />

              <FormInput
                id="address"
                label="Full Address"
                control={control}
                name="address"
                inputProps={{ placeholder: "Enter your full address" }}
              />

              <FormInput
                id="job-title"
                label="Job Title / Occupation"
                control={control}
                name="jobTitle"
                inputProps={{ placeholder: "Enter your job or occupation" }}
              />

              <FormSelect
                id="party"
                label="Political Party"
                control={control}
                name="partyId"
                options={partyOptions}
                placeholder="Select your political party"
                disabled={loading}
              />

              <FormInput
                id="electoral-district"
                label="Electoral District"
                control={control}
                name="electoralDistrict"
                inputProps={{ placeholder: "Enter your electoral district" }}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={profileUpdateActionState.status === "executing"}
            data-testid="save-profile-button"
          >
            {profileUpdateActionState.status === "executing"
              ? "Saving..."
              : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

