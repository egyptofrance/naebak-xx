"use client";
import { PageHeading } from "@/components/PageHeading";
import { TabsNavigation } from "@/components/TabsNavigation";
import { Lock, User } from "lucide-react";
import { useMemo } from "react";

export default function UserSettingsClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tabs = useMemo(() => {
    return [
      {
        label: "الإعدادات",
        href: `/user/settings`,
        icon: <User />,
      },
      {
        label: "الأمان",
        href: `/user/settings/security`,
        icon: <Lock />,
      },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <PageHeading
        title="إعدادات المستخدم"
        subTitle="إدارة حسابك وإعدادات الأمان."
      />
      <TabsNavigation tabs={tabs} />
      {children}
    </div>
  );
}
