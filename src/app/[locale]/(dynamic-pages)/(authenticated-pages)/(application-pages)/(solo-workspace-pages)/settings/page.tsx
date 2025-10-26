import { PageHeading } from "@/components/PageHeading";
import { getCompleteUserProfile, getGovernorates, getParties } from "@/data/user/complete-profile";
import { getCachedDeputyProfile } from "@/rsc-data/user/deputy";
import { Suspense } from "react";
import { ProfileUpdateForm } from "./ProfileUpdateForm";
import { DeputyDisplayNameForm } from "./DeputyDisplayNameForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile settings.",
};

export default async function SettingsPage() {
  const [userProfile, governorates, parties, deputyProfile] = await Promise.all([
    getCompleteUserProfile(),
    getGovernorates(),
    getParties(),
    getCachedDeputyProfile(),
  ]);

  if (!userProfile) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="الإعدادات"
        subTitle="قم بتحديث بياناتك الشخصية والانتخابية"
      />
      <Suspense fallback={<div>جاري التحميل...</div>>
        {deputyProfile && (
          <DeputyDisplayNameForm
            currentDisplayName={deputyProfile.display_name}
            fullName={userProfile.full_name}
          />
        )}
        <ProfileUpdateForm
          userProfile={userProfile}
          governorates={governorates}
          parties={parties}
        />
      </Suspense>>
    </div>
  );
}

