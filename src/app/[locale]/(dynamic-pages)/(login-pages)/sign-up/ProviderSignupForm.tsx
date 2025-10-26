"use client";

import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { toast } from "sonner";

import { RenderProviders } from "@/components/Auth/RenderProviders";
import { signInWithProviderAction } from "@/data/auth/auth";
import type { AuthProvider } from "@/types";
import { getSafeActionErrorMessage } from "@/utils/errorMessage";

interface ProviderSignupFormProps {
  next?: string;
  locale?: string;
}

export function ProviderSignupForm({ next, locale = 'en' }: ProviderSignupFormProps) {
  const isArabic = locale === 'ar';
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading(isArabic ? "جاري طلب تسجيل الدخول..." : "Requesting login...");
      },
      onSuccess: ({ data }) => {
        toast.success(isArabic ? "جاري التوجيه..." : "Redirecting...", { id: toastRef.current });
        toastRef.current = undefined;
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError: ({ error }) => {
        const errorMessage = getSafeActionErrorMessage(
          error,
          isArabic ? "فشل تسجيل الدخول" : "Failed to login",
        );
        toast.error(errorMessage, { id: toastRef.current });
        toastRef.current = undefined;
      },
    },
  );

  return (
    <RenderProviders
      providers={["google", "github", "twitter"]}
      isLoading={providerStatus === "executing"}
      onProviderLoginRequested={(
        provider: Extract<AuthProvider, "google" | "github" | "twitter">,
      ) => executeProvider({ provider, next })}
    />
  );
}
