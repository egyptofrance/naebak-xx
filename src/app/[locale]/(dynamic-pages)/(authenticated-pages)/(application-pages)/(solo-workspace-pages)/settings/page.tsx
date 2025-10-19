import { PageHeading } from "@/components/PageHeading";
import { getCompleteUserProfile, getGovernorates, getParties } from "@/data/user/complete-profile";
import { Suspense } from "react";
import { ProfileUpdateForm } from "./ProfileUpdateForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile settings.",
};

export default async function SettingsPage() {
  const [userProfile, governorates, parties] = await Promise.all([
    getCompleteUserProfile(),
    getGovernorates(),
    getParties(),
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
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <ProfileUpdateForm
          userProfile={userProfile}
          governorates={governorates}
          parties={parties}
        />
      </Suspense>
    </div>
  );
}

