import type { Metadata } from "next";
import { ComplaintForm } from "./ComplaintForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Complaints");
  
  return {
    title: t("form.title"),
    description: t("form.description"),
  };
}

export default async function NewComplaintPage() {
  const t = await getTranslations("Complaints");
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("form.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("form.description")}
        </p>
      </div>
      <ComplaintForm />
    </div>
  );
}

