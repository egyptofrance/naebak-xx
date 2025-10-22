"use client";

import { createComplaintAction } from "@/data/complaints/complaints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const categoryKeys = [
  "infrastructure",
  "education",
  "health",
  "security",
  "environment",
  "transportation",
  "utilities",
  "housing",
  "employment",
  "social_services",
  "legal",
  "corruption",
  "other",
] as const;

export function ComplaintForm() {
  const t = useTranslations("Complaints");
  const [category, setCategory] = useState<string>("");

  const { execute, status, result } = useAction(createComplaintAction, {
    onSuccess: ({ data }) => {
      toast.success(t("form.success.title"));
      // Reset form
      const form = document.getElementById("complaint-form") as HTMLFormElement;
      form?.reset();
      setCategory("");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to submit complaint");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    execute({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: category as any,
      governorate: formData.get("governorate") as string || null,
      district: formData.get("district") as string || null,
      address: formData.get("address") as string || null,
      citizen_phone: formData.get("citizen_phone") as string || null,
      citizen_email: formData.get("citizen_email") as string || null,
    });
  };

  const isLoading = status === "executing";

  return (
    <form id="complaint-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          {t("form.fields.title")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder={t("form.fields.titlePlaceholder")}
          required
          minLength={5}
          maxLength={200}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          {t("form.fields.category")} <span className="text-red-500">*</span>
        </Label>
        <Select
          value={category}
          onValueChange={setCategory}
          disabled={isLoading}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={t("form.fields.categoryPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {categoryKeys.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {t(`form.categories.${cat}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          {t("form.fields.description")} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t("form.fields.descriptionPlaceholder")}
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="governorate">{t("form.fields.governorate")}</Label>
          <Input
            id="governorate"
            name="governorate"
            placeholder={t("form.fields.governoratePlaceholder")}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">{t("form.fields.district")}</Label>
          <Input
            id="district"
            name="district"
            placeholder={t("form.fields.districtPlaceholder")}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t("form.fields.address")}</Label>
        <Input
          id="address"
          name="address"
          placeholder={t("form.fields.addressPlaceholder")}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="citizen_phone">{t("form.fields.phone")}</Label>
          <Input
            id="citizen_phone"
            name="citizen_phone"
            type="tel"
            placeholder={t("form.fields.phonePlaceholder")}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="citizen_email">{t("form.fields.email")}</Label>
          <Input
            id="citizen_email"
            name="citizen_email"
            type="email"
            placeholder={t("form.fields.emailPlaceholder")}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !category}>
          {isLoading ? t("form.buttons.submitting") : t("form.buttons.submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => {
            const form = document.getElementById("complaint-form") as HTMLFormElement;
            form?.reset();
            setCategory("");
          }}
        >
          {t("form.buttons.clear")}
        </Button>
      </div>

      {result?.data && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">
            ✓ {t("form.success.title")}
          </p>
          <p className="text-sm text-green-700 mt-1">
            {t("form.success.complaintId")}: {result.data.complaint.id}
          </p>
        </div>
      )}
    </form>
  );
}

